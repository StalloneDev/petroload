export type ProductType = 'DIESEL' | 'SP95' | 'SP98' | 'HEATING_OIL';
export type OrderStatus = 'PENDING' | 'PAID' | 'SCHEDULED' | 'DELIVERED';

export interface Compartment {
  id: string;
  capacity: number;
  currentLoad: number;
  productId: ProductType | null;
  orderIds: string[]; // Can hold multiple orders if same product/zone? For now, simplify to one or split orders
}

export interface Truck {
  id: string;
  name: string;
  licensePlate: string;
  maxWeight: number;
  compartments: Compartment[];
  status: 'IDLE' | 'LOADING' | 'IN_TRANSIT';
  assignedZone: string | null;
}

export interface Order {
  id: string;
  customerName: string;
  product: ProductType;
  quantity: number;
  remainingQuantity: number; // For split tracking
  zone: string;
  status: OrderStatus;
  priority: number; // 1-5
}

export interface OptimizationResult {
  trucks: Truck[];
  remainingOrders: Order[];
  fillRate: number; // Percentage
  totalVolumeMoved: number;
  utilizationByZone: Record<string, number>;
}
