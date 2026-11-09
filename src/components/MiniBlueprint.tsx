/** A small schematic preview of the planned collection, specimen, and notes layout. */
export function MiniBlueprint() {
    return (
        <div className="wireframe relative mt-4 overflow-hidden rounded-lg p-3"
        aria-label="Small wireframe preview of the planned museum interface" data-testid="preview-wireframe">
            <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[.16em] text-[#dcb16e]">Interface study . v.01</span>
                <span className="font-mono text-[9px] text-[#7d8580]">SCHEMATIC</span>
            </div>
            <svg viewBox="0 0 250 118" className="block w-full" role="img" aria-label="Wireframe showing collection, specimen viewer, and species information panel">
                <rect x="1" y="1" width="248" height="116" rx="5" fill="none" stroke="#6a6250" strokeOpacity=".55" />
                <rect x="9" y="9" width="232" height="12" rx="2" fill="#c9964b" fillOpacity=".13" stroke="#c9964b" strokeOpacity=".46" />
                <rect x="9" y="27" width="48" height="81" rx="3" fill="none" stroke="#8a8d7e" strokeOpacity=".7" />
                <rect x="63" y="27" width="118" height="81" rx="3" fill="#a7a176" fillOpacity=".06" stroke="#c9964b" strokeOpacity=".65" />
                <rect x="187" y="27" width="54" height="81" rx="3" fill="none" stroke="#8A8D7E" strokeOpacity=".7" />
                <path d ="M19 38h28M19 46h24M19 54h28M19 62h19M19 77h28M19 85h23M72 35h31M72 41h25M191 37h39M191 44h31M191 51h35M191 65h40M191 72h31M191 79h38" stroke="#aeb0a1" strokeOpacity=".46" strokeWidth="1.2" />
                <circle cx="123" cy="70" r="22" fill="none" stroke="#d4aa67" strokeOpacity=".6" strokeDasharray="2 3" />
                <path d="M106 70h34M123 53v34" stroke="#d4aa67" strokeOpacity=".5" />
                <path d="M111 66c4-8 17-10 23-2 3 4 1 11-4 13-6 3-14 0-19-4" fill="none" stroke="#e0ba7e" strokeWidth="1.2" />
                <text x="13" y="104" fill="#999b8f" fontSize="5" fontFamily="monospace">COLLECTION</text>
                <text x="106" y="104" fill="#c7ad7f" fontSize="5" fontFamily="monospace">SPECIMEN</text>
                <text x="192" y="104" fill="#999b8f" fontSize="5" fontFamily="monospace">FIELD NOTES</text>
            </svg>
        </div>
    );
}