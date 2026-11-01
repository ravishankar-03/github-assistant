export type StageId =
  | 'validation'
  | 'issues'
  | 'prs'
  | 'duplicates'
  | 'completeness'
  | 'finalization';

export type StageStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface StageEventPayload {
  stage: StageId;
  title: string;
  description: string;
  status: StageStatus;
}

export interface LogEventPayload {
  id?: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface ErrorEventPayload {
  code: 'RATE_LIMIT' | 'NOT_FOUND' | 'PRIVATE_REPO' | 'AI_ERROR' | 'INTERNAL';
  message: string;
  resolution: string;
  rateLimitReset?: number;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  html_url: string;
  comments: number;
  user?: {
    login: string;
    avatar_url: string;
  };
  labels: Array<{
    name: string;
    color: string;
  }>;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  html_url: string;
  draft?: boolean;
  user?: {
    login: string;
    avatar_url: string;
  };
  additions?: number;
  deletions?: number;
  changed_files?: number;
  labels: Array<{
    name: string;
    color: string;
  }>;
}

export interface DuplicateCluster {
  id: string;
  canonicalIssueNumber: number;
  canonicalTitle: string;
  similarityScore: number; // 0 - 100
  symptomOverlap: string;
  duplicateIssues: Array<{
    number: number;
    title: string;
    snippet: string;
    matchScore: number;
  }>;
  aiRationale: string;
}

export interface CompletenessItem {
  issueNumber: number;
  title: string;
  author: string;
  overallScore: number; // 0 - 100
  criteria: {
    reproductionSteps: boolean;
    environmentInfo: boolean;
    errorLogsOrScreenshots: boolean;
    expectedVsActual: boolean;
    minimalReproLink: boolean;
    versionSpecified: boolean;
  };
  missingFields: string[];
  suggestedPrompt: string;
}

export interface RepositoryMetadata {
  owner: string;
  name: string;
  fullName: string;
  description?: string;
  stars: number;
  forks: number;
  openIssuesCount: number;
  license: string;
  topics?: string[];
  html_url: string;
}

export interface RepositoryAnalysisSummary {
  repository: RepositoryMetadata;
  issues: GitHubIssue[];
  pullRequests: GitHubPullRequest[];
  duplicateClusters: DuplicateCluster[];
  completenessResults: CompletenessItem[];
  analyzedAt: string;
  isDemo: boolean;
  healthMetrics: {
    triageHealthScore: number; // 0 - 100
    burnoutRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
    duplicateRatioPct: number;
    incompleteRatioPct: number;
    staleIssueCount: number;
    topTags: Array<{ name: string; count: number }>;
  };
}
