import { Truck, Order, OptimizationResult, Compartment } from './types';

// ============================================================================
// HELPER TYPES
// ============================================================================

interface ZoneGroup {
  zone: string;
  orders: Order[];
  totalVolume: number;
}

interface ProductGroup {
  product: string;
  orders: Order[];
  totalVolume: number;
}

interface OrderCombination {
  orders: Order[];
  totalVolume: number;
  fillPercentage: number;
}

interface TruckScore {
  truck: Truck;
  score: number;
  expectedFillRate: number;
  compatibleProducts: string[];
}

interface ZoneAnalysis {
  zone: string;
  totalVolume: number;
  productBreakdown: Map<string, number>;
  orders: Order[];
}

interface AllocationPlan {
  truck: Truck;
  zone: string;
  expectedFillRate: number;
  plannedOrders: Order[];
}

// ============================================================================
// ZONE ANALYSIS
// ============================================================================

/**
 * Analyze a zone to understand product distribution
 */
function analyzeZone(zone: string, orders: Order[]): ZoneAnalysis {
  const zoneOrders = orders.filter(o => o.zone === zone && o.remainingQuantity > 0);
  const productBreakdown = new Map<string, number>();

  zoneOrders.forEach(order => {
    const current = productBreakdown.get(order.product) || 0;
    productBreakdown.set(order.product, current + order.remainingQuantity);
  });

  const totalVolume = zoneOrders.reduce((sum, o) => sum + o.remainingQuantity, 0);

  return {
    zone,
    totalVolume,
    productBreakdown,
    orders: zoneOrders
  };
}

// ============================================================================
// TRUCK SCORING
// ============================================================================

/**
 * Calculate how well a truck fits a zone's needs
 * Returns a score from 0-100
 */
function scoreTruckForZone(truck: Truck, zoneAnalysis: ZoneAnalysis): TruckScore {
  const truckCapacity = truck.compartments.reduce((sum, c) => sum + c.capacity, 0);
  const compartmentSizes = truck.compartments.map(c => c.capacity).sort((a, b) => b - a);

  // Get products sorted by volume
  const products = Array.from(zoneAnalysis.productBreakdown.entries())
    .sort((a, b) => b[1] - a[1]);

  let score = 0;
  let simulatedFill = 0;
  const compatibleProducts: string[] = [];

  // Simulate filling each compartment with best product
  for (let i = 0; i < compartmentSizes.length && i < products.length; i++) {
    const compartmentCap = compartmentSizes[i];
    const [product, productVolume] = products[i];

    const fillAmount = Math.min(compartmentCap, productVolume);
    simulatedFill += fillAmount;
    compatibleProducts.push(product);

    // Bonus points for perfect fits
    if (fillAmount === compartmentCap) {
      score += 20;
    } else if (fillAmount >= compartmentCap * 0.9) {
      score += 15;
    } else if (fillAmount >= compartmentCap * 0.8) {
      score += 10;
    } else {
      score += 5;
    }
  }

  const expectedFillRate = truckCapacity > 0 ? (simulatedFill / truckCapacity) * 100 : 0;

  // Bonus for high fill rate
  if (expectedFillRate >= 95) {
    score += 30;
  } else if (expectedFillRate >= 85) {
    score += 20;
  } else if (expectedFillRate >= 75) {
    score += 10;
  }

  // Penalty if truck is too big for zone
  if (truckCapacity > zoneAnalysis.totalVolume * 1.5) {
    score -= 20;
  }

  return {
    truck,
    score,
    expectedFillRate,
    compatibleProducts
  };
}

/**
 * Find best trucks for a zone
 */
function findBestTrucksForZone(
  availableTrucks: Truck[],
  zoneAnalysis: ZoneAnalysis,
  maxTrucks: number = 10
): TruckScore[] {
  const scores = availableTrucks
    .filter(t => t.status === 'IDLE')
    .map(truck => scoreTruckForZone(truck, zoneAnalysis))
    .sort((a, b) => b.score - a.score);

  return scores.slice(0, maxTrucks);
}

