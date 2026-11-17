export function HelpButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="How to use the museum"
      title="How to use the museum"
      data-testid="button-about"
      className="relative flex items-center gap-2 rounded-full border border-[#e5ad59]/50 bg-[#111617]/90 px-3 py-1.5 text-xs font-semibold text-[#e5ad59] hover:bg-[#1c2324]"
    >
      <span className="absolute -right-1 -top-1 flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e5ad59]/60" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-[#e5ad59]" />
      </span>
      <i className="fa-solid fa-circle-question" aria-hidden="true" />
      <span>How it works</span>
    </button>
  );
}