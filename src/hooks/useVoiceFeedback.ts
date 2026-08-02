/**
 * Voice feedback hook — FIX for flaw #4.3 (Missing Audio & Haptic Feedback).
 *
 * Wraps window.speechSynthesis so live-tracking screens can call out short
 * cues ("Good rep", "Go lower", "Hold steady") without the user needing to
 * stare at the screen from a few meters away. Falls back to a silent no-op
 * if the browser doesn't support the Web Speech API. Also fires a short
 * vibration pulse where the Vibration API is available, as a haptic
 * complement on supported mobile devices.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

interface SpeakOptions {
  /** If true, cancels any in-progress utterance to speak this one immediately. */
  priority?: boolean;
}

interface UseVoiceFeedbackResult {
  speak: (text: string, options?: SpeakOptions) => void;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  supported: boolean;
}

export function useVoiceFeedback(): UseVoiceFeedbackResult {
  const [enabled, setEnabled] = useState(true);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const lastSpokenRef = useRef<{ text: string; at: number }>({ text: '', at: 0 });

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  const speak = useCallback(
    (text: string, options?: SpeakOptions) => {
      if (!enabled || !supported || !text) return;

      // Debounce identical cues fired in quick succession (e.g. multiple
      // frames reporting the same event before state settles).
      const now = performance.now();
      if (lastSpokenRef.current.text === text && now - lastSpokenRef.current.at < 600) {
        return;
      }
      lastSpokenRef.current = { text, at: now };

      if (options?.priority) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.15;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);

      if ('vibrate' in navigator) {
        navigator.vibrate(60);
      }
    },
    [enabled, supported]
  );

  return { speak, enabled, setEnabled, supported };
}
