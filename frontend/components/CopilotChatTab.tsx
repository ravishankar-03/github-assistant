import React, { useState } from 'react';
import { RepositoryAnalysisSummary } from '../types';
import { askCopilotTriage } from '../services/aiAnalysis';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Lightbulb,
  FileText,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface CopilotChatTabProps {
  data: RepositoryAnalysisSummary;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export const CopilotChatTab: React.FC<CopilotChatTabProps> = ({ data }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `Hello Maintainer! I've ingested **${data.repository.fullName}** along with **${data.issues.length} issues** and **${data.pullRequests.length} pull requests**.\n\nI can help you:\n- **Draft friendly canned triage responses** for incomplete bug reports\n- **Synthesize top community complaints** and recurring root causes\n- **Prioritize your next maintenance sprint** to prevent burnout\n- **Compose release notes** highlighting recent community fixes`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const repoContextString = `
Repository: ${data.repository.fullName}
Stars: ${data.repository.stars} | Open Issues: ${data.repository.openIssuesCount}
Duplicate Clusters: ${data.duplicateClusters.length}
Low Quality Issues Count: ${data.completenessResults.filter((c) => c.overallScore < 50).length}
Sample Issues:
${data.issues.slice(0, 8).map((i) => `#${i.number}: ${i.title} (${i.comments} comments)`).join('\n')}
`;

  const handleSend = async (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const historyForAi = messages.slice(-6).map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));

    const response = await askCopilotTriage(textToSend, repoContextString, historyForAi);

    setMessages((prev) => [
      ...prev,
      {
        id: `ai-${Date.now()}`,
        role: 'model',
        content: response,
      },
    ]);
    setIsLoading(false);
  };

  const handlePresetPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col h-[700px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#30363d] bg-[#0d1117] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-xs flex items-center gap-2">
              Gemini Maintainer Copilot
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/50">
                gemini-2.5-flash
              </span>
            </h3>
            <p className="text-[11px] text-gray-400">
              Grounded in live issues & PR data from {data.repository.fullName}
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'welcome-reset',
                role: 'model',
                content: `Chat session refreshed. What would you like to review about ${data.repository.fullName}?`,
              },
            ])
          }
          className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#21262d] transition-colors"
          title="Reset chat"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-2.5 bg-[#0d1117]/60 border-b border-[#30363d] flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-gray-500 font-mono shrink-0 flex items-center gap-1">
          <Lightbulb className="w-3 h-3 text-amber-400" /> Prompts:
        </span>
        <button
          onClick={() => handlePresetPrompt('Summarize the top 3 architectural pain points reported in current open issues.')}
          className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-gray-300 border border-[#30363d] shrink-0 transition-colors"
        >
          Top Pain Points
        </button>
        <button
          onClick={() => handlePresetPrompt('Draft a standard maintainer response for issue reporters who forgot reproduction steps.')}
          className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-gray-300 border border-[#30363d] shrink-0 transition-colors"
        >
          Draft Repro Request
        </button>
        <button
          onClick={() => handlePresetPrompt('Create a release note changelog draft summarizing recent pull requests and fixed bugs.')}
          className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-gray-300 border border-[#30363d] shrink-0 transition-colors"
        >
          Draft Release Notes
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'model' && (
              <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`p-3.5 rounded-xl max-w-2xl text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-[#0d1117] border border-[#30363d] text-gray-200 rounded-tl-none whitespace-pre-wrap'
              }`}
            >
              {msg.content}
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-gray-700 text-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-gray-400 italic py-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>Maintainer Copilot is reasoning over repository issues...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-[#0d1117] border-t border-[#30363d] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Maintainer Copilot anything about these issues or PRs..."
          className="flex-1 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-sans"
        />

        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
