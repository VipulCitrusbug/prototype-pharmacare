import { type User, type InsertUser, type Prescription, type InsertPrescription } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getPrescriptions(filters?: { status?: string; limit?: number }): Promise<Prescription[]>;
  getPrescription(id: string): Promise<Prescription | undefined>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  updatePrescription(id: string, data: Partial<Prescription>): Promise<Prescription | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private prescriptions: Map<string, Prescription>;

  constructor() {
    this.users = new Map();
    this.prescriptions = new Map();
    this.seedData();
  }

  private seedData() {
    const demoUser: User = {
      id: "demo-pharmacist",
      username: "pharmacist",
      password: "password123",
      email: "pharmacist@pharmacare.com",
      firstName: "John",
      lastName: "Smith",
      role: "pharmacist",
      avatar: null,
      createdAt: new Date(),
    };
    this.users.set(demoUser.id, demoUser);

    const samplePrescriptions: Prescription[] = [
      {
        id: "rx-001",
        patientId: "p-001",
        patientName: "Sarah Johnson",
        prescriberId: "dr-001",
        prescriberName: "Dr. Michael Chen",
        drugName: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily",
        duration: "30 days",
        instructions: "Take with meals",
        status: "pending",
        priority: "high",
        isRefill: false,
        isDelivery: true,
        aiConfidence: 95,
        aiNotes: "Clear prescription, verified dosage",
        pharmacistNotes: null,
        assignedPharmacistId: null,
        createdAt: new Date(Date.now() - 30 * 60000),
        updatedAt: new Date(),
        dispensedAt: null,
      },
      {
        id: "rx-002",
        patientId: "p-002",
        patientName: "James Wilson",
        prescriberId: "dr-002",
        prescriberName: "Dr. Emily Park",
        drugName: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        duration: "90 days",
        instructions: "Take in the morning",
        status: "in_review",
        priority: "medium",
        isRefill: true,
        isDelivery: false,
        aiConfidence: 88,
        aiNotes: "Refill request, previous history available",
        pharmacistNotes: null,
        assignedPharmacistId: null,
        createdAt: new Date(Date.now() - 2 * 60 * 60000),
        updatedAt: new Date(),
        dispensedAt: null,
      },
      {
        id: "rx-003",
        patientId: "p-003",
        patientName: "Maria Garcia",
        prescriberId: "dr-001",
        prescriberName: "Dr. Michael Chen",
        drugName: "Amoxicillin",
        dosage: "250mg",
        frequency: "Three times daily",
        duration: "7 days",
        instructions: "Complete full course",
        status: "preparing",
        priority: "critical",
        isRefill: false,
        isDelivery: true,
        aiConfidence: 92,
        aiNotes: "Antibiotic prescription, urgent",
        pharmacistNotes: null,
        assignedPharmacistId: null,
        createdAt: new Date(Date.now() - 15 * 60000),
        updatedAt: new Date(),
        dispensedAt: null,
      },
      {
        id: "rx-004",
        patientId: "p-004",
        patientName: "Robert Brown",
        prescriberId: "dr-003",
        prescriberName: "Dr. Lisa Wang",
        drugName: "Atorvastatin",
        dosage: "20mg",
        frequency: "Once daily at bedtime",
        duration: "90 days",
        instructions: "Take at night for best results",
        status: "pending",
        priority: "low",
        isRefill: true,
        isDelivery: false,
        aiConfidence: 78,
        aiNotes: "Handwritten, some characters unclear",
        pharmacistNotes: null,
        assignedPharmacistId: null,
        createdAt: new Date(Date.now() - 4 * 60 * 60000),
        updatedAt: new Date(),
        dispensedAt: null,
      },
      {
        id: "rx-005",
        patientId: "p-005",
        patientName: "Emily Davis",
        prescriberId: "dr-002",
        prescriberName: "Dr. Emily Park",
        drugName: "Omeprazole",
        dosage: "20mg",
        frequency: "Once daily before breakfast",
        duration: "14 days",
        instructions: "Take 30 minutes before eating",
        status: "pending",
        priority: "medium",
        isRefill: false,
        isDelivery: false,
        aiConfidence: 96,
        aiNotes: "Electronic prescription, all fields clear",
        pharmacistNotes: null,
        assignedPharmacistId: null,
        createdAt: new Date(Date.now() - 45 * 60000),
        updatedAt: new Date(),
        dispensedAt: null,
      },
      {
        id: "rx-006",
        patientId: "p-006",
        patientName: "David Kim",
        prescriberId: "dr-001",
        prescriberName: "Dr. Michael Chen",
        drugName: "Levothyroxine",
        dosage: "50mcg",
        frequency: "Once daily",
        duration: "90 days",
        instructions: "Take on empty stomach",
        status: "pending",
        priority: "high",
        isRefill: true,
        isDelivery: true,
        aiConfidence: 91,
        aiNotes: "Thyroid medication refill",
        pharmacistNotes: null,
        assignedPharmacistId: null,
        createdAt: new Date(Date.now() - 1 * 60 * 60000),
        updatedAt: new Date(),
        dispensedAt: null,
      },
    ];

    samplePrescriptions.forEach((rx) => {
      this.prescriptions.set(rx.id, rx);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async getPrescriptions(filters?: { status?: string; limit?: number }): Promise<Prescription[]> {
    let prescriptions = Array.from(this.prescriptions.values());

    if (filters?.status) {
      const statuses = filters.status.split(",");
      prescriptions = prescriptions.filter((rx) => statuses.includes(rx.status));
    }

    prescriptions.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
    });

    if (filters?.limit) {
      prescriptions = prescriptions.slice(0, filters.limit);
    }

    return prescriptions;
  }

  async getPrescription(id: string): Promise<Prescription | undefined> {
    return this.prescriptions.get(id);
  }

  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    const id = randomUUID();
    const prescription: Prescription = {
      ...insertPrescription,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      dispensedAt: null,
    };
    this.prescriptions.set(id, prescription);
    return prescription;
  }

  async updatePrescription(id: string, data: Partial<Prescription>): Promise<Prescription | undefined> {
    const existing = this.prescriptions.get(id);
    if (!existing) return undefined;

    const updated: Prescription = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };

    if (data.status === "dispensed" && !updated.dispensedAt) {
      updated.dispensedAt = new Date();
    }

    this.prescriptions.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
