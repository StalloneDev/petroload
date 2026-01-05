import { Truck, Order, ProductType } from './types';

export const ZONES = ['North-Industrial', 'South-Retail', 'East-Harbor', 'West-Residential'];
export const PRODUCTS: ProductType[] = ['DIESEL', 'SP95', 'SP98', 'HEATING_OIL'];

export const MOCK_TRUCKS: Truck[] = [
  {
    id: 'T-101',
    name: 'Atlas Hauler 1',
    licensePlate: 'AB-123-CD',
    maxWeight: 40000,
    status: 'IDLE',
    assignedZone: null,
    compartments: [
      { id: 'c1', capacity: 5000, currentLoad: 0, productId: null, orderIds: [] },
      { id: 'c2', capacity: 10000, currentLoad: 0, productId: null, orderIds: [] },
      { id: 'c3', capacity: 15000, currentLoad: 0, productId: null, orderIds: [] },
    ],
  },
  {
    id: 'T-102',
    name: 'Atlas Hauler 2',
    licensePlate: 'EF-456-GH',
    maxWeight: 38000,
    status: 'IDLE',
    assignedZone: null,
    compartments: [
      { id: 'c1', capacity: 6000, currentLoad: 0, productId: null, orderIds: [] },
      { id: 'c2', capacity: 6000, currentLoad: 0, productId: null, orderIds: [] },
      { id: 'c3', capacity: 6000, currentLoad: 0, productId: null, orderIds: [] },
      { id: 'c4', capacity: 6000, currentLoad: 0, productId: null, orderIds: [] },
    ],
  },
  {
    id: 'T-103',
    name: 'City Sprinter',
    licensePlate: 'JK-789-LM',
    maxWeight: 26000,
    status: 'IDLE',
    assignedZone: null,
    compartments: [
      { id: 'c1', capacity: 5000, currentLoad: 0, productId: null, orderIds: [] },
      { id: 'c2', capacity: 5000, currentLoad: 0, productId: null, orderIds: [] },
      { id: 'c3', capacity: 5000, currentLoad: 0, productId: null, orderIds: [] },
    ],
  },
];

const generateOrders = (count: number): Order[] => {
  const orders: Order[] = [];
  for (let i = 0; i < count; i++) {
    const qty = Math.floor(Math.random() * 5 + 1) * 5000; // 5000, 10000, ..., 25000
    const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
    const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
    
    orders.push({
      id: `ORD-${2024000 + i}`,
      customerName: `Station ${zone.split('-')[0]} #${i + 1}`,
      product,
      quantity: qty,
      remainingQuantity: qty,
      zone,
      status: 'PAID', // Requirement: Must be PAID
      priority: Math.floor(Math.random() * 3) + 1,
    });
  }
  return orders;
};

export const MOCK_ORDERS = generateOrders(20);
