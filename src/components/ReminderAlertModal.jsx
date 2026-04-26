import React, { useEffect, useId, useRef } from 'react';

/**
 * ReminderAlertModal — A reusable warning/alert dialog component.
 *
 * Props:
 *  isOpen          {boolean}  — controls visibility
 *  onConfirm       {function} — callback when user clicks the confirm button
 *  onClose         {function} — callback when user dismisses the modal
 *  title           {string}   — modal heading
 *  message         {string}   — descriptive body text
 *  confirmText     {string}   — label for the primary action button
 *  cancelText      {string}   — label for the secondary/close button
 *  showCancelButton{boolean}  — whether to render the cancel button
 *  type            {'warning'|'error'|'info'|'success'} — visual variant
 */

const TYPE_CONFIG = {
  warning: {
    icon: 'warning',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    iconColor: 'text-amber-500',
    badge: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
    badgeLabel: 'Cảnh báo',
    confirmBtn:
      'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30',
    ring: 'focus-visible:ring-amber-400/40',
  },
  error: {
    icon: 'error',
    iconBg: 'bg-error/10 border-error/20',
    iconColor: 'text-error',
    badge: 'bg-error/10 text-error border border-error/20',
    badgeLabel: 'Lỗi',
    confirmBtn: 'bg-error hover:opacity-90 text-on-error shadow-error/30',
    ring: 'focus-visible:ring-error/40',
  },
  info: {
    icon: 'info',
    iconBg: 'bg-primary/10 border-primary/20',
    iconColor: 'text-primary',
    badge: 'bg-primary/10 text-primary border border-primary/20',
    badgeLabel: 'Thông tin',
    confirmBtn:
      'bg-primary hover:opacity-90 text-on-primary shadow-primary/30',
    ring: 'focus-visible:ring-primary/40',
  },
  success: {
    icon: 'check_circle',
    iconBg: 'bg-tertiary/10 border-tertiary/20',
    iconColor: 'text-tertiary',
    badge: 'bg-tertiary/10 text-tertiary border border-tertiary/20',
    badgeLabel: 'Thành công',
    confirmBtn:
      'bg-tertiary hover:opacity-90 text-on-tertiary shadow-tertiary/30',
    ring: 'focus-visible:ring-tertiary/40',
  },
};

const ReminderAlertModal = ({
  isOpen = false,
  onConfirm,
  onClose,
  title = 'Cảnh Báo',
  message = 'Có một hành động quan trọng cần bạn chú ý. Vui lòng kiểm tra và xác nhận để đảm bảo hệ thống hoạt động ổn định.',
  confirmText = 'Kiểm tra ngay',
  cancelText = 'Đóng',
  showCancelButton = true,
  type = 'warning',
  preventClose = false,
}) => {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef(null);

  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.warning;

  /* ── Side effects ──────────────────────────────────────────────── */
  useEffect(() => {
    if (!isOpen) return undefined;

    // Lock body and html scroll
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Focus the dialog panel
    const t = window.setTimeout(() => dialogRef.current?.focus(), 0);

    // ESC key handler
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (preventClose) return;
        e.stopPropagation();
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [isOpen, onClose, preventClose]);

  if (!isOpen) return null;

  /* ── Handlers ──────────────────────────────────────────────────── */
  const handleConfirm = () => onConfirm?.();
  const handleClose = () => onClose?.();

  /* ── Render ────────────────────────────────────────────────────── */
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300"
        aria-hidden="true"
        onClick={handleClose}
      />

      {/* Dialog panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="
          relative z-10 w-full max-w-md
          rounded-[2rem] border border-outline-variant/20
          bg-surface p-8 shadow-2xl
          outline-none
          animate-in zoom-in-95 fade-in duration-200
        "
      >
        {/* Close (X) button */}
        {!preventClose && (
          <button
            type="button"
            onClick={handleClose}
            aria-label="Đóng hộp thoại"
            className="
              absolute right-5 top-5
              flex h-9 w-9 items-center justify-center
              rounded-full border border-outline-variant/20
              bg-surface-container text-outline
              transition hover:bg-surface-container-high hover:text-on-surface
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
            "
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}

        {/* Header */}
        <div className="mb-6">
          {/* Icon badge */}
          <div
            className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border ${cfg.iconBg}`}
          >
            <span className={`material-symbols-outlined text-[28px] ${cfg.iconColor}`}>
              {cfg.icon}
            </span>
          </div>

          {/* Type pill */}
          <span
            className={`mb-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${cfg.badge}`}
          >
            <span className="material-symbols-outlined text-[13px]">{cfg.icon}</span>
            {cfg.badgeLabel}
          </span>

          {/* Title */}
          <h2
            id={titleId}
            className="text-2xl font-bold font-headline tracking-tight text-on-surface"
          >
            {title}
          </h2>
        </div>

        {/* Message */}
        <p
          id={descId}
          className="mb-8 text-sm leading-relaxed text-on-surface-variant"
        >
          {message}
        </p>

        {/* Divider */}
        <div className="mb-6 h-px bg-outline-variant/10" />

        {/* Action buttons */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          {showCancelButton && (
            <button
              type="button"
              onClick={handleClose}
              className="
                flex-1 rounded-xl border border-outline-variant/20
                bg-surface-container px-4 py-3
                text-sm font-semibold text-on-surface
                transition hover:bg-surface-container-high
                focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
              "
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className={`
              flex flex-1 items-center justify-center gap-2
              rounded-xl px-4 py-3
              text-sm font-semibold shadow-lg
              transition hover:scale-[1.02] active:scale-[0.98]
              focus:outline-none focus-visible:ring-2 ${cfg.ring}
              ${cfg.confirmBtn}
            `}
          >
            <span className="material-symbols-outlined text-[18px]">
              {cfg.icon}
            </span>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderAlertModal;
