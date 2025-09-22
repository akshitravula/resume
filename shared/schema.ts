import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  industry: text("industry"),
  brief: text("brief"),
  experience: text("experience"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const resumes = pgTable("resumes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  data: jsonb("data").notNull(),
  status: text("status").notNull().default("new"), // new, in-progress, completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Resume data structure schemas
export const workExperienceSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
});

export const educationSchema = z.object({
  id: z.string(),
  degree: z.string(),
  institution: z.string(),
  year: z.string(),
  gpa: z.string().optional(),
  description: z.string(),
});



export const porSchema = z.object({
  id: z.string(),
  title: z.string(),
  year: z.string(),
  bullets: z.array(z.string()),
  visible: z.boolean(),
});

export const achievementSchema = z.object({
  id: z.string(),
  title: z.string(),
  year: z.string(),
  description: z.string(),
  visible: z.boolean(),
});

export const certificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  year: z.string(),
  visible: z.boolean(),
});

export const skillsSchema = z.object({
  technical: z.string(),
  languages: z.string(),
  frameworks: z.string(),
  tools: z.string(),
});

export const resumeDataSchema = z.object({
  personalInfo: z.object({
    fullName: z.string(),
    jobTitle: z.string(),
    email: z.string().email(),
    phone: z.string(),
    summary: z.string(),
  }),
  workExperience: z.array(workExperienceSchema),
  education: z.array(educationSchema),
  projects: z.array(projectSchema),
  pors: z.array(porSchema),
  achievements: z.array(achievementSchema),
  certifications: z.array(certificationSchema),
  skills: skillsSchema,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumes.$inferSelect;
export type ResumeData = z.infer<typeof resumeDataSchema>;
export type WorkExperience = z.infer<typeof workExperienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Project = z.infer<typeof projectSchema>;
export type POR = z.infer<typeof porSchema>;
export type Achievement = z.infer<typeof achievementSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type Skills = z.infer<typeof skillsSchema>;
