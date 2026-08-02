// QR Passport — FIX for flaw #4.1 (Incomplete QR Passport Feature).
// The original component was a placeholder stub ("QR Passport — Phase 11")
// despite `qrcode.react` and `html-to-image` already being installed.
// This implements a real, exportable verification card:
//  - Encodes a compact JSON verification payload (exercise, reps, form
//    breaks, accuracy, timestamp, and a short integrity hash) into a QR
//    code so a scout/coach can scan it and cross-check the numbers.
//  - Lets the athlete export the whole card as a PNG via html-to-image,
//    which can be shared or dropped into a scouting report.
import { useRef, useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import type { SessionResult } from '../models/sessionResult';

interface QRPassportProps {
  exerciseName: string;
  icon: string;
  athleteName?: string;
  session: SessionResult;
}

/** Small non-cryptographic checksum so a tampered payload is at least detectable at a glance. */
function computeIntegrityHash(payload: string): string {
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = (hash * 31 + payload.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36).toUpperCase().slice(0, 8);
}

export function QRPassport({ exerciseName, icon, athleteName, session }: QRPassportProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const verificationPayload = JSON.stringify({
    app: 'ONFORM',
    v: 1,
    athlete: athleteName ?? 'Athlete',
    exercise: exerciseName,
    reps: session.validReps,
    formBreaks: session.formBreaks,
    accuracy: session.accuracy,
    durationSeconds: session.durationSeconds,
    timestamp: session.timestamp,
    sessionId: session.id ?? null,
  });
  const hash = computeIntegrityHash(verificationPayload);
  const qrValue = JSON.stringify({ ...JSON.parse(verificationPayload), hash });

  const handleExport = useCallback(async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: '#07070A',
      });
      const link = document.createElement('a');
      link.download = `onform-passport-${exerciseName.toLowerCase().replace(/\s+/g, '-')}-${hash}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export passport card', err);
    } finally {
      setExporting(false);
    }
  }, [exerciseName, hash]);

  return (
    <div className="glass-card p-0 overflow-hidden">
      <div ref={cardRef} className="p-6" style={{ background: 'var(--color-background)' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">ONFORM Passport</p>
            <h3 className="text-lg font-bold mt-0.5">
              {icon} {exerciseName}
            </h3>
            {athleteName && <p className="text-muted text-xs mt-0.5">{athleteName}</p>}
          </div>
          <div className="bg-white p-2 rounded-xl shrink-0">
            <QRCodeSVG value={qrValue} size={84} bgColor="#FFFFFF" fgColor="#07070A" level="M" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center mb-3">
          <div className="bg-surface rounded-xl py-2.5">
            <div className="text-xl font-bold text-primary">{session.validReps}</div>
            <div className="text-muted text-[10px] uppercase tracking-wide">Reps</div>
          </div>
          <div className="bg-surface rounded-xl py-2.5">
            <div className="text-xl font-bold text-danger">{session.formBreaks}</div>
            <div className="text-muted text-[10px] uppercase tracking-wide">Breaks</div>
          </div>
          <div className="bg-surface rounded-xl py-2.5">
            <div className="text-xl font-bold text-secondary-color">{session.accuracy}%</div>
            <div className="text-muted text-[10px] uppercase tracking-wide">Accuracy</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted">
          <span>{new Date(session.timestamp).toLocaleString()}</span>
          <span className="font-mono">#{hash}</span>
        </div>
      </div>

      <button
        onClick={handleExport}
        disabled={exporting}
        className="w-full py-3 font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
        style={{ background: 'var(--color-primary)', color: 'var(--color-background)' }}
      >
        {exporting ? 'Exporting…' : 'Export Passport PNG'}
      </button>
    </div>
  );
}
