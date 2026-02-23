// Book Appointment Modal

'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-context';
import { getAvailableProviders, bookAppointment } from '@/lib/api/appointments';
import type { Provider, AppointmentType } from '@/types';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BookAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
}: BookAppointmentModalProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [selectedProvider, setSelectedProvider] = useState('');
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('consultation');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [notes, setNotes] = useState('');

  // Load providers
  useEffect(() => {
    async function loadProviders() {
      // Wait for auth to finish loading
      if (authLoading) {
        console.log('Waiting for auth to load...');
        return;
      }

      if (!user?.organizationId) {
        console.warn('No organization ID available, user:', user);
        setLoadingProviders(false);
        return;
      }

      setLoadingProviders(true);
      try {
        console.log('Loading providers for organization:', user.organizationId);
        // Load organization_admin providers from employee's organization only
        const data = await getAvailableProviders({ 
          type: 'organization_admin',
          organizationId: user.organizationId 
        });
        console.log('Loaded providers:', data);
        setProviders(data);
      } catch (err) {
        console.error('Failed to load providers:', err);
      } finally {
        setLoadingProviders(false);
      }
    }

    if (isOpen) {
      loadProviders();
    }
  }, [isOpen, user?.organizationId, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedProvider) {
      setError('Please select a provider');
      return;
    }

    setLoading(true);
    try {
      await bookAppointment({
        providerId: selectedProvider,
        providerType: 'organization_admin',
        appointmentType,
        appointmentDate,
        appointmentTime,
        durationMinutes,
        notes,
      });

      onSuccess?.();
      onClose();
      resetForm();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to book appointment';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedProvider('');
    setAppointmentType('consultation');
    setAppointmentDate('');
    setAppointmentTime('');
    setDurationMinutes(30);
    setNotes('');
    setError('');
  };

  if (!isOpen) return null;

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-white dark:bg-slate-900 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-50">
            Book Appointment
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              <User className="inline h-4 w-4 mr-1" />
              Select Provider
            </label>
            {authLoading || loadingProviders ? (
              <div className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-3 text-sm text-slate-500">
                Loading providers...
              </div>
            ) : !user?.organizationId ? (
              <div className="rounded-lg border border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                Unable to load providers: Organization information not available. Please try logging out and back in.
              </div>
            ) : providers.length === 0 ? (
              <div className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-3 text-sm text-slate-500">
                No providers available in your organization
              </div>
            ) : (
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                required
                className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-50 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a provider...</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name} {provider.specialty && `- ${provider.specialty}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Appointment Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Appointment Type
            </label>
            <select
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value as AppointmentType)}
              required
              className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-50 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="consultation">Consultation</option>
              <option value="coaching">Coaching</option>
              <option value="mental_health">Mental Health</option>
              <option value="nutrition">Nutrition</option>
              <option value="general">General</option>
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date
              </label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={today}
                required
                className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-50 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <Clock className="inline h-4 w-4 mr-1" />
                Time
              </label>
              <input
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                required
                className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-50 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Duration
            </label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              required
              className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-50 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              <FileText className="inline h-4 w-4 mr-1" />
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Add any additional information..."
              className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-50 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {notes.length}/500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || loadingProviders}
              className="flex-1"
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
