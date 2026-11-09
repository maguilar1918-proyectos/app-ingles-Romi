// Guardado local y sistema de memoria (niveles + repaso espaciado).
const Store = (() => {
  const KEY = "pasaporte.v1";
  let S;

  const fresh = () => ({
    v: 1, parrot: "", stars: 0, words: {}, days: {},
    settings: { minutes: 20, newPerDay: MAX_NEW_PER_SESSION, sound: true, calm: false, pin: "", extra: {} },
    offset: 0
  });

  function load() {
    try { S = JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch (e) { S = fresh(); }
    S.settings = Object.assign(fresh().settings, S.settings || {});
    return S;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  // Número de día local (permite simular días con offset en modo #dev).
  function dayNum(d) {
    const t = new Date(Date.now() + S.offset * 864e5);
    return Math.floor(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) / 864e5) - (d || 0);
  }

  const get = id => S.words[id];

  function introduce(id) {
    const t = dayNum();
    // Vuelve al final de la misma sesión (mini prueba) y mañana (paso 1).
    S.words[id] = { intro: t, level: 0, step: 1, due: t + INTERVALS[1], coldDays: [], fails: 0, lastFailDay: -1, lastDay: t, leech: false };
    save();
  }

  // Cierre de la sesión de introducción: la palabra vuelve mañana.
  function scheduleTomorrow(id) {
    const w = S.words[id]; if (!w) return;
    w.step = 1; w.due = dayNum() + INTERVALS[1]; save();
  }

  // Resultado de un recuerdo en frío (primer intento del día sin ayuda).
  function recordCold(id, ok) {
    const w = S.words[id]; if (!w) return;
    const t = dayNum();
    w.lastDay = t;
    if (ok) {
      if (!w.coldDays.includes(t)) w.coldDays.push(t);
      if (w.coldDays.length >= COLD_DAYS_TO_LEVEL_UP && w.level < 3) { w.level++; w.coldDays = []; }
      w.step = Math.min(w.step + 1, INTERVALS.length - 1);
      w.due = t + INTERVALS[w.step];
    } else {
      if (w.lastFailDay !== t && w.level > 0) w.level--;
      w.lastFailDay = t;
      w.coldDays = [];
      w.fails++;
      w.step = 1;            // vuelve mañana, desde el principio
      w.due = t + 1;
      if (w.fails >= 3) w.leech = true;
    }
    save();
  }

  const dueWords = () => {
    const t = dayNum();
    return WORDS.filter(x => S.words[x.id] && S.words[x.id].intro < t && S.words[x.id].due <= t)
      .sort((a, b) => S.words[a.id].due - S.words[b.id].due);
  };
  const newWords = () => {
    const t = dayNum();
    const doneToday = WORDS.filter(x => S.words[x.id] && S.words[x.id].intro === t).length;
    const left = Math.max(0, S.settings.newPerDay - doneToday);
    return WORDS.filter(x => !S.words[x.id]).slice(0, left);
  };
  const introducedToday = () => WORDS.filter(x => S.words[x.id] && S.words[x.id].intro === dayNum());

  function addMinutes(sec) {
    const k = dayNum(); const d = S.days[k] || (S.days[k] = { sec: 0, done: false });
    d.sec += sec;
  }
  function today() { return S.days[dayNum()] || { sec: 0, done: false }; }
  function markDone() { const k = dayNum(); (S.days[k] || (S.days[k] = { sec: 0 })).done = true; delete S.settings.extra[k]; save(); }
  function streak() {
    let n = 0, k = dayNum();
    if (!(S.days[k] && S.days[k].done)) k--;
    while (S.days[k] && S.days[k].done) { n++; k--; }
    return n;
  }
  const canStart = () => !today().done || !!S.settings.extra[dayNum()];

  function exportJSON() { return JSON.stringify(S); }
  function importJSON(txt) {
    const o = JSON.parse(txt);
    if (!o || o.v !== 1 || typeof o.words !== "object") throw new Error("Archivo no válido");
    S = o; load_after(); save();
  }
  function load_after() { S.settings = Object.assign(fresh().settings, S.settings || {}); }
  function reset() { S = fresh(); save(); }

  return { load, save, data: () => S, dayNum, get, introduce, scheduleTomorrow, recordCold, dueWords, newWords,
    introducedToday, addMinutes, today, markDone, streak, canStart, exportJSON, importJSON, reset };
})();
