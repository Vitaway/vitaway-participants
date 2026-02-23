// Auth API service — Real API implementation

import { apiClient } from './client';
import type {
  AuthUser,
  AuthTokens,
  LoginCredentials,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  AcceptInvitePayload,
} from '@/types/auth';

interface LoginResponseData {
  user_id: number;
  employee_id: number;
  role: string;
  organization_id: number;
  permissions: string[];
  access_token: string;
  token_type: string;
  expires_at: string;
}

interface LoginResponse {
  data: LoginResponseData;
  message?: string;
  success: boolean;
}

// ─── Login ──────────────────────────────────────────────────────────
export async function login(
  credentials: LoginCredentials
): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  const response = await apiClient.post<LoginResponse>(
    '/api/org/employee/auth/login',
    credentials
  );

  const { data } = response;

  // Transform backend response to frontend format
  const user: AuthUser = {
    id: String(data.user_id),
    email: credentials.email,
    firstName: '', // Will be fetched from profile
    lastName: '',
    role: data.role as 'EMPLOYEE',
    organizationId: String(data.organization_id),
    organizationName: '', // Will be fetched from profile
  };

  // Parse token expiry - backend may not provide expires_at
  let expiresAt: number;
  
  if (data.expires_at) {
    expiresAt = new Date(data.expires_at).getTime();
    console.log('Backend expires_at:', data.expires_at);
    console.log('Parsed expiresAt timestamp:', expiresAt);
    
    if (isNaN(expiresAt)) {
      console.warn('Invalid expires_at from backend, using default 30 minutes');
      expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes from now
    }
  } else {
    // Backend doesn't provide expires_at, default to 30 minutes
    console.log('Backend did not provide expires_at, defaulting to 30 minutes');
    expiresAt = Date.now() + 30 * 60 * 1000;
  }
  
  console.log('Token will expire at:', new Date(expiresAt).toISOString());

  const tokens: AuthTokens = {
    accessToken: data.access_token,
    refreshToken: data.access_token, // Backend uses same token
    expiresAt,
  };

  return { user, tokens };
}

// ─── Logout ─────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  await apiClient.post('/api/org/employee/auth/logout');
  // Token cleanup is handled by auth-context clearTokens()
}

// ─── Get Current User ───────────────────────────────────────────────
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('vitaway_access_token');
  if (!token) return null;

  try {
    // Fetch employee profile to get current user data
    const response = await apiClient.get<{ data: any; success: boolean }>('/api/org/employee/profile');
    const profile = response.data;
    
    console.log('Profile data:', profile);
    
    if (!profile.organization_id) {
      console.error('Profile missing organization_id:', profile);
    }
    
    return {
      id: String(profile.id),
      email: profile.email,
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      role: 'EMPLOYEE',
      organizationId: String(profile.organization_id || ''),
      organizationName: profile.organization?.name || '',
    };
  } catch (error) {
    // Token is invalid, clear it
    localStorage.removeItem('vitaway_access_token');
    localStorage.removeItem('vitaway_token_expires_at');
    return null;
  }
}

// ─── Refresh Token ──────────────────────────────────────────────────
export async function refreshToken(
  _refreshToken: string
): Promise<AuthTokens> {
  const response = await apiClient.post<LoginResponse>(
    '/api/org/employee/auth/refresh'
  );

  // Store new token
  if (typeof window !== 'undefined') {
    localStorage.setItem('vitaway_access_token', response.data.access_token);
    localStorage.setItem('vitaway_token_expires_at', response.data.expires_at);
  }

  return {
    accessToken: response.data.access_token,
    refreshToken: response.data.access_token,
    expiresAt: new Date(response.data.expires_at).getTime(),
  };
}

// ─── Forgot Password ───────────────────────────────────────────────
export async function forgotPassword(
  payload: ForgotPasswordPayload
): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(
    '/api/organization/employee/auth/forgot-password',
    payload
  );
  
  return response;
}

// ─── Reset Password ────────────────────────────────────────────────
export async function resetPassword(
  payload: ResetPasswordPayload
): Promise<{ message: string }> {
  // Validate on client side first
  if (payload.password !== payload.confirmPassword) {
    throw new Error('Passwords do not match');
  }
  if (payload.password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const response = await apiClient.post<{ message: string }>(
    '/api/organization/employee/auth/reset-password',
    {
      token: payload.token,
      password: payload.password,
      password_confirmation: payload.confirmPassword,
    }
  );
  
  return response;
}

// ─── Accept Invite ──────────────────────────────────────────────────
export async function acceptInvite(
  payload: AcceptInvitePayload
): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  // Validate on client side first
  if (payload.password !== payload.confirmPassword) {
    throw new Error('Passwords do not match');
  }
  if (payload.password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const response = await apiClient.post<LoginResponse>(
    '/api/organization/employee/auth/accept-invite',
    {
      token: payload.token,
      first_name: payload.firstName,
      last_name: payload.lastName,
      password: payload.password,
      password_confirmation: payload.confirmPassword,
    }
  );

  // Store token
  if (typeof window !== 'undefined') {
    localStorage.setItem('vitaway_access_token', response.data.access_token);
    localStorage.setItem('vitaway_token_expires_at', response.data.expires_at);
  }

  const user: AuthUser = {
    id: String(response.data.user_id),
    email: '', // Will be set from profile
    firstName: payload.firstName,
    lastName: payload.lastName,
    role: response.data.role as 'EMPLOYEE',
    organizationId: String(response.data.organization_id),
    organizationName: '',
  };

  const tokens: AuthTokens = {
    accessToken: response.data.access_token,
    refreshToken: response.data.access_token,
    expiresAt: new Date(response.data.expires_at).getTime(),
  };

  return { user, tokens };
}

// ─── Validate Invite Token ─────────────────────────────────────────
export async function validateInviteToken(
  token: string
): Promise<{ valid: boolean; email: string; organizationName: string }> {
  const response = await apiClient.get<{
    valid: boolean;
    email: string;
    organization_name: string;
  }>(`/api/organization/employee/auth/invite/${token}/validate`);
  
  return {
    valid: response.valid,
    email: response.email,
    organizationName: response.organization_name,
  };
}
