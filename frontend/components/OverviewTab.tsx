import React from 'react';
import { RepositoryAnalysisSummary } from '../types';
import {
  Star,
  GitFork,
  AlertCircle,
  ShieldCheck,
  Flame,
  CheckCircle,
  Copy,
  FileQuestion,
  TrendingDown,
  Activity,
  HeartHandshake,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface OverviewTabProps {
  data: RepositoryAnalysisSummary;
  onNavigateTab: (tabId: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  data,
  onNavigateTab,
}) => {
  const { repository, issues, pullRequests, duplicateClusters, completenessResults, healthMetrics } = data;

  const incompleteCount = completenessResults.filter((c) => c.overallScore < 50).length;
  const duplicateCount = duplicateClusters.reduce(
    (acc, c) => acc + c.duplicateIssues.length,
    0
  );

  const pieData = [
    { name: 'Triaged / Complete', value: Math.max(1, issues.length - incompleteCount - duplicateCount), color: '#22c55e' },
    { name: 'Semantic Duplicates', value: duplicateCount, color: '#f59e0b' },
    { name: 'Missing Repro Info', value: incompleteCount, color: '#ef4444' },
  ];

  const tagChartData = healthMetrics.topTags.map((t) => ({
    name: t.name.length > 12 ? `${t.name.slice(0, 10)}...` : t.name,
    count: t.count,
  }));

  return (
    <div className="space-y-6">
      {/* Top Meta Header */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {repository.fullName}
              </h2>
              {data.isDemo && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800">
                  DEMO FIXTURE
                </span>
              )}
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">
                License: {repository.license}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl">
              {repository.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={repository.html_url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs font-medium text-gray-200 transition-colors flex items-center gap-1.5"
            >
              Open on GitHub ↗
            </a>
          </div>
        </div>

        {/* Quick Numbers Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[#30363d]/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-400">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-400">GitHub Stars</p>
              <p className="text-lg font-bold text-white font-mono">
                {repository.stars.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/50 text-blue-400">
              <GitFork className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Forks Count</p>
              <p className="text-lg font-bold text-white font-mono">
                {repository.forks.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-400">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Live Issues Ingested</p>
              <p className="text-lg font-bold text-white font-mono">
                {issues.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-800/50 text-purple-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Active Pull Requests</p>
              <p className="text-lg font-bold text-white font-mono">
                {pullRequests.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Scorecard & Burnout Risk */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Triage Health Card */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
                Triage Health Index
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white font-mono">
                {healthMetrics.triageHealthScore}
              </span>
              <span className="text-gray-400 text-xs">/ 100</span>
            </div>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Calculated from duplicate ratio, incomplete reports, and unattended stale threads.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#30363d] flex items-center justify-between text-xs">
            <span className="text-gray-400">Stale issues (&gt;0 comments):</span>
            <span className="font-mono text-amber-400 font-semibold">{healthMetrics.staleIssueCount}</span>
          </div>
        </div>

        {/* Burnout Risk Card */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
                Maintainer Burnout Risk
              </span>
              <Flame
                className={`w-4 h-4 ${
                  healthMetrics.burnoutRisk === 'Low'
                    ? 'text-emerald-400'
                    : healthMetrics.burnoutRisk === 'Moderate'
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span
                className={`text-2xl font-bold px-3 py-1 rounded-md font-mono ${
                  healthMetrics.burnoutRisk === 'Low'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                    : healthMetrics.burnoutRisk === 'Moderate'
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                    : 'bg-red-950/60 text-red-300 border border-red-800'
                }`}
              >
                {healthMetrics.burnoutRisk} Risk
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Based on incoming volume vs. unresolved duplicates burdening maintainers.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#30363d] flex items-center justify-between text-xs">
            <span className="text-gray-400">Triage efficiency estimate:</span>
            <span className="font-mono text-emerald-400 font-semibold">
              {Math.max(10, 100 - healthMetrics.incompleteRatioPct)}%
            </span>
          </div>
        </div>

        {/* Actionable Triage Shortcuts */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
                Urgent Action Queue
              </span>
              <HeartHandshake className="w-4 h-4 text-blue-400" />
            </div>

            <div className="mt-3 space-y-2">
              <button
                onClick={() => onNavigateTab('duplicates')}
                className="w-full text-left p-2.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2 text-xs">
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-gray-200">Merge Duplicates</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {duplicateClusters.length} clusters
                </span>
              </button>

              <button
                onClick={() => onNavigateTab('completeness')}
                className="w-full text-left p-2.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2 text-xs">
                  <FileQuestion className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-gray-200">Request Repro Steps</span>
                </div>
                <span className="text-xs font-mono font-bold text-red-400">
                  {incompleteCount} issues
                </span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-gray-500 mt-2">
            Clicking a queue switches to the dedicated AI copilot screen.
          </p>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Issue Quality Breakdown */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-4">
            Issue Quality & Triage State
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161b22',
                    borderColor: '#30363d',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-300 font-mono text-[11px]">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Label Distribution */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-4">
            Top Active Labels Frequency
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tagChartData}>
                <XAxis dataKey="name" stroke="#6e7681" fontSize={11} />
                <YAxis stroke="#6e7681" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161b22',
                    borderColor: '#30363d',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-gray-500 text-center mt-2">
            Identifies common bug clusters and feature pressure areas.
          </p>
        </div>
      </div>
    </div>
  );
};
