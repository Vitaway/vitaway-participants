'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    UtensilsCrossed,
    ArrowLeft,
    Calendar,
    FileText,
    Loader2,
    Download,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getMealPlan, downloadMealPlan } from '@/lib/api/mealplans';
import type { MealPlanDetail } from '@/lib/api/mealplans';

const TIME_SLOT_ORDER = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack'];
const TIME_SLOT_LABELS: Record<string, string> = {
    breakfast: 'Breakfast',
    morning_snack: 'Morning Snack',
    lunch: 'Lunch',
    afternoon_snack: 'Afternoon Snack',
    dinner: 'Dinner',
    evening_snack: 'Evening Snack',
};

function formatSlotLabel(slot: string): string {
    return TIME_SLOT_LABELS[slot] ?? slot.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function MealPlanDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);
    const [plan, setPlan] = useState<MealPlanDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const data = await getMealPlan(id);
                setPlan(data);
            } catch (error) {
                console.error('Failed to load meal plan:', error);
            } finally {
                setLoading(false);
            }
        }
        if (id) load();
    }, [id]);

    const handleDownload = async () => {
        if (!plan) return;
        setDownloading(true);
        await downloadMealPlan(id, plan.title);
        setDownloading(false);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
            </DashboardLayout>
        );
    }

    if (!plan) {
        return (
            <DashboardLayout>
                <div className="text-center py-16">
                    <UtensilsCrossed className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                        Meal Plan Not Found
                    </h3>
                    <Button variant="outline" onClick={() => router.push('/dashboard/meal-plans')}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Meal Plans
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Back link + title */}
                <div>
                    <button
                        onClick={() => router.push('/dashboard/meal-plans')}
                        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-3 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Meal Plans
                    </button>
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {plan.title}
                        </h1>
                        <Button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="flex items-center gap-2"
                        >
                            {downloading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            {downloading ? 'Downloading...' : 'Download PDF'}
                        </Button>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {plan.start_date && (
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {plan.start_date}{plan.end_date && ` — ${plan.end_date}`}
                            </span>
                        )}
                    </div>
                </div>

                {/* Notes & Guidelines */}
                {(plan.notes || plan.guidelines) && (
                    <Card className="p-5 space-y-3">
                        {plan.notes && (
                            <div>
                                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">{plan.notes}</p>
                            </div>
                        )}
                        {plan.guidelines && (
                            <div>
                                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Guidelines</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">{plan.guidelines}</p>
                            </div>
                        )}
                    </Card>
                )}

                {/* Daily Schedule */}
                {plan.schedule.length === 0 ? (
                    <Card className="p-10 text-center">
                        <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            No meal items have been added to this plan yet.
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {plan.schedule.map((day) => (
                            <Card key={day.date} className="overflow-hidden">
                                <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        {day.date}
                                    </h3>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    {[...day.meals]
                                        .sort((a, b) => {
                                            const ai = TIME_SLOT_ORDER.indexOf(a.time_slot);
                                            const bi = TIME_SLOT_ORDER.indexOf(b.time_slot);
                                            return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
                                        })
                                        .map((meal) => (
                                            <div key={meal.id} className="px-5 py-3 flex items-start gap-3">
                                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded w-32 text-center flex-shrink-0">
                                                    {formatSlotLabel(meal.time_slot)}
                                                </span>
                                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                                    {meal.meal_description}
                                                </p>
                                            </div>
                                        ))}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
