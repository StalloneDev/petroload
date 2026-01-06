export type ProductType = string; // Allow dynamic products from Excel
export type OrderStatus = 'PENDING' | 'PAID' | 'SCHEDULED' | 'DELIVERED';
export type TruckStatus = 'IDLE' | 'LOADING' | 'IN_TRANSIT' | 'AVAILABLE' | 'OPTIMIZED';

export interface Compartment {
  id: string;
  capacity: number;
  currentLoad: number;
  productId: ProductType | null;
  orderIds: string[];
}

export interface Truck {
  id: string;
  name: string;
  licensePlate: string;
  maxWeight: number;
  compartments: Compartment[];
  status: TruckStatus;
  assignedZone: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  client: string;
  station: string;
  product: ProductType;
  quantity: number;
  remainingQuantity: number;
  zone: string;
  status: OrderStatus;
  isLoaded: number; // 0: no, 1: yes
  priority?: number;
}

export interface OptimizationResult {
  trucks: Truck[];
  remainingOrders: Order[];
  fillRate: number;
  totalVolumeMoved: number;
  utilizationByZone: Record<string, number>;
}
