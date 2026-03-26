/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';
import {
  Activity, TrendingUp, TrendingDown, Minus, Loader2,
  User, Heart, Stethoscope, Pill, Shield, Phone, Clipboard,
  Scale, Thermometer, Droplets, AlertCircle
} from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getVitals, getPatientRecord } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { VitalReading, PatientRecord } from '@/types';

type TabKey = 'overview' | 'vitals' | 'medical' | 'visits' | 'prescriptions';

export default function HealthOverview() {
  const [vitals, setVitals] = useState<VitalReading[]>([]);
  const [patientRecord, setPatientRecord] = useState<PatientRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  useEffect(() => {
    async function loadData() {
      try {
        const [vitalsData, record] = await Promise.all([
          getVitals(),
          getPatientRecord(),
        ]);
        setVitals(vitalsData.data);
        setPatientRecord(record);
      } catch (error) {
        console.error('Failed to load health data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <p className="text-slate-500 dark:text-slate-400">Loading health data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const groupedVitals = vitals.reduce((acc, vital) => {
    if (!acc[vital.vitalType]) {
      acc[vital.vitalType] = [];
    }
    acc[vital.vitalType].push(vital);
    return acc;
  }, {} as Record<string, VitalReading[]>);

  Object.keys(groupedVitals).forEach((key) => {
    groupedVitals[key].sort(
      (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    );
  });

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-slate-400" />;
  };

  function isBloodPressureValue(value: unknown): value is { systolic: number; diastolic: number } {
    return (
      typeof value === 'object' &&
      value !== null &&
      'systolic' in value &&
      'diastolic' in value
    );
  }

  const formatVitalValue = (vital: VitalReading) => {
    if (vital.vitalType === 'blood_pressure' && isBloodPressureValue(vital.value)) {
      return `${vital.value.systolic}/${vital.value.diastolic} ${vital.unit}`;
    }
    return `${vital.value} ${vital.unit}`;
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <Activity className="h-4 w-4" /> },
    { key: 'vitals', label: 'Vitals History', icon: <Heart className="h-4 w-4" /> },
    { key: 'medical', label: 'Medical History', icon: <Stethoscope className="h-4 w-4" /> },
    { key: 'visits', label: 'Visit Records', icon: <Clipboard className="h-4 w-4" /> },
    { key: 'prescriptions', label: 'Prescriptions', icon: <Pill className="h-4 w-4" /> },
  ];

  const latestVisit = patientRecord?.recent_visits?.[0];
  const medHist = patientRecord?.medical_history;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50">Health Overview</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Your complete health profile from clinical records and self-reported data
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.key
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab
            patientRecord={patientRecord}
            groupedVitals={groupedVitals}
            latestVisit={latestVisit}
            getTrendIcon={getTrendIcon}
            isBloodPressureValue={isBloodPressureValue}
          />
        )}

        {activeTab === 'vitals' && (
          <VitalsTab
            groupedVitals={groupedVitals}
            patientRecord={patientRecord}
            getTrendIcon={getTrendIcon}
            isBloodPressureValue={isBloodPressureValue}
            formatVitalValue={formatVitalValue}
          />
        )}

        {activeTab === 'medical' && (
          <MedicalTab medicalHistory={medHist ?? null} lifestyle={patientRecord?.lifestyle ?? null} />
        )}

        {activeTab === 'visits' && (
          <VisitsTab visits={patientRecord?.recent_visits ?? []} />
        )}

        {activeTab === 'prescriptions' && (
          <PrescriptionsTab
            prescriptions={patientRecord?.prescriptions ?? []}
            insurance={patientRecord?.insurance ?? null}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

/* ─── Helper: info row ─────────────────────────────────────────────── */
function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{value}</span>
    </div>
  );
}

function MetricCard({ label, value, unit, icon: Icon }: {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  icon: React.ElementType;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
        <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-lg font-bold text-slate-800 dark:text-slate-50">
          {value}{unit ? <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span> : null}
        </p>
      </div>
    </div>
  );
}

function SectionEmpty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center py-12">
      <AlertCircle className="h-10 w-10 text-slate-300 dark:text-slate-600" />
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}

