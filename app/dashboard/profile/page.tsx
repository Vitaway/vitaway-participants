// Profile Page

'use client';

import { useEffect, useState } from 'react';
import { User, Mail, Phone, Calendar, Building, Edit2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getProfile } from '@/lib/api';
import { formatDate, getInitials } from '@/lib/utils';
import type { Employee } from '@/types';

export default function ProfilePage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const employeeData = await getProfile();
        setEmployee(employeeData);
      } catch (error) {
        console.error('Failed to load profile:', error);
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
          <p className="text-slate-500">Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!employee) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-500">Failed to load profile</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50">Profile</h1>
          <p className="mt-1 text-slate-600">Manage your personal information</p>
        </div>

        {/* Profile Card */}
        <Card>
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-600 text-2xl font-bold text-white">
                  {getInitials(employee.firstName, employee.lastName)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-50">
                    {employee.firstName} {employee.lastName}
                  </h2>
                  <p className="text-sm text-slate-600">{employee.role}</p>
                  <p className="text-xs text-slate-500">
                    Member since {formatDate(employee.joinedAt)}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 className="h-4 w-4" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>

            {/* Profile Information */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-slate-100 p-2">
                    <Mail className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">Email Address</p>
                    {isEditing ? (
                      <input
                        type="email"
                        defaultValue={employee.email}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-slate-800 dark:text-slate-50">{employee.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-slate-100 p-2">
                    <Phone className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">Phone Number</p>
                    {isEditing ? (
                      <input
                        type="tel"
                        defaultValue={employee.phone}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-slate-800 dark:text-slate-50">{employee.phone || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-slate-100 p-2">
                    <Calendar className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">Date of Birth</p>
                    {isEditing ? (
                      <input
                        type="date"
                        defaultValue={employee.dateOfBirth}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-slate-800 dark:text-slate-50">
                        {employee.dateOfBirth
                          ? formatDate(employee.dateOfBirth)
                          : 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-slate-100 p-2">
                    <Building className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">Organization</p>
                    <p className="mt-1 text-slate-800 dark:text-slate-50">{employee.organizationName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-slate-100 p-2">
                    <User className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">Employee ID</p>
                    <p className="mt-1 text-slate-800 dark:text-slate-50">{employee.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsEditing(false)}>Save Changes</Button>
              </div>
            )}
          </div>
        </Card>

        {/* Account Settings */}
        <Card title="Account Settings">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-50">Email Notifications</p>
                <p className="text-sm text-slate-600">
                  Receive email updates about appointments and programs
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-50">SMS Notifications</p>
                <p className="text-sm text-slate-600">
                  Get text reminders for upcoming appointments
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card title="Security">
          <div className="space-y-4">
            <Button variant="outline" className="w-full">
              Change Password
            </Button>
            <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50">
              Delete Account
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
