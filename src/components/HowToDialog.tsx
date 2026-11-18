import { useEffect, useRef } from 'react';

const STEPS = [
  { icon: 'fa-hand-pointer', title: 'Choose a specimen', text: 'Pick an animal, or the human, from the collection.' },
  { icon: 'fa-arrows-rotate', title: 'Look around', text: 'Drag to rotate. Pinch, use the + and - buttons, or hold Ctrl and scroll, to zoom.' },
  { icon: 'fa-tags', title: 'Show the labels', text: 'Press “Click here to see the labels” above the specimen. Dots appear on the body parts.' },
  { icon: 'fa-book-open', title: 'Learn', text: 'Tap a dot to read about that body part. The profile shows habitat, diet and facts.' },
  { icon: 'fa-text-height', title: 'Change the text size', text: 'Use A− and A+ at the top to resize the text. Press Reset to go back to normal. Your choice is saved.' },
] as const;

export function HowToDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) panelRef.current?.focus({ preventScroll: true });
  }, [open]);
  // Stop the page behind the guide from scrolling while it is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="howto-title"
        ref={panelRef}
        tabIndex={-1}
        className="panel max-h-[90dvh] w-full max-w-lg overflow-y-auto p-6 outline-none"
      >
        <p className="font-mono text-xs uppercase tracking-[.16em] text-[#e5ad59]">Quick guide</p>
        <h2 id="howto-title" className="font-display mt-1 text-2xl text-[#f0e8d8]">How to use the museum</h2>
        <ol className="mt-5 space-y-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#e5ad59]/50 bg-[#111617] text-[#e5ad59]">
                <i className={`fa-solid ${step.icon}`} aria-hidden="true" />
              </span>
              <div>
                <p className="text-base font-semibold text-[#f0e8d8]">{index + 1}. {step.title}</p>
                <p className="mt-0.5 text-sm leading-6 text-[#cfc8b8]">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-sm text-[#a9ada8]">Your place is saved, so you can continue where you left off.</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-full border border-[#e5ad59]/60 bg-[#111617]/90 px-5 py-3 text-sm font-semibold text-[#f0dcae] hover:bg-[#1c2326]"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
