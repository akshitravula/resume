import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertResumeSchema } from "@shared/schema";
import { z } from "zod";
import nodemailer from "nodemailer";

// Nodemailer transporter setup (replace with your actual email service credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'workwithriyab@gmail.com', // Replace with your email
    pass: 'aerf pdld wjza fawq' // Replace with your email password or app password
  }
});

const otpStore: { [email: string]: string } = {};

export async function registerRoutes(app: Express): Promise<Server> {
  // Send OTP endpoint
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { email } = req.body;
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore[email] = otp;

      const mailOptions = {
        from: 'workwithriyab@gmail.com',
        to: email,
        subject: 'Your OTP for Career AI',
        text: `Your OTP is: ${otp}`
      };

      await transporter.sendMail(mailOptions);
      res.json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  // Verify OTP endpoint
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;
      if (otpStore[email] === otp) {
        delete otpStore[email]; // OTP is used, so remove it
        res.json({ message: "OTP verified successfully" });
      } else {
        res.status(400).json({ message: "Invalid OTP" });
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ message: "Failed to verify OTP" });
    }
  });

  // Authentication sync endpoint
  app.post("/api/auth/sync", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      let user = await storage.getUserByFirebaseUid(userData.firebaseUid);
      
      if (!user) {
        // Create new user
        user = await storage.createUser(userData);
      } else {
        // Update existing user
        user = await storage.updateUser(user.id, userData);
      }
      
      res.json(user);
    } catch (error) {
      console.error("Auth sync error:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  // Resume endpoints
  app.get("/api/resumes", async (req, res) => {
    try {
      // In a real app, you'd get the user ID from the session/token
      // For now, we'll assume we have user identification
      const firebaseUid = req.headers["x-firebase-uid"] as string;
      if (!firebaseUid) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUserByFirebaseUid(firebaseUid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const resumes = await storage.getResumesByUserId(user.id);
      res.json(resumes);
    } catch (error) {
      console.error("Get resumes error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/resumes/:id", async (req, res) => {
    try {
      const resume = await storage.getResume(req.params.id);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      res.json(resume);
    } catch (error) {
      console.error("Get resume error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/resumes", async (req, res) => {
    try {
      const firebaseUid = req.headers["x-firebase-uid"] as string;
      if (!firebaseUid) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUserByFirebaseUid(firebaseUid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const resumeData = insertResumeSchema.parse({
        ...req.body,
        userId: user.id,
      });

      const resume = await storage.createResume(resumeData);
      res.json(resume);
    } catch (error) {
      console.error("Create resume error:", error);
      res.status(400).json({ message: "Invalid resume data" });
    }
  });

  app.put("/api/resumes/:id", async (req, res) => {
    try {
      const resumeData = insertResumeSchema.omit({ userId: true }).parse(req.body);
      const resume = await storage.updateResume(req.params.id, resumeData);
      
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      
      res.json(resume);
    } catch (error) {
      console.error("Update resume error:", error);
      res.status(400).json({ message: "Invalid resume data" });
    }
  });

  app.delete("/api/resumes/:id", async (req, res) => {
    try {
      const success = await storage.deleteResume(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Resume not found" });
      }
      res.json({ message: "Resume deleted" });
    } catch (error) {
      console.error("Delete resume error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Test authentication endpoint for development
  app.post("/api/auth/test-login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Check for test credentials
      if (email === "workwithakshitr@gmail.com" && password === "Akshit123") {
        // Check if test user exists in database
        let user = await storage.getUserByFirebaseUid("test-user-firebase-uid");
        
        if (!user) {
          // Create test user if doesn't exist
          user = await storage.createUser({
            firebaseUid: "test-user-firebase-uid",
            email: "workwithakshitr@gmail.com",
            name: "Test User",
          });
        }
        
        res.json({ 
          success: true, 
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            firebaseUid: user.firebaseUid
          },
          message: "Test login successful" 
        });
      } else {
        res.status(401).json({ error: "Invalid test credentials" });
      }
    } catch (error) {
      console.error("Test login error:", error);
      res.status(500).json({ error: "Test login failed" });
    }
  });

  // Resume upload endpoint (simplified - in production would use multer for file handling)
  app.post("/api/resumes/upload", async (req, res) => {
    try {
      const firebaseUid = req.headers["x-firebase-uid"] as string;
      if (!firebaseUid) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUserByFirebaseUid(firebaseUid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // For now, we'll create a basic resume structure from the uploaded data
      const title = req.body.title || "Uploaded Resume";
      
      const basicResumeData = {
        personalInfo: {
          fullName: "Please update your name",
          jobTitle: "Please update your job title", 
          email: user.email || "",
          phone: "",
          summary: "Please update your professional summary"
        },
        workExperience: [],
        education: [],
        technicalSkills: [],
        softSkills: []
      };

      const resumeData = insertResumeSchema.parse({
        title,
        data: basicResumeData,
        userId: user.id,
        status: "in-progress"
      });

      const resume = await storage.createResume(resumeData);
      res.json(resume);
    } catch (error) {
      console.error("Upload resume error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
