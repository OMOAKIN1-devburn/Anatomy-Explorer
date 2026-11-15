// Positions are generated once, so the scene doesn't reshuffle on re-render.
const STARS = Array.from({ length: 46 }, (_, i) => ({
  left: (i * 53) % 100,
  top: (i * 29) % 46,
  size: 1 + (i % 3),
  delay: (i % 7) * 0.8,
}));

const FIREFLIES = Array.from({ length: 14 }, (_, i) => ({
  left: 4 + ((i * 37) % 92),
  bottom: 3 + ((i * 17) % 28),
  delay: (i % 6) * 1.3,
  duration: 7 + (i % 5) * 2,
}));

// Jagged grass line along the front of the scene.
const GRASS =
  'M0 60 L0 40 ' +
  Array.from({ length: 121 }, (_, i) => {
    const x = i * 12;
    const h = 12 + ((i * 37) % 11) * 2;
    return `L${x + 3} ${40 - h} L${x + 6} 40`;
  }).join(' ') +
  ' L1440 60Z';

export function ExplorerBackdrop() {
  return (
    <div aria-hidden="true" className="explorer-backdrop">
      {STARS.map((s, i) => (
        <span
          key={i}
          className="eb-star"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
        />
      ))}

      <div className="eb-sun-glow" />
      <div className="eb-sun" />
      <div className="eb-cloud eb-cloud-1" />
      <div className="eb-cloud eb-cloud-2" />

      {/* Far mountains */}
      <svg className="eb-layer eb-mountains" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path d="M0 230 L120 150 L220 210 L360 110 L500 205 L640 140 L780 215 L930 100 L1080 200 L1220 135 L1340 190 L1440 150 L1440 320 L0 320Z" />
      </svg>

      {/* Mid hills */}
      <svg className="eb-layer eb-hills" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path d="M0 250 C200 190 380 240 600 205 C820 170 1040 245 1240 200 C1340 180 1400 205 1440 210 L1440 320 L0 320Z" />
      </svg>

      {/* Walking animals */}
      <svg className="eb-walker eb-elephant" viewBox="0 0 160 110">
        <ellipse cx="75" cy="55" rx="42" ry="28" />
        <circle cx="122" cy="50" r="20" />
        <ellipse cx="108" cy="54" rx="11" ry="17" />
        <path d="M136 58 C148 70 148 90 140 100 L133 96 C140 86 139 74 131 66Z" />
        <rect x="42" y="70" width="12" height="38" rx="4" />
        <rect x="58" y="72" width="12" height="36" rx="4" />
        <rect x="88" y="72" width="12" height="36" rx="4" />
        <rect x="104" y="70" width="12" height="38" rx="4" />
        <path d="M34 48 C24 54 22 68 26 80 L30 80 C28 70 30 60 38 54Z" />
      </svg>
      <svg className="eb-walker eb-giraffe" viewBox="0 0 120 160">
        <ellipse cx="68" cy="96" rx="26" ry="14" />
        <polygon points="84,92 96,88 88,26 78,30" />
        <ellipse cx="92" cy="22" rx="10" ry="5" transform="rotate(-18 92 22)" />
        <rect x="80" y="10" width="2.5" height="9" />
        <rect x="87" y="9" width="2.5" height="9" />
        <rect x="48" y="104" width="4" height="52" />
        <rect x="57" y="106" width="4" height="50" />
        <rect x="78" y="106" width="4" height="50" />
        <rect x="87" y="104" width="4" height="52" />
        <path d="M43 90 C34 98 34 112 38 124 L41 123 C38 112 39 102 46 94Z" />
      </svg>

      {/* Front ground with grass */}
      <svg className="eb-layer eb-ground" viewBox="0 0 1440 60" preserveAspectRatio="none">
        <path d={GRASS} />
      </svg>

      {/* Acacia trees */}
      <svg className="eb-acacia eb-acacia-r" viewBox="0 0 240 150">
        <path d="M112 150 C116 110 114 90 108 62 L124 62 C122 90 126 110 132 150Z" />
        <ellipse cx="120" cy="52" rx="112" ry="20" />
        <ellipse cx="70" cy="68" rx="52" ry="12" />
        <ellipse cx="176" cy="66" rx="48" ry="11" />
      </svg>
      <svg className="eb-acacia eb-acacia-l" viewBox="0 0 240 150">
        <path d="M112 150 C116 110 114 90 108 62 L124 62 C122 90 126 110 132 150Z" />
        <ellipse cx="120" cy="52" rx="100" ry="18" />
        <ellipse cx="64" cy="66" rx="46" ry="11" />
      </svg>

      {FIREFLIES.map((f, i) => (
        <span
          key={i}
          className="eb-firefly"
          style={{ left: `${f.left}%`, bottom: `${f.bottom}vh`, animationDelay: `${f.delay}s`, animationDuration: `${f.duration}s` }}
        />
      ))}
    </div>
  );
}