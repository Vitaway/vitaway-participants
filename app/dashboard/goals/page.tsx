/* eslint-disable react/no-unescaped-entities */
// Goals & Progress Page

'use client';

import { useEffect, useState } from 'react';
import { Target, TrendingUp, Award, Calendar, X, Loader2, ChevronRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { getGoals, getGoal, updateGoalProgress } from '@/lib/api';
import { formatDate, getProgressPercentage } from '@/lib/utils';
import type { Goal, GoalProgress } from '@/types';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ACTIVE');

  // Update progress modal state
  const [updatingGoal, setUpdatingGoal] = useState<Goal | null>(null);
  const [progressInput, setProgressInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Detail modal state
  const [detailGoal, setDetailGoal] = useState<Goal | null>(null);
  const [progressHistory, setProgressHistory] = useState<GoalProgress[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

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
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <p className="text-slate-500 dark:text-slate-400">Loading goals...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const openUpdateProgress = (goal: Goal) => {
    setUpdatingGoal(goal);
    setProgressInput(String(goal.currentValue));
    setNotesInput('');
  };

  const handleUpdateProgress = async () => {
    if (!updatingGoal) return;
    const value = parseFloat(progressInput);
    if (isNaN(value)) return;
    try {
      setSaving(true);
      await updateGoalProgress(updatingGoal.id, { progressValue: value, notes: notesInput || undefined });
      // Refresh goals
      const fresh = await getGoals();
      setGoals(fresh.data);
      setUpdatingGoal(null);
    } catch (error) {
      console.error('Failed to update progress:', error);
    } finally {
      setSaving(false);
    }
  };

  const openDetails = async (goal: Goal) => {
    setDetailGoal(goal);
    setDetailLoading(true);
    try {
      const res = await getGoal(goal.id);
      setDetailGoal(res.goal);
      setProgressHistory(res.progressHistory);
    } catch (error) {
      console.error('Failed to load goal details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  // Map filter to GoalStatus (lowercase)
  const filterToStatus = (f: 'ACTIVE' | 'COMPLETED') => {
    if (f === 'ACTIVE') return 'active';
    if (f === 'COMPLETED') return 'completed';
    return undefined;
  };

  const filteredGoals = goals.filter((goal) => {
    if (filter === 'ALL') return true;
    return goal.status === filterToStatus(filter as 'ACTIVE' | 'COMPLETED');
  });

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');
  
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
      EXERCISE: 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400',
      NUTRITION: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
      MEDICATION: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
      OTHER: 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300',
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
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Track your health goals and celebrate your achievements
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary-100 dark:bg-primary-900/30 p-3">
                <Target className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Goals</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-50">{activeGoals.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-50">{completedGoals.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Overall Progress</p>
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
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600'
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
              <p className="py-12 text-center text-slate-500 dark:text-slate-400">
                No {filter.toLowerCase()} goals found
              </p>
            </Card>
          ) : (
            filteredGoals.map((goal) => {
              const progress = getProgressPercentage(goal.currentValue, goal.targetValue);
              const isCompleted = goal.status === 'completed';

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
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {goal.description}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(goal.startDate)}
                            </span>
                            <span>Assigned by: {goal.assignedBy}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Progress</span>
                        <span className="font-medium text-slate-800 dark:text-slate-50">
                          {goal.currentValue} / {goal.targetValue} {goal.unit}
                        </span>
                      </div>
                      <ProgressBar
                        value={progress}
                        color={isCompleted ? 'green' : 'blue'}
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 text-right">{progress}% complete</p>
                    </div>

                    {/* Action Buttons */}
                    {!isCompleted && (
                      <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => openUpdateProgress(goal)}
                          className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          Update Progress
                        </button>
                        <button
                          onClick={() => openDetails(goal)}
                          className="flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          Details <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    {isCompleted && (
                      <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => openDetails(goal)}
                          className="flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          View History <ChevronRight className="h-4 w-4" />
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
          <div className="rounded-lg bg-linear-to-r from-blue-500 to-purple-600 p-6 text-white">
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

      {/* Update Progress Modal */}
      {updatingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Update Progress</h3>
              <button onClick={() => setUpdatingGoal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{updatingGoal.title}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Current Value ({updatingGoal.unit})
                </label>
                <input
                  type="number"
                  value={progressInput}
                  onChange={e => setProgressInput(e.target.value)}
                  min={0}
                  max={updatingGoal.targetValue}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Target: {updatingGoal.targetValue} {updatingGoal.unit}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={notesInput}
                  onChange={e => setNotesInput(e.target.value)}
                  rows={3}
                  placeholder="How are you feeling about your progress?"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setUpdatingGoal(null)}>Cancel</Button>
                <Button onClick={handleUpdateProgress} disabled={saving || !progressInput}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Progress
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goal Details Modal */}
      {detailGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-xl bg-white dark:bg-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Goal Details</h3>
              <button onClick={() => { setDetailGoal(null); setProgressHistory([]); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            {detailLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary-600" /></div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100">{detailGoal.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{detailGoal.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-slate-500 dark:text-slate-400">Start:</span> <span className="text-slate-800 dark:text-slate-100">{formatDate(detailGoal.startDate)}</span></div>
                  {detailGoal.targetDate && <div><span className="text-slate-500 dark:text-slate-400">Target:</span> <span className="text-slate-800 dark:text-slate-100">{formatDate(detailGoal.targetDate)}</span></div>}
                  <div><span className="text-slate-500 dark:text-slate-400">Progress:</span> <span className="font-medium text-slate-800 dark:text-slate-100">{detailGoal.currentValue} / {detailGoal.targetValue} {detailGoal.unit}</span></div>
                  <div><span className="text-slate-500 dark:text-slate-400">Assigned by:</span> <span className="text-slate-800 dark:text-slate-100">{detailGoal.assignedByName || detailGoal.assignedBy || 'N/A'}</span></div>
                </div>
                {progressHistory.length > 0 && (
                  <div>
                    <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Progress History</h5>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {progressHistory.map(p => (
                        <div key={p.id} className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm">
                          <span className="font-medium text-slate-800 dark:text-slate-100">{p.progressValue} {detailGoal.unit}</span>
                          {p.notes && <span className="text-slate-500 dark:text-slate-400 truncate mx-2">{p.notes}</span>}
                          <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{formatDate(p.recordedAt)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
