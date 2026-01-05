import { Truck, Order, OptimizationResult, Compartment } from './types';

// Simple Greedy Heuristic with Splitting
export function optimizeFleet(trucks: Truck[], orders: Order[]): OptimizationResult {
  // Deep copy to avoid mutating inputs directly during simulation
  const availableTrucks = JSON.parse(JSON.stringify(trucks)) as Truck[];
  let pendingOrders = JSON.parse(JSON.stringify(orders)) as Order[];
  
  // 1. Filter only PAID orders
  pendingOrders = pendingOrders.filter(o => o.status === 'PAID');

  // 2. Sort orders by Zone (clustering) and then by Quantity (Largest first)
  // This encourages filling trucks with same-zone orders
  pendingOrders.sort((a, b) => {
    if (a.zone !== b.zone) return a.zone.localeCompare(b.zone);
    return b.quantity - a.quantity;
  });

  let totalCapacity = 0;
  let usedCapacity = 0;

  // 3. Iterate trucks
  for (const truck of availableTrucks) {
    if (truck.status !== 'IDLE') continue;

    // Track assigned zone for this truck to minimize distance
    // A truck is locked to a zone once the first order is added? 
    // Optimization goal: "minimize kilometers by grouping by zone"
    let truckZone: string | null = null;

    for (const compartment of truck.compartments) {
      totalCapacity += compartment.capacity;

      // Find best fitting order for this compartment
      // Constraints: 
      // - Must match truckZone if set
      // - Must match compartment capacity OR be splittable (Order >= Capacity)
      // - 100% Fill required
      
      const perfectMatchIndex = pendingOrders.findIndex(order => {
        if (order.remainingQuantity <= 0) return false;
        if (truckZone && order.zone !== truckZone) return false;
        // Ideally we want to fill exactly, or split if order is huge
        return order.remainingQuantity >= compartment.capacity;
      });

      if (perfectMatchIndex !== -1) {
        const order = pendingOrders[perfectMatchIndex];
        
        // Assign
        compartment.productId = order.product;
        compartment.currentLoad = compartment.capacity;
        compartment.orderIds.push(order.id);
        
        // Update Order
        order.remainingQuantity -= compartment.capacity;
        usedCapacity += compartment.capacity;
        
        // Lock Truck Zone
        if (!truckZone) truckZone = order.zone;
        truck.assignedZone = truckZone;
      }
    }
  }

  // Calculate stats
  const fillRate = totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0;
  
  // Cleanup: Remove fully fulfilled orders from the "remaining" list for clarity
  // But wait, the return type expects "remainingOrders". 
  // If remainingQty is 0, it's done. 
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
