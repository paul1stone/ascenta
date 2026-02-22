"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  demoRequestSchema,
  type DemoRequestInput,
} from "@/lib/validations/demo-request";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@ascenta/ui";

const roleOptions = [
  { value: "", label: "Select..." },
  { value: "hr-leader", label: "HR Leader / CHRO" },
  { value: "hr-manager", label: "HR Manager / Director" },
  { value: "hr-specialist", label: "HR Specialist / Coordinator" },
  { value: "it", label: "IT / Technical" },
  { value: "executive", label: "Executive / C-Suite" },
  { value: "other", label: "Other" },
];

const employeeOptions = [
  { value: "", label: "Select..." },
  { value: "1-50", label: "1-50" },
  { value: "51-200", label: "51-200" },
  { value: "201-500", label: "201-500" },
  { value: "501-1000", label: "501-1000" },
  { value: "1000+", label: "1000+" },
];

const selectClassName =
  "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function DemoForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DemoRequestInput>({
    resolver: zodResolver(demoRequestSchema),
  });

  async function onSubmit(data: DemoRequestInput) {
    setServerError(null);

    try {
      const response = await fetch("/api/demo-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Something went wrong");
      }

      setSubmitted(true);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Failed to submit. Please try again."
      );
    }
  }

  if (submitted) {
    return (
      <Card className="border-slate-200 shadow-xl">
        <CardContent className="py-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold text-deep-blue">
            Thank You!
          </h3>
          <p className="text-slate-600">
            Your demo request has been received. We&apos;ll be in touch within
            24 hours to schedule your personalized walkthrough.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-deep-blue">
          Request Your Demo
        </CardTitle>
        <CardDescription>
          Fill out the form and we&apos;ll be in touch within 24 hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                className="h-11"
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                className="h-11"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Work Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@company.com"
              className="h-11"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              placeholder="Acme Inc."
              className="h-11"
              {...register("company")}
            />
            {errors.company && (
              <p className="text-xs text-red-500">{errors.company.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Your Role</Label>
            <select
              id="role"
              className={selectClassName}
              {...register("role")}
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-xs text-red-500">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeCount">Number of Employees</Label>
            <select
              id="employeeCount"
              className={selectClassName}
              {...register("employeeCount")}
            >
              {employeeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.employeeCount && (
              <p className="text-xs text-red-500">
                {errors.employeeCount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              className="h-11"
              {...register("phone")}
            />
          </div>

          {serverError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-summit hover:bg-summit-hover text-white font-bold uppercase tracking-wide"
          >
            {isSubmitting ? "Submitting..." : "Schedule My Demo"}
          </Button>

          <p className="text-xs text-slate-500 text-center">
            By submitting this form, you agree to our{" "}
            <a href="/terms" className="text-summit hover:underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-summit hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
