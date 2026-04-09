/* eslint-disable react/no-unescaped-entities */
// Goals & Progress Page

'use client';

import { useEffect, useState } from 'react';
import { Target, TrendingUp, Award, Calendar, X, Loader2, ChevronRight, Plus, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { getGoals, getGoal, updateGoalProgress, createGoal, deleteGoal } from '@/lib/api';
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

  // Create goal modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    goal_type: 'EXERCISE',
    target_value: '',
    unit: '',
    start_date: new Date().toISOString().split('T')[0],
    target_date: '',
  });

  // Delete confirm state
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

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
      setDetailGoal(res.goal);      setProgressHistory(res.progressHistory);
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

  const handleCreateGoal = async () => {
    if (!newGoal.title || !newGoal.target_value || !newGoal.target_date) return;
    try {
      setCreating(true);
      await createGoal({
        title: newGoal.title,
        description: newGoal.description || undefined,
        goal_type: newGoal.goal_type,
        target_value: parseFloat(newGoal.target_value),
        unit: newGoal.unit || undefined,
        start_date: newGoal.start_date,
        target_date: newGoal.target_date,
      });
      const fresh = await getGoals();
      setGoals(fresh.data);
      setShowCreateModal(false);
      setNewGoal({ title: '', description: '', goal_type: 'EXERCISE', target_value: '', unit: '', start_date: new Date().toISOString().split('T')[0], target_date: '' });
    } catch (error) {
      console.error('Failed to create goal:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteGoal(id);
      setGoals(prev => prev.filter(g => g.id !== id));
      setDeletingGoalId(null);
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
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
      WEIGHT_MANAGEMENT: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
      SLEEP: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400',
      OTHER: 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300',
    };
    return colors[category?.toUpperCase()] || colors.OTHER;
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50">Goals & Progress</h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Track your health goals and celebrate your achievements
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Goal
          </button>
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
                        <button
                          onClick={() => setDeletingGoalId(goal.id)}
                          className="rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    {isCompleted && (
                      <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => openDetails(goal)}
                          className="flex-1 flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          View History <ChevronRight className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingGoalId(goal.id)}
                          className="rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
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

      {/* Create Goal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">New Goal</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={e => setNewGoal(v => ({ ...v, title: e.target.value }))}
                  placeholder="e.g. Walk 10,000 steps daily"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                <select
                  value={newGoal.goal_type}
                  onChange={e => setNewGoal(v => ({ ...v, goal_type: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                >
                  <option value="EXERCISE">Exercise</option>
                  <option value="NUTRITION">Nutrition</option>
                  <option value="WEIGHT_MANAGEMENT">Weight Management</option>
                  <option value="SLEEP">Sleep</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Value *</label>
                  <input
                    type="number"
                    value={newGoal.target_value}
                    onChange={e => setNewGoal(v => ({ ...v, target_value: e.target.value }))}
                    min={0.01}
                    step="any"
                    placeholder="e.g. 10000"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newGoal.unit}
                    onChange={e => setNewGoal(v => ({ ...v, unit: e.target.value }))}
                    placeholder="e.g. steps, kg, min"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={newGoal.start_date}
                    onChange={e => setNewGoal(v => ({ ...v, start_date: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Date *</label>
                  <input
                    type="date"
                    value={newGoal.target_date}
                    onChange={e => setNewGoal(v => ({ ...v, target_date: e.target.value }))}
                    min={newGoal.start_date}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={newGoal.description}
                  onChange={e => setNewGoal(v => ({ ...v, description: e.target.value }))}
                  rows={2}
                  placeholder="Describe your goal (optional)"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button
                  onClick={handleCreateGoal}
                  disabled={creating || !newGoal.title || !newGoal.target_value || !newGoal.target_date}
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Goal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-slate-800 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Delete Goal?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              This will permanently remove the goal and all its progress history.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeletingGoalId(null)}>Cancel</Button>
              <button
                onClick={() => handleDeleteGoal(deletingGoalId)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
