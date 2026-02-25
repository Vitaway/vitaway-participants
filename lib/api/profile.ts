// Profile API Service

import { apiClient } from "./client";
import type { Employee } from "@/types";

// ─── Get Employee Profile ───────────────────────────────────────────
export async function getProfile(): Promise<Employee> {
  const response = await apiClient.get<{ data: any }>(
    "/employee/profile",
  );

  const profile = response.data;
  return {
    id: String(profile.id),
    email: profile.email,
    firstName: profile.first_name || "",
    lastName: profile.last_name || "",
    organizationId: String(profile.organization_id),
    organizationName: profile.organization?.name || "",
    role: "EMPLOYEE",
    profilePicture: profile.profile_picture,
    dateOfBirth: profile.date_of_birth,
    phone: profile.phone,
    joinedAt: profile.created_at,
    enrollmentStatus: profile.enrollment_status || "active",
  };
}

// ─── Update Employee Profile ────────────────────────────────────────
export async function updateProfile(data: {
  phone?: string;
  preferences?: Record<string, any>;
}): Promise<Employee> {
  const response = await apiClient.put<{ data: any }>(
    "/employee/profile",
    {
      phone: data.phone,
      preferences: data.preferences,
    },
  );

  const profile = response.data;
  return {
    id: String(profile.id),
    email: profile.email,
    firstName: profile.first_name || "",
    lastName: profile.last_name || "",
    organizationId: String(profile.organization_id),
    organizationName: profile.organization?.name || "",
    role: "EMPLOYEE",
    profilePicture: profile.profile_picture,
    dateOfBirth: profile.date_of_birth,
    phone: profile.phone,
    joinedAt: profile.created_at,
    enrollmentStatus: profile.enrollment_status || "active",
  };
}
