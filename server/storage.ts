import { type User, type InsertUser, type Prescription, type InsertPrescription, type InventoryItem, type InsertInventory, type Patient, type InsertPatient } from "@shared/schema";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";

export interface ClaimDocument {
  id: string;
  claimId: string;
  name: string;
  filename: string;
  type: string;
  uploadedAt: string;
  size: number;
  path: string;
  patientName?: string;
  claimRef?: string;
}

export interface PricingRule {
  id: string;
  name: string;
  description: string;
  type: "discount" | "surcharge" | "override" | "tier";
  value: number;
  valueType: "percentage" | "fixed";
  conditions: string[];
  status: "active" | "inactive" | "draft";
  priority: number;
  validFrom: string;
  validTo: string | null;
  usageCount: number;
  lastTriggered: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  
  getPrescriptions(filters?: { status?: string; limit?: number }): Promise<Prescription[]>;
  getPrescription(id: string): Promise<Prescription | undefined>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  updatePrescription(id: string, data: Partial<Prescription>): Promise<Prescription | undefined>;
  
  getInventory(): Promise<InventoryItem[]>;
  getInventoryItem(id: string): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventory): Promise<InventoryItem>;
  updateInventoryItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem | undefined>;

  getPatients(): Promise<Patient[]>;
  getPatient(id: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;

  getClaimDocuments(claimId: string): Promise<ClaimDocument[]>;
  getAllClaimDocuments(): Promise<ClaimDocument[]>;
  addClaimDocument(claimId: string, document: Omit<ClaimDocument, "id" | "uploadedAt">): Promise<ClaimDocument>;
  deleteClaimDocument(id: string): Promise<void>;

  getPricingRules(): Promise<PricingRule[]>;
  getPricingRule(id: string): Promise<PricingRule | undefined>;
  createPricingRule(rule: Omit<PricingRule, "id" | "createdAt" | "updatedAt" | "usageCount" | "lastTriggered">): Promise<PricingRule>;
  updatePricingRule(id: string, rule: Partial<PricingRule>): Promise<PricingRule | undefined>;
  deletePricingRule(id: string): Promise<boolean>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const PRESCRIPTIONS_FILE = path.join(DATA_DIR, "prescriptions.json");
const INVENTORY_FILE = path.join(DATA_DIR, "inventory.json");
const PATIENTS_FILE = path.join(DATA_DIR, "patients.json");

const CLAIM_DOCUMENTS_FILE = path.join(DATA_DIR, "finance_specialist", "documents.json");
const PRICING_RULES_FILE = path.join(DATA_DIR, "pricing", "rules.json");

export class JsonStorage implements IStorage {
  constructor() {
    this.ensureDataDirectory();
    this.initializeFiles();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }



  private initializeFiles() {
    // Initialize users file if it doesn't exist
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2), "utf-8");
    }
    
    // Initialize prescriptions file if it doesn't exist
    if (!fs.existsSync(PRESCRIPTIONS_FILE)) {
      fs.writeFileSync(PRESCRIPTIONS_FILE, JSON.stringify({ prescriptions: [] }, null, 2), "utf-8");
    }
    
    // Initialize inventory file if it doesn't exist - load from existing file
    if (!fs.existsSync(INVENTORY_FILE)) {
      fs.writeFileSync(INVENTORY_FILE, JSON.stringify({ inventory: [] }, null, 2), "utf-8");
    }

    // Initialize patients file if it doesn't exist
    if (!fs.existsSync(PATIENTS_FILE)) {
      fs.writeFileSync(PATIENTS_FILE, JSON.stringify({ patients: [] }, null, 2), "utf-8");
    }

    // Initialize claim documents file if it doesn't exist
    if (!fs.existsSync(CLAIM_DOCUMENTS_FILE)) {
      const dir = path.dirname(CLAIM_DOCUMENTS_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(CLAIM_DOCUMENTS_FILE, JSON.stringify({ documents: [] }, null, 2), "utf-8");
    }

    // Initialize pricing rules file if it doesn't exist
    if (!fs.existsSync(PRICING_RULES_FILE)) {
      const dir = path.dirname(PRICING_RULES_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      // Initialize with mock data if creating for the first time
      const initialRules = [
        {
          id: "rule-001",
          name: "Senior Citizen Discount",
          description: "10% discount for customers aged 65 and above",
          type: "discount",
          value: 10,
          valueType: "percentage",
          conditions: ["Age >= 65", "Valid ID Required"],
          status: "active",
          priority: 1,
          validFrom: "2024-01-01",
          validTo: null,
          usageCount: 1245,
          lastTriggered: "2025-12-31T10:30:00Z",
          createdBy: "Admin Sarah",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-06-15T14:30:00Z",
        },
        {
          id: "rule-002",
          name: "Generic Medication Discount",
          description: "15% discount on all generic medications",
          type: "discount",
          value: 15,
          valueType: "percentage",
          conditions: ["Medication Type = Generic"],
          status: "active",
          priority: 2,
          validFrom: "2024-03-01",
          validTo: null,
          usageCount: 3567,
          lastTriggered: "2025-12-31T11:45:00Z",
          createdBy: "Admin John",
          createdAt: "2024-03-01T00:00:00Z",
          updatedAt: "2024-03-01T00:00:00Z",
        },
        {
          id: "rule-003",
          name: "Insurance Tier A Copay",
          description: "Fixed copay amount for Tier A insurance members",
          type: "override",
          value: 10,
          valueType: "fixed",
          conditions: ["Insurance Tier = A", "In-Network Provider"],
          status: "active",
          priority: 1,
          validFrom: "2024-01-01",
          validTo: "2025-12-31",
          usageCount: 892,
          lastTriggered: "2025-12-30T16:20:00Z",
          createdBy: "Admin Sarah",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-09-01T10:00:00Z",
        },
        {
          id: "rule-004",
          name: "Loyalty Gold Member",
          description: "5% additional discount for gold loyalty members",
          type: "discount",
          value: 5,
          valueType: "percentage",
          conditions: ["Loyalty Tier = Gold", "Active Membership"],
          status: "active",
          priority: 3,
          validFrom: "2024-06-01",
          validTo: null,
          usageCount: 456,
          lastTriggered: "2025-12-31T09:15:00Z",
          createdBy: "Admin John",
          createdAt: "2024-06-01T00:00:00Z",
          updatedAt: "2024-06-01T00:00:00Z",
        },
        {
          id: "rule-005",
          name: "Holiday Promo 2023",
          description: "Seasonal holiday discount - expired",
          type: "discount",
          value: 20,
          valueType: "percentage",
          conditions: ["Date Range: Dec 15-31, 2023"],
          status: "inactive",
          priority: 1,
          validFrom: "2023-12-15",
          validTo: "2023-12-31",
          usageCount: 234,
          lastTriggered: "2023-12-31T23:45:00Z",
          createdBy: "Admin Sarah",
          createdAt: "2023-12-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "rule-006",
          name: "Employee Discount",
          description: "Employee pharmacy discount program",
          type: "discount",
          value: 25,
          valueType: "percentage",
          conditions: ["Employee ID Valid", "Active Employment"],
          status: "active",
          priority: 1,
          validFrom: "2024-01-01",
          validTo: null,
          usageCount: 89,
          lastTriggered: "2025-12-28T14:30:00Z",
          createdBy: "Admin John",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        }
      ];
      fs.writeFileSync(PRICING_RULES_FILE, JSON.stringify({ rules: initialRules }, null, 2), "utf-8");
    }
  }

  private readUsers(): User[] {
    try {
      const data = fs.readFileSync(USERS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      
      if (parsed.users && Array.isArray(parsed.users)) {
        return parsed.users.map((user: any) => ({
          ...user,
          createdAt: new Date(user.createdAt),
        }));
      }
      return [];
    } catch (error) {
      console.error("Error reading users from file:", error);
      return [];
    }
  }

  private writeUsers(users: User[]) {
    try {
      const data = JSON.stringify({ users }, null, 2);
      fs.writeFileSync(USERS_FILE, data, "utf-8");
    } catch (error) {
      console.error("Error writing users to file:", error);
      throw error;
    }
  }

  private readPrescriptions(): Prescription[] {
    try {
      const data = fs.readFileSync(PRESCRIPTIONS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      
      if (parsed.prescriptions && Array.isArray(parsed.prescriptions)) {
        return parsed.prescriptions.map((rx: any) => ({
          ...rx,
          createdAt: rx.createdAt ? new Date(rx.createdAt) : null,
          updatedAt: rx.updatedAt ? new Date(rx.updatedAt) : new Date(),
          dispensedAt: rx.dispensedAt ? new Date(rx.dispensedAt) : null,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error reading prescriptions from file:", error);
      return [];
    }
  }

  private writePrescriptions(prescriptions: Prescription[]) {
    try {
      const data = JSON.stringify({ prescriptions }, null, 2);
      fs.writeFileSync(PRESCRIPTIONS_FILE, data, "utf-8");
    } catch (error) {
      console.error("Error writing prescriptions to file:", error);
      throw error;
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const users = this.readUsers();
    return users.find((user) => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = this.readUsers();
    return users.find((user) => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = this.readUsers();
    return users.find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const users = this.readUsers();
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      role: insertUser.role || "patient",
      avatar: insertUser.avatar || null,
      phone: insertUser.phone || null,
    };
    users.push(user);
    this.writeUsers(users);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const users = this.readUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;

    const updatedUser = { ...users[index], ...updates };
    users[index] = updatedUser;
    this.writeUsers(users);
    return updatedUser;
  }

  async getPrescriptions(filters?: { status?: string; limit?: number }): Promise<Prescription[]> {
    let prescriptions = this.readPrescriptions();

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
    const prescriptions = this.readPrescriptions();
    return prescriptions.find((rx) => rx.id === id);
  }

  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    const prescriptions = this.readPrescriptions();
    const id = randomUUID();
    const prescription: Prescription = {
      ...insertPrescription,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      dispensedAt: null,
      status: insertPrescription.status || "pending",
      priority: insertPrescription.priority || "medium",
      prescriberId: insertPrescription.prescriberId ?? null,
      prescriberName: insertPrescription.prescriberName ?? null,
      duration: insertPrescription.duration ?? null,
      instructions: insertPrescription.instructions ?? null,
      isRefill: insertPrescription.isRefill ?? false,
      isDelivery: insertPrescription.isDelivery ?? false,
      aiConfidence: insertPrescription.aiConfidence ?? null,
      aiNotes: insertPrescription.aiNotes ?? null,
      pharmacistNotes: insertPrescription.pharmacistNotes ?? null,
      assignedPharmacistId: insertPrescription.assignedPharmacistId ?? null,
    };
    prescriptions.push(prescription);
    this.writePrescriptions(prescriptions);
    return prescription;
  }

  async updatePrescription(id: string, data: Partial<Prescription>): Promise<Prescription | undefined> {
    const prescriptions = this.readPrescriptions();
    const index = prescriptions.findIndex((rx) => rx.id === id);
    
    if (index === -1) return undefined;

    const updated: Prescription = {
      ...prescriptions[index],
      ...data,
      updatedAt: new Date(),
    };

    if (data.status === "dispensed" && !updated.dispensedAt) {
      updated.dispensedAt = new Date();
    }

    prescriptions[index] = updated;
    this.writePrescriptions(prescriptions);
    return updated;
  }

  private readInventory(): InventoryItem[] {
    try {
      const data = fs.readFileSync(INVENTORY_FILE, "utf-8");
      const parsed = JSON.parse(data);
      
      if (parsed.inventory && Array.isArray(parsed.inventory)) {
        return parsed.inventory;
      }
      return [];
    } catch (error) {
      console.error("Error reading inventory from file:", error);
      return [];
    }
  }

  private writeInventory(inventory: InventoryItem[]) {
    try {
      const data = JSON.stringify({ inventory }, null, 2);
      fs.writeFileSync(INVENTORY_FILE, data, "utf-8");
    } catch (error) {
      console.error("Error writing inventory to file:", error);
      throw error;
    }
  }

  async getInventory(): Promise<InventoryItem[]> {
    return this.readInventory();
  }

  async getInventoryItem(id: string): Promise<InventoryItem | undefined> {
    const inventory = this.readInventory();
    return inventory.find((item) => item.id === id);
  }

  async createInventoryItem(insertItem: InsertInventory): Promise<InventoryItem> {
    const inventory = this.readInventory();
    const id = randomUUID();
    const item: InventoryItem = {
      ...insertItem,
      id,
      status: insertItem.status || "available",
    };
    inventory.push(item);
    this.writeInventory(inventory);
    return item;
  }

  async updateInventoryItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem | undefined> {
    const inventory = this.readInventory();
    const index = inventory.findIndex((item) => item.id === id);
    
    if (index === -1) return undefined;

    const updated: InventoryItem = {
      ...inventory[index],
      ...data,
    };

    inventory[index] = updated;
    this.writeInventory(inventory);
    return updated;
  }

  // Patient methods
  private readPatients(): Patient[] {
    try {
      if (!fs.existsSync(PATIENTS_FILE)) return [];
      
      const data = fs.readFileSync(PATIENTS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed.patients && Array.isArray(parsed.patients)) {
        return parsed.patients.map((p: any) => ({
          ...p,
          dateOfBirth: new Date(p.dateOfBirth),
          lastVisit: p.lastVisit ? new Date(p.lastVisit) : new Date(),
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        }));
      }
      return [];
    } catch (error) {
      console.error("Error reading patients from file:", error);
      return [];
    }
  }

  private writePatients(patients: Patient[]) {
    try {
      const data = JSON.stringify({ patients }, null, 2);
      fs.writeFileSync(PATIENTS_FILE, data, "utf-8");
    } catch (error) {
      console.error("Error writing patients to file:", error);
      throw error;
    }
  }

  async getPatients(): Promise<Patient[]> {
    return this.readPatients();
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    const patients = this.readPatients();
    return patients.find(p => p.id === id);
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const patients = this.readPatients();
    const newPatient: Patient = {
      ...patient,
      id: randomUUID(),
      lastVisit: new Date(),
      createdAt: new Date(),
      activePrescriptions: 0,
      address: patient.address || null,
      insuranceProvider: patient.insuranceProvider || null,
      insurancePolicyNumber: patient.insurancePolicyNumber || null,
      allergies: patient.allergies || [],
    };
    patients.push(newPatient);
    this.writePatients(patients);
    return newPatient;
  }


  // Claim Document methods
  private readClaimDocuments(): ClaimDocument[] {
    try {
      if (!fs.existsSync(CLAIM_DOCUMENTS_FILE)) return [];
      
      const data = fs.readFileSync(CLAIM_DOCUMENTS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed.documents && Array.isArray(parsed.documents)) {
        return parsed.documents;
      }
      return [];
    } catch (error) {
      console.error("Error reading claim documents from file:", error);
      return [];
    }
  }

  private writeClaimDocuments(documents: ClaimDocument[]) {
    try {
      const data = JSON.stringify({ documents }, null, 2);
      fs.writeFileSync(CLAIM_DOCUMENTS_FILE, data, "utf-8");
    } catch (error) {
      console.error("Error writing claim documents to file:", error);
      throw error;
    }
  }

  async getClaimDocuments(claimId: string): Promise<ClaimDocument[]> {
    const documents = this.readClaimDocuments();
    return documents.filter(doc => doc.claimId === claimId);
  }

  async getAllClaimDocuments(): Promise<ClaimDocument[]> {
    return this.readClaimDocuments();
  }

  async addClaimDocument(claimId: string, document: Omit<ClaimDocument, "id" | "uploadedAt">): Promise<ClaimDocument> {
    const documents = this.readClaimDocuments();
    const newDoc: ClaimDocument = {
      ...document,
      id: randomUUID(),
      uploadedAt: new Date().toISOString(),
      claimId,
    };
    documents.push(newDoc);
    this.writeClaimDocuments(documents);
    return newDoc;
  }

  async deleteClaimDocument(id: string): Promise<void> {
    const documents = this.readClaimDocuments();
    const filtered = documents.filter(doc => doc.id !== id);
    this.writeClaimDocuments(filtered);
  }


  // Pricing Rules
  private readPricingRules(): PricingRule[] {
    try {
      const data = fs.readFileSync(PRICING_RULES_FILE, "utf-8");
      return JSON.parse(data).rules;
    } catch (error) {
      return [];
    }
  }

  async getPricingRules(): Promise<PricingRule[]> {
    return this.readPricingRules();
  }

  async getPricingRule(id: string): Promise<PricingRule | undefined> {
    return this.readPricingRules().find(r => r.id === id);
  }

  async createPricingRule(rule: Omit<PricingRule, "id" | "createdAt" | "updatedAt" | "usageCount" | "lastTriggered">): Promise<PricingRule> {
    const rules = this.readPricingRules();
    const newRule: PricingRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      lastTriggered: null
    };
    rules.push(newRule);
    fs.writeFileSync(PRICING_RULES_FILE, JSON.stringify({ rules }, null, 2), "utf-8");
    return newRule;
  }

  async updatePricingRule(id: string, updates: Partial<PricingRule>): Promise<PricingRule | undefined> {
    const rules = this.readPricingRules();
    const index = rules.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    
    const updatedRule = {
      ...rules[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    rules[index] = updatedRule;
    fs.writeFileSync(PRICING_RULES_FILE, JSON.stringify({ rules }, null, 2), "utf-8");
    return updatedRule;
  }

  async deletePricingRule(id: string): Promise<boolean> {
    const rules = this.readPricingRules();
    const filteredRules = rules.filter(r => r.id !== id);
    if (filteredRules.length === rules.length) return false;
    
    try {
      fs.writeFileSync(PRICING_RULES_FILE, JSON.stringify({ rules: filteredRules }, null, 2), "utf-8");
      return true;
    } catch (error) {
      console.error("Error deleting pricing rule:", error);
      throw error;
    }
  }
}

export const storage = new JsonStorage();
