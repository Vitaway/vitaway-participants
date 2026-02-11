// Health Overview Page - Vitals and Assessments

'use client';

import { useEffect, useState } from 'react';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getVitals } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { VitalReading } from '@/types';

export default function HealthOverview() {
  const [vitals, setVitals] = useState<VitalReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const vitalsData = await getVitals();
        setVitals(vitalsData);
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
          <p className="text-gray-500">Loading health data...</p>
        </div>
      </DashboardLayout>
    );
  }

  const groupedVitals = vitals.reduce((acc, vital) => {
    if (!acc[vital.type]) {
      acc[vital.type] = [];
    }
    acc[vital.type].push(vital);
    return acc;
  }, {} as Record<string, VitalReading[]>);

  // Sort each group by date (most recent first)
  Object.keys(groupedVitals).forEach((key) => {
    groupedVitals[key].sort(
      (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    );
  });

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const formatVitalValue = (vital: VitalReading) => {
    if (typeof vital.value === 'object' && 'systolic' in vital.value) {
      return `${vital.value.systolic}/${vital.value.diastolic} ${vital.unit}`;
    }
    return `${vital.value} ${vital.unit}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Overview</h1>
          <p className="mt-1 text-gray-600">
            View your vital signs and health trends over time
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(groupedVitals).map(([type, readings]) => {
            const latest = readings[0];
            const previous = readings[1];
            
            let currentValue: number;
            let previousValue: number | undefined;

            if (typeof latest.value === 'object' && 'systolic' in latest.value) {
              currentValue = latest.value.systolic;
              previousValue = previous && typeof previous.value === 'object' && 'systolic' in previous.value 
                ? previous.value.systolic 
                : undefined;
            } else {
              currentValue = latest.value as number;
              previousValue = previous ? (previous.value as number) : undefined;
            }

            return (
              <Card key={type}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600">
                      {type.replace(/_/g, ' ')}
                    </p>
                    <Activity className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold text-gray-900">
                        {typeof latest.value === 'object' && 'systolic' in latest.value
                          ? `${latest.value.systolic}/${latest.value.diastolic}`
                          : latest.value}
                      </p>
                      {previousValue !== undefined && getTrendIcon(currentValue, previousValue)}
                    </div>
                    <p className="text-xs text-gray-500">{latest.unit}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Last recorded: {formatDate(latest.recordedAt)}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Detailed History */}
        <div className="space-y-6">
          {Object.entries(groupedVitals).map(([type, readings]) => (
            <Card key={type} title={type.replace(/_/g, ' ')}>
              <div className="space-y-3">
                {readings.map((reading) => (
                  <div
                    key={reading.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <Activity className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatVitalValue(reading)}
                        </p>
                        <p className="text-sm text-gray-500">
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

        {/* Health Note */}
        <Card>
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> This data is for tracking purposes only and does not
              constitute medical advice. Please consult with your healthcare provider for
              medical interpretation and recommendations.
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
