// Pasaporte de Inglés — lógica de la sesión diaria (Etapa 1).
(() => {
  "use strict";
  Store.load();
  const S = () => Store.data();
  const $ = s => document.querySelector(s);
  const stage = $("#stage"), bubble = $("#bubble"), parrotEl = $("#parrot"), overlay = $("#overlay");
  const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);
  const pickOne = a => a[Math.floor(Math.random() * a.length)];
  const wordById = id => WORDS.find(w => w.id === id);

  /* ---------- Estado de la sesión ---------- */
  const ses = { active: false, paused: false, breaking: false, elapsed: 0, blockElapsed: 0, blockIdx: 0,
    total: 1200, blockSecs: 300, idle: 0, idleSaid: false, stars: 0, newWords: 0, timeUp: false };
  const BLOCKS = [
    { icon: "🧠", name: "Calentamiento" }, { icon: "🌟", name: "Palabras nuevas" },
    { icon: "🎮", name: "Juego" }, { icon: "✏️", name: "Escribe y cierre" }
  ];
  const blockOver = () => ses.timeUp || ses.blockElapsed >= ses.blockSecs;

  /* ---------- Utilidades de UI ---------- */
  function sleep(ms) {
    return new Promise(res => {
      let left = ms;
      const t = setInterval(() => { if (!ses.paused) left -= 100; if (left <= 0) { clearInterval(t); res(); } }, 100);
    });
  }
  function say(text, opts) {
    opts = opts || {};
    bubble.textContent = text;
    if (opts.speak !== false) Sound.speak([{ t: text, lang: "es" }].concat(opts.then || []));
  }
  function cheer() {
    parrotEl.classList.remove("cheer"); void parrotEl.offsetWidth; parrotEl.classList.add("cheer");
  }
  function applyPrefs() {
    document.body.classList.toggle("calm", !!S().settings.calm);
    $("#muteBtn").textContent = S().settings.sound ? "🔊" : "🔇";
  }
  function touch() { ses.idle = 0; ses.idleSaid = false; }
  function render(html) { stage.innerHTML = html; touch(); }
  function confetti() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || S().settings.calm) return;
    const box = $("#confetti"), set = ["🎉", "⭐", "🎊", "✨", "🌟", "🦜"];
    for (let i = 0; i < 50; i++) {
      const d = document.createElement("div"); d.className = "conf"; d.textContent = pickOne(set);
      d.style.left = Math.random() * 100 + "%"; d.style.animationDuration = 2.5 + Math.random() * 2.5 + "s";
      d.style.animationDelay = Math.random() * 1.2 + "s"; box.appendChild(d);
      setTimeout(() => d.remove(), 7000);
    }
  }
  const parrotName = () => S().parrot || "Loro";
  function star(n) { S().stars += n || 1; ses.stars += n || 1; Store.save(); Sound.sfx.star(); }

  /* ---------- Teclado en pantalla (letras grandes, sin teclado del sistema) ---------- */
  function keyboard(host, onKey) {
    const rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
    host.innerHTML = rows.map((r, i) =>
      `<div class="krow">${[...r].map(c => `<button class="key" data-k="${c}">${c}</button>`).join("")}${i === 2 ? '<button class="key wide" data-k="back" aria-label="Borrar">⌫</button>' : ""}</div>`).join("");
    host.onclick = e => { const b = e.target.closest(".key"); if (b) { Sound.sfx.tap(); touch(); onKey(b.dataset.k); } };
  }

  // Pide escribir una palabra. Resuelve "ok" | "wrong" | "idk". Con showWord (copia) solo termina al acertar.
  function askWord(w, o) {
    o = o || {};
    return new Promise(res => {
      render(`<div class="ask">
        <div class="ask-pic">${o.showWord ? `<div class="word-big">${w.en}</div>` : ""}<div class="big-emoji">${w.emoji}</div></div>
        <div class="ask-input">
          <div class="ans" id="ans"><span id="ansTxt"></span></div>
          <div id="kb" class="kb"></div>
          <div class="row">
            <button class="btn go" id="okBtn">Listo ✔</button>
            ${o.showWord ? '<button class="btn soft" id="hearBtn">🔊</button>' : '<button class="btn soft" id="idkBtn">No me acuerdo</button>'}
          </div>
        </div></div>`);
      let txt = ""; const out = $("#ansTxt"), ans = $("#ans");
      const draw = () => { out.textContent = txt; };
      const key = k => { if (k === "back") txt = txt.slice(0, -1); else if (txt.length < 12) txt += k; draw(); };
      keyboard($("#kb"), key);
      const submit = () => {
        if (!txt) return;
        document.removeEventListener("keydown", onKd);
        if (txt === w.en) { ans.classList.add("ok"); res("ok"); }
        else if (o.showWord) { document.addEventListener("keydown", onKd); txt = ""; draw(); say("¡Mira bien las letras!", { speak: false }); Sound.sfx.soft(); }
        else res("wrong");
      };
      function onKd(e) {
        if (e.key === "Enter") submit();
        else if (e.key === "Backspace") key("back");
        else if (/^[a-z]$/i.test(e.key)) key(e.key.toLowerCase());
      }
      document.addEventListener("keydown", onKd);
      $("#okBtn").onclick = submit;
      const idk = $("#idkBtn"); if (idk) idk.onclick = () => { document.removeEventListener("keydown", onKd); res("idk"); };
      const hear = $("#hearBtn"); if (hear) hear.onclick = () => Sound.word(w);
      if (o.autoSpeak) Sound.word(w);
    });
  }

  /* ---------- Bloque 1: calentamiento en frío ---------- */
  const PRAISE_COLD = ["¡Lo recordaste sin ayuda! Tu memoria se hace fuerte.", "¡Sin pistas y lo lograste! Repasar funciona.",
    "¡Wow! Te acordaste tú solita."];
  const HELP_MSG = ["¡Casi! Mira cómo se escribe.", "Está bien, así se aprende. Mírala bien."];

  async function coldTask(w) {
    say("¿Cómo se dice? Dilo y escríbelo.");
    const r = await askWord(w);
    if (r === "ok") {
      Store.recordCold(w.id, true); star(); cheer(); Sound.sfx.good();
      say(pickOne(PRAISE_COLD), { speak: false }); Sound.word(w); await sleep(1700);
    } else {
      Store.recordCold(w.id, false); Sound.sfx.soft();
      say(pickOne(HELP_MSG), { then: [{ t: w.en, lang: "en" }] });
      await sleep(2200);
      say("Ahora escríbela tú.", { speak: false });
      await askWord(w, { showWord: true, autoSpeak: true });
      Sound.sfx.good(); star(); cheer();
      say("¡Muy bien! Lo volviste a intentar. Mañana la repasamos.", { speak: false }); await sleep(1800);
    }
  }
  async function blockCold() {
    const q = Store.dueWords().slice(0, MAX_COLD_PER_SESSION);
    if (!q.length) { say("Hoy no hay repaso. ¡Vamos con algo nuevo!"); render(`<div class="big-emoji">🌱</div>`); await sleep(2600); return; }
    for (const w of q) { if (blockOver()) break; await coldTask(w); }
  }

  /* ---------- Bloque 2: palabras nuevas (ver, oír, decir, escribir) ---------- */
  function nextBtn(label) {
    return new Promise(res => {
      const b = document.createElement("button"); b.className = "btn go"; b.textContent = label;
      b.onclick = () => res(); stage.querySelector(".row").appendChild(b);
    });
  }
  async function newWordTask(w) {
    render(`<div class="card"><div class="big-emoji">${w.emoji}</div><div class="word-big">${w.en}</div>
      <div class="es-small">${w.es}</div><div class="hook">🦜 ${w.hook}</div>
      <div class="row"><button class="btn soft" id="hear">🔊 Escuchar</button></div></div>`);
    say("Mira y escucha.", { then: [{ t: w.en, lang: "en" }] });
    $("#hear").onclick = () => Sound.word(w);
    await nextBtn("Siguiente ➜");
    render(`<div class="card"><div class="big-emoji">${w.emoji}</div><div class="word-big">${w.en}</div>
      <div class="row"><button class="btn soft" id="hear">🔊</button></div></div>`);
    say("Dilo en voz alta, tres veces.");
    $("#hear").onclick = () => Sound.word(w);
    await nextBtn("¡Lo dije! 🗣️");
    star(); Sound.sfx.good();
    say("Ahora escríbela copiando.", { speak: true });
    await askWord(w, { showWord: true, autoSpeak: true });
    if (!Store.get(w.id)) { Store.introduce(w.id); ses.newWords++; }
    star(); cheer(); Sound.sfx.good();
    say("¡Palabra nueva en tu jardín!", { speak: true }); await sleep(1500);
  }
  async function blockNew() {
    const q = Store.newWords();
    if (!q.length) { say("¡Hoy toca repasar lo que sabes!"); await sleep(1800); return; }
    for (const w of q) { if (ses.timeUp) break; await newWordTask(w); }
  }

  /* ---------- Bloque 3: juego «Escucha y toca» ---------- */
  function gamePool() {
    let pool = WORDS.filter(w => Store.get(w.id));
    if (pool.length < 3) pool = pool.concat(shuffle(WORDS.filter(w => !Store.get(w.id)))).slice(0, 3);
    return pool;
  }
  async function gameRound(target, pool) {
    const opts = shuffle([target, ...shuffle(pool.filter(w => w !== target)).slice(0, 2)]);
    render(`<div class="card"><p class="instr">Toca lo que escuchas</p>
      <div class="row"><button class="btn soft" id="hear">🔊 Otra vez</button></div>
      <div class="choices">${opts.map((w, i) => `<button class="choice" data-i="${i}">${w.emoji}</button>`).join("")}</div></div>`);
    say("Escucha y toca.", { speak: false });
    Sound.word(target);
    $("#hear").onclick = () => Sound.word(target);
    let tries = 0;
    await new Promise(res => {
      stage.querySelectorAll(".choice").forEach(b => b.onclick = () => {
        touch();
        if (opts[+b.dataset.i] === target) {
          b.classList.add("good"); Sound.sfx.good(); star(); cheer();
          say(tries ? "¡Eso! Lo intentaste otra vez." : "¡Rápido y correcto!", { speak: false });
          stage.querySelectorAll(".choice").forEach(x => x.disabled = true);
          setTimeout(res, 1200);
        } else {
          tries++; b.classList.add("miss"); b.disabled = true; Sound.sfx.soft();
          say("Casi. Escucha otra vez.", { speak: false }); Sound.word(target);
        }
      });
    });
  }
  async function blockGame() {
    const pool = gamePool(); let n = 0;
    const targets = shuffle(pool);
    while (!blockOver() && n < 10) { await gameRound(targets[n % targets.length], pool); n++; }
  }

  /* ---------- Bloque 4: arma la palabra + mini prueba ---------- */
  async function buildTask(w) {
    render(`<div class="card"><div class="big-emoji">${w.emoji}</div>
      <div class="slots" id="slots"></div><div class="tiles" id="tiles"></div>
      <div class="row"><button class="btn soft" id="hear">🔊</button></div></div>`);
    say("Escucha y arma la palabra.", { speak: false }); Sound.word(w);
    $("#hear").onclick = () => Sound.word(w);
    const letters = [...w.en]; let pos = 0;
    $("#slots").innerHTML = letters.map(() => `<div class="slot"></div>`).join("");
    const tiles = shuffle(letters.map((c, i) => ({ c, i })));
    $("#tiles").innerHTML = tiles.map((t, k) => `<button class="tile" data-k="${k}">${t.c}</button>`).join("");
    await new Promise(res => {
      stage.querySelectorAll(".tile").forEach(b => b.onclick = () => {
        touch(); const t = tiles[+b.dataset.k];
        if (t.c === letters[pos]) {
          $("#slots").children[pos].textContent = t.c; b.classList.add("used"); pos++; Sound.sfx.tap();
          if (pos === letters.length) { Sound.sfx.good(); star(); cheer(); say("¡Armaste " + w.en + "!", { speak: false }); setTimeout(res, 1200); }
        } else { b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); Sound.sfx.soft(); }
      });
    });
  }
  async function blockWrite() {
    const today = Store.introducedToday();
    const extra = shuffle(WORDS.filter(w => Store.get(w.id) && !today.includes(w))).slice(0, 2);
    const list = today.concat(extra);
    for (const w of list) { if (ses.timeUp) break; await buildTask(w); }
    // Mini prueba final: recuerdo inmediato de las palabras nuevas de hoy.
    if (today.length) {
      say("¡Mini prueba! Las palabras nuevas de hoy.");
      await sleep(2000);
      for (const w of shuffle(today)) {
        say("¿Cómo se dice? Dilo y escríbelo.");
        const r = await askWord(w);
        if (r === "ok") { star(); cheer(); Sound.sfx.good(); say("¡La recuerdas! Mañana la vemos otra vez.", { speak: false }); Sound.word(w); await sleep(1600); }
        else {
          Sound.sfx.soft(); say(pickOne(HELP_MSG), { then: [{ t: w.en, lang: "en" }] }); await sleep(2200);
          await askWord(w, { showWord: true, autoSpeak: true }); star(); Sound.sfx.good();
          say("¡Muy bien! Mañana la repasamos.", { speak: false }); await sleep(1500);
        }
      }
    }
  }

  /* ---------- Pausa activa ---------- */
  const BREAKS = ["¡Salta diez veces como un loro!", "¡Estira los brazos como alas!", "¡Baila conmigo!", "¡Toca tus pies y sacude las manos!"];
  async function activeBreak() {
    ses.breaking = true; let left = 30, skip = false;
    render(`<div class="break">🦜</div><div class="count" id="cnt">30</div>
      <div class="row"><button class="btn soft" id="skip" hidden>Seguir ➜</button></div>`);
    say("Pausa activa. " + pickOne(BREAKS));
    $("#skip").onclick = () => { skip = true; };
    while (left > 0 && !skip) {
      await sleep(1000); left--; const c = $("#cnt"); if (c) c.textContent = left;
      if (left === 20 && $("#skip")) $("#skip").hidden = false;
    }
    ses.breaking = false;
  }

  /* ---------- Reloj, pausa, reenganche ---------- */
  const fmt = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  let lastT = performance.now(), lastSave = 0;
  setInterval(() => {
    const now = performance.now(), dt = (now - lastT) / 1000; lastT = now;
    if (!ses.active || ses.paused) return;
    ses.idle += dt;
    if (ses.idle > 10 && !ses.idleSaid) { ses.idleSaid = true; say("¿Sigues ahí? ¡Tú puedes, vamos!"); cheer(); }
    if (ses.breaking) return;
    ses.elapsed += dt; ses.blockElapsed += dt; Store.addMinutes(dt);
    if (ses.elapsed >= ses.total) ses.timeUp = true;
    $("#clock").textContent = fmt(ses.total - ses.elapsed);
    $("#blockBar").style.width = Math.max(0, 100 - (ses.blockElapsed / ses.blockSecs) * 100) + "%";
    if (now - lastSave > 5000) { lastSave = now; Store.save(); }
  }, 250);

  function setPaused(p) {
    ses.paused = p; lastT = performance.now();
    if (p) {
      Sound.stop();
      overlay.hidden = false;
      overlay.innerHTML = `<div style="font-size:90px">😴</div><h2>Pausa</h2><button class="btn hero" id="resume">Seguir</button>`;
      $("#resume").onclick = () => setPaused(false);
    } else { overlay.hidden = true; overlay.innerHTML = ""; touch(); }
  }
  $("#pauseBtn").onclick = () => ses.active && setPaused(true);
  $("#muteBtn").onclick = () => { S().settings.sound = !S().settings.sound; Store.save(); applyPrefs(); if (!S().settings.sound) Sound.stop(); };

  function drawPips() {
    $("#pips").innerHTML = BLOCKS.map((b, i) =>
      `<div class="pip ${i < ses.blockIdx ? "done" : i === ses.blockIdx ? "on" : ""}" title="${b.name}">${i < ses.blockIdx ? "✓" : b.icon}</div>`).join("");
  }

  /* ---------- Sesión completa ---------- */
  async function runSession() {
    const mins = S().settings.minutes + 0;
    Object.assign(ses, { active: true, paused: false, breaking: false, elapsed: 0, blockIdx: 0, blockElapsed: 0, idle: 0,
      total: mins * 60, blockSecs: mins * 15, stars: 0, newWords: 0, timeUp: false });
    $("#topbar").hidden = false; $("#gear")?.remove();
    const runners = [blockCold, blockNew, blockGame, blockWrite];
    for (let i = 0; i < 4 && !ses.timeUp; i++) {
      ses.blockIdx = i; ses.blockElapsed = 0; drawPips();
      await runners[i]();
      if (i < 3 && !ses.timeUp) await activeBreak();
    }
    ses.blockIdx = 4; drawPips();
    await finish();
  }
  async function finish() {
    ses.active = false; Store.markDone(); Store.save();
    $("#topbar").hidden = true;
    Sound.sfx.win(); confetti(); cheer();
    say(`¡Lo lograste! Hoy ganaste ${ses.stars} estrellas. ¡Nos vemos mañana!`);
    render(`<div class="big-emoji">🏆</div><div class="home-meta"><span class="chip">⭐ ${ses.stars} hoy</span>
      <span class="chip">🌱 ${ses.newWords} palabras nuevas</span><span class="chip">🔥 ${Store.streak()} días</span></div>
      <div class="row"><button class="btn go" id="bye">Terminar</button></div>`);
    $("#bye").onclick = () => { home(); };
  }

  /* ---------- Inicio y nombre del loro ---------- */
  function greeting() {
    const n = parrotName();
    const g = [`¡Hola, exploradora! Soy ${n}. ¿Lista para volar?`, `¡Buenos días! ${n} trae una sorpresa.`,
      `¡Hola, hola! ${n} te extrañó mucho.`, `¡Mira quién llegó! ¡Vamos a jugar con palabras!`,
      `¡${n} está listo! ¿Y tú?`, `¡Qué alegría verte! Hoy aprendemos jugando.`, `¡Cuac no, soy loro! ¡Hola! ¿Empezamos?`];
    return g[Store.dayNum() % g.length];
  }
  function askName() {
    return new Promise(res => {
      render(`<div class="card"><p class="instr">¿Cómo se llama el loro?</p>
        <div class="ans" id="ans"><span id="ansTxt"></span></div><div id="kb" class="kb"></div>
        <div class="row"><button class="btn go" id="okName">Listo ✔</button></div></div>`);
      say("¡Hola! Aún no tengo nombre. ¿Me pones uno?");
      let t = ""; const out = $("#ansTxt");
      keyboard($("#kb"), k => { if (k === "back") t = t.slice(0, -1); else if (t.length < 12) t += k; out.textContent = t; });
      $("#okName").onclick = () => {
        if (!t) return;
        S().parrot = t[0].toUpperCase() + t.slice(1); Store.save(); res();
      };
    });
  }
  async function home() {
    ses.active = false; $("#topbar").hidden = true; applyPrefs();
    if (!S().parrot) await askName();
    const can = Store.canStart();
    render(`<div class="home-meta"><span class="chip">⭐ ${S().stars}</span><span class="chip">🔥 ${Store.streak()}</span></div>
      <div class="big-emoji">${can ? "🌟" : "🌙"}</div>
      ${can ? `<button class="btn hero" id="start">¡Empezar!</button>` : `<p class="instr">¡Ya practicaste hoy! Mañana más.</p>`}
      <button id="gear" aria-label="Padres">⚙️</button>`);
    say(can ? greeting() : `¡Qué gran trabajo hoy! ${parrotName()} te espera mañana.`);
    if (can) $("#start").onclick = () => { Sound.sfx.good(); runSession(); };
    setupGear();
  }

  /* ---------- Panel de padres (Etapa 4 lo amplía) ---------- */
  function setupGear() {
    const g = $("#gear"); let timer;
    const down = e => { e.preventDefault(); timer = setTimeout(parents, 1500); };
    const up = () => clearTimeout(timer);
    g.addEventListener("pointerdown", down); g.addEventListener("pointerup", up); g.addEventListener("pointerleave", up);
  }
  function pinPad(title) {
    return new Promise(res => {
      let v = "";
      overlay.hidden = false;
      overlay.innerHTML = `<h2>${title}</h2><div class="dots" id="dots"></div>
        <div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, "✕", 0, "⌫"].map(k => `<button class="btn soft" data-k="${k}">${k}</button>`).join("")}</div>`;
      const dots = () => { $("#dots").textContent = "●".repeat(v.length) + "○".repeat(4 - v.length); }; dots();
      overlay.querySelector(".keypad").onclick = e => {
        const k = e.target.closest("button")?.dataset.k; if (k === undefined) return;
        if (k === "✕") { overlay.hidden = true; overlay.innerHTML = ""; res(null); return; }
        if (k === "⌫") v = v.slice(0, -1); else if (v.length < 4) v += k;
        dots(); if (v.length === 4) setTimeout(() => res(v), 150);
      };
    });
  }
  async function parents() {
    let pin = S().settings.pin;
    if (!pin) {
      const a = await pinPad("Crea un PIN de 4 números"); if (!a) return;
      const b = await pinPad("Repite el PIN"); if (!b) return;
      if (a !== b) { overlay.hidden = true; return; }
      S().settings.pin = a; Store.save();
    } else {
      const a = await pinPad("PIN de padres"); if (!a) return;
      if (a !== pin) { overlay.hidden = true; overlay.innerHTML = ""; return; }
    }
    panel();
  }
  async function panel() {
    const t = Store.dayNum();
    const days = [6, 5, 4, 3, 2, 1, 0].map(i => { const d = S().days[t - i]; return `<td>${d ? Math.round(d.sec / 60) : 0} min</td>`; }).join("");
    const rows = WORDS.map(w => { const s = Store.get(w.id);
      return `<tr><td>${w.emoji} ${w.en}</td><td>${s ? `<span class="lvl lvl${s.level}">${LEVELS[s.level]}</span>` : "—"}</td><td>${s ? s.fails : 0}${s && s.leech ? " 🩸" : ""}</td></tr>`; }).join("");
    overlay.hidden = false;
    overlay.innerHTML = `<div class="panel"><h2 style="color:#2B3A55">Panel de padres</h2>
      <p>Racha: <b>${Store.streak()}</b> días · Estrellas: <b>${S().stars}</b></p>
      <h3>Minutos (últimos 7 días)</h3><table><tr>${days}</tr></table>
      <h3>Palabras</h3><table><tr><th>Palabra</th><th>Nivel</th><th>Fallos</th></tr>${rows}</table>
      <h3>Ajustes</h3>
      <p><label>Duración (min): <select id="mins">${[10, 15, 20, 25, 30].map(m => `<option ${m === S().settings.minutes ? "selected" : ""}>${m}</option>`).join("")}</select></label>
      &nbsp; <label><input type="checkbox" id="calm" ${S().settings.calm ? "checked" : ""}> Modo calma</label></p>
      <p><button class="btn soft" id="extra">Dar tiempo extra hoy</button> <button class="btn soft" id="exp">Respaldar</button>
      <label class="btn soft" style="display:inline-block">Restaurar<input type="file" id="imp" accept=".json" hidden></label></p>
      <p id="upd"></p>
      ${location.hash === "#dev" ? '<p><button class="btn soft" id="nextday">(Prueba) Avanzar un día</button></p>' : ""}
      <p><button class="btn soft" id="reset">Reiniciar progreso</button> <button class="btn go" id="close">Cerrar</button></p>
      <p style="font-size:13px">Herramienta de apoyo al aprendizaje; no es una terapia ni reemplaza a su especialista.</p></div>`;
    $("#mins").onchange = e => { S().settings.minutes = +e.target.value; Store.save(); };
    $("#calm").onchange = e => { S().settings.calm = e.target.checked; Store.save(); applyPrefs(); };
    $("#extra").onclick = () => { S().settings.extra[t] = true; Store.save(); $("#extra").textContent = "¡Listo! ✔"; };
    $("#exp").onclick = () => {
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([Store.exportJSON()], { type: "application/json" }));
      a.download = "pasaporte-respaldo-" + new Date().toISOString().slice(0, 10) + ".json"; a.click();
    };
    $("#imp").onchange = async e => {
      try { Store.importJSON(await e.target.files[0].text()); location.reload(); } catch (err) { alert("Ese archivo no sirve."); }
    };
    const nd = $("#nextday"); if (nd) nd.onclick = () => { S().offset++; Store.save(); panel(); };
    $("#reset").onclick = () => { if (confirm("¿Borrar TODO el progreso?")) { Store.reset(); location.reload(); } };
    $("#close").onclick = () => { overlay.hidden = true; overlay.innerHTML = ""; home(); };
    // Aviso suave de nueva versión: solo aquí, nunca durante la sesión.
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) { try { await reg.update(); } catch (e) {}
        if (reg.waiting && $("#upd")) {
          $("#upd").innerHTML = '<button class="btn go" id="upBtn">Hay una versión nueva · Actualizar</button>';
          $("#upBtn").onclick = () => reg.waiting.postMessage("SKIP_WAITING");
        } }
    }
  }

  /* ---------- Arranque ---------- */
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => { if (reloading || ses.active) return; reloading = true; location.reload(); });
  }
  ["pointerdown", "keydown"].forEach(ev => document.addEventListener(ev, touch, true));
  home();
})();
