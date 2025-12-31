import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const UserRole = {
  PHARMACIST: "pharmacist",
  MANAGER: "manager",
  PATIENT: "patient",
  FINANCE: "finance",
  COMPLIANCE: "compliance",
  ADMIN: "admin",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export const PrescriptionStatus = {
  PENDING: "pending",
  IN_REVIEW: "in_review",
  PREPARING: "preparing",
  DISPENSED: "dispensed",
  READY: "ready",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export type PrescriptionStatusType = (typeof PrescriptionStatus)[keyof typeof PrescriptionStatus];

export const PriorityLevel = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export type PriorityLevelType = (typeof PriorityLevel)[keyof typeof PriorityLevel];

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("patient"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const prescriptions = pgTable("prescriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull(),
  patientName: text("patient_name").notNull(),
  prescriberId: varchar("prescriber_id"),
  prescriberName: text("prescriber_name"),
  drugName: text("drug_name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  duration: text("duration"),
  instructions: text("instructions"),
  status: text("status").notNull().default("pending"),
  priority: text("priority").notNull().default("medium"),
  isRefill: boolean("is_refill").default(false),
  isDelivery: boolean("is_delivery").default(false),
  aiConfidence: integer("ai_confidence"),
  aiNotes: text("ai_notes"),
  pharmacistNotes: text("pharmacist_notes"),
  assignedPharmacistId: varchar("assigned_pharmacist_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  dispensedAt: timestamp("dispensed_at"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  dispensedAt: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = insertUserSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["pharmacist", "manager", "patient", "finance", "compliance", "admin"]),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type Prescription = typeof prescriptions.$inferSelect;
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

export interface DashboardMetric {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  icon: string;
  color: "clinical" | "mint" | "amber" | "success" | "danger" | "info";
}

export interface QueueItem extends Prescription {
  urgencyScore?: number;
  waitTime?: string;
}
