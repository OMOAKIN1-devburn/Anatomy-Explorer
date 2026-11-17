import { useEffect, useMemo, useState } from 'react';
import { species, type SpeciesRecord } from './data/species';
import { InfoRow } from './components/InfoRow';
import { SpecimenViewer, type ViewerCommand, type ViewerCommandType } from './components/SpecimenViewer';
import { ExplorerBackdrop} from './components/ExplorerBackdrop';
import { Credits, ModelCredit } from './components/Credits';
import { Contact } from './components/Contact';
import { usePersistentState } from './hooks/usePersistentState';
import { HowToDialog } from './components/HowToDialog';
import { HelpButton } from './components/HelpButton';

type Availability = 'checking' | 'ready' | 'missing' | 'error';

// Defined outside the component so they are not rebuilt on every render.
const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'adaptations', label: 'Adaptations' },
  { id: 'facts', label: 'Facts' },
] as const;
type TabId = (typeof TABS)[number]['id'];

// Small helper so every Font Awesome icon has the same fixed width and is hidden from screen readers.
const Icon = ({ name, className = '' }: { name: string; className?: string }) => (
  <i className={`fa-solid ${name} fa-fw ${className}`} aria-hidden="true" />
);

function App() {
  // Collection state: selected species and gallery filters.
  const [activeSpeciesId, setActiveSpeciesId] = usePersistentState('wam-species', 'lion');
  const [query, setQuery] = useState('');
  const [habitatFilter, setHabitatFilter] = useState('All habitats');

  // Profile state: open information tab and focused body hotspot.
  const [activeTab, setActiveTab] = usePersistentState<TabId>('wam-tab', 'overview');
  const [selectedRegionId, setSelectedRegionId] = usePersistentState<string | null>('wam-dot', null);
  const [showLabels, setShowLabels] = usePersistentState('wam-labels', false);

  const [helpOpen, setHelpOpen] = useState(() => {
  try {
    return window.localStorage.getItem('wam-help-seen') !== '1';
  } catch {
    return false;
  }
});
const closeHelp = () => {
  setHelpOpen(false);
  try {
    window.localStorage.setItem('wam-help-seen', '1');
  } catch {
    // Ignore: the guide will simply show again next visit.
  }
};

  // Viewer state: layer, asset check result, retry counter, and the last camera command.
  const [availability, setAvailability] = useState<Availability>('checking');
  const [attempt, setAttempt] = useState(0);
  const [viewerCommand, setViewerCommand] = useState<ViewerCommand>(null);

  // Toggles the short explanatory panel in the header.
  const activeSpecies = species.find((item) => item.id === activeSpeciesId) ?? species[0];
  const hotspots = activeSpecies.hotspots ?? [];
  const selectedHotspot = hotspots.find((hotspot) => hotspot.id === selectedRegionId);

  const habitats = useMemo(() => ['All habitats', ...new Set(species.map((item) => item.habitat.split(',')[0]))], []);
  const filteredSpecies = useMemo(() => species.filter((item) => {
    const matchesQuery = `${item.name} ${item.scientificName} ${item.className}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesHabitat = habitatFilter === 'All habitats' || item.habitat.includes(habitatFilter);
    return matchesQuery && matchesHabitat;
  }), [query, habitatFilter]);

  // Check that the local model file really exists. The AbortController cancels
  // an old check if the learner switches species before it finishes.
  useEffect(() => {
    if (!activeSpecies.modelAvailable || !activeSpecies.modelPath) {
      setAvailability('missing');
      return;
    }
    const controller = new AbortController();
    setAvailability('checking');
    fetch(activeSpecies.modelPath, { method: 'HEAD', signal: controller.signal })
      .then((response) => {
        // Vite (and the production rewrite rule) answers unknown paths with
        // index.html and status 200, so a 200 alone does not prove the file exists.
        const contentType = response.headers.get('content-type') ?? '';
        if (!response.ok) setAvailability(response.status === 404 ? 'missing' : 'error');
        else if (contentType.includes('text/html')) setAvailability('missing');
        else setAvailability('ready');
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setAvailability('error');
      });
    return () => controller.abort();
  }, [activeSpecies, attempt]);

  const selectSpecies = (entry: SpeciesRecord) => {
    // Reset transient focus when the learner switches to a different record.
    setActiveSpeciesId(entry.id);
    setSelectedRegionId(null);
    setActiveTab('overview');
    setViewerCommand(null);
  };

  const sendViewerCommand = (type: ViewerCommandType) =>
    setViewerCommand((previous) => ({ type, id: (previous?.id ?? 0) + 1 }));

  const statusLabel = { checking: 'Checking', ready: 'Asset found', error: 'Asset check failed', missing: 'Model pending' }[availability];
  const placeholderPath = `public${activeSpecies.modelPath ?? `/models/${activeSpecies.id}.glb`}`;

  return (
    <main className="museum-shell">
      <ExplorerBackdrop />
      <header className="topbar sticky top-0 z-20">
        <div className="topbar-inner mx-auto flex h-[68px] max-w-[1600px] items-center justify-between px-[30px]">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-md border border-[#c99a58]/35 bg-[#bd8741]/10 text-[#e4b66e]">
              <Icon name="fa-paw" className="text-[16px]" />
            </div>
            <div>
              <div className="font-display text-[18px] leading-5 tracking-[.01em] text-[#efe8d9]">Wildlife Anatomy Museum</div>
              <div className="brand-subtitle mt-0.5 font-mono text-[10px] uppercase tracking-[.18em] text-[#9aa097]">Explore wildlife, one body part at a time</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[#778b78]/20 bg-[#415848]/10 px-3 py-1.5 text-[10px] tracking-wide text-[#a9baa5] sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#87a47c]" /> LEARNING COLLECTION
            </div>
            <HelpButton onClick={() => setHelpOpen(true)} />
          </div>
        </div>
      </header>

      <div className="museum-grid">
        {/* ---------- Left: searchable collection ---------- */}
        <aside className="species-panel panel flex min-h-[680px] flex-col p-4" aria-label="Species collection">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[.2em] text-[#d8a95f]">Explore</div>
              <h1 className="mt-1 font-display text-[21px] text-[#eee7d9]">The collection</h1>
            </div>
            <span className="font-mono text-[11px] text-[#939a92]">{species.length} species</span>
          </div>
          <label className="relative mb-3 block">
            <Icon name="fa-magnifying-glass" className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#8e948d]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a species…" aria-label="Search species" className="h-10 w-full rounded-md border border-white/10 bg-[#111516] pl-9 pr-3 text-xs text-[#e4e0d5] placeholder:text-[#868c87]" data-testid="input-species-search" />
          </label>
          <label className="relative mb-4 block">
            <select value={habitatFilter} onChange={(event) => setHabitatFilter(event.target.value)} className="h-9 w-full appearance-none rounded-md border border-white/10 bg-[#171b1c] px-3 pr-8 text-[11px] text-[#bfc1b7]" aria-label="Filter by habitat" data-testid="select-habitat">
              {habitats.map((habitat) => <option key={habitat}>{habitat}</option>)}
            </select>
            <Icon name="fa-chevron-down" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#939991]" />
          </label>
          <div className="species-scroll min-h-[260px] max-h-[55vh] space-y-1 overflow-y-auto pr-1" aria-label="Available species">
            {filteredSpecies.map((entry) => {
              const active = activeSpeciesId === entry.id;
              return (
                <button key={entry.id} aria-current={active ? 'true' : undefined} onClick={() => selectSpecies(entry)} className={`species-row flex w-full items-center gap-3 rounded-md border border-transparent px-2.5 py-2 text-left ${active ? 'active' : ''}`} data-testid={`button-species-${entry.id}`}>
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-md text-[13px] ${active ? 'bg-[#dba95f]/15 text-[#e6b86d]' : 'bg-white/[.035] text-[#939a91]'}`}>
                    <Icon name={entry.icon} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-[12px] ${active ? 'text-[#f0e6d4]' : 'text-[#c6c6bb]'}`}>{entry.name}</span>
                    <span className="species-meta mt-0.5 block truncate font-mono text-[10px] text-[#8e948d]">{entry.scientificName}</span>
                    <span className="mt-0.5 block truncate text-[10px] text-[#d8a75d]"><Icon name="fa-mountain" className="mr-1" />{entry.habitat.split(',')[0]}</span>
                  </span>
                  {entry.modelAvailable && <span title={`${entry.name} 3D model available`} className="h-1.5 w-1.5 rounded-full bg-[#d8a75d]" />}
                </button>
              );
            })}
            {!filteredSpecies.length && (
              <div className="rounded-md border border-dashed border-white/10 px-3 py-5 text-center">
                <Icon name="fa-magnifying-glass" className="mb-2 text-[16px] text-[#868c87]" />
                <p className="text-xs text-[#afb1a8]">No species found</p>
                <button onClick={() => { setQuery(''); setHabitatFilter('All habitats'); }} className="mt-2 text-[11px] text-[#d8a75d] underline underline-offset-2" data-testid="button-clear-filters">Clear filters</button>
              </div>
            )}
          </div>
        </aside>

        {/* ---------- Centre: specimen viewer ---------- */}
        <section className="viewer-panel panel min-w-0 overflow-hidden" aria-label={`${activeSpecies.name} specimen viewer`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.07] px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded bg-[#d6a55f]/10 text-[#d9ac69]"><Icon name="fa-compass" className="text-[14px]" /></span>
              <div>
                <h2 className="text-[12px] font-semibold tracking-wide text-[#e8e2d5]">Specimen viewer</h2>
                <p className="font-mono text-[10px] uppercase tracking-[.13em] text-[#868e88]">{activeSpecies.modelAvailable ? 'Model status · local asset' : 'Model status · planned'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span role="status" aria-live="polite" className={`rounded-full border px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${availability === 'ready' ? 'border-[#719273]/35 bg-[#44654a]/10 text-[#9abb91]' : availability === 'checking' ? 'border-[#bd9a5b]/30 text-[#d7b675]' : 'border-white/10 text-[#a4a99f]'}`}>
                {statusLabel}
              </span>
              {availability === 'ready' && (
                <button onClick={() => sendViewerCommand('reset')} aria-label="Reset view" title="Reset view" className="grid h-8 w-8 place-items-center rounded border border-white/10 text-[#a7aaa1] hover:bg-white/5" data-testid="button-reset-view">
                  <Icon name="fa-rotate-left" className="text-[13px]" />
                </button>
              )}
            </div>
          </div>

          <div className={`specimen-stage min-h-[460px] ${showLabels ? '' : 'labels-off'}`}>
            {availability === 'ready' && (
               <button
               type="button"
               onClick={() => setShowLabels((value) => !value)}
               aria-pressed={showLabels}
               className="absolute right-3 top-3 z-[5] flex items-center gap-2 rounded-full border border-[#e5ad59]/60 bg-[#111617]/90 px-4 py-2 text-sm font-semibold text-[#f0dcae] hover:bg-[#1c2326]"
               data-testid="button-toggle-labels">
                <Icon name={showLabels ? 'fa-eye-slash' : 'fa-tags'} />
                {showLabels ? 'Hide labels' : 'Click here to see the labels'}
                </button>
              )}
            {availability === 'ready' ? (
              <SpecimenViewer species={activeSpecies} command={viewerCommand} attempt={attempt} selectedId={selectedRegionId} onSelect={setSelectedRegionId} onRetry={() => setAttempt((value) => value + 1)} />
            ) : availability === 'checking' ? (
              <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-4">
                <div className="skeleton h-44 w-44 rounded-full opacity-60" />
                <div className="skeleton h-3 w-36 rounded-full" />
                <p className="font-mono text-[11px] uppercase tracking-[.16em] text-[#a5a596]">
                  <Icon name="fa-circle-notch fa-spin" className="mr-1" />Checking local specimen file
                </p>
              </div>
            ) : availability === 'error' ? (
              <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center px-6 text-center">
                <Icon name="fa-circle-exclamation" className="mb-3 text-[24px] text-[#d69a7c]" />
                <p className="text-sm font-medium text-[#e8e0d2]">Viewer connection interrupted</p>
                <p className="mt-2 max-w-xs text-xs leading-5 text-[#a4a99f]">The local model could not be checked. Confirm the development server is running, then retry.</p>
                <button onClick={() => setAttempt((value) => value + 1)} className="mt-4 rounded-md border border-white/15 px-3 py-2 text-xs hover:bg-white/5" data-testid="button-retry-check">
                  <Icon name="fa-rotate-right" className="mr-1" />Try again
                </button>
              </div>
            ) : (
              <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center px-6 text-center">
                <div className="stage-art relative mb-5 grid h-[190px] w-[230px] place-items-center">
                  <div className="absolute h-36 w-36 rounded-full border border-dashed border-[#d5aa69]/30" />
                  <div className="absolute h-52 w-52 rounded-full border border-[#d5aa69]/10" />
                  <div className="absolute h-px w-[220px] bg-[#d5aa69]/15" />
                  <div className="absolute h-[200px] w-px bg-[#d5aa69]/15" />
                  <div className="relative grid h-14 w-14 place-items-center rounded-full border border-[#d5aa69]/25 bg-[#d5aa69]/[.07] text-[#ddb16d]"><Icon name="fa-layer-group" className="text-[22px]" /></div>
                  <span className="absolute left-0 top-1/2 font-mono text-[9px] text-[#9e9e8e]">SPECIMEN</span>
                  <span className="absolute bottom-0 right-0 font-mono text-[9px] text-[#9e9e8e]">ASSET AWAITED</span>
                </div>
                <span className="rounded-full border border-[#c99a58]/25 bg-[#c99a58]/[.07] px-3 py-1 font-mono text-[10px] uppercase tracking-[.15em] text-[#d3aa6e]">Planned specimen · not yet installed</span>
                <h3 className="mt-3 font-display text-[25px] text-[#eee5d5]">The {activeSpecies.name.toLowerCase()}, in 3D</h3>
                <p className="mt-2 max-w-sm text-[12px] leading-5 text-[#adb0a7]">
                  Add the real model at <code className="rounded bg-white/[.06] px-1.5 py-0.5 font-mono text-[11px] text-[#e0c18e]">{placeholderPath}</code> to activate drag-to-rotate viewing.
                </p>
              </div>
            )}

            {/* Controls hint is only shown when there is actually a model to control. */}
            {availability === 'ready' && (
              <div className="pointer-events-none absolute bottom-4 left-4 z-[4] flex items-center gap-2 rounded border border-white/[.08] bg-[#0d1112]/75 px-2.5 py-1.5 font-mono text-[10px] text-[#aab0a5]">
                <Icon name="fa-hand-pointer" className="text-[11px]" /> DRAG TO ROTATE <span className="mx-1 text-white/20">/</span> CTRL + SCROLL TO ZOOM
                {hotspots.length > 0 && <><span className="mx-1 text-white/20">/</span>{showLabels ? 'CLICK A DOT' : 'LABELS ARE OFF'}</>}
              </div>
            )}
            {availability === 'ready' && (
              <div className="absolute bottom-4 right-4 z-[4] flex gap-1.5">
                <button onClick={() => sendViewerCommand('zoomIn')} aria-label="Zoom in" title="Zoom in" className="grid h-8 w-8 place-items-center rounded border border-white/10 bg-[#111617]/80 hover:bg-white/10" data-testid="button-zoom-in"><Icon name="fa-magnifying-glass-plus" className="text-[13px]" /></button>
                <button onClick={() => sendViewerCommand('zoomOut')} aria-label="Zoom out" title="Zoom out" className="grid h-8 w-8 place-items-center rounded border border-white/10 bg-[#111617]/80 hover:bg-white/10" data-testid="button-zoom-out"><Icon name="fa-magnifying-glass-minus" className="text-[13px]" /></button>
              </div>
            )}
          </div>

          {/* Body focus: only hotspots that this species' model really defines. */}
          <div className="flex flex-wrap items-center justify-between gap-y-3 border-t border-white/[.07] px-5 py-3">
            <div className="flex items-center gap-2 text-[11px] text-[#9ea49c]"><Icon name="fa-eye" className="text-[12px]" /><span>Body focus</span><span className="text-white/20">/</span>
              <span className="font-mono text-[#cdb282]">{selectedHotspot ? selectedHotspot.name : 'None selected'}</span>
            </div>
            <div className="flex max-w-full gap-1 overflow-x-auto">
              {availability === 'ready' && hotspots.length > 0 ? hotspots.map((hotspot) => (
                <button key={hotspot.id} onClick={() => setSelectedRegionId(selectedRegionId === hotspot.id ? null : hotspot.id)} aria-pressed={selectedRegionId === hotspot.id} className={`shrink-0 rounded border px-2 py-1.5 text-[10px] transition-colors ${selectedRegionId === hotspot.id ? 'border-[#c99a58]/50 bg-[#c99a58]/10 text-[#e3ba78]' : 'border-white/[.08] text-[#aaaea4] hover:bg-white/[.04]'}`} data-testid={`button-part-${hotspot.id}`}>{hotspot.name}</button>
              )) : (
                <span className="self-center text-[11px] text-[#868d86]">
                  {availability === 'ready' ? 'No dots are placed on this model yet.' : 'Body focus is unavailable until a model is added.'}
                </span>
              )}
            </div>
          </div>
          {selectedHotspot && (
            <div className="flex items-start gap-2 border-t border-white/[.06] bg-[#c99a58]/[.035] px-5 py-2.5 text-[11px] leading-4 text-[#bdbcaf]">
              <Icon name="fa-circle-info" className="mt-0.5 shrink-0 text-[12px] text-[#d4aa69]" />
              <span><strong className="text-[#e8d2a6]">{selectedHotspot.name}.</strong> {selectedHotspot.note}</span>
            </div>
          )}
        </section>

        {/* ---------- Right: species profile ---------- */}
        <aside className="info-panel panel min-h-[680px] overflow-hidden" aria-label={`${activeSpecies.name} species information`} data-testid="panel-species-information">
          <div className="border-b border-white/[.07] px-5 pb-4 pt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[.18em] text-[#d5a65f]">Species profile</span>
              <span className="font-mono text-[10px] text-[#889088]">FIELD NOTE / {String(species.findIndex((entry) => entry.id === activeSpecies.id) + 1).padStart(2, '0')}</span>
            </div>
            <h2 className="font-display text-[32px] leading-tight text-[#f0e8d9]">{activeSpecies.name}</h2>
            <p className="mt-1 font-display text-[13px] italic text-[#bcbdb1]">{activeSpecies.scientificName}</p>
            <span className="mt-3 inline-flex rounded-sm border border-white/10 bg-white/[.035] px-2 py-1 font-mono text-[10px] uppercase tracking-[.08em] text-[#b4b6ac]">{activeSpecies.className}</span>
          </div>

          <div role="tablist" aria-label="Species information" className="flex border-b border-white/[.07] px-4">
            {TABS.map((tab) => (
              <button key={tab.id} id={`tab-${tab.id}`} role="tab" aria-selected={activeTab === tab.id} aria-controls={`panel-${tab.id}`} onClick={() => setActiveTab(tab.id)} className={`tab-button flex-1 py-3 text-[11px] ${activeTab === tab.id ? 'selected' : 'text-[#9ca39b] hover:text-[#d6d2c7]'}`} data-testid={`tab-${tab.id}`}>{tab.label}</button>
            ))}
          </div>

          <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`} className="px-5 py-4">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <InfoRow icon={<Icon name="fa-mountain-sun" className="text-[12px]" />} label="Habitat" value={activeSpecies.habitat} />
                <InfoRow icon={<Icon name="fa-earth-americas" className="text-[12px]" />} label="Range" value={activeSpecies.range} />
                <InfoRow icon={<Icon name="fa-utensils" className="text-[12px]" />} label="Diet" value={activeSpecies.diet} />
                <InfoRow icon={<Icon name="fa-person-walking" className="text-[12px]" />} label="Movement" value={activeSpecies.movement} />
                <div className="mt-5 border-t border-white/[.08] pt-4">
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.12em] text-[#d7ae6d]"><Icon name="fa-wand-magic-sparkles" className="text-[12px]" /> Did you know?</div>
                  <p className="text-[12px] leading-[1.6] text-[#c6c6bb]">{activeSpecies.facts[0]}</p>
                  <ModelCredit speciesId={activeSpecies.id} />
                </div>
              </div>
            )}
            {activeTab === 'adaptations' && (
              <ul className="space-y-3">
                {activeSpecies.adaptations.map((item) => (
                  <li key={item} className="flex gap-3 text-[12px] leading-[1.6] text-[#c6c6bb]">
                    <Icon name="fa-dna" className="mt-1 shrink-0 text-[12px] text-[#d4aa69]" />{item}
                  </li>
                ))}
              </ul>
            )}
            {activeTab === 'facts' && (
              <ul className="space-y-3">
                {activeSpecies.facts.map((item) => (
                  <li key={item} className="flex gap-3 text-[12px] leading-[1.6] text-[#c6c6bb]">
                    <Icon name="fa-lightbulb" className="mt-1 shrink-0 text-[12px] text-[#d4aa69]" />{item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
      <Credits />
      <Contact />
      <HowToDialog open={helpOpen} onClose={closeHelp} />
    </main>
  );
}

export default App;