// ============================================================================
// ALLOCATION PLANNING
// ============================================================================

/**
 * Create an allocation plan for a zone
 */
function planZoneAllocation(
  zoneAnalysis: ZoneAnalysis,
  availableTrucks: Truck[]
): AllocationPlan[] {
  const plans: AllocationPlan[] = [];
  const remainingOrders = [...zoneAnalysis.orders];

  // Get best trucks for this zone
  const bestTrucks = findBestTrucksForZone(availableTrucks, zoneAnalysis);

  for (const truckScore of bestTrucks) {
    if (remainingOrders.filter(o => o.remainingQuantity > 0).length === 0) break;

    const plan: AllocationPlan = {
      truck: truckScore.truck,
      zone: zoneAnalysis.zone,
      expectedFillRate: truckScore.expectedFillRate,
      plannedOrders: []
    };

    // Simulate filling this truck
    const truckCapacity = truckScore.truck.compartments.reduce((sum, c) => sum + c.capacity, 0);
    let plannedVolume = 0;

    // Prioritize products that this truck can handle well
    for (const product of truckScore.compatibleProducts) {
      const productOrders = remainingOrders.filter(
        o => o.product === product && o.remainingQuantity > 0
      );

      for (const order of productOrders) {
        if (plannedVolume >= truckCapacity) break;

        const canTake = Math.min(order.remainingQuantity, truckCapacity - plannedVolume);
        if (canTake > 0) {
          plan.plannedOrders.push(order);
          plannedVolume += canTake;
        }
      }
    }

    // Only add plan if it's worthwhile (>50% fill)
    const actualFillRate = (plannedVolume / truckCapacity) * 100;
    if (actualFillRate >= 50) {
      plans.push(plan);
    }
  }

  return plans;
}

// ============================================================================
// ADVANCED COMBINATION ALGORITHMS
// ============================================================================

/**
 * Find optimal combination of orders using dynamic programming (subset sum variant)
 */
function findOptimalCombination(
  orders: Order[],
  capacity: number,
  product: string
): OrderCombination {
  const productOrders = orders.filter(o => o.product === product && o.remainingQuantity > 0);

  if (productOrders.length === 0) {
    return { orders: [], totalVolume: 0, fillPercentage: 0 };
  }

  // Special case: single order that fills perfectly or overfills
  for (const order of productOrders) {
    if (order.remainingQuantity === capacity) {
      return { orders: [order], totalVolume: capacity, fillPercentage: 100 };
    }
    if (order.remainingQuantity >= capacity) {
      return { orders: [order], totalVolume: capacity, fillPercentage: 100 };
    }
  }

  // Try combinations up to 4 orders
  const maxOrdersInCombination = Math.min(4, productOrders.length);
  let bestCombination: OrderCombination = { orders: [], totalVolume: 0, fillPercentage: 0 };

  const sortedOrders = [...productOrders].sort((a, b) => b.remainingQuantity - a.remainingQuantity);

  for (let size = 1; size <= maxOrdersInCombination; size++) {
    const combination = findBestCombinationOfSize(sortedOrders, capacity, size);
    if (combination.fillPercentage > bestCombination.fillPercentage) {
      bestCombination = combination;
    }
    if (combination.fillPercentage === 100) break;
  }

  return bestCombination;
}

function findBestCombinationOfSize(
  orders: Order[],
  capacity: number,
  size: number
): OrderCombination {
  if (size === 1) {
    let best: OrderCombination = { orders: [], totalVolume: 0, fillPercentage: 0 };
    for (const order of orders) {
      const volume = Math.min(order.remainingQuantity, capacity);
      const fillPct = (volume / capacity) * 100;
      if (fillPct > best.fillPercentage) {
        best = { orders: [order], totalVolume: volume, fillPercentage: fillPct };
      }
    }
    return best;
  }

  let best: OrderCombination = { orders: [], totalVolume: 0, fillPercentage: 0 };

  function searchCombinations(start: number, current: Order[], currentVolume: number) {
    if (current.length === size) {
      const fillPct = (currentVolume / capacity) * 100;
      if (fillPct > best.fillPercentage && fillPct <= 100) {
        best = { orders: [...current], totalVolume: currentVolume, fillPercentage: fillPct };
      }
      return;
    }

    for (let i = start; i < orders.length; i++) {
      const order = orders[i];
      const newVolume = currentVolume + Math.min(order.remainingQuantity, capacity - currentVolume);

      if (newVolume <= capacity) {
        current.push(order);
        searchCombinations(i + 1, current, newVolume);
        current.pop();
      }
    }
  }

  searchCombinations(0, [], 0);
  return best;
}

