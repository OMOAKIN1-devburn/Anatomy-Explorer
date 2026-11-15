const CREDITS = [
  {
    title: 'Realistic_ Lion 3D_model_of_texture_fbx',
    author: 'mohamed.salaah880',
    sourceUrl: 'https://sketchfab.com/3d-models/realistic--lion-3d-model-of-texture-fbx-1826fce5708d42388f6a750e6e7e3d06',
    authorUrl: 'https://sketchfab.com/mohamed.salaah880',
    license: 'CC BY 4.0',
    licenseUrl: 'http://creativecommons.org/licenses/by/4.0/',
  },

  {
    title: 'Elephant',
    author: 'Stephengury',
    sourceUrl: 'https://sketchfab.com/3d-models/elephant-f57057ad0c2044ec88c9ba5ab5c18a41',
    authorUrl: 'https://sketchfab.com/Stephengury',
    license: 'CC BY 4.0',
    licenseUrl: 'http://creativecommons.org/licenses/by/4.0',
  },

  {
    title: 'Giraffe_Textured',
    author: 'davidgrima',
    sourceUrl: 'https://sketchfab.com/3d-models/giraffe-textured-bb673b1e6fb64a5685f1ac55e1d894e',
    authorUrl: 'https://sketchfab.com/davidgrima',
    license: 'CC BY 4.0',
    licenseUrl: 'http://creativecommons.org/licenses/by/4.0',
  },

  {
    title: 'Kangaroo',
    author: 'rinaskylark',
    sourceUrl: 'https://sketchfab.com/3d-models/kangaroo-31236db25afe445e8444b0ce8e22d53d',
    authorUrl: 'https://sketchfab.com/rinaskylark',
    license: 'CC BY 4.0',
    licenseUrl: 'http://creativecommons.org/licenses/by/4.0',
  },

   {
    title: 'Tiger',
    author: 'Vavtrudner',
    sourceUrl: 'https://sketchfab.com/3d-models/tiger-1ec8e57c13a345bf91fe8209de979637',
    authorUrl: 'https://sketchfab.com/Vavtrudner',
    license: 'CC BY 4.0',
    licenseUrl: 'http://creativecommons.org/licenses/by/4.0',
  },

  {
    title: 'Wolf',
    author: 'AX-7YK',
    sourceUrl: 'https://sketchfab.com/3d-models/wolf-f53173981deb44559419fd0370d5a4c8',
    authorUrl: 'https://sketchfab.com/AX-7YK',
    license: 'CC BY 4.0',
    licenseUrl: 'http://creativecommons.org/licenses/by/4.0',
  },
];

const link = 'text-[#e8b56c] underline-offset-2 hover:underline';

export function Credits() {
  return (
    <footer className="mx-auto max-w-[1600px] px-[30px] pb-10 text-xs leading-6">
      <div className="rounded-x1 border border-white/10 bg-[#0c0f18]/90 p-5 text-[#d8d1c2]">
      <h2 className="font-mono mb-2 text-[11px] uppercase tracking-widest text-[#e8b56c]">Credits</h2>
      <ul className="space-y-1">
        {CREDITS.map((c) => (
          <li key={c.sourceUrl}>
            “<a className={link} href={c.sourceUrl} target="_blank" rel="noopener noreferrer">{c.title}</a>” by{' '}
            <a className={link} href={c.authorUrl} target="_blank" rel="noopener noreferrer">{c.author}</a>, licensed under{' '}
            <a className={link} href={c.licenseUrl} target="_blank" rel="noopener noreferrer">{c.license}</a>.
            Converted and resized for web display.
          </li>
        ))}
      </ul>
      <p className="mt-2">Icons by Font Awesome Free. 3D rendering with Three.js.</p>
      </div>
    </footer>
  );
}