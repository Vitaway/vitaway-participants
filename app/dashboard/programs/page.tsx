// Programs & Learning Page

'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  BookOpen, CheckCircle, Clock, PlayCircle, ArrowLeft,
  FileText, Award, AlertCircle, ChevronRight, Loader2, Video, File,
  FileTextIcon,
  FolderOpen,
  Target,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { LessonContent } from '@/components/programs/LessonContent';
import { RichTextContent } from '@/components/ui/rich-text-content';
import {
  getEnrolledPrograms, getProgram, startProgram,
  getModule, completeModule, getModuleQuiz, submitModuleQuiz,
  getFinalQuiz, submitFinalQuiz, getModuleLessons,
} from '@/lib/api';
import { formatDate, htmlToPlainText } from '@/lib/utils';
import type {
  ProgramEnrollment, Program, ProgramModule, ProgramQuiz,
  ModuleProgress, QuizSubmissionResult, ProgramLesson,
} from '@/types';


type View = 'list' | 'detail' | 'module' | 'quiz' | 'quiz-result' | 'final-quiz' | 'final-result' | 'lesson';

export default function ProgramsPage() {
  // Lessons state (must be inside component)
  const [moduleLessons, setModuleLessons] = useState<ProgramLesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<ProgramLesson | null>(null);
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
      console.log("Fetched ", res.program);
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
      // Debug: Log programId and moduleId
      console.log('Fetching lessons for programId:', selectedEnrollment.programId, 'moduleId:', mod.id);
      const res = await getModule(selectedEnrollment.programId, mod.id);
      console.log(res.module)
      setCurrentModule({
        ...mod,
        ...res.module,
        quiz: res.module.quiz ?? mod.quiz,
        lessons: res.module.lessons?.length ? res.module.lessons : mod.lessons,
      });
      setCurrentModuleProgress(res.progress);
      // Fetch lessons for this module
      const lessons = await getModuleLessons(selectedEnrollment.programId, mod.id);
      console.log('Lessons fetched:', lessons);
      setModuleLessons(lessons);
      setView('module');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load module';
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const openLesson = (lesson: ProgramLesson) => {
    setCurrentLesson(lesson);
    setView('lesson');
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
      const apiError = e as { response?: { status?: number; data?: { message?: string } } };
      if (
        apiError.response?.status === 422 &&
        apiError.response?.data?.message?.includes('requires quiz but none found')
      ) {
        setError('This module is configured to require a quiz, but no quiz has been set up yet. Please contact your administrator.');
      } else {
        const message = e instanceof Error ? e.message : 'Failed to complete module';
        setError(message);
      }
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
      if (!res.quiz) {
        setError('No quiz available for this module.');
        return;
      }
      setCurrentQuiz(res.quiz);
      setQuizAnswers({});
      setQuizResult(null);
      setView('quiz');
    } catch (e: unknown) {
      const apiError = e as { response?: { status?: number; data?: { message?: string } } };
      if (
        apiError.response?.status === 422 &&
        apiError.response?.data?.message?.includes('requires quiz but none found')
      ) {
        setError('This module is configured to require a quiz, but no quiz has been set up yet. Please contact your administrator.');
      } else if (
        apiError.response?.status === 404 ||
        apiError.response?.data?.message?.includes('No quiz')
      ) {
        setError('No quiz available for this module.');
      } else {
        const message = e instanceof Error ? e.message : 'Failed to load quiz';
        setError(message);
      }
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
    if (view === 'lesson') setView('module');
    else if (view === 'module' || view === 'quiz-result') setView('detail');
    else if (view === 'quiz') setView('module');
    else if (view === 'final-quiz' || view === 'final-result') setView('detail');
    else { setView('list'); setSelectedProgram(null); setSelectedEnrollment(null); }
  };

  const getModuleProgressForId = (moduleId: string) =>
    moduleProgress.find(p => p.moduleId === moduleId);

  const getContentTypeIcon = (type?: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      case 'file':
        return <FileTextIcon className="h-5 w-5 text-orange-500 dark:text-orange-400" />;
      case 'mixed':
        return <FolderOpen className="h-5 w-5 text-purple-500 dark:text-purple-400" />;
      case 'text':
        return <BookOpen className="h-5 w-5 text-green-500 dark:text-green-400" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // Helper function to get icon for lesson content type
  const getLessonIcon = (contentType?: string) => {
    switch (contentType) {
      case 'video':
        return <Video className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      case 'file':
        return <File className="h-5 w-5 text-orange-500 dark:text-orange-400" />;
      case 'text':
        return <BookOpen className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case 'mixed':
        return <FileText className="h-5 w-5 text-purple-500 dark:text-purple-400" />;
      default:
        return <BookOpen className="h-5 w-5 text-primary-500 dark:text-primary-400" />;
    }
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
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${quizAnswers[question.id] === Number(answer.id)
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
    const hasQuiz = !!currentModule.quiz;
    const quizPassed = progress?.quizPassed;
    const moduleDetails = [
      { label: 'Content type', value: currentModule.contentType || 'text' },
      { label: 'Requirement', value: currentModule.isRequired ? 'Required' : 'Optional' },
      { label: 'Position', value: String(currentModule.orderIndex || 0) },
      ...(currentModule.durationMinutes
        ? [{ label: 'Estimated time', value: `${currentModule.durationMinutes} minutes` }]
        : []),
      ...(currentModule.fileType
        ? [{ label: 'File type', value: currentModule.fileType.toUpperCase() }]
        : []),
      { label: 'Quiz pass', value: currentModule.requiresQuizPass ? 'Required to complete' : 'Not required' },
      { label: 'Lessons', value: String(moduleLessons.length) },
      { label: 'Quizzes', value: hasQuiz ? '1' : '0' },
    ];

    return (
      <DashboardLayout>
        <div className="space-y-6">
          <button onClick={goBack} className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
            <ArrowLeft className="h-4 w-4" /> Back to Modules
          </button>
          <div>
            <div className="flex items-center gap-3">
              {getContentTypeIcon(currentModule.contentType)}
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{currentModule.title}</h1>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="info" className="capitalize">{currentModule.contentType || 'text'}</Badge>
              <Badge variant={currentModule.isRequired ? 'warning' : 'default'}>
                {currentModule.isRequired ? 'Required' : 'Optional'}
              </Badge>
              {currentModule.requiresQuizPass && (
                <Badge variant="success">Quiz pass required</Badge>
              )}
              {currentModule.durationMinutes && (
                <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {currentModule.durationMinutes} min
                </span>
              )}
            </div>
          </div>

          {error && <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>}

          <Card>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Module Details</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {moduleDetails.map((detail) => (
                  <div key={detail.label} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {detail.label}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100 capitalize">
                      {detail.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {moduleLessons.length > 0 && (
            <Card>
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Lessons</h3>
                <div className="space-y-2">
                  {moduleLessons.sort((a, b) => a.orderIndex - b.orderIndex).map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 cursor-pointer transition-all"
                      onClick={() => openLesson(lesson)}
                    >
                      <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                      </div>

                      {getLessonIcon(lesson.contentType)}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800 dark:text-slate-100 truncate">{lesson.title}</span>
                          <Badge variant={lesson.isRequired ? 'warning' : 'default'}>
                            {lesson.isRequired ? 'Required' : 'Optional'}
                          </Badge>
                        </div>
                        {lesson.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                            {htmlToPlainText(lesson.description)}
                          </p>
                        )}
                        {lesson.durationMinutes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <Clock className="h-3 w-3 inline mr-1" />{lesson.durationMinutes} min
                          </p>
                        )}
                        <div className="mt-1 flex items-center gap-3">
                          <span className="text-xs text-muted-foreground capitalize">{lesson.contentType || 'text'}</span>
                          {lesson.fileType && (
                            <span className="text-xs text-muted-foreground uppercase">{lesson.fileType}</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {hasQuiz && currentModule.quiz && (
            <Card>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="info">Module Quiz</Badge>
                  {currentModule.quiz.isRequired && <Badge variant="warning">Required</Badge>}
                  {quizPassed && <Badge variant="success">Passed</Badge>}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">{currentModule.quiz.title}</h3>
                  {currentModule.quiz.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">{currentModule.quiz.description}</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>Passing score: {currentModule.quiz.passingScore}%</span>
                  <span>Max attempts: {currentModule.quiz.maxAttempts}</span>
                  {currentModule.quiz.timeLimitMinutes && <span>Time limit: {currentModule.quiz.timeLimitMinutes} min</span>}
                </div>
              </div>
            </Card>
          )}

          <div className="flex items-center gap-3">
            {hasQuiz && !quizPassed && (
              <Button onClick={openModuleQuiz} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Take Quiz
              </Button>
            )}
            {!hasQuiz && (
              <span className="text-xs text-slate-500 dark:text-slate-400">No quiz available for this module.</span>
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

  // ─── Lesson Content View ─────────────────────────────────────────
  if (view === 'lesson' && currentLesson) {
    const lessonDetails = [
      { label: 'Content type', value: currentLesson.contentType || 'text' },
      { label: 'Requirement', value: currentLesson.isRequired ? 'Required' : 'Optional' },
      { label: 'Position', value: String(currentLesson.orderIndex || 0) },
      ...(currentLesson.durationMinutes
        ? [{ label: 'Estimated time', value: `${currentLesson.durationMinutes} minutes` }]
        : []),
      ...(currentLesson.fileType
        ? [{ label: 'File type', value: currentLesson.fileType.toUpperCase() }]
        : []),
    ];

    return (
      <DashboardLayout>
        <div className="space-y-6">
          <button onClick={goBack} className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
            <ArrowLeft className="h-4 w-4" /> Back to Module
          </button>
          <div>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  {getLessonIcon(currentLesson.contentType)}
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{currentLesson.title}</h1>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="info" className="capitalize">{currentLesson.contentType || 'text'}</Badge>
                  <Badge variant={currentLesson.isRequired ? 'warning' : 'default'}>
                    {currentLesson.isRequired ? 'Required' : 'Optional'}
                  </Badge>
                  {currentLesson.fileType && (
                    <Badge variant="default" className="uppercase">{currentLesson.fileType}</Badge>
                  )}
                </div>
              </div>
              {currentLesson.durationMinutes && (
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 whitespace-nowrap">
                  <Clock className="h-4 w-4" /> {currentLesson.durationMinutes} min
                </p>
              )}
            </div>
          </div>

          <Card>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {lessonDetails.map((detail) => (
                <div key={detail.label} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {detail.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100 capitalize">
                    {detail.value}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <LessonContent
            contentType={currentLesson.contentType}
            content={currentLesson.content}
            videoUrl={currentLesson.videoUrl}
            fileUrl={currentLesson.fileUrl}
            fileType={currentLesson.fileType}
            title={currentLesson.title}
            description={currentLesson.description}
          />
        </div>
      </DashboardLayout>
    );
  }

  // ─── Program Detail View ─────────────────────────────────────────
  if (view === 'detail' && selectedProgram && selectedEnrollment) {
    const modules = selectedProgram.modules || [];
    const sortedModules = [...modules].sort((a, b) => a.orderIndex - b.orderIndex);
    console.log(selectedProgram.modules)
    const allModulesComplete = sortedModules.length > 0 && sortedModules.every(
      m => getModuleProgressForId(m.id)?.moduleStatus === 'completed'
    );
    const finalQuizzes = (selectedProgram.quizzes || []).filter(q => q.quizType === 'final_quiz');
    const hasFinalQuiz = finalQuizzes.length > 0;
    const isNotStarted = selectedEnrollment.status === 'not_started' || selectedEnrollment.status === 'not_enrolled' || selectedEnrollment.status === 'enrolled';
    const isCompleted = selectedEnrollment.status === 'completed';
    const programDetails = [
      { label: 'Status', value: selectedEnrollment.status === 'not_enrolled' ? 'Available' : selectedEnrollment.status.replace(/_/g, ' ') },
      { label: 'Difficulty', value: selectedProgram.difficultyLevel || 'Not set' },
      {
        label: 'Estimated duration',
        value: selectedProgram.estimatedDurationHours
          ? `${selectedProgram.estimatedDurationHours} hours`
          : selectedProgram.durationMinutes
            ? `${selectedProgram.durationMinutes} minutes`
            : 'Not set',
      },
      { label: 'Modules', value: String(sortedModules.length) },
      { label: 'Program quizzes', value: String(finalQuizzes.length) },
      { label: 'Progress', value: `${Math.round(selectedEnrollment.progressPercentage)}%` },
      { label: 'Enrolled', value: formatDate(selectedEnrollment.enrolledAt) },
      { label: 'Started', value: selectedEnrollment.startedAt ? formatDate(selectedEnrollment.startedAt) : 'Not started' },
    ];

    return (
      <DashboardLayout>
        <div className="space-y-6">
          <button onClick={() => { setView('list'); setSelectedProgram(null); }} className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
            <ArrowLeft className="h-4 w-4" /> Back to Programs
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{selectedProgram.title}</h1>
              {selectedProgram.description && (
                <RichTextContent
                  html={selectedProgram.description}
                  className="mt-1 text-slate-600 dark:text-slate-400"
                />
              )}
            </div>
            <Badge variant={isCompleted ? 'success' : selectedEnrollment.status === 'in_progress' ? 'warning' : 'default'}>
              {selectedEnrollment.status === 'not_enrolled' ? 'Available' : selectedEnrollment.status.replace(/_/g, ' ')}
            </Badge>
          </div>
          {error && <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>}

          <Card>
            <div className="flex flex-col gap-6 lg:flex-row">
              {selectedProgram.imageUrl && (
                <img
                  src={selectedProgram.imageUrl}
                  alt={selectedProgram.title}
                  className="h-48 w-full rounded-xl object-cover lg:h-40 lg:w-64"
                />
              )}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedProgram.difficultyLevel && (
                    <Badge variant="default" className="capitalize">
                      {selectedProgram.difficultyLevel}
                    </Badge>
                  )}
                  {selectedProgram.estimatedDurationHours && (
                    <Badge variant="info">
                      {selectedProgram.estimatedDurationHours}h estimated
                    </Badge>
                  )}
                  <Badge variant="default">
                    {sortedModules.length} module{sortedModules.length === 1 ? '' : 's'}
                  </Badge>
                  {finalQuizzes.length > 0 && (
                    <Badge variant="success">
                      {finalQuizzes.length} quiz{finalQuizzes.length === 1 ? '' : 'zes'}
                    </Badge>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {programDetails.map((detail) => (
                    <div key={detail.label} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {detail.label}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100 capitalize">
                        {detail.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {selectedProgram.learningObjectives && (
            <Card>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Learning Objectives</h2>
                </div>
                <RichTextContent
                  html={selectedProgram.learningObjectives}
                  className="text-slate-700 dark:text-slate-300"
                />
              </div>
            </Card>
          )}

          {/* Progress */}
          <Card className='shadow-none'>
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
                    className={`flex items-center gap-4 rounded-lg border p-4 transition-all bg-white ${isModComplete
                      ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                      : isNotStarted
                        ? 'border-slate-200 dark:border-slate-700 opacity-60'
                        : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 cursor-pointer'
                      }`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isModComplete
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                      : status === 'in_progress'
                        ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                      {isModComplete ? <CheckCircle className="h-5 w-5" /> : idx + 1}
                    </div>

                    {/* Content type icon */}
                    <div className="flex-shrink-0">
                      {getContentTypeIcon(mod.contentType || '')}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-800 dark:text-slate-100 truncate">{mod.title}</h4>
                      {mod.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                          {htmlToPlainText(mod.description)}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground capitalize">{mod.contentType || 'text'}</span>
                        <Badge variant={mod.isRequired ? 'warning' : 'default'}>
                          {mod.isRequired ? 'Required' : 'Optional'}
                        </Badge>
                        {mod.durationMinutes && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">{mod.durationMinutes} min</span>
                        )}
                        {mod.requiresQuizPass && (
                          <Badge variant="success" className="text-xs py-0">Quiz pass required</Badge>
                        )}
                      </div>
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

          {/* Program Quizzes */}
          {hasFinalQuiz && (
            <Card>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">Program Quizzes</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Final assessments published in the admin system appear here for participants.
                  </p>
                </div>

                <div className="space-y-3">
                  {finalQuizzes.map((quiz) => {
                    const unlocked = allModulesComplete && !isCompleted;
                    return (
                      <div
                        key={quiz.id}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 p-4"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="info">Final Quiz</Badge>
                              {quiz.isRequired && <Badge variant="warning">Required</Badge>}
                              {isCompleted && <Badge variant="success">Program Completed</Badge>}
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-800 dark:text-slate-100">{quiz.title}</h4>
                              {quiz.description && (
                                <p className="text-sm text-slate-600 dark:text-slate-400">{quiz.description}</p>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                              <span>Passing score: {quiz.passingScore}%</span>
                              <span>Max attempts: {quiz.maxAttempts}</span>
                              {quiz.timeLimitMinutes && <span>Time limit: {quiz.timeLimitMinutes} min</span>}
                            </div>
                            {!allModulesComplete && (
                              <p className="text-sm text-amber-600 dark:text-amber-400">
                                Complete all modules to unlock this quiz.
                              </p>
                            )}
                          </div>

                          {!isCompleted && (
                            <Button onClick={openFinalQuiz} disabled={!unlocked || actionLoading}>
                              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                              {unlocked ? 'Take Final Quiz' : 'Locked'}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          {/* Final Quiz CTA */}
          {hasFinalQuiz && allModulesComplete && !isCompleted && (
            <Card>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3">
                    <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">Final Assessment Unlocked</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">You can now take the final quiz to finish this program.</p>
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
                          {program.description && (
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                              {htmlToPlainText(program.description)}
                            </p>
                          )}
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
