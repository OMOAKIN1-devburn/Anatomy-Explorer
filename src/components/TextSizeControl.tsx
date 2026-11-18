import { useEffect } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';

const STEPS = [0.9, 1, 1.15, 1.3, 1.5];
const DEFAULT_INDEX = 1;

export function TextSizeControl() {
  const [index, setIndex] = usePersistentState<number>('wam-text-step', DEFAULT_INDEX);
  const safe = Math.min(Math.max(Number(index) || 0, 0), STEPS.length - 1);

  useEffect(() => {
    document.documentElement.style.setProperty('--text-scale', String(STEPS[safe]));
  }, [safe]);

  const base = 'grid h-8 place-items-center rounded-full border border-white/15 bg-[#111617]/90 text-xs font-semibold hover:bg-[#1c2324] disabled:opacity-40';
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Text size">
      <button type="button" className={`${base} w-8`} onClick={() => setIndex(safe - 1)} disabled={safe === 0} aria-label="Smaller text" title="Smaller text">A−</button>
      <button type="button" className={`${base} px-2`} onClick={() => setIndex(DEFAULT_INDEX)} disabled={safe === DEFAULT_INDEX} aria-label="Reset text size to normal" title="Reset text size to normal">
        {safe === DEFAULT_INDEX ? '100%' : 'Reset'}
      </button>
      <button type="button" className={`${base} w-8`} onClick={() => setIndex(safe + 1)} disabled={safe === STEPS.length - 1} aria-label="Bigger text" title="Bigger text">A+</button>
    </div>
  );
}