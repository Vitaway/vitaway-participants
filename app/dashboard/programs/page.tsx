// Programs & Learning Page

'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  BookOpen, CheckCircle, Clock, PlayCircle, ArrowLeft,
  FileText, Award, AlertCircle, ChevronRight, Loader2,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  getEnrolledPrograms, getProgram, startProgram,
  getModule, completeModule, getModuleQuiz, submitModuleQuiz,
  getFinalQuiz, submitFinalQuiz,
} from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type {
  ProgramEnrollment, Program, ProgramModule, ProgramQuiz,
  ModuleProgress, QuizSubmissionResult,
} from '@/types';

type View = 'list' | 'detail' | 'module' | 'quiz' | 'quiz-result' | 'final-quiz' | 'final-result';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<ProgramEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [view, setView] = useState<View>('list');
  const [error, setError] = useState<string | null>(null);

  // Detail view state
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState<ProgramEnrollment | null>(null);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);

  // Module view state
  const [currentModule, setCurrentModule] = useState<ProgramModule | null>(null);
  const [currentModuleProgress, setCurrentModuleProgress] = useState<ModuleProgress | null>(null);

  // Quiz state
  const [currentQuiz, setCurrentQuiz] = useState<ProgramQuiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<QuizSubmissionResult | null>(null);

  const loadPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getEnrolledPrograms();
      setPrograms(res.data);
    } catch {
      console.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPrograms(); }, [loadPrograms]);

  const openProgramDetail = async (enrollment: ProgramEnrollment) => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await getProgram(enrollment.programId);
      setSelectedProgram(res.program);
      setSelectedEnrollment({ ...enrollment, progressPercentage: res.completionPercentage });
      setModuleProgress(res.progress);
      setView('detail');
    } catch {
      setError('Failed to load program details');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartProgram = async () => {
    if (!selectedEnrollment) return;
    try {
      setActionLoading(true);
      const updated = await startProgram(selectedEnrollment.programId);
      setSelectedEnrollment(updated);
      loadPrograms();
    } catch {
      setError('Failed to start program');
    } finally {
      setActionLoading(false);
    }
  };

  const openModule = async (mod: ProgramModule) => {
    if (!selectedEnrollment) return;
    try {
      setActionLoading(true);
      setError(null);
      const res = await getModule(selectedEnrollment.programId, mod.id);
      setCurrentModule(res.module);
      setCurrentModuleProgress(res.progress);
      setView('module');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load module';
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteModule = async () => {
    if (!selectedEnrollment || !currentModule) return;
    try {
      setActionLoading(true);
      await completeModule(selectedEnrollment.programId, currentModule.id);
      // Refresh program detail
      const res = await getProgram(selectedEnrollment.programId);
      setSelectedProgram(res.program);
      setSelectedEnrollment(prev => prev ? { ...prev, progressPercentage: res.completionPercentage } : null);
      setModuleProgress(res.progress);
      setView('detail');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to complete module';
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const openModuleQuiz = async () => {
    if (!selectedEnrollment || !currentModule) return;
    try {
      setActionLoading(true);
      setError(null);
      const res = await getModuleQuiz(selectedEnrollment.programId, currentModule.id);
      setCurrentQuiz(res.quiz);
      setQuizAnswers({});
      setQuizResult(null);
      setView('quiz');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load quiz';
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitModuleQuiz = async () => {
    if (!selectedEnrollment || !currentModule || !currentQuiz) return;
    if (Object.keys(quizAnswers).length === 0) {
      setError('Please answer all questions before submitting.');
      return;
    }
    try {
      setActionLoading(true);
      setError(null);
      const result = await submitModuleQuiz(selectedEnrollment.programId, currentModule.id, {
        answers: quizAnswers,
      });
      setQuizResult(result);
      setView('quiz-result');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to submit quiz';
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const openFinalQuiz = async () => {
    if (!selectedEnrollment) return;
    try {
      setActionLoading(true);
      setError(null);
      const res = await getFinalQuiz(selectedEnrollment.programId);
      setCurrentQuiz(res.quiz);
      setQuizAnswers({});
      setQuizResult(null);
      setView('final-quiz');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load final quiz';
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitFinalQuiz = async () => {
    if (!selectedEnrollment || !currentQuiz) return;
    if (Object.keys(quizAnswers).length === 0) {
      setError('Please answer all questions before submitting.');
      return;
    }
    try {
      setActionLoading(true);
      setError(null);
      const result = await submitFinalQuiz(selectedEnrollment.programId, {
        answers: quizAnswers,
      });
      setQuizResult(result);
      setView('final-result');
      loadPrograms();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to submit final quiz';
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const goBack = () => {
    if (view === 'module' || view === 'quiz-result') setView('detail');
    else if (view === 'quiz') setView('module');
    else if (view === 'final-quiz' || view === 'final-result') setView('detail');
    else { setView('list'); setSelectedProgram(null); setSelectedEnrollment(null); }
  };

  const getModuleProgressForId = (moduleId: string) =>
    moduleProgress.find(p => p.moduleId === moduleId);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  // ─── Quiz View (shared for module & final) ──────────────────────
  if (view === 'quiz' || view === 'final-quiz') {
    const hasQuestions = (currentQuiz?.questions?.length ?? 0) > 0;
    const allAnswered = hasQuestions && currentQuiz!.questions!.every(q => quizAnswers[q.id] !== undefined);
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <button onClick={goBack} className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{currentQuiz?.title}</h1>
            {currentQuiz?.description && (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{currentQuiz.description}</p>
            )}
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Passing score: {currentQuiz?.passingScore}% &bull; {currentQuiz?.questions?.length || 0} questions
            </p>
          </div>
          {error && <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
          {!hasQuestions && (
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4 text-sm text-yellow-700 dark:text-yellow-400">
              This quiz has no questions yet. Please check back later.
            </div>
          )}
          <div className="space-y-6">
            {currentQuiz?.questions?.map((question, qi) => (
              <Card key={question.id}>
                <div className="space-y-4">
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    {qi + 1}. {question.questionText}
                  </p>
                  <div className="space-y-2">
                    {question.answers.map(answer => (
                      <label
                        key={answer.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                          quizAnswers[question.id] === Number(answer.id)
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${question.id}`}
                          checked={quizAnswers[question.id] === Number(answer.id)}
                          onChange={() => setQuizAnswers(prev => ({ ...prev, [question.id]: Number(answer.id) }))}
                          className="h-4 w-4 text-primary-600"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{answer.answerText}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="flex justify-end">
            <Button
              onClick={view === 'quiz' ? handleSubmitModuleQuiz : handleSubmitFinalQuiz}
              disabled={!allAnswered || actionLoading}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Quiz
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Quiz Result View ────────────────────────────────────────────
  if (view === 'quiz-result' || view === 'final-result') {
    const passed = quizResult?.passed;
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          <div className={`rounded-full p-6 ${passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            {passed
              ? <Award className="h-16 w-16 text-green-600 dark:text-green-400" />
              : <AlertCircle className="h-16 w-16 text-red-600 dark:text-red-400" />}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {passed ? 'Congratulations!' : 'Not Quite'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
            {passed
              ? view === 'final-result'
                ? 'You passed the final assessment! The program is now complete.'
                : 'You passed the quiz! You can proceed to the next module.'
              : 'You did not meet the passing score. Review the material and try again.'}
          </p>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{quizResult?.score}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Your Score</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{quizResult?.passingScore}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Passing Score</p>
            </div>
          </div>
          <Button onClick={goBack}>
            {view === 'final-result' ? 'Back to Program' : 'Back to Modules'}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Module Content View ─────────────────────────────────────────
  if (view === 'module' && currentModule) {
    const progress = currentModuleProgress;
    const isCompleted = progress?.moduleStatus === 'completed';
    const hasQuiz = !!currentModule.requiresQuizPass || !!currentModule.quiz;
    const quizPassed = progress?.quizPassed;

    return (
      <DashboardLayout>
        <div className="space-y-6">
          <button onClick={goBack} className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
            <ArrowLeft className="h-4 w-4" /> Back to Modules
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{currentModule.title}</h1>
            {currentModule.durationMinutes && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="h-4 w-4" /> {currentModule.durationMinutes} min
              </p>
            )}
          </div>
          {error && <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
          <Card>
            <div className="prose dark:prose-invert max-w-none">
              {currentModule.content ? (
                <div dangerouslySetInnerHTML={{ __html: currentModule.content }} />
              ) : currentModule.description ? (
                <p className="text-slate-700 dark:text-slate-300">{currentModule.description}</p>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">No content available for this module.</p>
              )}
            </div>
          </Card>
          <div className="flex items-center gap-3">
            {hasQuiz && !quizPassed && (
              <Button onClick={openModuleQuiz} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Take Quiz
              </Button>
            )}
            {hasQuiz && quizPassed && (
              <Badge variant="success">Quiz Passed ({progress?.quizScore}%)</Badge>
            )}
            {!isCompleted && (!hasQuiz || quizPassed) && (
              <Button onClick={handleCompleteModule} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Mark as Complete
              </Button>
            )}
            {isCompleted && <Badge variant="success">Completed</Badge>}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Program Detail View ─────────────────────────────────────────
  if (view === 'detail' && selectedProgram && selectedEnrollment) {
    const modules = selectedProgram.modules || [];
    const sortedModules = [...modules].sort((a, b) => a.orderIndex - b.orderIndex);
    const allModulesComplete = sortedModules.length > 0 && sortedModules.every(
      m => getModuleProgressForId(m.id)?.moduleStatus === 'completed'
    );
    const hasFinalQuiz = selectedProgram.quizzes?.some(q => q.quizType === 'final_quiz');
    const isNotStarted = selectedEnrollment.status === 'not_started' || selectedEnrollment.status === 'not_enrolled' || selectedEnrollment.status === 'enrolled';
    const isCompleted = selectedEnrollment.status === 'completed';

    return (
      <DashboardLayout>
        <div className="space-y-6">
          <button onClick={() => { setView('list'); setSelectedProgram(null); }} className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
            <ArrowLeft className="h-4 w-4" /> Back to Programs
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{selectedProgram.title}</h1>
              <p className="mt-1 text-slate-600 dark:text-slate-400">{selectedProgram.description}</p>
            </div>
            <Badge variant={isCompleted ? 'success' : selectedEnrollment.status === 'in_progress' ? 'warning' : 'default'}>
              {selectedEnrollment.status === 'not_enrolled' ? 'Available' : selectedEnrollment.status.replace(/_/g, ' ')}
            </Badge>
          </div>
          {error && <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>}

          {/* Progress */}
          <Card>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Overall Progress</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {Math.round(selectedEnrollment.progressPercentage)}%
                </span>
              </div>
              <ProgressBar value={Math.round(selectedEnrollment.progressPercentage)} color={isCompleted ? 'green' : 'blue'} />
            </div>
          </Card>

          {/* Start Program Button */}
          {isNotStarted && (
            <Button onClick={handleStartProgram} disabled={actionLoading} className="w-full">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlayCircle className="h-4 w-4 mr-2" />}
              Start Program
            </Button>
          )}

          {/* Modules List */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
              Modules ({sortedModules.length})
            </h2>
            <div className="space-y-3">
              {sortedModules.map((mod, idx) => {
                const mp = getModuleProgressForId(mod.id);
                const status = mp?.moduleStatus || 'not_started';
                const isModComplete = status === 'completed';
                return (
                  <div
                    key={mod.id}
                    onClick={() => !isNotStarted && openModule(mod)}
                    className={`flex items-center gap-4 rounded-lg border p-4 transition-all ${
                      isModComplete
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                        : isNotStarted
                          ? 'border-slate-200 dark:border-slate-700 opacity-60'
                          : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 cursor-pointer'
                    }`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      isModComplete
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                        : status === 'in_progress'
                          ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      {isModComplete ? <CheckCircle className="h-5 w-5" /> : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-800 dark:text-slate-100 truncate">{mod.title}</h4>
                      {mod.durationMinutes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">{mod.durationMinutes} min</p>
                      )}
                    </div>
                    {mod.requiresQuizPass && (
                      <Badge variant={mp?.quizPassed ? 'success' : 'default'} className="text-xs shrink-0">
                        {mp?.quizPassed ? 'Quiz Passed' : 'Has Quiz'}
                      </Badge>
                    )}
                    {!isNotStarted && <ChevronRight className="h-5 w-5 text-slate-400 dark:text-slate-500 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final Quiz */}
          {hasFinalQuiz && allModulesComplete && !isCompleted && (
            <Card>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3">
                    <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">Final Assessment</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Complete the final quiz to finish this program</p>
                  </div>
                </div>
                <Button onClick={openFinalQuiz} disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Take Final Quiz
                </Button>
              </div>
            </Card>
          )}
          {isCompleted && selectedEnrollment.finalScore !== undefined && (
            <Card>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                  <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-700 dark:text-green-400">Program Completed!</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Final Score: {selectedEnrollment.finalScore}%</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // ─── Programs List View ──────────────────────────────────────────
  const inProgressPrograms = programs.filter(p => p.status === 'in_progress');
  const completedPrograms = programs.filter(p => p.status === 'completed');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Programs & Learning</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Engage with educational content and track your learning progress
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary-100 dark:bg-primary-900/30 p-3">
                <BookOpen className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Programs</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{programs.length}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 p-3">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">In Progress</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{inProgressPrograms.length}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{completedPrograms.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {actionLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
          </div>
        )}

        {/* Programs Grid */}
        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">All Programs</h2>
          {programs.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No programs available yet</p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {programs.map(enrollment => {
                const { program, status, progressPercentage, enrolledAt, dueDate } = enrollment;
                const progress = Math.round(progressPercentage);
                return (
                  <Card key={enrollment.id} className="transition-all hover:shadow-md">
                    <div className="cursor-pointer space-y-4" onClick={() => openProgramDetail(enrollment)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 mr-3">
                          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {program.title}
                          </h3>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                            {program.description}
                          </p>
                        </div>
                        <Badge variant={status === 'completed' ? 'success' : status === 'in_progress' ? 'warning' : status === 'not_enrolled' ? 'default' : 'default'}>
                          {status === 'not_enrolled' ? 'Available' : status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Progress</span>
                          <span className="font-medium text-slate-800 dark:text-slate-100">{progress}%</span>
                        </div>
                        <ProgressBar value={progress} color={status === 'completed' ? 'green' : 'blue'} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Enrolled: {formatDate(enrolledAt)}</span>
                        {dueDate && <span>Due: {formatDate(dueDate)}</span>}
                      </div>
                      <div className="flex items-center justify-end">
                        <span className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400">
                          View Details <ChevronRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {programs.length > 0 && (
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
              <FileText className="h-4 w-4" />
              {programs.length} program{programs.length !== 1 ? 's' : ''} available
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
