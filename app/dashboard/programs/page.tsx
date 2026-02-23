// Programs & Learning Page

'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Video, FileText, CheckCircle, Clock, PlayCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { getEnrolledPrograms, getProgramContent } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { ProgramEnrollment, ProgramContent } from '@/types';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<ProgramEnrollment[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<ProgramEnrollment | null>(null);
  const [modules, setModules] = useState<ProgramContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const programsData = await getEnrolledPrograms();
        setPrograms(programsData.data);
        if (programsData.data.length > 0) {
          setSelectedProgram(programsData.data[0]);
        }
      } catch (error) {
        console.error('Failed to load programs:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    async function loadModules() {
      if (selectedProgram) {
        try {
          const modulesData = await getProgramContent(selectedProgram.id);
          setModules(modulesData);
        } catch (error) {
          console.error('Failed to load modules:', error);
        }
      }
    }

    loadModules();
  }, [selectedProgram]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-500">Loading programs...</p>
        </div>
      </DashboardLayout>
    );
  }

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="h-5 w-5" />;
      case 'ARTICLE':
        return <FileText className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'default'> = {
      COMPLETED: 'success',
      IN_PROGRESS: 'warning',
      NOT_STARTED: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status.replace(/_/g, ' ')}</Badge>;
  };

  const inProgressPrograms = programs.filter((p) => p.status === 'in_progress');
  const completedPrograms = programs.filter((p) => p.status === 'completed');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50">Programs & Learning</h1>
          <p className="mt-1 text-slate-600">
            Engage with educational content and track your learning progress
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary-100 p-3">
                <BookOpen className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Programs</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-50">{programs.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-yellow-100 p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">In Progress</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-50">
                  {inProgressPrograms.length}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-50">
                  {completedPrograms.length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Programs Grid */}
        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-50 mb-4">Your Programs</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {programs.map((enrollment) => {
              const { program, status, progressPercentage, enrolledAt, dueDate } = enrollment;
              const progress = Math.round(progressPercentage);
              return (
                <Card
                  key={enrollment.id}
                  className={`transition-all ${
                    selectedProgram?.id === enrollment.id
                      ? 'ring-2 ring-primary-500'
                      : 'hover:shadow-md'
                  }`}
                >
                  <div
                    className="cursor-pointer space-y-4"
                    onClick={() => setSelectedProgram(enrollment)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-50">
                          {program.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">{program.description}</p>
                      </div>
                      {getStatusBadge(status)}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Progress</span>
                        <span className="font-medium text-slate-800 dark:text-slate-50">
                          {progress}%
                        </span>
                      </div>
                      <ProgressBar
                        value={progress}
                        color={status === 'completed' ? 'green' : 'blue'}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Assigned: {formatDate(enrolledAt)}</span>
                      {dueDate && (
                        <span>Due: {formatDate(dueDate)}</span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Selected Program Modules */}
        {selectedProgram && (
          <Card title={`${selectedProgram.program.title} - Modules`}>
            <div className="space-y-3">
              {modules.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  No modules available
                </p>
              ) : (
                modules.map((module) => (
                  <div
                    key={module.id}
                    className={`rounded-lg border p-4 transition-all ${
                      module.completed
                        ? 'border-green-200 bg-green-50'
                        : 'border-slate-200 hover:border-primary-300 hover:bg-primary-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`rounded-full p-2 ${
                            module.completed
                              ? 'bg-green-100 text-green-600'
                              : 'bg-primary-100 text-primary-600'
                          }`}
                        >
                          {module.completed ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            getModuleIcon(module.contentType)
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-slate-800 dark:text-slate-50">{module.title}</h4>
                            <Badge variant="default" className="text-xs">
                              {module.contentType}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-slate-600">
                            {module.description}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                            {module.durationMinutes && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {module.durationMinutes} min
                              </span>
                            )}
                            {module.completed && module.completedAt && (
                              <span>Completed: {formatDate(module.completedAt)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {!module.completed && (
                        <Button size="sm" className="flex items-center gap-2">
                          <PlayCircle className="h-4 w-4" />
                          Start
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
