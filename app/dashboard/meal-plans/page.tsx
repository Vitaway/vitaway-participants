'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    UtensilsCrossed,
    Calendar,
    ChevronRight,
    Loader2,
    FileText,
    Download,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getMealPlans, downloadMealPlan } from '@/lib/api/mealplans';
import type { MealPlanSummary } from '@/lib/api/mealplans';

export default function MealPlansPage() {
    const [mealPlans, setMealPlans] = useState<MealPlanSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const result = await getMealPlans();
                setMealPlans(result.data);
            } catch (error) {
                console.error('Failed to load meal plans:', error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        Meal Plans
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        View your personalized meal plans created by your care team.
                    </p>
                </div>

                {/* Meal Plans List */}
                {mealPlans.length === 0 ? (
                    <Card className="p-12 text-center">
                        <UtensilsCrossed className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">
                            No Meal Plans Yet
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Your care team hasn&apos;t created any meal plans for you yet. Check back later.
                        </p>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {mealPlans.map((plan) => {
                            const isActive =
                                plan.start_date &&
                                plan.end_date &&
                                new Date(plan.start_date) <= new Date() &&
                                new Date(plan.end_date) >= new Date();

                            return (
                                <Link
                                    key={plan.id}
                                    href={`/dashboard/meal-plans/${plan.id}`}
                                >
                                    <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                                                    <UtensilsCrossed className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                                                            {plan.title}
                                                        </h3>
                                                        {isActive && (
                                                            <Badge variant="success">Active</Badge>
                                                        )}
                                                    </div>
                                                    {plan.notes && (
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
                                                            {plan.notes}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                                                        {plan.start_date && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3.5 w-3.5" />
                                                                {plan.start_date}
                                                                {plan.end_date && ` — ${plan.end_date}`}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                                                            <FileText className="h-3.5 w-3.5" />
                                                            {plan.items_count} meal{plan.items_count !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <button
                                                    onClick={async (e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setDownloadingId(plan.id);
                                                        await downloadMealPlan(plan.id, plan.title);
                                                        setDownloadingId(null);
                                                    }}
                                                    className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                    title="Download PDF"
                                                >
                                                    {downloadingId === plan.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                                    ) : (
                                                        <Download className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                                                    )}
                                                </button>
                                                <ChevronRight className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
