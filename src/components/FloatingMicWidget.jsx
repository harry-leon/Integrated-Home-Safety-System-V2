import React, { useState } from 'react';
import { useVoiceCommand } from '../contexts/VoiceCommandContext';
import { useLang } from '../contexts/LangContext';

const statusTone = {
  idle: 'border-primary/20 bg-surface-container text-primary shadow-[0_18px_40px_rgba(15,98,254,0.18)]',
  listening: 'border-emerald-400/40 bg-emerald-500 text-white shadow-[0_18px_50px_rgba(16,185,129,0.34)]',
  processing: 'border-primary/20 bg-primary text-white shadow-[0_18px_50px_rgba(15,98,254,0.28)]',
  error: 'border-error/20 bg-error text-white shadow-[0_18px_50px_rgba(220,38,38,0.28)]',
};

const FloatingMicWidget = () => {
  const { t } = useLang();
  const {
    isSupported,
    isListening,
    isExecuting,
    transcript,
    parsedCommand,
    feedback,
    error,
    commandHistory,
    showHelp,
    helpItems,
    toggleListening,
    runSampleCommand,
  } = useVoiceCommand();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isSupported) {
    return null;
  }

  const state = error ? 'error' : isExecuting ? 'processing' : isListening ? 'listening' : 'idle';
  const icon = isExecuting ? 'progress_activity' : isListening ? 'graphic_eq' : error ? 'priority_high' : 'mic';

  return (
    <div className="fixed bottom-24 right-4 z-[70] flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {isExpanded ? (
        <div className="w-[min(calc(100vw-2rem),24rem)] overflow-hidden rounded-[1.5rem] border border-outline-variant/15 bg-surface/95 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4 border-b border-outline-variant/12 px-5 py-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-outline">
                {t('voice_control')}
              </p>
              <h3 className="mt-1 text-lg font-black tracking-tight text-on-surface">
                {isListening ? t('voice_listening') : isExecuting ? t('voice_processing') : t('voice_ready')}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-outline transition-colors hover:bg-surface-container-high hover:text-on-surface"
              aria-label={t('voice_close')}
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="space-y-4 px-5 py-4">
            <div className="rounded-2xl bg-surface-container px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">
                {t('voice_transcript')}
              </p>
              <p className="mt-2 min-h-10 text-sm font-semibold leading-6 text-on-surface">
                {transcript || (isListening ? t('voice_speak_now') : t('voice_no_transcript'))}
              </p>
              <p className={`mt-2 text-xs leading-5 ${error ? 'text-error' : 'text-outline'}`} role={error ? 'alert' : 'status'}>
                {error || feedback}
              </p>
            </div>

            {parsedCommand ? (
              <div className="rounded-2xl border border-primary/12 bg-primary/6 px-4 py-3">
                <p className="text-xs font-bold text-primary">{parsedCommand.label}</p>
                <p className="mt-1 text-xs leading-5 text-outline">{parsedCommand.detail}</p>
              </div>
            ) : null}

            {showHelp ? (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">{t('voice_examples')}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {helpItems.slice(0, 8).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => runSampleCommand(item)}
                      className="rounded-xl border border-outline-variant/12 bg-surface-container px-3 py-2 text-left text-xs font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {commandHistory.length > 0 ? (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">{t('voice_history')}</p>
                <div className="mt-2 max-h-36 space-y-2 overflow-y-auto pr-1">
                  {commandHistory.slice(0, 4).map((entry) => (
                    <div key={entry.id} className="rounded-xl bg-surface-container px-3 py-2">
                      <p className="truncate text-xs font-semibold text-on-surface">{entry.command || entry.transcript}</p>
                      <p className={`mt-0.5 text-[11px] ${entry.status === 'error' ? 'text-error' : 'text-outline'}`}>
                        {entry.status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="hidden h-12 items-center gap-2 rounded-2xl border border-outline-variant/12 bg-surface/95 px-4 text-sm font-semibold text-on-surface shadow-lg backdrop-blur transition-colors hover:border-primary/30 hover:text-primary sm:inline-flex"
          title={t('voice_shortcut')}
        >
          <span className="material-symbols-outlined text-[19px]">tune</span>
          {t('voice_panel')}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsExpanded(true);
            toggleListening();
          }}
          className={`relative flex h-14 w-14 items-center justify-center rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 ${statusTone[state]}`}
          aria-label={isListening ? t('voice_stop') : t('voice_start')}
          title={t('voice_shortcut')}
        >
          {isListening ? (
            <span className="absolute inset-0 rounded-full border border-emerald-300/50 animate-ping" aria-hidden="true" />
          ) : null}
          <span className={`material-symbols-outlined text-[25px] ${isExecuting ? 'animate-spin' : ''}`}>
            {icon}
          </span>
        </button>
      </div>
    </div>
  );
};

export default FloatingMicWidget;
