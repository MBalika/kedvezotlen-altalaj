import { $, $$, h } from './util.js';
import { QUIZ, DETECTIVE, TF } from './data.js';

export function quizzes() { $$('.quiz[data-quiz]').forEach(buildQuiz); }
function buildQuiz(box) {
  const qs = QUIZ[box.dataset.quiz]; if (!qs) return;
  box.innerHTML = '';
  let right = 0, done = 0;
  const score = h('div', { class: 'quiz-score' });
  qs.forEach(([q, opts, ans, exp], i) => {
    const exEl = h('p', { class: 'q-exp' });
    const optBox = h('div', { class: 'q-opts' });
    const card = h('div', { class: 'q' }, h('div', { class: 'q-head' }, h('span', { class: 'n' }, String(i + 1).padStart(2, '0')), h('p', {}, q)), optBox, exEl);
    const btns = opts.map((o, k) => { const b = h('button', { type: 'button' }, o); b.addEventListener('click', () => {
      if (card.dataset.done) return; card.dataset.done = '1'; done++;
      btns.forEach(x => x.disabled = true);
      if (k === ans) { b.classList.add('right'); right++; } else { b.classList.add('wrong'); btns[ans].classList.add('right'); }
      exEl.innerHTML = ''; exEl.append(h('b', {}, k === ans ? 'Helyes. ' : 'Nem egészen. '), exp); upd();
    }); optBox.append(b); return b; });
    box.append(card);
  });
  const reset = h('button', { class: 'btn small', type: 'button' }, 'Újrakezdés');
  reset.addEventListener('click', () => buildQuiz(box));
  function upd() { score.innerHTML = ''; score.append(h('span', {}, `${right} / ${qs.length} helyes${done === qs.length && right === qs.length ? ' · Hibátlan!' : ''}`), h('div', { class: 'bar' }, h('i', { style: `width:${right / qs.length * 100}%` })), ...(done === qs.length ? [reset] : [])); }
  upd(); box.append(score);
}

export function detective() {
  const box = $('#detGame'); if (!box) return;
  const names = ['Térfogatváltozó agyag', 'Roskadékony talaj', 'Feltöltés', 'Szerves talaj'];
  let right = 0;
  DETECTIVE.forEach(([t, ans, exp], i) => {
    const fb = h('p', { class: 'small muted' });
    const opts = h('div', { class: 'det-opts' });
    const card = h('div', { class: 'det-card' }, h('p', {}, h('b', { class: 'mono', style: 'color:var(--muted);margin-right:8px' }, '#' + (i + 1)), t), opts, fb);
    const bs = names.map((n, k) => { const b = h('button', { type: 'button' }, n); b.addEventListener('click', () => {
      if (card.dataset.done) return; card.dataset.done = '1';
      if (k === ans) { b.classList.add('right'); right++; } else { b.classList.add('wrong'); bs[ans].classList.add('right'); }
      fb.textContent = exp; score();
    }); opts.append(b); return b; });
    box.append(card);
  });
  function score() { const el = $('#detScore'); el.innerHTML = ''; el.append(h('span', {}, `${right} / ${DETECTIVE.length} eset megoldva`), h('div', { class: 'bar' }, h('i', { style: `width:${right / DETECTIVE.length * 100}%` }))); }
  score();
}

export function trueFalse() {
  const box = $('#tfGame'); if (!box) return;
  let order, idx, res;
  function start() { order = TF.map((_, i) => i).sort(() => Math.random() - 0.5); idx = 0; res = []; render(); }
  function render() {
    box.innerHTML = '';
    const card = h('div', { class: 'tf-card' });
    const dots = h('div', { class: 'tf-dots' }, ...order.map((_, i) => h('i', { class: (res[i] === true ? 'ok' : res[i] === false ? 'no' : '') + (i === idx ? ' cur' : '') })));
    if (idx >= order.length) {
      const ok = res.filter(Boolean).length; const pct = Math.round(ok / order.length * 100);
      card.append(h('div', { class: 'tf-meta' }, h('span', {}, 'Eredmény')),
        h('div', { class: 'tf-stmt' }, `${ok} / ${order.length} helyes válasz (${pct}%)`),
        h('p', { class: 'muted' }, pct >= 90 ? 'Kiváló! Ezzel a tudással nyugodtan alapozhatsz kedvezőtlen talajra is.' : pct >= 70 ? 'Jó eredmény. Nézd át azokat a fejezeteket, ahol hibáztál.' : 'Érdemes még egyszer átnézni a fejezeteket, majd újra próbálkozni.'),
        h('div', { class: 'tf-btns' }, h('button', { type: 'button', onclick: start }, 'Újrakezdés')), dots);
      box.append(card); return;
    }
    const [stmt, val, exp] = TF[order[idx]];
    const fb = h('div', {});
    const next = h('button', { class: 'btn primary', type: 'button', style: 'margin-top:14px', hidden: true }, idx === order.length - 1 ? 'Eredmény' : 'Következő állítás →');
    next.addEventListener('click', () => { idx++; render(); });
    const answer = (v) => {
      if (res[idx] !== undefined) return; const ok = v === val; res[idx] = ok;
      fb.className = 'tf-fb ' + (ok ? 'ok' : 'no'); fb.innerHTML = ''; fb.append(h('b', {}, (ok ? 'Helyes! ' : 'Nem jó. ') + (val ? 'Igaz.' : 'Hamis.') + ' '), exp);
      next.hidden = false; $$('.tf-btns button', card).forEach(b => b.disabled = true);
      dots.children[idx].className = ok ? 'ok cur' : 'no cur'; next.focus();
    };
    const ok = res.filter(Boolean).length;
    card.append(h('div', { class: 'tf-meta' }, h('span', {}, `${idx + 1}. állítás / ${order.length}`), h('span', {}, `${ok} helyes eddig`)),
      h('div', { class: 'tf-stmt' }, stmt),
      h('div', { class: 'tf-btns' }, h('button', { type: 'button', class: 't', onclick: () => answer(true) }, 'Igaz'), h('button', { type: 'button', class: 'f', onclick: () => answer(false) }, 'Hamis')),
      fb, next, dots);
    box.append(card);
  }
  start();
}
