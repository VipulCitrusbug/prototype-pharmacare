import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { signupSchema, loginSchema, insertPrescriptionSchema, insertPatientSchema, insertInventorySchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";
import multer from "multer";
import path from "path";
import fs from "fs";

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join(process.cwd(), "data", "finance_specialist");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + ext);
    }
  })
});

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

  app.patch("/api/auth/me", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Validate allowed fields
      const { firstName, lastName, email, phone } = req.body;
      const updates: any = {};
      if (firstName !== undefined) updates.firstName = firstName;
      if (lastName !== undefined) updates.lastName = lastName;
      if (email !== undefined) updates.email = email;
      if (phone !== undefined) updates.phone = phone;

      const user = await storage.updateUser(userId, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update user error:", error);
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

  app.post("/api/inventory", async (req, res) => {
    try {
      const result = insertInventorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: result.error.flatten(),
        });
      }

      const item = await storage.createInventoryItem(result.data);
      res.status(201).json(item);
    } catch (error) {
      console.error("Create inventory error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Patient routes
  app.get("/api/patients", async (req, res) => {
    try {
      const patients = await storage.getPatients();
      res.json(patients);
    } catch (error) {
      console.error("Get patients error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/patients", async (req, res) => {
    try {
      const result = insertPatientSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: result.error.flatten(),
        });
      }

      const patient = await storage.createPatient(result.data);
      res.status(201).json(patient);
    } catch (error) {
      console.error("Create patient error:", error);
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

  // Manager authorization middleware
  const requireManager = async (req: any, res: any, next: any) => {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await storage.getUser(userId);
    if (!user || user.role !== "manager") {
      return res.status(403).json({ error: "Forbidden: Manager access required" });
    }
    next();
  };

  // Manager endpoints
  app.get("/api/manager/metrics", requireManager, async (req, res) => {
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

  app.get("/api/manager/alerts", requireManager, async (req, res) => {
    try {
      await new Promise((r) => setTimeout(r, 200));

      // Load alerts from JSON file
      const fs = require("fs");
      const path = require("path");
      const alertsFilePath = path.join(process.cwd(), "data", "manager-alerts.json");
      
      let alerts = [];
      if (fs.existsSync(alertsFilePath)) {
        const data = fs.readFileSync(alertsFilePath, "utf-8");
        const parsed = JSON.parse(data);
        alerts = parsed.alerts || [];
      }

      res.json(alerts);
    } catch (error) {
      console.error("Get manager alerts error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Patient authorization middleware
  const requirePatient = async (req: any, res: any, next: any) => {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await storage.getUser(userId);
    if (!user || user.role !== "patient") {
      return res.status(403).json({ error: "Forbidden: Patient access required" });
    }
    next();
  };

  // Finance authorization middleware
  const requireFinance = async (req: any, res: any, next: any) => {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await storage.getUser(userId);
    if (!user || user.role !== "finance") {
      return res.status(403).json({ error: "Forbidden: Finance access required" });
    }
    next();
  };

  app.get("/api/finance/documents", requireFinance, async (req, res) => {
    try {
      const documents = await storage.getAllClaimDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Get all documents error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/finance/documents", requireFinance, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const document = await storage.addClaimDocument(req.body.claimRef || "unknown", {
        name: req.body.name || req.file.originalname,
        filename: req.file.filename,
        type: req.body.type || "other",
        size: req.file.size,
        path: req.file.path,
        claimId: req.body.claimRef || "unknown",
        patientName: req.body.patientName,
        claimRef: req.body.claimRef
      });

      res.status(201).json(document);
    } catch (error) {
      console.error("Upload document error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/finance/documents/:id", requireFinance, async (req, res) => {
    try {
      await storage.deleteClaimDocument(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      console.error("Delete document error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Finance endpoints
  app.post("/api/finance/claims/:id/documents", requireFinance, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const document = await storage.addClaimDocument(req.params.id, {
        name: req.body.name || req.file.originalname,
        filename: req.file.filename,
        type: "document", // You might want to get this from body or determine from file
        size: req.file.size,
        path: req.file.path,
        claimId: req.params.id
      });

      res.status(201).json(document);
    } catch (error) {
      console.error("Upload document error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/finance/claims/:id/documents", requireFinance, async (req, res) => {
    try {
      const documents = await storage.getClaimDocuments(req.params.id);
      res.json(documents);
    } catch (error) {
      console.error("Get claim documents error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/finance/documents/:filename", requireFinance, async (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(process.cwd(), "data", "finance_specialist", filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }

      res.download(filePath);
    } catch (error) {
      console.error("Download document error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/finance/metrics", requireFinance, async (req, res) => {
    try {
      await new Promise((r) => setTimeout(r, 200));

      res.json([
        {
          id: "pending-claims",
          title: "Claims Pending Review",
          value: 24,
          change: 3,
          changeType: "increase",
          icon: "clipboard",
          color: "amber",
        },
        {
          id: "ready-submit",
          title: "Ready for Submission",
          value: 18,
          change: 5,
          changeType: "increase",
          icon: "check",
          color: "success",
        },
        {
          id: "high-risk",
          title: "High-Risk Claims",
          value: 6,
          change: 2,
          changeType: "decrease",
          icon: "alert",
          color: "danger",
        },
        {
          id: "success-rate",
          title: "Success Rate",
          value: "94.2%",
          change: 2.1,
          changeType: "increase",
          icon: "trending-up",
          color: "success",
        },
      ]);
    } catch (error) {
      console.error("Get finance metrics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/finance/reports", requireFinance, async (req, res) => {
    try {
      const range = req.query.range as string || "30_days";
      await new Promise((r) => setTimeout(r, 600)); // Simulate calculation delay

      // Generate localized mock data based on range
      let multiplier = 1;
      switch (range) {
        case "7_days": multiplier = 0.2; break;
        case "30_days": multiplier = 1; break;
        case "90_days": multiplier = 2.5; break;
        case "year": multiplier = 10; break;
      }

      // 1. Top-level Metrics
      const totalClaims = Math.round(1247 * multiplier);
      const approvedClaims = Math.round(totalClaims * 0.94);
      const rejectedClaims = totalClaims - approvedClaims;
      const successRate = 94.2 + (Math.random() * 2 - 1); // Slight variation
      const totalReimbursed = Math.round(847523 * multiplier);
      const pendingAmount = Math.round(totalReimbursed * 0.15);
      const avgProcessingDays = 2.4 - (multiplier * 0.05);

      const metrics = {
        totalClaims,
        approvedClaims,
        rejectedClaims,
        successRate: Number(successRate.toFixed(1)),
        totalReimbursed,
        avgProcessingDays: Number(avgProcessingDays.toFixed(1)),
        pendingAmount,
      };

      // 2. Rejection Reasons (Scales counts)
      const rejectionReasons = [
        { reason: "Missing Prior Authorization", count: Math.round(28 * multiplier), percentage: 38.9 },
        { reason: "Invalid Member ID", count: Math.round(15 * multiplier), percentage: 20.8 },
        { reason: "Service Not Covered", count: Math.round(12 * multiplier), percentage: 16.7 },
        { reason: "Duplicate Claim", count: Math.round(9 * multiplier), percentage: 12.5 },
        { reason: "Incorrect Drug Code", count: Math.round(8 * multiplier), percentage: 11.1 },
      ];

      // 3. Payer Performance (Varies slightly randomly)
      const payerPerformance = [
        { payer: "BlueCross BlueShield", claims: Math.round(342 * multiplier), successRate: Number((96.2 + (Math.random() - 0.5)).toFixed(1)), avgDays: 1.8 },
        { payer: "Aetna", claims: Math.round(287 * multiplier), successRate: Number((94.8 + (Math.random() - 0.5)).toFixed(1)), avgDays: 2.1 },
        { payer: "United Healthcare", claims: Math.round(256 * multiplier), successRate: Number((93.4 + (Math.random() - 0.5)).toFixed(1)), avgDays: 2.6 },
        { payer: "Cigna", claims: Math.round(198 * multiplier), successRate: Number((95.1 + (Math.random() - 0.5)).toFixed(1)), avgDays: 2.3 },
        { payer: "Humana", claims: Math.round(164 * multiplier), successRate: Number((91.5 + (Math.random() - 0.5)).toFixed(1)), avgDays: 3.1 },
      ];

      // 4. Monthly/Period Trends
      // If range is 7 days, we might return daily data, but for now let's keep the shape consistent 
      // or return less months.
      let trendData = [];
      if (range === "7_days") {
        trendData = [
          { month: "Mon", claims: 45, approved: 42, rejected: 3 },
          { month: "Tue", claims: 52, approved: 49, rejected: 3 },
          { month: "Wed", claims: 48, approved: 45, rejected: 3 },
          { month: "Thu", claims: 55, approved: 52, rejected: 3 },
          { month: "Fri", claims: 60, approved: 58, rejected: 2 },
          { month: "Sat", claims: 32, approved: 30, rejected: 2 },
          { month: "Sun", claims: 28, approved: 26, rejected: 2 },
        ];
      } else {
         trendData = [
          { month: "Aug", claims: Math.round(198 * multiplier), approved: Math.round(185 * multiplier), rejected: Math.round(13 * multiplier) },
          { month: "Sep", claims: Math.round(215 * multiplier), approved: Math.round(201 * multiplier), rejected: Math.round(14 * multiplier) },
          { month: "Oct", claims: Math.round(234 * multiplier), approved: Math.round(220 * multiplier), rejected: Math.round(14 * multiplier) },
          { month: "Nov", claims: Math.round(256 * multiplier), approved: Math.round(243 * multiplier), rejected: Math.round(13 * multiplier) },
          { month: "Dec", claims: Math.round(289 * multiplier), approved: Math.round(274 * multiplier), rejected: Math.round(15 * multiplier) },
          { month: "Jan", claims: Math.round(55 * multiplier), approved: Math.round(52 * multiplier), rejected: Math.round(3 * multiplier) },
        ];
      }

      res.json({
        metrics,
        rejectionReasons,
        payerPerformance,
        monthlyTrends: trendData
      });

    } catch (error) {
      console.error("Get finance reports error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Patient endpoints
  app.get("/api/patient/metrics", requirePatient, async (req, res) => {
    try {
      await new Promise((r) => setTimeout(r, 200));

      res.json([
        {
          id: "active-rx",
          title: "Active Medications",
          value: 4,
          change: 0,
          changeType: "neutral",
          icon: "pill",
          color: "clinical",
        },
        {
          id: "pending-refills",
          title: "Pending Refills",
          value: 1,
          change: 1,
          changeType: "increase",
          icon: "refresh",
          color: "amber",
        },
        {
          id: "next-refill",
          title: "Next Refill Due",
          value: "3 days",
          change: 0,
          changeType: "neutral",
          icon: "calendar",
          color: "mint",
        },
        {
          id: "orders-in-progress",
          title: "Orders in Progress",
          value: 1,
          change: 0,
          changeType: "neutral",
          icon: "truck",
          color: "info",
        },
      ]);
    } catch (error) {
      console.error("Get patient metrics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Inventory endpoints (accessible to pharmacists and managers)
  app.get("/api/inventory", async (req, res) => {
    try {
      await new Promise((r) => setTimeout(r, 200));

      const inventory = await storage.getInventory();
      res.json(inventory);
    } catch (error) {
      console.error("Get inventory error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      await new Promise((r) => setTimeout(r, 500));

      const item = await storage.createInventoryItem(req.body);
      res.status(201).json(item);
    } catch (error) {
      console.error("Create inventory item error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}
