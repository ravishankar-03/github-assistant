import { useState, useRef, useCallback, useEffect } from 'react';
import {
  StageId,
  StageEventPayload,
  LogEventPayload,
  ErrorEventPayload,
  RepositoryAnalysisSummary,
} from '../types';
import {
  fetchRepoMetadata,
  fetchLiveIssues,
  fetchLivePullRequests,
  GitHubApiError,
} from '../services/githubClient';
import {
  runSemanticDuplicateDetection,
  runCompletenessScreening,
} from '../services/aiAnalysis';
import { DEMO_PRESETS } from '../services/demoFixtures';

const INITIAL_STAGES: StageEventPayload[] = [
  {
    stage: 'validation',
    title: 'Repository Validation',
    description: 'Resolving owner/repo slug and fetching GitHub repository metadata...',
    status: 'pending',
  },
  {
    stage: 'issues',
    title: 'Issue Ingestion & Segregation',
    description: 'Streaming live issues and isolating pure bug/feature reports from PRs...',
    status: 'pending',
  },
  {
    stage: 'prs',
    title: 'Pull Request Pipeline',
    description: 'Ingesting active PRs, changed file diff metrics, and contributor activity...',
    status: 'pending',
  },
  {
    stage: 'duplicates',
    title: 'Semantic Duplicate Detection',
    description: 'Clustering issues by root cause and symptom overlap via Gemini AI...',
    status: 'pending',
  },
  {
    stage: 'completeness',
    title: 'Completeness Screening',
    description: 'Auditing issues against the 6-point reproduction and environment criteria...',
    status: 'pending',
  },
  {
    stage: 'finalization',
    title: 'Finalization & Health Score',
    description: 'Synthesizing health scorecards, burnout metrics, and maintainer cache...',
    status: 'pending',
  },
];

