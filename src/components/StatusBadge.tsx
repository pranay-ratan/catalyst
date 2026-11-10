import type { BatchStatus } from '../types';
import { STATUS_LABEL } from '../lib/status';
import { CheckIcon, CrossIcon, WarnIcon } from './Icons';

const BADGE_STYLE: Record<BatchStatus, string> = {
  verified: 'bg-turquoise-text/10 text-turquoise-text border-turquoise-text',
  review: 'bg-warn/10 text-warn border-warn',
  withheld: 'bg-danger/10 text-danger border-danger',
};

interface StatusBadgeProps {
  status: BatchStatus;
}

/** Status is always conveyed by text and icon, never by colour alone. */
export function StatusBadge({ status }: StatusBadgeProps) {
  const Icon = status === 'verified' ? CheckIcon : status === 'review' ? WarnIcon : CrossIcon;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-base font-bold ${BADGE_STYLE[status]}`}
      data-status={status}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{STATUS_LABEL[status]}</span>
    </span>
  );
}
