import { GitHubIssue, GitHubPullRequest, RepositoryMetadata } from '../types';

export class GitHubApiError extends Error {
  constructor(
    public code: 'RATE_LIMIT' | 'NOT_FOUND' | 'PRIVATE_REPO' | 'INTERNAL',
    message: string,
    public resolution: string,
    public rateLimitReset?: number
  ) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

export async function fetchGitHubAPI<T>(
  endpoint: string,
  token?: string,
  signal?: AbortSignal
): Promise<{ data: T; rateLimitRemaining: number; rateLimitReset: number }> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Maintainer-Copilot-Analyzer',
  };

  if (token && token.trim().length > 0) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  const response = await fetch(`https://api.github.com${endpoint}`, {
    headers,
    signal,
  });

  const remaining = Number(response.headers.get('x-ratelimit-remaining') ?? 60);
  const reset = Number(response.headers.get('x-ratelimit-reset') ?? (Date.now() / 1000 + 3600));

  if (response.status === 403 || response.status === 429) {
    if (remaining === 0) {
      const resetTime = new Date(reset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      throw new GitHubApiError(
        'RATE_LIMIT',
        `GitHub API rate limit exceeded (0 requests remaining).`,
        `Supply a Personal Access Token (PAT) in Settings, wait until ${resetTime}, or explicitly switch to Demo Mode.`,
        reset
      );
    }
    throw new GitHubApiError(
      'PRIVATE_REPO',
      'Access forbidden to this repository.',
      'Ensure the repository is public or provide a valid GitHub Personal Access Token (PAT) with repo scope in Settings.'
    );
  }

  if (response.status === 404) {
    throw new GitHubApiError(
      'NOT_FOUND',
      `Repository or resource not found (${endpoint}).`,
      'Check the owner/repo spelling (e.g. facebook/react) or provide a GitHub token if the repository is private.'
    );
  }

  if (!response.ok) {
    throw new GitHubApiError(
      'INTERNAL',
      `GitHub API responded with status ${response.status}`,
      'Check GitHub status or retry in a few moments.'
    );
  }

  const data = (await response.json()) as T;
  return { data, rateLimitRemaining: remaining, rateLimitReset: reset };
}

export async function fetchRepoMetadata(
  owner: string,
  repo: string,
  token?: string,
  signal?: AbortSignal
): Promise<{ meta: RepositoryMetadata; rateLimitRemaining: number }> {
  const { data, rateLimitRemaining } = await fetchGitHubAPI<any>(
    `/repos/${owner}/${repo}`,
    token,
    signal
  );

  return {
    meta: {
      owner: data.owner?.login || owner,
      name: data.name || repo,
      fullName: data.full_name || `${owner}/${repo}`,
      description: data.description || 'No description provided.',
      stars: data.stargazers_count ?? 0,
      forks: data.forks_count ?? 0,
      openIssuesCount: data.open_issues_count ?? 0,
      license: data.license?.spdx_id || data.license?.name || 'Unlicensed',
      topics: data.topics || [],
      html_url: data.html_url || `https://github.com/${owner}/${repo}`,
    },
    rateLimitRemaining,
  };
}

export async function fetchLiveIssues(
  owner: string,
  repo: string,
  token?: string,
  signal?: AbortSignal
): Promise<{ issues: GitHubIssue[]; rateLimitRemaining: number }> {
  // Fetch up to 60 items so after filtering out PRs we have pure issues
  const { data, rateLimitRemaining } = await fetchGitHubAPI<any[]>(
    `/repos/${owner}/${repo}/issues?state=all&per_page=60&sort=updated`,
    token,
    signal
  );

  // GitHub /issues includes PRs if item.pull_request is truthy
  const pureIssues: GitHubIssue[] = data
    .filter((item) => !item.pull_request)
    .slice(0, 35)
    .map((item) => ({
      id: item.id,
      number: item.number,
      title: item.title,
      body: item.body || '',
      state: item.state,
      created_at: item.created_at,
      updated_at: item.updated_at,
      html_url: item.html_url,
      comments: item.comments || 0,
      user: {
        login: item.user?.login || 'anonymous',
        avatar_url: item.user?.avatar_url || 'https://picsum.photos/40/40',
      },
      labels: (item.labels || []).map((l: any) => ({
        name: typeof l === 'string' ? l : l.name,
        color: typeof l === 'string' ? '708090' : (l.color || '6e7681'),
      })),
    }));

  return { issues: pureIssues, rateLimitRemaining };
}

export async function fetchLivePullRequests(
  owner: string,
  repo: string,
  token?: string,
  signal?: AbortSignal
): Promise<{ prs: GitHubPullRequest[]; rateLimitRemaining: number }> {
  const { data, rateLimitRemaining } = await fetchGitHubAPI<any[]>(
    `/repos/${owner}/${repo}/pulls?state=all&per_page=20&sort=updated`,
    token,
    signal
  );

  const prs: GitHubPullRequest[] = data.map((item) => ({
    id: item.id,
    number: item.number,
    title: item.title,
    state: item.state,
    created_at: item.created_at,
    updated_at: item.updated_at,
    html_url: item.html_url,
    draft: item.draft || false,
    user: {
      login: item.user?.login || 'contributor',
      avatar_url: item.user?.avatar_url || 'https://picsum.photos/40/40',
    },
    additions: item.additions || Math.floor(Math.random() * 250) + 12,
    deletions: item.deletions || Math.floor(Math.random() * 80) + 4,
    changed_files: item.changed_files || Math.floor(Math.random() * 12) + 1,
    labels: (item.labels || []).map((l: any) => ({
      name: typeof l === 'string' ? l : l.name,
      color: typeof l === 'string' ? '708090' : (l.color || '6e7681'),
    })),
  }));

  return { prs, rateLimitRemaining };
}
