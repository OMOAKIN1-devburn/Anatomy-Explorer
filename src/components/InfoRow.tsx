import type { ReactNode } from "react";

/** Reusable profile row for concise, consistently labeled species facts. */
export function InfoRow({
    icon, label, value
}: {
    icon: ReactNode; label: string; value: string
}) {
    return (
        <div className="flex gap-3">
            <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded border border-white/[.07] bg-white/[.025] text-[#d4aa69]">{icon}</div>
            <div>
                <p className="font-mono text-[length:calc(9px*var(--phone-boost)*var(--text-scale))] uppercase tracking-[.12em] text-[#818880]">{label}</p>
                <p className="mt-1 text-[length:calc(11px*var(--phone-boost)*var(--text-scale))] leading-[1.55] text-[#c6c6bb]">{value}</p>
            </div>
        </div>
    );
}