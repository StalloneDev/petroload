import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const stations = pgTable("stations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientName: text("client_name").notNull(),
  name: text("name").notNull(),
  contact: text("contact"),
  zone: text("zone").notNull(),
});

export const insertStationSchema = createInsertSchema(stations).pick({
  clientName: true,
  name: true,
  contact: true,
  zone: true,
});

export type InsertStation = z.infer<typeof insertStationSchema>;
export type Station = typeof stations.$inferSelect;

export const trucks = pgTable("trucks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  licensePlate: text("license_plate").notNull().unique(),
  capacity: integer("capacity").array().notNull(),
  driverName: text("driver_name"),
  driverPhone: text("driver_phone"),
  status: text("status").default('AVAILABLE').notNull(),
});

export const insertTruckSchema = createInsertSchema(trucks).pick({
  licensePlate: true,
  capacity: true,
  driverName: true,
  driverPhone: true,
  status: true,
});

export type InsertTruck = z.infer<typeof insertTruckSchema>;
export type Truck = typeof trucks.$inferSelect;

export const validations = pgTable("validations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  truckId: text("truck_id").notNull(),
  licensePlate: text("license_plate").notNull(),
  date: text("date").notNull().default(sql`CURRENT_TIMESTAMP`),
  totalVolume: integer("total_volume").notNull(),
  fillRate: integer("fill_rate").notNull(),
  zone: text("zone").notNull(),
  plan: text("plan").notNull(), // JSON stringify of the loading plan
});

export const insertValidationSchema = createInsertSchema(validations).pick({
  truckId: true,
  licensePlate: true,
  totalVolume: true,
  fillRate: true,
  zone: true,
  plan: true,
});

export type InsertValidation = z.infer<typeof insertValidationSchema>;
export type Validation = typeof validations.$inferSelect;

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull(),
  client: text("client").notNull(),
  station: text("station").notNull(),
  zone: text("zone").notNull(),
  product: text("product").notNull(),
  quantity: integer("quantity").notNull(),
  remainingQuantity: integer("remaining_quantity").notNull(),
  status: text("status").notNull().default('PAID'),
  isLoaded: integer("is_loaded").notNull().default(0), // 0: no, 1: yes
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  orderUnique: uniqueIndex("order_unique_idx").on(table.orderNumber, table.station, table.product),
}));

export const insertOrderSchema = createInsertSchema(orders).pick({
  orderNumber: true,
  client: true,
  station: true,
  zone: true,
  product: true,
  quantity: true,
  remainingQuantity: true,
  status: true,
  isLoaded: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderDB = typeof orders.$inferSelect;
