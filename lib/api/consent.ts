// Consent Management API

import { apiClient } from './client';

export interface ConsentSetting {
  id: string;
  employeeId: string;
  consentType: string;
  employerVisibility: boolean;
  dataSharingPreferences?: any;
  grantedAt: string;
  updatedAt: string;
}

export interface ConsentHistory {
  id: string;
  consentId: string;
  action: string;
  previousValue: any;
  newValue: any;
  changedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

// ─── Get Consent Settings ───────────────────────────────────────────
export async function getConsentSettings(): Promise<ConsentSetting[]> {
  try {
    const response = await apiClient.get<{ data: any[] }>(
      '/api/org/employee/consent/settings'
    );
    
    return Array.isArray(response.data) ? response.data.map((setting: any) => ({
    id: String(setting.id),
    employeeId: String(setting.employee_id),
    consentType: setting.consent_type,
    employerVisibility: setting.employer_visibility,
    dataSharingPreferences: setting.data_sharing_preferences,
    grantedAt: setting.granted_at,
    updatedAt: setting.updated_at,
  })) : [];
  } catch (error: any) {
    console.error('Failed to fetch consent settings:', error);
    return [];
  }
}

// ─── Update Consent Setting ─────────────────────────────────────────
export async function updateConsentSetting(data: {
  consentType: string;
  employerVisibility: boolean;
  dataSharingPreferences?: any;
}): Promise<ConsentSetting> {
  const response = await apiClient.put<any>(
    '/api/org/employee/consent/settings',
    {
      consent_type: data.consentType,
      employer_visibility: data.employerVisibility,
      data_sharing_preferences: data.dataSharingPreferences,
    }
  );
  
  return {
    id: String(response.id),
    employeeId: String(response.employee_id),
    consentType: response.consent_type,
    employerVisibility: response.employer_visibility,
    dataSharingPreferences: response.data_sharing_preferences,
    grantedAt: response.granted_at,
    updatedAt: response.updated_at,
  };
}

// ─── Get Consent History ────────────────────────────────────────────
export async function getConsentHistory(): Promise<ConsentHistory[]> {
  try {
    const response = await apiClient.get<{ data: any[] }>(
      '/api/org/employee/consent/history'
    );
    
    return Array.isArray(response.data) ? response.data.map((history: any) => ({
    id: String(history.id),
    consentId: String(history.consent_id),
    action: history.action,
    previousValue: history.previous_value,
    newValue: history.new_value,
    changedAt: history.changed_at,
    ipAddress: history.ip_address,
    userAgent: history.user_agent,
  })) : [];
  } catch (error: any) {
    console.error('Failed to fetch consent history:', error);
    return [];
  }
}

// ─── Revoke Consent ─────────────────────────────────────────────────
export async function revokeConsent(consentId: string): Promise<void> {
  await apiClient.post(`/api/org/employee/consent/${consentId}/revoke`);
}
