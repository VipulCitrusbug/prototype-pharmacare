import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { signupSchema, loginSchema, insertPrescriptionSchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "pharmacare-secret-key",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000,
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  app.post("/api/auth/signup", async (req, res) => {
    try {
      await new Promise((r) => setTimeout(r, 500));

      const result = signupSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: result.error.flatten(),
        });
      }

      const existingUsername = await storage.getUserByUsername(result.data.username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(result.data.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const user = await storage.createUser(result.data);
      const { password, ...userWithoutPassword } = user;

      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      await new Promise((r) => setTimeout(r, 500));

      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: result.error.flatten(),
        });
      }

      const user = await storage.getUserByUsername(result.data.username);
      if (!user || user.password !== result.data.password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      (req.session as any).userId = user.id;

      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.json(null);
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.json(null);
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      await new Promise((r) => setTimeout(r, 300));

      const prescriptions = await storage.getPrescriptions();
      const pending = prescriptions.filter((p) => p.status === "pending").length;
      const inReview = prescriptions.filter((p) => p.status === "in_review").length;
      const preparing = prescriptions.filter((p) => p.status === "preparing").length;
      const completed = prescriptions.filter(
        (p) => p.status === "dispensed" || p.status === "ready" || p.status === "delivered"
      ).length;

      res.json([
        {
          id: "pending",
          title: "Pending Prescriptions",
          value: pending,
          change: 12,
          changeType: "increase",
          icon: "clipboard",
          color: "amber",
        },
        {
          id: "in-review",
          title: "In Review",
          value: inReview,
          change: -5,
          changeType: "decrease",
          icon: "eye",
          color: "info",
        },
        {
          id: "preparing",
          title: "Preparing",
          value: preparing,
          change: 3,
          changeType: "increase",
          icon: "package",
          color: "mint",
        },
        {
          id: "completed",
          title: "Completed Today",
          value: completed + 47,
          change: 8,
          changeType: "increase",
          icon: "check",
          color: "success",
        },
      ]);
    } catch (error) {
      console.error("Get metrics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/prescriptions", async (req, res) => {
    try {
      await new Promise((r) => setTimeout(r, 300));

      const { status, limit } = req.query;
      const prescriptions = await storage.getPrescriptions({
        status: status as string | undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json(prescriptions);
    } catch (error) {
      console.error("Get prescriptions error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/prescriptions/:id", async (req, res) => {
    try {
      await new Promise((r) => setTimeout(r, 200));

      const prescription = await storage.getPrescription(req.params.id);
      if (!prescription) {
        return res.status(404).json({ error: "Prescription not found" });
      }

      res.json(prescription);
    } catch (error) {
      console.error("Get prescription error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/prescriptions", async (req, res) => {
    try {
      await new Promise((r) => setTimeout(r, 500));

      const result = insertPrescriptionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: result.error.flatten(),
        });
      }

      const prescription = await storage.createPrescription(result.data);
      res.status(201).json(prescription);
    } catch (error) {
      console.error("Create prescription error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/prescriptions/:id", async (req, res) => {
    try {
      await new Promise((r) => setTimeout(r, 300));

      const prescription = await storage.updatePrescription(req.params.id, req.body);
      if (!prescription) {
        return res.status(404).json({ error: "Prescription not found" });
      }

      res.json(prescription);
    } catch (error) {
      console.error("Update prescription error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Manager endpoints
  app.get("/api/manager/metrics", async (req, res) => {
    try {
      await new Promise((r) => setTimeout(r, 300));

      const prescriptions = await storage.getPrescriptions();
      const totalVolume = prescriptions.length;
      const refillCount = prescriptions.filter(p => p.isRefill).length;
      const refillRate = totalVolume > 0 ? Math.round((refillCount / totalVolume) * 100) : 0;

      res.json([
        {
          id: "workload",
          title: "Current Workload",
          value: totalVolume + 150,
          change: 8,
          changeType: "increase",
          icon: "activity",
          color: "clinical",
        },
        {
          id: "refill-rate",
          title: "Refill Completion",
          value: `${refillRate + 60}%`,
          change: 2,
          changeType: "increase",
          icon: "refresh",
          color: "success",
        },
        {
          id: "turnaround",
          title: "Avg Turnaround",
          value: "18 min",
          change: -3,
          changeType: "decrease",
          icon: "clock",
          color: "mint",
        },
        {
          id: "inventory-health",
          title: "Inventory Health",
          value: "87%",
          change: -2,
          changeType: "decrease",
          icon: "package",
          color: "amber",
        },
      ]);
    } catch (error) {
      console.error("Get manager metrics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/manager/alerts", async (req, res) => {
    try {
      await new Promise((r) => setTimeout(r, 200));

      res.json([
        {
          id: "alert-1",
          type: "warning",
          category: "workflow",
          title: "Rising Refill Backlog",
          description: "Refill requests increased 23% in the last 2 hours",
          impact: "12 prescriptions affected",
          aiConfidence: 88,
          time: "15 min ago",
          acknowledged: false,
        },
        {
          id: "alert-2",
          type: "critical",
          category: "inventory",
          title: "High Expiry Risk",
          description: "3 medications approaching expiry within 30 days",
          impact: "$2,400 inventory at risk",
          aiConfidence: 94,
          time: "1 hour ago",
          acknowledged: false,
        },
        {
          id: "alert-3",
          type: "info",
          category: "capacity",
          title: "Peak Hour Approaching",
          description: "Historical data suggests 40% volume increase at 2 PM",
          impact: "Staff allocation recommended",
          aiConfidence: 91,
          time: "2 hours ago",
          acknowledged: true,
        },
      ]);
    } catch (error) {
      console.error("Get manager alerts error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}
