import { Truck, Order, OptimizationResult, Compartment } from './types';

// Advanced Zone-Based Fleet Optimization
export function optimizeFleet(trucks: Truck[], orders: Order[]): OptimizationResult {
  // Deep copy to avoid mutating inputs directly during simulation
  const availableTrucks = JSON.parse(JSON.stringify(trucks)) as Truck[];
  let pendingOrders = JSON.parse(JSON.stringify(orders)) as Order[];

  // 1. Filter only PAID orders
  pendingOrders = pendingOrders.filter(o => o.status === 'PAID' && o.remainingQuantity > 0);

  // 2. Sort orders: Preference to larger orders to minimize splits, but we will iterate intelligently
  pendingOrders.sort((a, b) => b.quantity - a.quantity);

  let totalCapacity = 0;
  let usedCapacity = 0;

  // Helper to find the best zone to attack next (simplified: just pick the one with most volume)
  // But actually, we just iterate trucks. For a fresh truck, we pick the zone that matches the best available "Biggest Pending Block".

  // 3. Iterate trucks
  for (const truck of availableTrucks) {
    // Only optimize trucks that are IDLE
    if (truck.status !== 'IDLE') continue;

    let truckZone: string | null = null;
    let truckUsedVolume = 0;

    // We process compartments.
    // OPTIMIZATION: Try to fill compartment with a SINGLE order first (Operationally better),
    // if not possible, combine multiple orders.

    for (const compartment of truck.compartments) {
      if (compartment.currentLoad > 0) continue; // Already filled
      totalCapacity += compartment.capacity;

      // Determine candidates
      // If truck has a zone, we MUST stick to it.
      // If not, we are free to chose a zone based on the first order we pick.

      let eligibleOrders = pendingOrders.filter(o => o.remainingQuantity > 0);
      if (truckZone) {
        eligibleOrders = eligibleOrders.filter(o => o.zone === truckZone);
      }

      if (eligibleOrders.length === 0) continue;

      // Strategy: MAXIMIZE FILLING
      // We need to pick a Product for this compartment.
      // A compartment can only have ONE product.
      // We should pick the product that allows us to fill this compartment the most.

      // Group eligible orders by Product
      const productGroups: Record<string, Order[]> = {};
      eligibleOrders.forEach(o => {
        if (!productGroups[o.product]) productGroups[o.product] = [];
        productGroups[o.product].push(o);
      });

      // Find best product for this compartment
      let bestProduct: string | null = null;
      let maxFill = -1;

      for (const [product, productOrders] of Object.entries(productGroups)) {
        // Calculate how much we could fill with this product
        let possibleFill = 0;
        let remainingCap = compartment.capacity;

        // Simulating greedy fill
        for (const order of productOrders) {
          const taking = Math.min(order.remainingQuantity, remainingCap);
          possibleFill += taking;
          remainingCap -= taking;
          if (remainingCap === 0) break;
        }

        if (possibleFill > maxFill) {
          maxFill = possibleFill;
          bestProduct = product;
        }
      }

      // If we found a valid product to load
      if (bestProduct && maxFill > 0) {
        const productOrders = productGroups[bestProduct];

        // Lock Compartment Product
        compartment.productId = bestProduct;
        let spaceLeft = compartment.capacity;

        // FILL IT
        for (const order of productOrders) {
          if (spaceLeft === 0) break;

          const quantityToTake = Math.min(order.remainingQuantity, spaceLeft);

          // Update Compartment
          compartment.currentLoad += quantityToTake;
          compartment.orderIds.push(order.id);

          // Update Order
          order.remainingQuantity -= quantityToTake;

          // Update Loop State
          spaceLeft -= quantityToTake;

          // Lock Truck Zone if distinct
          if (!truckZone) {
            truckZone = order.zone;
            truck.assignedZone = truckZone;
            truck.status = 'OPTIMIZED';
          }
        }

        truckUsedVolume += compartment.currentLoad;
        usedCapacity += compartment.currentLoad;
      }
    }
  }

  // Calculate stats
  const fillRate = totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0;
  const remaining = pendingOrders.filter(o => o.remainingQuantity > 0);

  // Utilization by zone
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
