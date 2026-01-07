import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Authentication
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await storage.getUserByUsername(username);

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Stations
  app.get("/api/stations", async (_req, res) => {
    const result = await storage.getStations();
    res.json(result);
  });

  app.post("/api/stations", async (req, res) => {
    const result = await storage.createStation(req.body);
    res.json(result);
  });

  app.put("/api/stations/:id", async (req, res) => {
    const result = await storage.updateStation(req.params.id, req.body);
    res.json(result);
  });

  app.delete("/api/stations/:id", async (req, res) => {
    await storage.deleteStation(req.params.id);
    res.status(204).end();
  });

  // Trucks
  app.get("/api/trucks", async (_req, res) => {
    const result = await storage.getTrucks();
    res.json(result);
  });

  app.post("/api/trucks", async (req, res) => {
    const result = await storage.createTruck(req.body);
    res.json(result);
  });

  app.put("/api/trucks/:id", async (req, res) => {
    const result = await storage.updateTruck(req.params.id, req.body);
    res.json(result);
  });

  app.delete("/api/trucks/:id", async (req, res) => {
    await storage.deleteTruck(req.params.id);
    res.status(204).end();
  });

  // Simulation
  app.get("/api/validations", async (_req, res) => {
    const result = await storage.getValidations();
    res.json(result);
  });

  app.get("/api/orders", async (_req, res) => {
    const result = await storage.getOrders();
    res.json(result);
  });

  app.get("/api/orders/all", async (_req, res) => {
    const result = await storage.getAllOrders();
    console.log(`[GET /api/orders/all] Returning ${result.length} orders`);
    res.json(result);
  });

  app.post("/api/orders/batch", async (req, res) => {
    console.log(`[POST /api/orders/batch] Received ${req.body?.length} orders`);
    if (!Array.isArray(req.body)) {
      return res.status(400).send("Body must be an array of orders");
    }
    try {
      const result = await storage.createOrders(req.body);
      console.log(`[POST /api/orders/batch] Successfully saved ${result.length} orders`);
      res.json(result);
    } catch (error) {
      console.error("[POST /api/orders/batch] Error saving orders:", error);
      res.status(500).send("Error saving orders");
    }
  });

  app.delete("/api/orders", async (_req, res) => {
    await storage.deleteAllOrders();
    console.log("[DELETE /api/orders] All orders deleted");
    res.status(204).end();
  });

  app.post("/api/simulation/validate", async (req, res) => {
    const { truckId, licensePlate, totalVolume, fillRate, zone, plan } = req.body;

    if (!truckId || !licensePlate) {
      return res.status(400).send("Missing required fields");
    }

    // 1. Record the validation
    const validation = await storage.createValidation({
      truckId,
      licensePlate,
      totalVolume,
      fillRate,
      zone,
      plan: JSON.stringify(plan)
    });

    // 2. Update truck status
    await storage.updateTruck(truckId, { status: 'IN_TRANSIT' });

    // 3. Mark orders as loaded
    const orderIds = plan.flatMap((c: any) => c.orders || []);
    if (orderIds.length > 0) {
      await storage.markOrdersAsLoaded(orderIds);
    }

    res.json(validation);
  });

  return httpServer;
}
