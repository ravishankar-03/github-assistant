import React, { useEffect, useRef } from 'react';
import {
  StageEventPayload,
  LogEventPayload,
  ErrorEventPayload,
} from '../types';
import {
  CheckCircle2,
  CircleDashed,
  AlertCircle,
  Clock,
  Terminal,
  X,
  KeyRound,
  Play,
  RotateCcw,
} from 'lucide-react';

interface LiveProgressModalProps {
  isOpen: boolean;
  progress: number;
  stages: StageEventPayload[];
  logs: LogEventPayload[];
  error: ErrorEventPayload | null;
  elapsedSeconds: number;
  onCancel: () => void;
  onOpenTokenSettings: () => void;
  onSwitchToDemo: () => void;
  onRetry: () => void;
}

export const LiveProgressModal: React.FC<LiveProgressModalProps> = ({
  isOpen,
  progress,
  stages,
  logs,
  error,
  elapsedSeconds,
  onCancel,
  onOpenTokenSettings,
  onSwitchToDemo,
  onRetry,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#161b22] border border-[#30363d] w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117]">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${error ? 'bg-red-400' : 'bg-emerald-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${error ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                Live Repository SSE Stream
                <span className="text-xs px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/50 font-mono">
                  text/event-stream
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Streaming live GitHub REST endpoints & Gemini AI reasoning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-300 font-mono bg-[#21262d] px-3 py-1.5 rounded-md border border-[#30363d]">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{elapsedSeconds}s elapsed</span>
            </div>

            <button
              onClick={onCancel}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#21262d] transition-colors"
              title="Close or abort"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#21262d] h-2">
          <div
            className={`h-full transition-all duration-300 ease-out ${
              error ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Main Content Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto">
          {/* Step Tracker (Left Column) */}
          <div className="md:col-span-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase font-mono">
                Pipeline Stages
              </span>
              <span className="text-xs font-mono font-medium text-emerald-400">
                {progress}% Complete
              </span>
            </div>

            <div className="space-y-2.5">
              {stages.map((stage, idx) => {
                const isCompleted = stage.status === 'completed';
                const isInProgress = stage.status === 'in_progress';
                const isFailed = stage.status === 'failed';

                return (
                  <div
                    key={stage.stage}
                    className={`p-3 rounded-lg border transition-all ${
                      isInProgress
                        ? 'bg-[#1f242c] border-emerald-500/50 shadow-md shadow-emerald-950/30'
                        : isCompleted
                        ? 'bg-[#0d1117]/80 border-[#30363d]'
                        : isFailed
                        ? 'bg-red-950/20 border-red-800/50'
                        : 'bg-[#0d1117]/40 border-[#21262d] opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {isCompleted && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                        {isInProgress && (
                          <CircleDashed className="w-4 h-4 text-emerald-400 animate-spin" />
                        )}
                        {isFailed && (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        )}
                        {stage.status === 'pending' && (
                          <div className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center text-[10px] text-gray-500">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium text-gray-200 truncate">
                            {stage.title}
                          </p>
                          {isInProgress && (
                            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded font-mono">
                              RUNNING
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                          {stage.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Terminal / Live Diagnostic Logs (Right Column) */}
          <div className="md:col-span-7 flex flex-col">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase font-mono flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                Live Diagnostic Terminal
              </span>
              <span className="text-[11px] text-gray-500 font-mono">
                {logs.length} events received
              </span>
            </div>

            <div
              ref={terminalRef}
              className="bg-[#090d13] border border-[#30363d] rounded-lg p-3 font-mono text-xs text-gray-300 h-72 md:h-80 overflow-y-auto space-y-1.5 shadow-inner"
            >
              {logs.length === 0 ? (
                <div className="text-gray-500 italic py-4 text-center">
                  Awaiting stream connection...
                </div>
              ) : (
                logs.map((log) => {
                  let badge = 'text-blue-400';
                  let prefix = 'ℹ';
                  if (log.level === 'warn') {
                    badge = 'text-amber-400';
                    prefix = '⚠';
                  } else if (log.level === 'error') {
                    badge = 'text-red-400';
                    prefix = '✖';
                  } else if (log.level === 'success') {
                    badge = 'text-emerald-400';
                    prefix = '✔';
                  }

                  return (
                    <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-gray-500 text-[10px] shrink-0 select-none">
                        [{log.timestamp}]
                      </span>
                      <span className={`${badge} shrink-0 font-bold select-none`}>
                        {prefix}
                      </span>
                      <span className="break-words text-gray-200">
                        {log.message}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Actionable Error Recovery Banner */}
            {error && (
              <div className="mt-4 p-4 rounded-lg bg-red-950/40 border border-red-800/80 text-red-200 flex flex-col gap-3 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-red-300">
                      Analysis Halted: {error.code}
                    </p>
                    <p className="text-red-200/90 leading-relaxed">
                      {error.message}
                    </p>
                    <p className="text-gray-400 text-[11px] pt-1">
                      💡 <strong>Recommended Action:</strong> {error.resolution}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-red-900/50 justify-end">
                  <button
                    onClick={onOpenTokenSettings}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-gray-200 text-xs font-medium border border-gray-600 transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    Add GitHub Token
                  </button>

                  <button
                    onClick={onSwitchToDemo}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Switch to Demo Mode
                  </button>

                  <button
                    onClick={onRetry}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-700 hover:bg-blue-600 text-white text-xs font-medium transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Retry
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-[#0d1117] border-t border-[#30363d] flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SSE Client active on browser thread</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-1.5 rounded-lg border border-[#30363d] bg-[#21262d] text-gray-300 hover:text-white hover:bg-[#30363d] transition-colors"
            >
              Abort Stream
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
