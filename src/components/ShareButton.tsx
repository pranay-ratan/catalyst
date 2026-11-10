import { useState } from 'react';

const COPIED_MESSAGE = 'Link copied to clipboard.';
const SHARE_FAILED_MESSAGE = 'Sharing is not available here. Copy the address from your browser bar.';

interface ShareButtonProps {
  title: string;
  url: string;
}

/**
 * Shares the passport link through the native share sheet when available,
 * otherwise copies it. Failures are shown as text, not swallowed.
 */
export function ShareButton({ title, url }: ShareButtonProps) {
  const [message, setMessage] = useState('');

  async function handleShare(): Promise<void> {
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title, url });
        setMessage('');
        return;
      }
      await navigator.clipboard.writeText(url);
      setMessage(COPIED_MESSAGE);
    } catch (error: unknown) {
      // The user cancelling the share sheet is not a failure worth alarming them about.
      if (error instanceof DOMException && error.name === 'AbortError') {
        setMessage('');
        return;
      }
      setMessage(SHARE_FAILED_MESSAGE);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleShare}
        className="min-h-[44px] rounded-md border-2 border-indigo px-4 py-2 text-base font-bold text-indigo hover:bg-indigo hover:text-linen"
      >
        Share this passport
      </button>
      <p className="text-base text-muted" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
