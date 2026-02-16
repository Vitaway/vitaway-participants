// Privacy & Consent Management Page

'use client';

import { useEffect, useState } from 'react';
import { Shield, CheckCircle, XCircle, History, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getConsentSettings, updateConsentSetting, type ConsentSetting } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface ConsentPreferences {
  allowEmployerAccess: boolean;
  allowAggregatedData: boolean;
  allowIndividualData: boolean;
  lastUpdated: string;
  version: string;
}

export default function ConsentPage() {
  const [settings, setSettings] = useState<ConsentSetting[]>([]);
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [tempPreferences, setTempPreferences] = useState<ConsentPreferences | null>(null);

  // Convert array of consent settings to preferences object
  const convertToPreferences = (consentSettings: ConsentSetting[]): ConsentPreferences => {
    const findSetting = (type: string) => 
      consentSettings.find(s => s.consentType === type);
    
    const employerAccess = findSetting('employer_access');
    const aggregatedData = findSetting('aggregated_data');
    const individualData = findSetting('individual_data');
    
    const lastUpdated = consentSettings.reduce((latest, setting) => {
      const date = new Date(setting.updatedAt);
      return date > new Date(latest) ? setting.updatedAt : latest;
    }, consentSettings[0]?.updatedAt || new Date().toISOString());

    return {
      allowEmployerAccess: employerAccess?.employerVisibility ?? false,
      allowAggregatedData: aggregatedData?.employerVisibility ?? false,
      allowIndividualData: individualData?.employerVisibility ?? false,
      lastUpdated,
      version: '1.0',
    };
  };

  useEffect(() => {
    async function loadData() {
      try {
        const settingsData = await getConsentSettings();
        setSettings(settingsData);
        const prefs = convertToPreferences(settingsData);
        setPreferences(prefs);
        setTempPreferences(prefs);
      } catch (error) {
        console.error('Failed to load consent preferences:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleToggle = (key: keyof ConsentPreferences) => {
    if (!tempPreferences) return;

    const updatedPreferences = {
      ...tempPreferences,
      [key]: !tempPreferences[key],
    };

    setTempPreferences(updatedPreferences);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!tempPreferences) return;

    setSaving(true);
    try {
      // Map UI preferences to API consent types
      const updates = [
        { type: 'employer_access', value: tempPreferences.allowEmployerAccess },
        { type: 'aggregated_data', value: tempPreferences.allowAggregatedData },
        { type: 'individual_data', value: tempPreferences.allowIndividualData },
      ];

      // Update each consent setting
      for (const update of updates) {
        await updateConsentSetting({
          consentType: update.type,
          employerVisibility: update.value,
        });
      }

      // Reload settings
      const settingsData = await getConsentSettings();
      setSettings(settingsData);
      const prefs = convertToPreferences(settingsData);
      setPreferences(prefs);
      setTempPreferences(prefs);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to update consent preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setTempPreferences(preferences);
    setHasChanges(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-500">Loading consent preferences...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!preferences || !tempPreferences) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-500">Failed to load consent preferences</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50">Privacy & Consent</h1>
          <p className="mt-1 text-slate-600">
            Control how your health data is shared and used
          </p>
        </div>

        {/* Current Status */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-50">
                  Your Privacy is Protected
                </h3>
                <p className="text-sm text-slate-600">
                  You have control over your health information
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Last Updated</p>
              <p className="font-medium text-slate-800 dark:text-slate-50">
                {formatDate(preferences.lastUpdated)}
              </p>
            </div>
          </div>
        </Card>

        {/* Consent Preferences */}
        <Card title="Data Sharing Preferences">
          <div className="space-y-6">
            {/* Employer Access */}
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-50">Employer Access</h4>
                    {tempPreferences.allowEmployerAccess ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Allow your employer to access your health data for wellness program
                    administration and compliance. Your employer will only see data you
                    explicitly consent to share.
                  </p>
                  <div className="mt-3">
                    <Badge
                      variant={tempPreferences.allowEmployerAccess ? 'success' : 'error'}
                    >
                      {tempPreferences.allowEmployerAccess ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={tempPreferences.allowEmployerAccess}
                    onChange={() => handleToggle('allowEmployerAccess')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>

            {/* Aggregated Data */}
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-50">Aggregated Data Sharing</h4>
                    {tempPreferences.allowAggregatedData ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Allow your employer to view aggregated, anonymized data that cannot be
                    traced back to you individually. This helps improve wellness programs
                    for all employees.
                  </p>
                  <div className="mt-3">
                    <Badge
                      variant={tempPreferences.allowAggregatedData ? 'success' : 'error'}
                    >
                      {tempPreferences.allowAggregatedData ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={tempPreferences.allowAggregatedData}
                    onChange={() => handleToggle('allowAggregatedData')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>

            {/* Individual Data */}
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-50">
                      Individual Data Sharing
                    </h4>
                    {tempPreferences.allowIndividualData ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Allow your employer to view your individual health metrics and
                    progress. This may be required for certain wellness incentive
                    programs.
                  </p>
                  <div className="mt-3">
                    <Badge
                      variant={tempPreferences.allowIndividualData ? 'success' : 'error'}
                    >
                      {tempPreferences.allowIndividualData ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={tempPreferences.allowIndividualData}
                    onChange={() => handleToggle('allowIndividualData')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {hasChanges && (
            <div className="flex gap-2 mt-6 pt-6 border-t border-slate-200">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={handleReset} disabled={saving}>
                Reset
              </Button>
            </div>
          )}
        </Card>

        {/* Important Information */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-primary-50 p-4">
              <AlertCircle className="h-5 w-5 text-primary-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-primary-900">How Your Data is Protected</h4>
                <ul className="mt-2 space-y-1 text-sm text-primary-800">
                  <li>• All data is encrypted in transit and at rest</li>
                  <li>• Access is logged and audited for compliance</li>
                  <li>• You can revoke consent at any time</li>
                  <li>• Your employer cannot access medical diagnoses or treatment details</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-yellow-50 p-4">
              <History className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-yellow-900">Consent Version</h4>
                <p className="mt-1 text-sm text-yellow-800">
                  Current version: {preferences.version} | Last updated:{' '}
                  {formatDate(preferences.lastUpdated)}
                </p>
                <p className="mt-2 text-sm text-yellow-800">
                  You will be notified if consent terms are updated and will need to
                  review and accept the new terms.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Legal */}
        <Card title="Legal Documents">
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              View Privacy Policy
            </Button>
            <Button variant="outline" className="w-full justify-start">
              View Terms of Service
            </Button>
            <Button variant="outline" className="w-full justify-start">
              View HIPAA Notice
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
