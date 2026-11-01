import React, { useState } from 'react';
import { DuplicateCluster, GitHubIssue } from '../types';
import {
  Copy,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Link2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface DuplicateDetectorTabProps {
  clusters: DuplicateCluster[];
  issues: GitHubIssue[];
}

export const DuplicateDetectorTab: React.FC<DuplicateDetectorTabProps> = ({
  clusters,
  issues,
}) => {
  const [resolvedClusters, setResolvedClusters] = useState<Record<string, boolean>>({});
  const [expandedCluster, setExpandedCluster] = useState<string | null>(clusters[0]?.id || null);

  const toggleResolved = (clusterId: string) => {
    setResolvedClusters((prev) => ({
      ...prev,
      [clusterId]: !prev[clusterId],
    }));
  };

  if (clusters.length === 0) {
    return (
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 mx-auto flex items-center justify-center mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">No Duplicate Clusters Detected</h3>
        <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
          Gemini 2.5 Flash analyzed the ingested repository issues and verified that recent bug reports exhibit distinct, orthogonal failure symptoms.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-amber-950/30 via-[#161b22] to-amber-950/20 border border-amber-900/50 rounded-xl p-5 flex items-start gap-4">
        <div className="p-2.5 rounded-lg bg-amber-900/40 text-amber-300 border border-amber-700/60 shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <h3 className="font-semibold text-amber-200 text-sm">
            AI Semantic Duplicate Clustering
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Identified {clusters.length} duplicate cluster(s) across recent repository issues. Instead of basic keyword matching, Gemini compares the root cause call-stacks and behavioral signatures to consolidate issues into a single canonical source.
          </p>
        </div>
      </div>

      {/* Cluster List */}
      <div className="space-y-4">
        {clusters.map((cluster) => {
          const isResolved = !!resolvedClusters[cluster.id];
          const isExpanded = expandedCluster === cluster.id;

          return (
            <div
              key={cluster.id}
              className={`bg-[#161b22] border rounded-xl overflow-hidden transition-all ${
                isResolved
                  ? 'border-emerald-800/60 bg-emerald-950/10 opacity-75'
                  : 'border-[#30363d] shadow-sm'
              }`}
            >
              {/* Cluster Header */}
              <div
                onClick={() => setExpandedCluster(isExpanded ? null : cluster.id)}
                className="p-5 cursor-pointer hover:bg-[#1f242c] transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-400 shrink-0 mt-0.5">
                    <Copy className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        Canonical #{cluster.canonicalIssueNumber}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#21262d] text-gray-300 border border-[#30363d]">
                        {cluster.duplicateIssues.length} Duplicate(s)
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800">
                        {cluster.similarityScore}% Match Confidence
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-white mt-1 truncate">
                      {cluster.canonicalTitle}
                    </h4>

                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                      <strong className="text-gray-300">Symptom Overlap:</strong> {cluster.symptomOverlap}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleResolved(cluster.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                      isResolved
                        ? 'bg-emerald-900/60 border-emerald-700 text-emerald-300'
                        : 'bg-[#21262d] border-[#30363d] text-gray-300 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isResolved ? 'Triaged' : 'Mark Triaged'}</span>
                  </button>

                  <div className="text-gray-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Collapsible Cluster Details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-[#30363d] bg-[#0d1117]/60 space-y-4">
                  {/* AI Rationale */}
                  <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#30363d] text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gemini Root-Cause Diagnosis</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed font-sans">
                      {cluster.aiRationale}
                    </p>
                  </div>

                  {/* Duplicate Issues List */}
                  <div>
                    <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                      Identified Duplicate Issues To Link & Close
                    </h5>
                    <div className="space-y-2">
                      {cluster.duplicateIssues.map((dup) => (
                        <div
                          key={dup.number}
                          className="p-3 rounded-lg bg-[#161b22] border border-[#30363d] flex items-center justify-between gap-4"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-red-400">
                                #{dup.number}
                              </span>
                              <span className="text-xs text-white font-medium truncate">
                                {dup.title}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1 line-clamp-1 italic">
                              "{dup.snippet}"
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs font-mono text-emerald-400 font-medium">
                              {dup.matchScore}% overlap
                            </span>
                            <a
                              href={`https://github.com/issues/${dup.number}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-gray-300 hover:text-white transition-colors"
                              title="View on GitHub"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Maintainer Action */}
                  <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/60 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-300">
                      <Link2 className="w-4 h-4 text-blue-400" />
                      <span>Suggested reply: "Duplicate of #{cluster.canonicalIssueNumber}. Closing in favor of the canonical discussion."</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`Duplicate of #${cluster.canonicalIssueNumber}. Consolidating discussion to the main tracking issue.`);
                        alert('Copied maintainer response to clipboard!');
                      }}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-medium transition-colors"
                    >
                      Copy Response
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
