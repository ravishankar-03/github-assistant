import React, { useState } from 'react';
import { KeyRound, X, ExternalLink, ShieldCheck, Trash2 } from 'lucide-react';

interface TokenSettingsModalProps {
  isOpen: boolean;
  currentToken: string;
  onSaveToken: (token: string) => void;
  onClose: () => void;
}

export const TokenSettingsModal: React.FC<TokenSettingsModalProps> = ({
  isOpen,
  currentToken,
  onSaveToken,
  onClose,
}) => {
  const [tokenInput, setTokenInput] = useState(currentToken);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveToken(tokenInput.trim());
    onClose();
  };

  const handleClear = () => {
    setTokenInput('');
    onSaveToken('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#161b22] border border-[#30363d] w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117]">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400" />
            GitHub Personal Access Token (PAT)
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          <p className="text-gray-300 leading-relaxed">
            By default, anonymous requests to GitHub’s REST API share a public IP quota of <strong>60 requests/hour</strong>. Supplying a Personal Access Token upgrades your quota to <strong>5,000 requests/hour</strong>.
          </p>

          <div className="space-y-1.5">
            <label className="block font-medium text-gray-200">
              Personal Access Token:
            </label>
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-gray-200 font-mono placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] text-gray-400 text-[11px] space-y-1">
            <p className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Stored locally in your browser
            </p>
            <p>
              Only standard read-only access (<code>public_repo</code>) is required. Tokens are never uploaded to any third-party servers.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <a
              href="https://github.com/settings/tokens/new?description=Maintainer%20Copilot%20Analyzer&scopes=public_repo"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1"
            >
              Generate token on GitHub <ExternalLink className="w-3 h-3" />
            </a>

            <div className="flex items-center gap-2">
              {currentToken && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-1.5 rounded-lg border border-red-800 bg-red-950/40 text-red-300 hover:bg-red-900/60 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
