// ------------------------------------------------------------------ módszer-videók a többi appból
// A talajjavítási és alapozási módszerekhez kártyasor: a BME Építőmérnöki Kar YouTube-felvételei (az angol oldalon a
// Geotech Project csatorna angol változatai) és a Védekezés, illetve a Mélyalapozások app saját animációi.
// Kattintásra a videó ezen az oldalon, lejátszóablakban nyílik meg.  Használat: <div class="mvids" data-mv="dong,vibro,…"></div>
import { $$, h, EN } from './util.js';

const VED = 'https://vedekezesakarossullyedesekellen.vercel.app', MEL = 'https://melyalapozasok.vercel.app';
const MV = {
  dong: { yt: 'LtSalNj4ByQ', ytEn: 'VNDEW8acU_0', name: 'Ejtett döngölés', title: 'Talajtömörítés döngöléssel', dur: '3:16', durEn: '3:22' },
  vibro: { yt: 'Gca4PGhTC5o', ytEn: 'I1M6afZLrxo', name: 'Vibroflotáció', title: 'Vibroflotáció', dur: '2:23' },
  inj: { yt: 'CgKwZBWn_xM', ytEn: 'bVTljbQcE6U', name: 'Injektálás, szilárdítás', title: 'Injektálások', dur: '5:53' },
  fdp: { yt: 'hwP8iZzAq6I', ytEn: 'Mps1k494kSo', name: 'Talajkiszorításos cölöp', title: 'Helyben betonozott, csavart cölöpök', dur: '3:30' },
  colop: { yt: 'c3vKfjgqJdA', name: 'Cölöpalapozások', title: 'Cölöpalapozások rendszerezése', dur: '2:32' },
  cfa: { yt: 'wqOU4bcUiCk', ytEn: 'Z94hg0Y4SNY', name: 'CFA-cölöp', title: 'Folyamatos spirállal készített cölöpök (CFA)', dur: '2:41' },
  tj1: { app: VED, file: '/video/tj1.html', fileEn: '/video/en/tj1.html', appName: 'Védekezés a káros süllyedések ellen', name: 'Talajcsere', title: 'Talajcsere', en: 'Soil replacement', dur: '2:16' },
  tj7: { app: VED, file: '/video/tj7.html', fileEn: '/video/en/tj7.html', appName: 'Védekezés a káros süllyedések ellen', name: 'Előterhelés', title: 'Előterhelés', dur: '2:14' },
  mv1: { app: MEL, file: '/video/v1.html', fileEn: '/video/en/v1.html', appName: 'Mélyalapozások', name: 'Mélyalapozás', title: 'A mélyalapozás alapjai', dur: '2:31' },
};
const PLAY = '<svg viewBox="0 0 24 24" fill="#111"><path d="M6 4l14 8-14 8z"/></svg>';

function info(k) {
  const m = MV[k];
  if (m.yt) {
    const id = EN && m.ytEn ? m.ytEn : m.yt;
    const src = EN && m.ytEn ? 'Geotech Project · YouTube' : (EN ? 'BME Faculty of Civil Engineering · YouTube · in Hungarian' : 'BME Építőmérnöki Kar · YouTube');
    return { kind: 'yt', id, src, dur: (EN && m.durEn) || m.dur, thumb: 'assets/mv/' + k + (EN && m.ytEn ? '_en' : '') + '.webp',
      embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`, open: `https://www.youtube.com/watch?v=${id}`, openLabel: 'Megnyitás a YouTube-on' };
  }
  const base = m.app.replace(/\/en$/, '');   // az angol build a társoldal címét /en-re írja át
  return { kind: 'anim', src: (EN ? 'Animation · ' : 'Animáció · ') + m.appName + ' app', dur: m.dur, thumb: 'assets/mv/' + k + (EN ? '_en' : '') + '.webp',
    embed: base + (EN ? m.fileEn : m.file), open: base + (EN ? '/en' : ''), openLabel: 'Az app megnyitása' };
}

function openExt(m, x) {
  const close = h('button', { class: 'modal-close', type: 'button', 'aria-label': 'Bezárás' }, '✕');
  const inner = h('div', { class: 'modal-in' });
  const msg = h('div', { class: 'modal-msg' }, 'Videó betöltése…');
  const frame = h('iframe', { src: x.embed, title: m.title, allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen', allowfullscreen: true, referrerpolicy: 'strict-origin-when-cross-origin' });
  frame.addEventListener('load', () => msg.remove());
  inner.append(msg, frame);
  const bar = h('div', { class: 'modal-bar' }, h('div', {}, h('b', {}, m.title), h('small', {}, x.src + ' · ' + x.dur)),
    h('a', { href: x.open, target: '_blank', rel: 'noopener' }, x.openLabel + ' ↗'));
  const col = h('div', { class: 'modal-col' }, inner, bar);
  const modal = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': m.title }, col, close);
  const shut = () => { modal.remove(); document.removeEventListener('keydown', esc); };
  const esc = (e) => { if (e.key === 'Escape') shut(); };
  close.addEventListener('click', shut); modal.addEventListener('click', (e) => { if (e.target === modal) shut(); });
  document.addEventListener('keydown', esc);
  document.body.append(modal); close.focus();
}

export function methodVideos() {
  $$('.mvids[data-mv]').forEach((box) => {
    const keys = box.dataset.mv.split(',').map((s) => s.trim()).filter((k) => MV[k]);
    const row = h('div', { class: 'mv-row', style: '--n:' + keys.length });
    keys.forEach((k) => {
      const m = { ...MV[k] }, x = info(k); if (EN && m.en) m.name = m.title = m.en;
      const card = h('button', { class: 'mvcard ' + x.kind, type: 'button', 'aria-label': 'Videó lejátszása: ' + m.title },
        h('span', { class: 'mv-thumb', style: `background-image:url('${x.thumb}')` },
          h('span', { class: 'mv-badge' }, x.kind === 'yt' ? 'YouTube' : 'Animáció'),
          h('span', { class: 'play', html: PLAY }), h('span', { class: 'dur' }, x.dur)),
        h('b', {}, m.name), h('small', {}, x.src));
      card.addEventListener('click', () => openExt(m, x));
      row.append(card);
    });
    box.append(h('div', { class: 'mv-head' }, h('span', { class: 'k' }, 'Videók a módszerekről'), h('span', { class: 'mv-hint' }, 'Kattints egy kártyára: a videó itt nyílik meg')), row);
  });
}
