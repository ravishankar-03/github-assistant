import React, { useState } from 'react';
import {
  Github,
  Search,
  Key,
  Flame,
  Check,
  AlertTriangle,
  Play,
  Layers,
} from 'lucide-react';

interface HeaderProps {
  currentRepoUrl: string;
  isStreaming: boolean;
  isDemoMode: boolean;
  hasCustomToken: boolean;
  onAnalyze: (url: string, demo: boolean) => void;
  onOpenTokenModal: () => void;
  onToggleDemoMode: (val: boolean) => void;
}

const PRESET_REPOS = [
  { label: 'expressjs/express', slug: 'expressjs/express' },
  { label: 'pallets/flask', slug: 'pallets/flask' },
  { label: 'facebook/react', slug: 'facebook/react' },
  { label: 'vuejs/core', slug: 'vuejs/core' },
];

export const Header: React.FC<HeaderProps> = ({
  currentRepoUrl,
  isStreaming,
  isDemoMode,
  hasCustomToken,
  onAnalyze,
  onOpenTokenModal,
  onToggleDemoMode,
}) => {
  const [inputUrl, setInputUrl] = useState(currentRepoUrl || 'expressjs/express');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onAnalyze(inputUrl.trim(), isDemoMode);
    }
  };

  const handleSelectPreset = (slug: string) => {
    setInputUrl(slug);
    onAnalyze(slug, isDemoMode);
  };

  return (
    <header className="bg-[#161b22] border-b border-[#30363d] sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <Github className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-white text-base tracking-tight">
                  Github Assistant
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 font-semibold">
                  LIVE SSE
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Real-Time Issue Segregation & Duplicate Screening
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 max-w-xl w-full flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Enter GitHub owner/repo or URL (e.g. expressjs/express)..."
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isStreaming}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 text-white text-xs font-semibold rounded-lg shadow-md transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Analyze
            </button>
          </form>

          {/* Controls: Token & Demo Mode */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenTokenModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                hasCustomToken
                  ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
                  : 'bg-[#21262d] border-[#30363d] text-gray-300 hover:text-white'
              }`}
              title="Configure Personal Access Token"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>{hasCustomToken ? 'PAT Active' : 'Set Token'}</span>
            </button>

            <label className="flex items-center gap-1.5 text-xs text-gray-300 bg-[#21262d] px-2.5 py-1.5 rounded-lg border border-[#30363d] cursor-pointer hover:bg-[#30363d] transition-colors select-none">
              <input
                type="checkbox"
                checked={isDemoMode}
                onChange={(e) => onToggleDemoMode(e.target.checked)}
                className="w-3.5 h-3.5 accent-emerald-500 rounded"
              />
              <span className="font-medium text-gray-200">Demo Mode</span>
            </label>
          </div>
        </div>

        {/* Presets Row */}
        <div className="mt-2.5 pt-2 border-t border-[#30363d]/60 flex items-center gap-2 overflow-x-auto text-[11px] text-gray-400">
          <span className="shrink-0 text-gray-500 flex items-center gap-1 font-mono">
            <Layers className="w-3 h-3" /> Quick Presets:
          </span>
          <div className="flex items-center gap-1.5">
            {PRESET_REPOS.map((preset) => (
              <button
                key={preset.slug}
                onClick={() => handleSelectPreset(preset.slug)}
                className={`px-2.5 py-0.5 rounded border transition-colors font-mono ${
                  inputUrl === preset.slug
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : 'bg-[#0d1117] border-[#30363d] text-gray-400 hover:text-gray-200 hover:border-gray-500'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
