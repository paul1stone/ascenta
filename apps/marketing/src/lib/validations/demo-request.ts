import { z } from "zod";

export const demoRequestSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Please select your role"),
  employeeCount: z.string().min(1, "Please select employee count"),
  phone: z.string().optional(),
});

export type DemoRequestInput = z.infer<typeof demoRequestSchema>;