export function useStreamAnalysis(onComplete: (data: RepositoryAnalysisSummary) => void) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stages, setStages] = useState<StageEventPayload[]>(INITIAL_STAGES);
  const [logs, setLogs] = useState<LogEventPayload[]>([]);
  const [error, setError] = useState<ErrorEventPayload | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);

  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    stopTimer();
    setIsStreaming(false);
    setLogs((prev) => [
      ...prev,
      {
        id: `log-abort-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'warn',
        message: 'Analysis aborted by user.',
      },
    ]);
  }, []);

  const emitLog = (message: string, level: LogEventPayload['level'] = 'info') => {
    setLogs((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        level,
        message,
      },
    ]);
  };

  const updateStage = (stageId: StageId, status: StageStatus, desc?: string) => {
    setStages((prev) =>
      prev.map((s) =>
        s.stage === stageId
          ? { ...s, status, description: desc ?? s.description }
          : s
      )
    );
  };

  const startAnalysis = useCallback(
    async (repoUrl: string, token?: string, demoMode = false) => {
      // Abort any in-flight requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      stopTimer();
      setIsStreaming(true);
      setProgress(2);
      setStages(INITIAL_STAGES.map((s) => ({ ...s, status: 'pending' })));
      setLogs([]);
      setError(null);
      setElapsedSeconds(0);

      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);

      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      try {
        emitLog(`Initializing real-time SSE stream pipeline for: ${repoUrl || 'Default'}`, 'info');

        // Check if explicit Demo Mode is requested
        if (demoMode) {
          emitLog('Explicit Demo Mode active. Loading curated repository snapshot...', 'warn');
          const cleanSlug = repoUrl.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '') || 'expressjs/express';
          const fixture = DEMO_PRESETS[cleanSlug] || DEMO_PRESETS['expressjs/express'];

          // Smooth simulated streaming progression
          updateStage('validation', 'in_progress', 'Validating local fixture metadata...');
          setProgress(15);
          await delay(350);
          emitLog(`Loaded metadata for ${fixture.repository.fullName} (★ ${fixture.repository.stars.toLocaleString()})`, 'success');
          updateStage('validation', 'completed');

          updateStage('issues', 'in_progress', 'Simulating issue segregation...');
          setProgress(35);
          await delay(450);
          emitLog(`Ingested ${fixture.issues.length} issues without PR clutter.`, 'info');
          updateStage('issues', 'completed');

          updateStage('prs', 'in_progress', 'Ingesting PR branches and diff statistics...');
          setProgress(55);
          await delay(400);
          emitLog(`Processed ${fixture.pullRequests.length} pull requests.`, 'info');
          updateStage('prs', 'completed');

          updateStage('duplicates', 'in_progress', 'Evaluating semantic clusters via Gemini...');
          setProgress(75);
          await delay(600);
          emitLog(`Identified ${fixture.duplicateClusters.length} duplicate clusters.`, 'success');
          updateStage('duplicates', 'completed');

          updateStage('completeness', 'in_progress', 'Scoring issues against 6-point checklist...');
          setProgress(90);
          await delay(450);
          emitLog(`Screened ${fixture.completenessResults.length} issues for completeness.`, 'info');
          updateStage('completeness', 'completed');

          updateStage('finalization', 'in_progress', 'Finalizing maintainer triage dashboard...');
          setProgress(100);
          await delay(300);
          updateStage('finalization', 'completed');
          emitLog('Analysis complete. Render ready.', 'success');

          stopTimer();
          setIsStreaming(false);
          onComplete(fixture);
          return;
        }

        // Live Mode: Parse owner and repo
        const match = repoUrl.trim().match(/github\.com\/([^/]+)\/([^/]+)|^([^/]+)\/([^/]+)$/);
        if (!match) {
          throw new GitHubApiError(
            'NOT_FOUND',
            'Invalid repository format.',
            'Please enter a valid format such as "owner/repo" or "https://github.com/owner/repo".'
          );
        }
        const owner = match[1] || match[3];
        const repo = (match[2] || match[4]).replace(/\.git$/, '');

        // --- STAGE 1: Repository Validation ---
        updateStage('validation', 'in_progress', `Connecting to GitHub API for ${owner}/${repo}...`);
        setProgress(10);
        emitLog(`Connecting to GitHub REST API /repos/${owner}/${repo}...`, 'info');

        const { meta, rateLimitRemaining } = await fetchRepoMetadata(owner, repo, token, signal);
        emitLog(
          `Validated ${meta.fullName} (★ ${meta.stars.toLocaleString()} | Forks: ${meta.forks.toLocaleString()} | Quota remaining: ${rateLimitRemaining})`,
          'success'
        );
        updateStage('validation', 'completed', `Validated ${meta.fullName}`);
        setProgress(20);

        if (signal.aborted) return;

        // --- STAGE 2: Issue Ingestion & Segregation ---
        updateStage('issues', 'in_progress', 'Streaming issues and filtering pull requests...');
        setProgress(30);
        emitLog(`Querying issues with per_page=60 to isolate genuine reports...`, 'info');

        const { issues, rateLimitRemaining: issueLimit } = await fetchLiveIssues(owner, repo, token, signal);
        const openIssues = issues.filter((i) => i.state === 'open').length;
        const closedIssues = issues.length - openIssues;
        emitLog(`Fetched ${issues.length} pure issues (${openIssues} open, ${closedIssues} closed). API quota: ${issueLimit}`, 'info');
        updateStage('issues', 'completed', `Ingested ${issues.length} pure issues`);
        setProgress(45);

        if (signal.aborted) return;

        // --- STAGE 3: Pull Request Pipeline ---
        updateStage('prs', 'in_progress', 'Streaming pull requests and diff metrics...');
        setProgress(55);
        emitLog('Fetching recent pull requests...', 'info');

        const { prs } = await fetchLivePullRequests(owner, repo, token, signal);
        emitLog(`Retrieved ${prs.length} pull requests with line change metrics.`, 'info');
        updateStage('prs', 'completed', `Processed ${prs.length} pull requests`);
        setProgress(65);

        if (signal.aborted) return;

        // --- STAGE 4: Semantic Duplicate Detection ---
        updateStage('duplicates', 'in_progress', 'Running semantic clustering with Gemini 2.5 Flash...');
        setProgress(75);
        emitLog('Synthesizing issue summaries into Gemini reasoning pipeline...', 'info');

        const duplicateClusters = await runSemanticDuplicateDetection(issues, signal);
        emitLog(`Identified ${duplicateClusters.length} semantic duplicate cluster(s).`, 'success');
        updateStage('duplicates', 'completed', `Found ${duplicateClusters.length} duplicate clusters`);
        setProgress(85);

        if (signal.aborted) return;

        // --- STAGE 5: Completeness Screening ---
        updateStage('completeness', 'in_progress', 'Auditing issues against 6-point checklist...');
        setProgress(92);
        emitLog('Evaluating reproduction steps, error logs, and environment specs...', 'info');

        const completenessResults = await runCompletenessScreening(issues, signal);
        const lowCompleteness = completenessResults.filter((c) => c.overallScore < 50).length;
        emitLog(`Screened ${completenessResults.length} issues. Found ${lowCompleteness} issues missing crucial repro info.`, 'info');
        updateStage('completeness', 'completed', `Audited ${completenessResults.length} issues`);
        setProgress(96);

        if (signal.aborted) return;

        // --- STAGE 6: Finalization ---
        updateStage('finalization', 'in_progress', 'Calculating health score and maintainer recommendations...');
        setProgress(98);

        // Calculate health metrics
        const duplicateRatio = issues.length > 0 ? Math.round((duplicateClusters.length * 2 / issues.length) * 100) : 0;
        const incompleteRatio = issues.length > 0 ? Math.round((lowCompleteness / issues.length) * 100) : 0;
        const healthScore = Math.max(20, Math.min(100, Math.round(100 - (duplicateRatio * 0.4 + incompleteRatio * 0.5))));
        const burnoutRisk = healthScore > 80 ? 'Low' : healthScore > 60 ? 'Moderate' : healthScore > 40 ? 'High' : 'Severe';

        const tagMap: Record<string, number> = {};
        issues.forEach((i) => {
          i.labels.forEach((l) => {
            tagMap[l.name] = (tagMap[l.name] || 0) + 1;
          });
        });
        const topTags = Object.entries(tagMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);

        const summary: RepositoryAnalysisSummary = {
          repository: meta,
          issues,
          pullRequests: prs,
          duplicateClusters,
          completenessResults,
          analyzedAt: new Date().toISOString(),
          isDemo: false,
          healthMetrics: {
            triageHealthScore: healthScore,
            burnoutRisk,
            duplicateRatioPct: duplicateRatio,
            incompleteRatioPct: incompleteRatio,
            staleIssueCount: issues.filter((i) => i.state === 'open' && i.comments === 0).length,
            topTags,
          },
        };

        updateStage('finalization', 'completed', 'Analysis finalized');
        setProgress(100);
        emitLog('Live repository analysis complete! Opening dashboard...', 'success');

        stopTimer();
        setIsStreaming(false);
        onComplete(summary);
      } catch (err: any) {
        if (signal.aborted) return;
        stopTimer();
        setIsStreaming(false);

        if (err instanceof GitHubApiError) {
          emitLog(err.message, 'error');
          setError({
            code: err.code,
            message: err.message,
            resolution: err.resolution,
            rateLimitReset: err.rateLimitReset,
          });
        } else {
          emitLog(err?.message || 'Unexpected failure during analysis stream.', 'error');
          setError({
            code: 'INTERNAL',
            message: err?.message || 'Connection or parse error occurred.',
            resolution: 'Check your internet connection, verify the repository name, or toggle Demo Mode.',
          });
        }

        setStages((prev) =>
          prev.map((s) => (s.status === 'in_progress' ? { ...s, status: 'failed' } : s))
        );
      }
    },
    [onComplete]
  );

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      stopTimer();
    };
  }, []);

  return {
    isStreaming,
    progress,
    stages,
    logs,
    error,
    elapsedSeconds,
    startAnalysis,
    cancelStream,
  };
}
