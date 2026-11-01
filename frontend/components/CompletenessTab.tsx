import React, { useState } from 'react';
import { CompletenessItem } from '../types';
import {
  FileQuestion,
  Check,
  X,
  Copy,
  ExternalLink,
  Filter,
  CheckCheck,
} from 'lucide-react';

interface CompletenessTabProps {
  items: CompletenessItem[];
}

export const CompletenessTab: React.FC<CompletenessTabProps> = ({ items }) => {
  const [filterMode, setFilterMode] = useState<'all' | 'incomplete' | 'high'>('incomplete');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filteredItems = items.filter((item) => {
    if (filterMode === 'incomplete') return item.overallScore < 60;
    if (filterMode === 'high') return item.overallScore >= 60;
    return true;
  });

  const handleCopyPrompt = (issueNumber: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(issueNumber);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white text-base flex items-center gap-2">
            <FileQuestion className="w-4 h-4 text-emerald-400" />
            Issue Completeness Screening (Bug Detective)
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Automated 6-point audit evaluating reproduction steps, environment specs, error logs, and minimal repo links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded-lg border border-[#30363d] text-xs">
            <button
              onClick={() => setFilterMode('incomplete')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterMode === 'incomplete'
                  ? 'bg-red-950/80 text-red-300 border border-red-800'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Missing Info ({items.filter((i) => i.overallScore < 60).length})
            </button>
            <button
              onClick={() => setFilterMode('high')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterMode === 'high'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Complete ({items.filter((i) => i.overallScore >= 60).length})
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterMode === 'all'
                  ? 'bg-[#21262d] text-white border border-gray-600'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All ({items.length})
            </button>
          </div>
        </div>
      </div>

      {/* Issues Grid */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const isCopied = copiedId === item.issueNumber;

          return (
            <div
              key={item.issueNumber}
              className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-400">
                      #{item.issueNumber}
                    </span>
                    <span className="text-xs text-gray-400">
                      reported by @{item.author}
                    </span>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
                        item.overallScore >= 70
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                          : item.overallScore >= 40
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                          : 'bg-red-950/60 text-red-300 border border-red-800'
                      }`}
                    >
                      {item.overallScore}% Quality Score
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white mt-1">
                    {item.title}
                  </h4>
                </div>

                <a
                  href={`https://github.com/issues/${item.issueNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-gray-400 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* 6-Point Checklist Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${item.criteria.reproductionSteps ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300' : 'bg-red-950/20 border-red-900/40 text-red-400'}`}>
                  {item.criteria.reproductionSteps ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate">Repro Steps</span>
                </div>

                <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${item.criteria.environmentInfo ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300' : 'bg-red-950/20 border-red-900/40 text-red-400'}`}>
                  {item.criteria.environmentInfo ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate">Environment</span>
                </div>

                <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${item.criteria.errorLogsOrScreenshots ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300' : 'bg-red-950/20 border-red-900/40 text-red-400'}`}>
                  {item.criteria.errorLogsOrScreenshots ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate">Error Logs</span>
                </div>

                <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${item.criteria.expectedVsActual ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300' : 'bg-red-950/20 border-red-900/40 text-red-400'}`}>
                  {item.criteria.expectedVsActual ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate">Expected/Actual</span>
                </div>

                <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${item.criteria.minimalReproLink ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300' : 'bg-red-950/20 border-red-900/40 text-red-400'}`}>
                  {item.criteria.minimalReproLink ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate">Minimal Repro</span>
                </div>

                <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${item.criteria.versionSpecified ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300' : 'bg-red-950/20 border-red-900/40 text-red-400'}`}>
                  {item.criteria.versionSpecified ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate">Version Spec</span>
                </div>
              </div>

              {/* Missing Fields + Auto Draft */}
              {item.missingFields.length > 0 && (
                <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-400">
                      Missing Critical Criteria ({item.missingFields.length}):
                    </span>
                    <button
                      onClick={() => handleCopyPrompt(item.issueNumber, item.suggestedPrompt)}
                      className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono transition-colors"
                    >
                      {isCopied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied Prompt!' : 'Copy Reply Template'}</span>
                    </button>
                  </div>

                  <ul className="list-disc list-inside text-gray-400 space-y-0.5 pl-1">
                    {item.missingFields.map((f, idx) => (
                      <li key={idx}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
