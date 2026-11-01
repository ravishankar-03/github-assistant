import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LiveProgressModal } from './components/LiveProgressModal';
import { OverviewTab } from './components/OverviewTab';
import { DuplicateDetectorTab } from './components/DuplicateDetectorTab';
import { CompletenessTab } from './components/CompletenessTab';
import { PrPipelineTab } from './components/PrPipelineTab';
import { CopilotChatTab } from './components/CopilotChatTab';
import { TokenSettingsModal } from './components/TokenSettingsModal';
import { useStreamAnalysis } from './hooks/useStreamAnalysis';
import { RepositoryAnalysisSummary } from './types';
import { DEMO_PRESETS } from './services/demoFixtures';
import {
  LayoutDashboard,
  Copy,
  FileQuestion,
  GitPullRequest,
  Sparkles,
  Info,
} from 'lucide-react';

export default function App() {
  const [githubToken, setGithubToken] = useState<string>(() => {
    return localStorage.getItem('maintainer_github_token') || '';
  });
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'duplicates' | 'completeness' | 'prs' | 'copilot'>('overview');
  const [lastRepoUrl, setLastRepoUrl] = useState<string>('expressjs/express');

  // Active analyzed data
  const [analysisData, setAnalysisData] = useState<RepositoryAnalysisSummary>(() => {
    return DEMO_PRESETS['expressjs/express'];
  });

  const {
    isStreaming,
    progress,
    stages,
    logs,
    error,
    elapsedSeconds,
    startAnalysis,
    cancelStream,
  } = useStreamAnalysis((completedData) => {
    setAnalysisData(completedData);
  });

  const handleSaveToken = (token: string) => {
    setGithubToken(token);
    localStorage.setItem('maintainer_github_token', token);
  };

  const handleTriggerAnalysis = (repoUrl: string, demo = false) => {
    setLastRepoUrl(repoUrl);
    startAnalysis(repoUrl, githubToken, demo);
  };

  return (
    <div className="min-h-screen bg-[#090d13] text-gray-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentRepoUrl={lastRepoUrl}
        isStreaming={isStreaming}
        isDemoMode={isDemoMode}
        hasCustomToken={Boolean(githubToken)}
        onAnalyze={(url, demo) => handleTriggerAnalysis(url, demo)}
        onOpenTokenModal={() => setIsTokenModalOpen(true)}
        onToggleDemoMode={(val) => setIsDemoMode(val)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="border-b border-[#30363d] flex items-center justify-between gap-4 overflow-x-auto pb-1">
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#21262d] text-white border border-[#30363d]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#161b22]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('duplicates')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'duplicates'
                  ? 'bg-[#21262d] text-white border border-[#30363d]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#161b22]'
              }`}
            >
              <Copy className="w-4 h-4 text-amber-400" />
              <span>Semantic Duplicates</span>
              {analysisData?.duplicateClusters?.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                  {analysisData.duplicateClusters.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('completeness')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'completeness'
                  ? 'bg-[#21262d] text-white border border-[#30363d]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#161b22]'
              }`}
            >
              <FileQuestion className="w-4 h-4 text-red-400" />
              <span>Bug Detective (Audit)</span>
            </button>

            <button
              onClick={() => setActiveTab('prs')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'prs'
                  ? 'bg-[#21262d] text-white border border-[#30363d]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#161b22]'
              }`}
            >
              <GitPullRequest className="w-4 h-4 text-purple-400" />
              <span>PR Pipeline</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                {analysisData.pullRequests.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('copilot')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'copilot'
                  ? 'bg-gradient-to-r from-emerald-950 to-teal-950 text-emerald-300 border border-emerald-700'
                  : 'text-emerald-400 hover:bg-[#161b22]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Gemini Triage Copilot</span>
            </button>
          </nav>

          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 font-mono">
            <span>Last Analyzed:</span>
            <span className="text-gray-300">
              {new Date(analysisData.analyzedAt).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'overview' && (
          <OverviewTab
            data={analysisData}
            onNavigateTab={(tabId) => setActiveTab(tabId as any)}
          />
        )}

        {activeTab === 'duplicates' && (
          <DuplicateDetectorTab
            clusters={analysisData.duplicateClusters}
            issues={analysisData.issues}
          />
        )}

        {activeTab === 'completeness' && (
          <CompletenessTab items={analysisData.completenessResults} />
        )}

        {activeTab === 'prs' && (
          <PrPipelineTab prs={analysisData.pullRequests} />
        )}

        {activeTab === 'copilot' && (
          <CopilotChatTab data={analysisData} />
        )}
      </main>

      {/* SSE Real-Time Progress Modal */}
      <LiveProgressModal
        isOpen={isStreaming || !!error}
        progress={progress}
        stages={stages}
        logs={logs}
        error={error}
        elapsedSeconds={elapsedSeconds}
        onCancel={cancelStream}
        onOpenTokenSettings={() => setIsTokenModalOpen(true)}
        onSwitchToDemo={() => {
          setIsDemoMode(true);
          handleTriggerAnalysis(lastRepoUrl, true);
        }}
        onRetry={() => handleTriggerAnalysis(lastRepoUrl, isDemoMode)}
      />

      {/* Settings Modal */}
      <TokenSettingsModal
        isOpen={isTokenModalOpen}
        currentToken={githubToken}
        onSaveToken={handleSaveToken}
        onClose={() => setIsTokenModalOpen(false)}
      />
    </div>
  );
}