// ============================================================================
// GROUPING AND PRIORITIZATION
// ============================================================================

function groupOrdersByZone(orders: Order[]): ZoneGroup[] {
  const zoneMap = new Map<string, Order[]>();

  orders.forEach(order => {
    if (!zoneMap.has(order.zone)) {
      zoneMap.set(order.zone, []);
    }
    zoneMap.get(order.zone)!.push(order);
  });

  const zoneGroups: ZoneGroup[] = Array.from(zoneMap.entries()).map(([zone, zoneOrders]) => ({
    zone,
    orders: zoneOrders,
    totalVolume: zoneOrders.reduce((sum, o) => sum + o.remainingQuantity, 0)
  }));

  zoneGroups.sort((a, b) => b.totalVolume - a.totalVolume);

  return zoneGroups;
}

function groupOrdersByProduct(orders: Order[]): ProductGroup[] {
  const productMap = new Map<string, Order[]>();

  orders.forEach(order => {
    if (!productMap.has(order.product)) {
      productMap.set(order.product, []);
    }
    productMap.get(order.product)!.push(order);
  });

  const productGroups: ProductGroup[] = Array.from(productMap.entries()).map(([product, productOrders]) => ({
    product,
    orders: productOrders,
    totalVolume: productOrders.reduce((sum, o) => sum + o.remainingQuantity, 0)
  }));

  productGroups.sort((a, b) => b.totalVolume - a.totalVolume);

  return productGroups;
}

// ============================================================================
// TRUCK FILLING LOGIC
// ============================================================================

function fillTruckCompletely(
  truck: Truck,
  availableOrders: Order[],
  assignedZone: string | null
): { filled: boolean; zone: string | null; fillPercentage: number } {
  let truckZone = assignedZone;
  let totalFilled = 0;

  // FIX: Calculate total capacity ONCE, outside the loop
  const totalCapacity = truck.compartments.reduce((sum, c) => sum + c.capacity, 0);

  let madeProgress = true;
  let passCount = 0;
  const MAX_PASSES = 3;

  while (madeProgress && passCount < MAX_PASSES) {
    madeProgress = false;
    passCount++;

    for (const compartment of truck.compartments) {
      if (compartment.currentLoad >= compartment.capacity) continue;

      const remainingSpace = compartment.capacity - compartment.currentLoad;
      if (remainingSpace === 0) continue;

      let eligibleOrders = availableOrders.filter(o => o.remainingQuantity > 0);
      if (truckZone) {
        eligibleOrders = eligibleOrders.filter(o => o.zone === truckZone);
      }

      if (eligibleOrders.length === 0) continue;

      if (compartment.productId) {
        eligibleOrders = eligibleOrders.filter(o => o.product === compartment.productId);

        if (eligibleOrders.length > 0) {
          const combination = findOptimalCombination(
            eligibleOrders,
            remainingSpace,
            compartment.productId
          );

          if (combination.orders.length > 0) {
            let spaceLeft = remainingSpace;
            for (const order of combination.orders) {
              if (spaceLeft === 0) break;
              const quantityToTake = Math.min(order.remainingQuantity, spaceLeft);

              compartment.currentLoad += quantityToTake;
              if (!compartment.orderIds.includes(order.id)) {
                compartment.orderIds.push(order.id);
              }
              order.remainingQuantity -= quantityToTake;
              spaceLeft -= quantityToTake;
              totalFilled += quantityToTake;
              madeProgress = true;

              if (!truckZone) {
                truckZone = order.zone;
                truck.assignedZone = truckZone;
                truck.status = 'OPTIMIZED';
              }
            }
          }
        }
      } else {
        const productGroups = groupOrdersByProduct(eligibleOrders);

        let bestProduct: string | null = null;
        let bestCombination: OrderCombination | null = null;

        for (const productGroup of productGroups) {
          const combination = findOptimalCombination(
            productGroup.orders,
            compartment.capacity,
            productGroup.product
          );

          if (!bestCombination || combination.fillPercentage > bestCombination.fillPercentage) {
            bestProduct = productGroup.product;
            bestCombination = combination;
          }

          if (combination.fillPercentage === 100) break;
        }

        if (bestProduct && bestCombination && bestCombination.orders.length > 0) {
          compartment.productId = bestProduct;
          let spaceLeft = compartment.capacity;

          for (const order of bestCombination.orders) {
            if (spaceLeft === 0) break;

            const quantityToTake = Math.min(order.remainingQuantity, spaceLeft);

            compartment.currentLoad += quantityToTake;
            compartment.orderIds.push(order.id);
            order.remainingQuantity -= quantityToTake;
            spaceLeft -= quantityToTake;
            totalFilled += quantityToTake;
            madeProgress = true;

            if (!truckZone) {
              truckZone = order.zone;
              truck.assignedZone = truckZone;
              truck.status = 'OPTIMIZED';
            }
          }
        }
      }
    }
  }

  const fillPercentage = totalCapacity > 0 ? (totalFilled / totalCapacity) * 100 : 0;

  return {
    filled: totalFilled > 0,
    zone: truckZone,
    fillPercentage
  };
}

