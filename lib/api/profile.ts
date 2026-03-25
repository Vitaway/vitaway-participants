// Profile API Service
/* eslint-disable @typescript-eslint/no-explicit-any */

import { apiClient } from "./client";
import type { Employee } from "@/types";

function mapProfile(profile: any): Employee {
  return {
    id: String(profile.id),
    email: profile.email,
    firstName: profile.first_name || profile.firstname || "",
    lastName: profile.last_name || profile.lastname || "",
    organizationId: String(profile.organization_id || profile.organization?.id || ""),
    organizationName: profile.organization?.name || "",
    role: "EMPLOYEE",
    profilePicture: profile.profile_picture,
    dateOfBirth: profile.date_of_birth,
    phone: profile.phone,
    joinedAt: profile.created_at,
    enrollmentStatus: profile.enrollment_status || "active",
  };
}

// ─── Get Employee Profile ───────────────────────────────────────────
export async function getProfile(): Promise<Employee> {
  const response = await apiClient.get<{ data: any }>(
    "/api/organization/employee/profile",
  );
  return mapProfile(response.data);
}

// ─── Update Employee Profile ────────────────────────────────────────
export async function updateProfile(data: {
  phone?: string;
  preferences?: Record<string, any>;
}): Promise<Employee> {
  const response = await apiClient.put<{ data: any }>(
    "/api/organization/employee/profile",
    {
      phone: data.phone,
      preferences: data.preferences,
    },
  );
  return mapProfile(response.data);
}
