import {
  users, type User, type InsertUser,
  stations, type Station, type InsertStation,
  trucks, type Truck, type InsertTruck,
  validations, type Validation, type InsertValidation,
  orders, type OrderDB, type InsertOrder
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Stations
  getStations(): Promise<Station[]>;
  getStation(id: string): Promise<Station | undefined>;
  createStation(station: InsertStation): Promise<Station>;
  updateStation(id: string, station: Partial<Station>): Promise<Station>;
  deleteStation(id: string): Promise<void>;

  // Trucks
  getTrucks(): Promise<Truck[]>;
  getTruck(id: string): Promise<Truck | undefined>;
  createTruck(truck: InsertTruck): Promise<Truck>;
  updateTruck(id: string, truck: Partial<Truck>): Promise<Truck>;
  deleteTruck(id: string): Promise<void>;
  batchUpdateTruckStatus(ids: string[], status: string): Promise<void>;

  // Validations
  getValidations(): Promise<Validation[]>;
  createValidation(validation: InsertValidation): Promise<Validation>;

  // Orders
  getOrders(): Promise<OrderDB[]>;
  getAllOrders(): Promise<OrderDB[]>;
  createOrders(orders: InsertOrder[]): Promise<OrderDB[]>;
  deleteAllOrders(): Promise<void>;
  markOrdersAsLoaded(ids: string[]): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getStations(): Promise<Station[]> {
    return await db.select().from(stations);
  }

  async getStation(id: string): Promise<Station | undefined> {
    const [station] = await db.select().from(stations).where(eq(stations.id, id));
    return station;
  }

  async createStation(insertStation: InsertStation): Promise<Station> {
    const [station] = await db.insert(stations).values(insertStation).returning();
    return station;
  }

  async updateStation(id: string, update: Partial<Station>): Promise<Station> {
    const [station] = await db.update(stations).set(update).where(eq(stations.id, id)).returning();
    return station;
  }

  async deleteStation(id: string): Promise<void> {
    await db.delete(stations).where(eq(stations.id, id));
  }

  async getTrucks(): Promise<Truck[]> {
    return await db.select().from(trucks);
  }

  async getTruck(id: string): Promise<Truck | undefined> {
    const [truck] = await db.select().from(trucks).where(eq(trucks.id, id));
    return truck;
  }

  async createTruck(insertTruck: InsertTruck): Promise<Truck> {
    const [truck] = await db.insert(trucks).values(insertTruck).returning();
    return truck;
  }

  async updateTruck(id: string, update: Partial<Truck>): Promise<Truck> {
    const [truck] = await db.update(trucks).set(update).where(eq(trucks.id, id)).returning();
    return truck;
  }

  async deleteTruck(id: string): Promise<void> {
    await db.delete(trucks).where(eq(trucks.id, id));
  }

  async batchUpdateTruckStatus(ids: string[], status: string): Promise<void> {
    await db.update(trucks).set({ status }).where(sql`id IN ${ids}`);
  }

  async getValidations(): Promise<Validation[]> {
    return await db.select().from(validations).orderBy(sql`${validations.date} DESC`);
  }

  async createValidation(insertValidation: InsertValidation): Promise<Validation> {
    const [validation] = await db.insert(validations).values(insertValidation).returning();
    return validation;
  }

  // Orders
  async getOrders(): Promise<OrderDB[]> {
    return await db.select().from(orders).where(
      sql`${orders.isLoaded} = 0 AND ${orders.status} = 'PAID'`
    );
  }

  async getAllOrders(): Promise<OrderDB[]> {
    return await db.select().from(orders).orderBy(sql`${orders.createdAt} DESC`);
  }

  async createOrders(insertOrders: InsertOrder[]): Promise<OrderDB[]> {
    if (insertOrders.length === 0) return [];
    return await db.insert(orders)
      .values(insertOrders)
      .onConflictDoUpdate({
        target: [orders.orderNumber, orders.station, orders.product],
        set: {
          quantity: sql`EXCLUDED.quantity`,
          remainingQuantity: sql`EXCLUDED.remaining_quantity`,
          zone: sql`EXCLUDED.zone`,
          client: sql`EXCLUDED.client`
        }
      })
      .returning();
  }

  async deleteAllOrders(): Promise<void> {
    await db.delete(orders);
  }

  async markOrdersAsLoaded(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await db.update(orders)
      .set({ isLoaded: 1 })
      .where(inArray(orders.id, ids));
  }
}

export const storage = new DatabaseStorage();
