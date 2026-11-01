import React from 'react';
import { GitHubPullRequest } from '../types';
import { GitPullRequest, GitCommit, User, ExternalLink, ShieldAlert } from 'lucide-react';

interface PrPipelineTabProps {
  prs: GitHubPullRequest[];
}

export const PrPipelineTab: React.FC<PrPipelineTabProps> = ({ prs }) => {
  if (prs.length === 0) {
    return (
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-12 text-center text-gray-400 text-xs">
        No active or recent pull requests found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white text-base flex items-center gap-2">
            <GitPullRequest className="w-4 h-4 text-purple-400" />
            Pull Request Pipeline & Triage Velocity
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Analyzing {prs.length} pull requests with line change volume, risk surface, and contributor velocity.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {prs.map((pr) => {
          const totalChanges = (pr.additions || 0) + (pr.deletions || 0);
          const isLarge = totalChanges > 300;

          return (
            <div
              key={pr.id}
              className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-purple-950/60 border border-purple-800 text-purple-400 shrink-0 mt-0.5">
                  <GitPullRequest className="w-4 h-4" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-purple-400">
                      #{pr.number}
                    </span>
                    <span className="text-xs font-medium text-white truncate">
                      {pr.title}
                    </span>
                    {pr.draft && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                        Draft
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> @{pr.user?.login}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400">+{pr.additions}</span>
                    <span className="text-red-400">-{pr.deletions}</span>
                    <span>in {pr.changed_files} file(s)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                {isLarge && (
                  <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800">
                    <ShieldAlert className="w-3 h-3" /> High Review Burden
                  </span>
                )}
                <a
                  href={pr.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-gray-300 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
