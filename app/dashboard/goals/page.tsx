// Goals & Progress Page

'use client';

import { useEffect, useState } from 'react';
import { Target, TrendingUp, Award, Calendar } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { getGoals } from '@/lib/api';
import { formatDate, getProgressPercentage } from '@/lib/utils';
import type { Goal } from '@/types';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ACTIVE');

  useEffect(() => {
    async function loadData() {
      try {
        const goalsData = await getGoals();
        setGoals(goalsData.data);
      } catch (error) {
        console.error('Failed to load goals:', error);
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
          <p className="text-slate-500">Loading goals...</p>
        </div>
      </DashboardLayout>
    );
  }

  const filteredGoals = goals.filter((goal) => {
    if (filter === 'ALL') return true;
    return goal.status === filter;
  });

  const activeGoals = goals.filter((g) => g.status === 'ACTIVE');
  const completedGoals = goals.filter((g) => g.status === 'COMPLETED');
  const totalProgress =
    activeGoals.length > 0
      ? Math.round(
          activeGoals.reduce(
            (sum, goal) =>
              sum + getProgressPercentage(goal.currentValue, goal.targetValue),
            0
          ) / activeGoals.length
        )
      : 0;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      EXERCISE: 'bg-primary-100 text-primary-800',
      NUTRITION: 'bg-green-100 text-green-800',
      MEDICATION: 'bg-purple-100 text-purple-800',
      OTHER: 'bg-slate-100 text-slate-800',
    };
    return colors[category] || colors.OTHER;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'EXERCISE':
        return <TrendingUp className="h-5 w-5" />;
      case 'NUTRITION':
        return <Target className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50">Goals & Progress</h1>
          <p className="mt-1 text-slate-600">
            Track your health goals and celebrate your achievements
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary-100 p-3">
                <Target className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active Goals</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-50">{activeGoals.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-50">{completedGoals.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-100 p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Overall Progress</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-50">{totalProgress}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['ALL', 'ACTIVE', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as typeof filter)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Goals List */}
        <div className="space-y-4">
          {filteredGoals.length === 0 ? (
            <Card>
              <p className="py-12 text-center text-slate-500">
                No {filter.toLowerCase()} goals found
              </p>
            </Card>
          ) : (
            filteredGoals.map((goal) => {
              const progress = getProgressPercentage(goal.currentValue, goal.targetValue);
              const isCompleted = goal.status === 'COMPLETED';

              return (
                <Card key={goal.id}>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={`rounded-full p-3 ${getCategoryColor(
                            goal.category
                          )}`}
                        >
                          {getCategoryIcon(goal.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-50">
                              {goal.title}
                            </h3>
                            <Badge
                              variant={isCompleted ? 'success' : 'info'}
                              className="ml-2"
                            >
                              {goal.status}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-slate-600">
                            {goal.description}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(goal.startDate)} - {formatDate(goal.endDate)}
                            </span>
                            <span>Assigned by: {goal.assignedBy}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Progress</span>
                        <span className="font-medium text-slate-800 dark:text-slate-50">
                          {goal.currentValue} / {goal.targetValue} {goal.unit}
                        </span>
                      </div>
                      <ProgressBar
                        value={progress}
                        color={isCompleted ? 'green' : 'blue'}
                      />
                      <p className="text-xs text-slate-500 text-right">{progress}% complete</p>
                    </div>

                    {/* Action Buttons */}
                    {!isCompleted && (
                      <div className="flex gap-2 pt-2 border-t border-slate-200">
                        <button className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                          Update Progress
                        </button>
                        <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                          View Details
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Motivation Card */}
        <Card>
          <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex items-center gap-4">
              <Award className="h-12 w-12" />
              <div>
                <h3 className="text-lg font-semibold">Keep Going!</h3>
                <p className="mt-1 text-sm text-primary-100">
                  You're making great progress on your health journey. Stay consistent
                  and you'll reach your goals!
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
