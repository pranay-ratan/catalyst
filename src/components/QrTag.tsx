import { QRCodeSVG } from 'qrcode.react';
import type { Batch } from '../types';
import { passportUrl } from '../lib/links';

interface QrTagProps {
  batch: Batch;
}

/** Printable garment tag: the QR encodes the full passport URL for this batch id. */
export function QrTag({ batch }: QrTagProps) {
  const url = passportUrl(batch.id);
  return (
    <article className="print-card mx-auto max-w-xs rounded-lg border-2 border-indigo bg-linen p-6 text-center" aria-label={`QR tag for ${batch.id}`}>
      <p className="font-heading text-lg text-indigo">ClearThread</p>
      <div className="mx-auto my-4 inline-block bg-white p-3">
        <QRCodeSVG value={url} size={180} level="M" marginSize={0} title={`Passport QR for ${batch.id}`} />
      </div>
      <p className="font-bold">{batch.id}</p>
      <p className="text-base text-muted">{batch.garment}</p>
      <p className="mt-2 break-all text-sm text-muted">{url}</p>
      <p className="mt-3 text-sm font-bold text-muted">Demo data. Not real test results.</p>
    </article>
  );
}