/* ─── OVERVIEW TAB ─────────────────────────────────────────────────── */
function OverviewTab({
  patientRecord,
  groupedVitals,
  latestVisit,
  getTrendIcon,
  isBloodPressureValue,
}: {
  patientRecord: PatientRecord | null;
  groupedVitals: Record<string, VitalReading[]>;
  latestVisit: PatientRecord['recent_visits'][0] | undefined;
  getTrendIcon: (a: number, b: number) => React.ReactNode;
  isBloodPressureValue: (v: unknown) => v is { systolic: number; diastolic: number };
}) {
  const info = patientRecord?.personal_info;

  return (
    <div className="space-y-6">
      {/* Personal Information + Emergency Contact */}
      {info && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Personal Information">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                <User className="h-7 w-7 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-50">{info.name}</h3>
                {info.medical_record_number && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">MRN: {info.medical_record_number}</p>
                )}
              </div>
            </div>
            <div className="space-y-0">
              <InfoRow label="Gender" value={info.gender} />
              <InfoRow label="Date of Birth" value={info.date_of_birth ? formatDate(info.date_of_birth) : null} />
              <InfoRow label="Marital Status" value={info.marital_status} />
              <InfoRow label="Email" value={info.email} />
              <InfoRow label="Phone" value={info.contact_number} />
              <InfoRow label="Address" value={info.address} />
              <InfoRow label="Location" value={info.location} />
              <InfoRow label="National ID" value={info.national_id} />
            </div>
          </Card>

          <div className="space-y-6">
            {/* Emergency Contact */}
            {patientRecord?.emergency_contact && (
              <Card title="Emergency Contact">
                <div className="flex items-center gap-3 mb-4">
                  <Phone className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {patientRecord.emergency_contact.name || info.emergency_contact_name || 'Not set'}
                  </span>
                </div>
                <InfoRow label="Phone" value={patientRecord.emergency_contact.phone} />
                <InfoRow label="Email" value={patientRecord.emergency_contact.email} />
              </Card>
            )}

            {/* Insurance */}
            {patientRecord?.insurance && (
              <Card title="Insurance Information">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {patientRecord.insurance.assurance_type || 'Insurance'}
                  </span>
                </div>
                <InfoRow label="Policy Number" value={patientRecord.insurance.assurance_number} />
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Key Health Metrics from Latest Visit */}
      {latestVisit && (
        <Card title="Latest Clinical Measurements" action={
          latestVisit.visit_date ? (
            <Badge variant="info">{formatDate(latestVisit.visit_date)}</Badge>
          ) : null
        }>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="BMI" value={latestVisit.bmi} icon={Scale} />
            <MetricCard label="Weight" value={latestVisit.weight} unit={latestVisit.weight_unit || 'kg'} icon={Scale} />
            <MetricCard label="Height" value={latestVisit.height} unit={latestVisit.height_unit || 'cm'} icon={Activity} />
            <MetricCard label="Blood Pressure" value={
              latestVisit.systolic_bp && latestVisit.diastolic_bp
                ? `${latestVisit.systolic_bp}/${latestVisit.diastolic_bp}`
                : latestVisit.blood_pressure
            } unit="mmHg" icon={Heart} />
            <MetricCard label="Heart Rate" value={latestVisit.heart_rate} unit="bpm" icon={Heart} />
            <MetricCard label="Temperature" value={latestVisit.temperature} unit="°C" icon={Thermometer} />
            <MetricCard label="Blood Sugar" value={latestVisit.blood_sugar} unit="mmol/L" icon={Droplets} />
            <MetricCard label="HbA1c" value={latestVisit.haemoglobin_a1c} unit="%" icon={Droplets} />
          </div>
        </Card>
      )}

      {/* Body Composition from Latest Visit */}
      {latestVisit && (latestVisit.body_fat_percentage || latestVisit.muscle_mass || latestVisit.metabolic_age) && (
        <Card title="Body Composition">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Body Fat" value={latestVisit.body_fat_percentage} unit="%" icon={Activity} />
            <MetricCard label="Muscle Mass" value={latestVisit.muscle_mass} unit="kg" icon={Activity} />
            <MetricCard label="Bone Mass" value={latestVisit.bone_mass} unit="kg" icon={Activity} />
            <MetricCard label="Visceral Fat" value={latestVisit.visceral_fat_percentage} unit="%" icon={Activity} />
            <MetricCard label="Metabolic Age" value={latestVisit.metabolic_age} unit="yrs" icon={Activity} />
            <MetricCard label="Waist Circumference" value={latestVisit.waist_circumference} unit="cm" icon={Activity} />
          </div>
        </Card>
      )}

      {/* Self-Reported Vitals Summary */}
      {Object.keys(groupedVitals).length > 0 && (
        <Card title="Self-Reported Vitals">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(groupedVitals).map(([type, readings]) => {
              const latest = readings[0];
              const previous = readings[1];

              let currentValue: number;
              let previousValue: number | undefined;

              if (latest.vitalType === 'blood_pressure' && isBloodPressureValue(latest.value)) {
                currentValue = latest.value.systolic;
                previousValue =
                  previous && previous.vitalType === 'blood_pressure' && isBloodPressureValue(previous.value)
                    ? previous.value.systolic
                    : undefined;
              } else {
                currentValue = latest.value as number;
                previousValue = previous ? (previous.value as number) : undefined;
              }

              return (
                <div key={type} className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 capitalize">
                      {type.replace(/_/g, ' ')}
                    </p>
                    <Activity className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-50">
                      {latest.vitalType === 'blood_pressure' && isBloodPressureValue(latest.value)
                        ? `${latest.value.systolic}/${latest.value.diastolic}`
                        : latest.value}
                    </p>
                    {previousValue !== undefined && getTrendIcon(currentValue, previousValue)}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{latest.unit}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {formatDate(latest.recordedAt)}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Assessment & Goals from Latest Visit */}
      {latestVisit && (latestVisit.assessment_summary || latestVisit.primary_goal) && (
        <Card title="Clinical Assessment & Goals">
          <div className="space-y-4">
            {latestVisit.assessment_summary && (
              <div>
                <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Assessment Summary</h4>
                <p className="text-sm text-slate-800 dark:text-slate-200">{latestVisit.assessment_summary}</p>
              </div>
            )}
            {latestVisit.intervention_plan && (
              <div>
                <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Intervention Plan</h4>
                <p className="text-sm text-slate-800 dark:text-slate-200">{latestVisit.intervention_plan}</p>
              </div>
            )}
            {latestVisit.primary_goal && (
              <div>
                <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Primary Goal</h4>
                <p className="text-sm text-slate-800 dark:text-slate-200">{latestVisit.primary_goal}</p>
              </div>
            )}
            {latestVisit.short_term_goals && (
              <div>
                <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Short-term Goals</h4>
                <p className="text-sm text-slate-800 dark:text-slate-200">{latestVisit.short_term_goals}</p>
              </div>
            )}
            {latestVisit.long_term_goals && (
              <div>
                <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Long-term Goals</h4>
                <p className="text-sm text-slate-800 dark:text-slate-200">{latestVisit.long_term_goals}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {!patientRecord && Object.keys(groupedVitals).length === 0 && (
        <SectionEmpty message="No health data available yet. Your health information will appear here once recorded." />
      )}
    </div>
  );
}

/* ─── VITALS TAB ──────────────────────────────────────────────────── */
function VitalsTab({
  groupedVitals,
  patientRecord,
  getTrendIcon,
  isBloodPressureValue,
  formatVitalValue,
}: {
  groupedVitals: Record<string, VitalReading[]>;
  patientRecord: PatientRecord | null;
  getTrendIcon: (a: number, b: number) => React.ReactNode;
  isBloodPressureValue: (v: unknown) => v is { systolic: number; diastolic: number };
  formatVitalValue: (v: VitalReading) => string;
}) {
  const healthRecords = patientRecord?.health_records ?? [];

  return (
    <div className="space-y-6">
      {/* Clinic-recorded Health Records */}
      {healthRecords.length > 0 && (
        <Card title="Clinical Health Records">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-3 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Date</th>
                  <th className="px-3 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Blood Pressure</th>
                  <th className="px-3 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Pulse</th>
                  <th className="px-3 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Blood Sugar</th>
                  <th className="px-3 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Haemoglobin</th>
                  <th className="px-3 py-3 text-left font-medium text-slate-500 dark:text-slate-400">HbA1c</th>
                  <th className="px-3 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Waist</th>
                  <th className="px-3 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Notes</th>
                </tr>
              </thead>
              <tbody>
                {healthRecords.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 dark:border-slate-700/50">
                    <td className="px-3 py-3 text-slate-800 dark:text-slate-200">{formatDate(r.recorded_at)}</td>
                    <td className="px-3 py-3 text-slate-800 dark:text-slate-200">
                      {r.blood_pressure ? `${r.blood_pressure} ${r.blood_pressure_unit || ''}` : '—'}
                    </td>
                    <td className="px-3 py-3 text-slate-800 dark:text-slate-200">{r.pulse_rate || '—'}</td>
                    <td className="px-3 py-3 text-slate-800 dark:text-slate-200">
                      {r.blood_sugar ? `${r.blood_sugar} ${r.blood_sugar_unit || ''}` : '—'}
                    </td>
                    <td className="px-3 py-3 text-slate-800 dark:text-slate-200">
                      {r.haemoglobin ? `${r.haemoglobin} ${r.haemoglobin_unit || ''}` : '—'}
                    </td>
                    <td className="px-3 py-3 text-slate-800 dark:text-slate-200">
                      {r.haemoglobin_a1c ? `${r.haemoglobin_a1c} ${r.haemoglobin_a1c_unit || '%'}` : '—'}
                    </td>
                    <td className="px-3 py-3 text-slate-800 dark:text-slate-200">
                      {r.waist_circumference ? `${r.waist_circumference} ${r.waist_circumference_unit || 'cm'}` : '—'}
                    </td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-400 max-w-50 truncate">
                      {r.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Self-Reported Vitals */}
      {Object.keys(groupedVitals).length > 0 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-50">Self-Reported Vitals History</h2>
          {Object.entries(groupedVitals).map(([type, readings]) => (
            <Card key={type} title={type.replace(/_/g, ' ')}>
              <div className="space-y-3">
                {readings.map((reading) => (
                  <div
                    key={reading.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                        <Activity className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-50">
                          {formatVitalValue(reading)}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {formatDate(reading.recordedAt)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="default">Recorded</Badge>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {healthRecords.length === 0 && Object.keys(groupedVitals).length === 0 && (
        <SectionEmpty message="No vitals data recorded yet." />
      )}
    </div>
  );
}

/* ─── MEDICAL HISTORY TAB ─────────────────────────────────────────── */
function MedicalTab({
  medicalHistory,
  lifestyle,
}: {
  medicalHistory: PatientRecord['medical_history'];
  lifestyle: PatientRecord['lifestyle'];
}) {
  if (!medicalHistory && !lifestyle) {
    return <SectionEmpty message="No medical history recorded yet." />;
  }

  return (
    <div className="space-y-6">
      {medicalHistory && (
        <>
          {/* Core Medical Info */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Medical Information">
              <div className="space-y-0">
                <InfoRow label="Blood Type" value={medicalHistory.blood_type} />
                <InfoRow label="Height" value={medicalHistory.height ? `${medicalHistory.height} cm` : null} />
                <InfoRow label="Weight" value={medicalHistory.weight ? `${medicalHistory.weight} kg` : null} />
                <InfoRow label="BMI" value={medicalHistory.bmi} />
                <InfoRow label="Past Illnesses" value={medicalHistory.past_illness} />
                <InfoRow label="Surgeries" value={medicalHistory.surgeries} />
                <InfoRow label="Family History" value={medicalHistory.family_history} />
              </div>
            </Card>

            <Card title="Medications & Allergies">
              <div className="space-y-0">
                <InfoRow label="Current Medications" value={medicalHistory.medication} />
                <InfoRow label="Medication Details" value={medicalHistory.medication_details} />
                <InfoRow label="Allergies" value={medicalHistory.allergies} />
                <InfoRow label="Allergy Reactions" value={medicalHistory.allergy_reactions} />
              </div>
            </Card>
          </div>

          {/* Diagnoses and Goals */}
          <div className="grid gap-6 lg:grid-cols-2">
            {medicalHistory.diagnoses && medicalHistory.diagnoses.length > 0 && (
              <Card title="Diagnoses">
                <div className="flex flex-wrap gap-2">
                  {medicalHistory.diagnoses.map((diag, i) => (
                    <Badge key={i} variant="warning">{diag}</Badge>
                  ))}
                </div>
              </Card>
            )}

            {medicalHistory.goals && medicalHistory.goals.length > 0 && (
              <Card title="Health Goals">
                <div className="flex flex-wrap gap-2">
                  {medicalHistory.goals.map((goal, i) => (
                    <Badge key={i} variant="success">{goal}</Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Screenings */}
          {(medicalHistory.last_physical_exam || medicalHistory.last_blood_work || medicalHistory.last_dental_exam) && (
            <Card title="Last Screenings">
              <div className="grid gap-4 sm:grid-cols-3">
                {medicalHistory.last_physical_exam && (
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Physical Exam</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{formatDate(medicalHistory.last_physical_exam)}</p>
                  </div>
                )}
                {medicalHistory.last_blood_work && (
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Blood Work</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{formatDate(medicalHistory.last_blood_work)}</p>
                  </div>
                )}
                {medicalHistory.last_dental_exam && (
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Dental Exam</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{formatDate(medicalHistory.last_dental_exam)}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Health Concerns */}
          {(medicalHistory.health_concerns || medicalHistory.nutrition_goals || medicalHistory.additional_notes) && (
            <Card title="Health Concerns & Notes">
              <div className="space-y-4">
                {medicalHistory.health_concerns && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Health Concerns</h4>
                    <p className="text-sm text-slate-800 dark:text-slate-200">{medicalHistory.health_concerns}</p>
                  </div>
                )}
                {medicalHistory.nutrition_goals && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Nutrition Goals</h4>
                    <p className="text-sm text-slate-800 dark:text-slate-200">{medicalHistory.nutrition_goals}</p>
                  </div>
                )}
                {medicalHistory.additional_notes && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Additional Notes</h4>
                    <p className="text-sm text-slate-800 dark:text-slate-200">{medicalHistory.additional_notes}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Lifestyle */}
      {lifestyle && (
        <Card title="Lifestyle Information">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-0">
              <InfoRow label="Diet" value={lifestyle.diet} />
              <InfoRow label="Physical Activity" value={lifestyle.physical_activity} />
              <InfoRow label="Sleep Patterns" value={lifestyle.sleep_patterns} />
            </div>
            <div className="space-y-0">
              <InfoRow label="Smoking" value={lifestyle.smoking} />
              <InfoRow label="Alcohol Use" value={lifestyle.alcohol_use} />
              <InfoRow label="Recreational Drugs" value={lifestyle.recreational_drugs_frequency} />
            </div>
          </div>
        </Card>
      )}

      {/* Lifestyle habits from medical history */}
      {medicalHistory && (medicalHistory.smoke_frequency || medicalHistory.drink_frequency || medicalHistory.exercise_frequency) && (
        <Card title="Recorded Habits">
          <div className="space-y-0">
            <InfoRow label="Smoking Frequency" value={medicalHistory.smoke_frequency} />
            <InfoRow label="Drinking Frequency" value={medicalHistory.drink_frequency} />
            <InfoRow label="Exercise Frequency" value={medicalHistory.exercise_frequency} />
          </div>
        </Card>
      )}
    </div>
  );
}

/* ─── VISITS TAB ──────────────────────────────────────────────────── */
function VisitsTab({ visits }: { visits: PatientRecord['recent_visits'] }) {
  if (visits.length === 0) {
    return <SectionEmpty message="No visit records found." />;
  }

  return (
    <div className="space-y-6">
      {visits.map((visit) => (
        <Card
          key={visit.id}
          title={`${visit.visit_type ? visit.visit_type.replace(/_/g, ' ') : 'Clinical'} Visit`}
          action={visit.visit_date ? <Badge variant="info">{formatDate(visit.visit_date)}</Badge> : null}
        >
          <div className="space-y-6">
            {/* Anthropometrics */}
            {(visit.height || visit.weight || visit.bmi) && (
              <div>
                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Anthropometrics</h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard label="Height" value={visit.height} unit={visit.height_unit || 'cm'} icon={Activity} />
                  <MetricCard label="Weight" value={visit.weight} unit={visit.weight_unit || 'kg'} icon={Scale} />
                  <MetricCard label="BMI" value={visit.bmi} icon={Scale} />
                  <MetricCard label="Waist" value={visit.waist_circumference} unit="cm" icon={Activity} />
                </div>
              </div>
            )}

            {/* Vitals */}
            {(visit.blood_pressure || visit.heart_rate || visit.temperature || visit.blood_sugar) && (
              <div>
                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Vital Signs</h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard label="Blood Pressure" value={
                    visit.systolic_bp && visit.diastolic_bp
                      ? `${visit.systolic_bp}/${visit.diastolic_bp}`
                      : visit.blood_pressure
                  } unit="mmHg" icon={Heart} />
                  <MetricCard label="Heart Rate" value={visit.heart_rate} unit="bpm" icon={Heart} />
                  <MetricCard label="Temperature" value={visit.temperature} unit="°C" icon={Thermometer} />
                  <MetricCard label="Blood Sugar" value={visit.blood_sugar} unit="mmol/L" icon={Droplets} />
                  <MetricCard label="Haemoglobin" value={visit.haemoglobin} icon={Droplets} />
                  <MetricCard label="HbA1c" value={visit.haemoglobin_a1c} unit="%" icon={Droplets} />
                </div>
              </div>
            )}

            {/* Body Composition */}
            {(visit.body_fat_percentage || visit.muscle_mass || visit.metabolic_age) && (
              <div>
                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Body Composition</h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard label="Body Fat" value={visit.body_fat_percentage} unit="%" icon={Activity} />
                  <MetricCard label="Muscle Mass" value={visit.muscle_mass} unit="kg" icon={Activity} />
                  <MetricCard label="Bone Mass" value={visit.bone_mass} unit="kg" icon={Activity} />
                  <MetricCard label="Visceral Fat" value={visit.visceral_fat_percentage} unit="%" icon={Activity} />
                  <MetricCard label="Metabolic Age" value={visit.metabolic_age} unit="yrs" icon={Activity} />
                </div>
              </div>
            )}

            {/* Lifestyle at Visit */}
            {(visit.activity_level || visit.sleep_hours || visit.stress_level) && (
              <div>
                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Lifestyle at Visit</h4>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <InfoRow label="Activity Level" value={visit.activity_level} />
                  <InfoRow label="Sleep Hours" value={visit.sleep_hours ? `${visit.sleep_hours} hrs` : null} />
                  <InfoRow label="Sleep Quality" value={visit.sleep_quality} />
                  <InfoRow label="Stress Level" value={visit.stress_level} />
                  <InfoRow label="Appetite" value={visit.appetite_level} />
                </div>
              </div>
            )}

            {/* Assessment */}
            {(visit.assessment_summary || visit.intervention_plan) && (
              <div>
                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Clinical Assessment</h4>
                <div className="space-y-3">
                  {visit.assessment_summary && (
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Summary</p>
                      <p className="text-sm text-slate-800 dark:text-slate-200">{visit.assessment_summary}</p>
                    </div>
                  )}
                  {visit.intervention_plan && (
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Intervention Plan</p>
                      <p className="text-sm text-blue-900 dark:text-blue-200">{visit.intervention_plan}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Goals */}
            {(visit.primary_goal || visit.short_term_goals || visit.long_term_goals) && (
              <div>
                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Goals</h4>
                <div className="space-y-3">
                  {visit.primary_goal && (
                    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
                      <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Primary Goal</p>
                      <p className="text-sm text-green-900 dark:text-green-200">{visit.primary_goal}</p>
                    </div>
                  )}
                  {visit.short_term_goals && (
                    <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4">
                      <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-1">Short-term Goals</p>
                      <p className="text-sm text-yellow-900 dark:text-yellow-200">{visit.short_term_goals}</p>
                    </div>
                  )}
                  {visit.long_term_goals && (
                    <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 p-4">
                      <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">Long-term Goals</p>
                      <p className="text-sm text-purple-900 dark:text-purple-200">{visit.long_term_goals}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ─── PRESCRIPTIONS TAB ───────────────────────────────────────────── */
function PrescriptionsTab({
  prescriptions,
  insurance,
}: {
  prescriptions: PatientRecord['prescriptions'];
  insurance: PatientRecord['insurance'];
}) {
  return (
    <div className="space-y-6">
      {/* Insurance */}
      {insurance && (
        <Card title="Insurance Information">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {insurance.assurance_type || 'Insurance'}
            </span>
          </div>
          <InfoRow label="Policy Number" value={insurance.assurance_number} />
        </Card>
      )}

      {/* Prescriptions */}
      {prescriptions.length > 0 ? (
        <Card title="Current Prescriptions">
          <div className="space-y-3">
            {prescriptions.map((rx) => (
              <div
                key={rx.id}
                className="flex items-start gap-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <Pill className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 dark:text-slate-50">{rx.medication_name}</p>
                  <div className="mt-1 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                    {rx.dosage && <span>Dosage: {rx.dosage}</span>}
                    {rx.frequency && <span>Frequency: {rx.frequency}</span>}
                    {rx.duration && <span>Duration: {rx.duration}</span>}
                  </div>
                </div>
                <Badge variant="info">Active</Badge>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <SectionEmpty message="No prescriptions recorded." />
      )}
    </div>
  );
}
