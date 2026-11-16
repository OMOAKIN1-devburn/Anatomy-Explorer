export function Contact() {
  return (
    <section className="panel mx-auto mb-10 max-w-[1600px] p-6 text-center" aria-label="Contact">
      <p className="font-mono text-xs uppercase tracking-[.16em] text-[#e5ad59]">Built by Olamide Akinola</p>
      <h2 className="font-display mt-2 text-2xl text-[#f0e8d8]">Want a website like this?</h2>
      <p className="mt-2 text-sm text-[#cfc8b8]">I build interactive learning and productivity sites. Send me a message and let's talk about yours.</p>
      <a href="mailto:haroldburn03@gmail.com" className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#e5ad59]/60 bg-[#111617]/90 px-5 py-2 text-sm font-semibold text-[#f0dcae] hover:bg-[#1c2326]">
        <i className="fa-solid fa-envelope" aria-hidden="true" /> haroldburn03@gmail.com
      </a>
    </section>
  );
}