// ============================================================================
// MAIN OPTIMIZATION FUNCTION
// ============================================================================

export function optimizeFleet(trucks: Truck[], orders: Order[]): OptimizationResult {
  const availableTrucks = JSON.parse(JSON.stringify(trucks)) as Truck[];
  let pendingOrders = JSON.parse(JSON.stringify(orders)) as Order[];

  pendingOrders = pendingOrders.filter(o => o.status === 'PAID' && o.remainingQuantity > 0);

  const zoneGroups = groupOrdersByZone(pendingOrders);

  let totalCapacity = 0;
  let usedCapacity = 0;

  // Process zones with intelligent pre-planning
  for (const zoneGroup of zoneGroups) {
    const { zone, orders: zoneOrders } = zoneGroup;

    // STEP 1: Analyze the zone
    const zoneAnalysis = analyzeZone(zone, zoneOrders);

    // STEP 2: Create allocation plan
    const allocationPlans = planZoneAllocation(zoneAnalysis, availableTrucks);

    // STEP 3: Execute the plan
    for (const plan of allocationPlans) {
      const remainingZoneOrders = zoneOrders.filter(o => o.remainingQuantity > 0);
      if (remainingZoneOrders.length === 0) break;

      const result = fillTruckCompletely(plan.truck, zoneOrders, null);

      if (!result.filled) continue;

      plan.truck.compartments.forEach(c => {
        totalCapacity += c.capacity;
        usedCapacity += c.currentLoad;
      });

      // Only continue if truck is well-filled or no more orders
      if (result.fillPercentage >= 80) {
        continue;
      } else {
        const stillHasOrders = zoneOrders.some(o =>
          o.remainingQuantity > 0 &&
          (!result.zone || o.zone === result.zone)
        );

        if (!stillHasOrders) continue;
      }
    }
  }

  const fillRate = totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0;
  const remaining = pendingOrders.filter(o => o.remainingQuantity > 0);

  const utilizationByZone: Record<string, number> = {};
  availableTrucks.forEach(t => {
    if (t.assignedZone) {
      utilizationByZone[t.assignedZone] = (utilizationByZone[t.assignedZone] || 0) + 1;
    }
  });

  return {
    trucks: availableTrucks,
    remainingOrders: remaining,
    fillRate,
    totalVolumeMoved: usedCapacity,
    utilizationByZone
  };
}
