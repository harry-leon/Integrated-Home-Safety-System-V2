import React, { useEffect, useId, useRef, useState } from 'react';

const ReAuthModal = ({
  isOpen,
  title = 'Confirm action',
  description = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isSubmitting = false,
  error = '',
  onConfirm,
  onClose,
}) => {
  const [password, setPassword] = useState('');
  const inputRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    const handleEscape = (event) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    onConfirm(password);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        disabled={isSubmitting}
        aria-label="Close confirmation dialog"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="relative z-10 w-full max-w-md rounded-[2rem] border border-outline-variant/20 bg-surface p-8 shadow-2xl"
      >
        <div className="mb-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[22px]">shield_lock</span>
          </div>
          <h2 id={titleId} className="text-2xl font-bold tracking-tight text-on-surface">
            {title}
          </h2>
          {description ? (
            <p id={descriptionId} className="mt-2 text-sm leading-6 text-outline">
              {description}
            </p>
          ) : null}
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="reauth-password"
              className="block text-[11px] font-bold uppercase tracking-[0.18em] text-outline"
            >
              Current password
            </label>
            <input
              ref={inputRef}
              id="reauth-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-outline-variant/20 bg-surface-container px-4 py-3 text-sm text-on-surface outline-none transition focus-visible:ring-2 focus-visible:ring-primary/40"
              autoComplete="current-password"
              disabled={isSubmitting}
              required
            />
          </div>

          {error ? (
            <div
              className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border border-outline-variant/20 bg-surface-container px-4 py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancelLabel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Verifying...' : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReAuthModal;
