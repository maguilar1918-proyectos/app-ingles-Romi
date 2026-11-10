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
    total: 1200, blockSecs: 300, idle: 0, idleSaid: false, stars: 0, newWords: 0, timeUp: false, hints: 3, change: false, pref: null };
  const MAX_HINTS = 3; // ayudas «No me acuerdo» por sesión
  const hintsEn = () => ses.hints === 0 ? " You have no hints left." : ses.hints === 1 ? " You have 1 hint left." : ` You have ${ses.hints} hints left.`;
  function sayHelp(r, w) {
    const es = pickOne(HELP_MSG);
    say(es + (r === "idk" ? hintsText() : ""), { then: [{ t: w.en, lang: "en" }], en: EN[es] + (r === "idk" ? hintsEn() : "") });
  }
  const hintsText = () => ses.hints === 0 ? " Ya no te quedan ayudas." : ses.hints === 1 ? " Te queda 1 ayuda." : ` Te quedan ${ses.hints} ayudas.`;
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
  /* ---------- Inglés principal + español como subtítulo ---------- */
  const EN = {
 "¿Cómo se dice? Dilo y escríbelo.": "How do you say it? Say it and write it.",
 "¡Mira bien las letras!": "Look at the letters!",
 "¡Lo recordaste sin ayuda! Tu memoria se hace fuerte.": "You remembered it without help! Your memory is getting strong.",
 "¡Sin pistas y lo lograste! Repasar funciona.": "No hints and you did it! Reviewing works.",
 "¡Wow! Te acordaste tú solita.": "Wow! You remembered it all by yourself.",
 "¡Casi! Mira cómo se escribe.": "Almost! Look at how it is written.",
 "Está bien, así se aprende. Mírala bien.": "That is okay, that is how we learn. Look at it closely.",
 "Ahora escríbela tú.": "Now write it yourself.",
 "¡Muy bien! Lo volviste a intentar. Mañana la repasamos.": "Very good! You tried again. We will review it tomorrow.",
 "Hoy no hay repaso. ¡Vamos con algo nuevo!": "No review today. Let us do something new!",
 "Mira y escucha.": "Look and listen.",
 "Dilo en voz alta, tres veces.": "Say it out loud, three times.",
 "Ahora escríbela copiando.": "Now copy it and write it.",
 "¡Palabra nueva en tu jardín!": "A new word in your garden!",
 "Escucha y repite en voz alta.": "Listen and repeat out loud.",
 "¡Qué bien suena! Tres veces.": "That sounds great! Three times.",
 "¡Otra vez, más fuerte!": "Again, louder!",
 "¡Una más!": "One more!",
 "¡Bien escrita!": "Well written!",
 "¡Muy bien!": "Very good!",
 "Mira bien las letras.": "Look at the letters.",
 "¡Ahora escríbela tú!": "Now you write it!",
 "Pasa el dedo sobre las letras.": "Trace the letters with your finger.",
 "¡Qué bonito trazo!": "Nice tracing!",
 "¿Qué letras faltan?": "Which letters are missing?",
 "Toca las palabras en orden.": "Tap the words in order.",
 "¡Escribiste una oración!": "You wrote a sentence!",
 "Mira bien. ¡Se van a esconder!": "Look closely. They will hide!",
 "¿Dónde están las parejas?": "Where are the pairs?",
 "¡Todas las parejas!": "All the pairs!",
 "Casi. ¡Prueba otra vez!": "Almost. Try again!",
 "Escucha y escribe.": "Listen and write.",
 "¡Hoy toca repasar lo que sabes!": "Today we review what you know!",
 "Lee y toca.": "Read and tap.",
 "Escucha y toca.": "Listen and tap.",
 "¡Eso! Lo intentaste otra vez.": "Yes! You tried again.",
 "¡Rápido y correcto!": "Fast and correct!",
 "Casi. Inténtalo otra vez.": "Almost. Try again.",
 "Escucha y arma la palabra.": "Listen and build the word.",
 "¡Mini prueba! Las palabras nuevas de hoy.": "Mini quiz! Today's new words.",
 "¡La recuerdas! Mañana la vemos otra vez.": "You remember it! We will see it again tomorrow.",
 "¡Muy bien! Mañana la repasamos.": "Very good! We will review it tomorrow.",
 "¡Salta diez veces como un loro!": "Jump ten times like a parrot!",
 "¡Estira los brazos como alas!": "Stretch your arms like wings!",
 "¡Baila conmigo!": "Dance with me!",
 "¡Toca tus pies y sacude las manos!": "Touch your toes and shake your hands!",
 "¿Sigues ahí? ¡Tú puedes, vamos!": "Are you still there? You can do it, let us go!",
 "¡Bonus! Cinco minutos más. ¡Vamos!": "Bonus! Five more minutes. Let us go!",
 "¡Hola! Aún no tengo nombre. ¿Me pones uno?": "Hi! I do not have a name yet. Can you give me one?",
 "¡Mira quién llegó! ¡Vamos a jugar con palabras!": "Look who is here! Let us play with words!",
 "¡Qué alegría verte! Hoy aprendemos jugando.": "So happy to see you! Today we learn by playing.",
 "¡Cuac no, soy loro! ¡Hola! ¿Empezamos?": "Quack no, I am a parrot! Hello! Shall we start?",
 "¿Qué nombre nuevo le ponemos al loro?": "What new name shall we give the parrot?",
 "¿Cómo quieres llamarme ahora?": "What do you want to call me now?",
 "Cancelar": "Cancel",
 "¿Qué quieres practicar?": "What do you want to practice?",
 "Tú eliges. ¿Qué quieres practicar?": "You choose. What do you want to practice?",
 "¡Listo! Cambiamos de ejercicio al terminar este.": "Okay! We will change the exercise when this one ends.",
 "Sorpréndeme": "Surprise me",
 "Hablar": "Speak",
 "Completar": "Complete",
 "Mirar y escribir": "Look and write",
 "Pares": "Pairs",
 "Oraciones": "Sentences",
 "Leer": "Read",
 "Trazar": "Trace",
 "Armar": "Build",
 "Escribir al oído": "Write what you hear",
 "Escuchar": "Listen",
 "Otra vez": "Again",
 "Listo ✔": "Done ✔",
 "No me acuerdo": "I do not remember",
 "🧽 Borrar": "🧽 Erase",
 "Siguiente ➜": "Next ➜",
 "Seguir ➜": "Go on ➜",
 "Seguir": "Continue",
 "Pausa": "Pause",
 "Une la imagen con su palabra": "Match the picture with its word",
 "Toca la palabra": "Tap the word",
 "Toca lo que escuchas": "Tap what you hear",
 "¡Empezar!": "Let us start!",
 "¡Ya practicaste hoy! Mañana más.": "You practiced today! More tomorrow.",
 "Seguir practicando ➜": "Keep practicing ➜",
 "Terminar": "Finish",
 "¿Cómo se llama el loro?": "What is the parrot's name?",
 "Traza con el dedo": "Trace with your finger",
 "Completa la palabra": "Complete the word",
 "Arma la oración": "Build the sentence",
 "Memoria de pares": "Memory pairs",
 "Escucha y arma": "Listen and build"
};
  // HTML bilingüe: inglés grande, español pequeño debajo.
  const bi = es => EN[es] ? `<span class="en">${EN[es]}</span><small class="es">${es}</small>` : es;
  function say(text, opts) {
    opts = opts || {};
    const en = opts.en || EN[text];
    bubble.innerHTML = en ? `<span class="en">${en}</span><small class="es">${text}</small>` : text;
    if (opts.speak !== false) Sound.speak([en ? { t: en, lang: "en" } : { t: text, lang: "es" }].concat(opts.then || []));
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
        <div class="ask-pic">${o.showWord ? `<div class="word-big">${w.en}</div>` : ""}<div class="big-emoji">${o.hidePic ? "🔊" : w.emoji}</div></div>
        <div class="ask-input">
          <div class="ans" id="ans"><span id="ansTxt"></span></div>
          <div id="kb" class="kb"></div>
          <div class="row">
            <button class="btn go" id="okBtn">${bi("Listo ✔")}</button>
            ${o.showWord ? '<button class="btn soft" id="hearBtn">🔊</button>' : `<button class="btn soft" id="idkBtn" ${ses.hints > 0 ? "" : "disabled"}>${bi("No me acuerdo")} · 💡 ${ses.hints}</button>`}
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
      const idk = $("#idkBtn"); if (idk) idk.onclick = () => { if (ses.hints <= 0) return; ses.hints--; document.removeEventListener("keydown", onKd); res("idk"); };
      const hear = $("#hearBtn"); if (hear) hear.onclick = () => Sound.word(w);
      if (o.hidePic) $(".ask-pic").onclick = () => Sound.word(w);
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
      sayHelp(r, w);
      await sleep(r === "idk" ? 3600 : 2200);
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
    render(`<div class="card">${tag(CATEGORIES[w.cat].icon + " " + CATEGORIES[w.cat].label + " · New word")}<div class="big-emoji" style="font-size:clamp(80px,20vmin,150px)">${w.emoji}</div><div class="word-big">${w.en}</div>
      <div class="es-small">${w.es}</div><div class="hook">🦜 ${w.hook}</div>
      <div class="row"><button class="btn soft" id="hear">🔊 ${bi("Escuchar")}</button></div></div>`);
    say("Mira y escucha.", { then: [{ t: w.en, lang: "en" }] });
    $("#hear").onclick = () => Sound.word(w);
    await nextBtn("Next ➜");
    render(`<div class="card"><div class="big-emoji">${w.emoji}</div><div class="word-big">${w.en}</div>
      <div class="row"><button class="btn soft" id="hear">🔊</button></div></div>`);
    say("Dilo en voz alta, tres veces.");
    $("#hear").onclick = () => Sound.word(w);
    await nextBtn("I said it! 🗣️");
    star(); Sound.sfx.good();
    await traceTask(w);
    say("Ahora escríbela copiando.", { speak: true });
    await askWord(w, { showWord: true, autoSpeak: true });
    if (!Store.get(w.id)) { Store.introduce(w.id); ses.newWords++; }
    star(); cheer(); Sound.sfx.good();
    say("¡Palabra nueva en tu jardín!", { speak: true }); await sleep(1500);
  }
  // Palabras para practicar: primero las de hoy, luego las más débiles.
  let cyc = 0;
  function nextWord() {
    const today = Store.introducedToday();
    const rest = WORDS.filter(w => Store.get(w.id) && !today.includes(w)).sort((a, b) => Store.get(a.id).level - Store.get(b.id).level);
    const p = today.concat(rest);
    return p.length ? p[(cyc++) % p.length] : null;
  }
  // Hablar: escucha y repite 3 veces en voz alta.
  async function sayTask(w) {
    render(`<div class="card"><div class="big-emoji">${w.emoji}</div><div class="word-big">${w.en}</div>
      <div class="row"><button class="btn soft" id="hear">🔊 ${bi("Escuchar")}</button><button class="btn go" id="said">I said it! 🗣️ 0/3</button></div></div>`);
    say("Escucha y repite en voz alta.", { then: [{ t: w.en, lang: "en" }] });
    $("#hear").onclick = () => Sound.word(w);
    let n = 0;
    await new Promise(res => { $("#said").onclick = () => {
      n++; Sound.sfx.tap(); $("#said").textContent = `I said it! 🗣️ ${n}/3`;
      if (n >= 3) { star(); cheer(); Sound.sfx.good(); say("¡Qué bien suena! Tres veces.", { speak: false }); setTimeout(res, 1100); }
      else say(n === 1 ? "¡Otra vez, más fuerte!" : "¡Una más!", { speak: false });
    }; });
  }
  // Escritura con ayuda: si falla, ve la palabra y la vuelve a escribir (sin castigo).
  async function writeTask(w, o) {
    const r = await askWord(w, o);
    if (r === "ok") { star(); cheer(); Sound.sfx.good(); say("¡Bien escrita!", { speak: false }); Sound.word(w); await sleep(1300); }
    else {
      Sound.sfx.soft(); sayHelp(r, w); await sleep(r === "idk" ? 3600 : 2200);
      await askWord(w, { showWord: true, autoSpeak: true }); star(); Sound.sfx.good();
      say("¡Muy bien!", { speak: false }); await sleep(1200);
    }
  }
  // Mira la palabra 3 segundos, se oculta y la escribe de memoria.
  async function peekWrite(w) {
    render(`<div class="card"><div class="big-emoji">${w.emoji}</div><div class="word-big">${w.en}</div></div>`);
    say("Mira bien las letras."); Sound.word(w); await sleep(3000);
    say("¡Ahora escríbela tú!", { speak: false });
    await writeTask(w, {});
  }
  const tag = t => { const i = t.indexOf(" "); return `<div class="tagline">${t.slice(0, i)} ${bi(t.slice(i + 1))}</div>`; };
  const hearRow = w => { const b = $("#hear"); if (b) b.onclick = () => Sound.word(w); };

  // Trazar con el dedo: palabra punteada sobre un lienzo; se completa al cubrir ~85 % del trazo.
  function traceTask(w) {
    return new Promise(res => {
      render(`<div class="card">${tag("✏️ Traza con el dedo")}<div class="big-emoji" style="font-size:clamp(50px,11vmin,90px)">${w.emoji}</div>
        <canvas id="cv" class="trace"></canvas>
        <div class="row"><button class="btn soft" id="hear">🔊</button><button class="btn soft" id="clr">${bi("🧽 Borrar")}</button>
        <button class="btn soft" id="skipT" hidden>${bi("Siguiente ➜")}</button></div></div>`);
      say("Pasa el dedo sobre las letras.", { speak: true }); Sound.word(w);
      const cv = $("#cv"), W = Math.max(260, Math.min(620, stage.clientWidth - 70)), H = 170;
      cv.width = W; cv.height = H; cv.style.width = W + "px"; cv.style.height = H + "px";
      const ctx = cv.getContext("2d"), family = getComputedStyle(document.body).fontFamily;
      let fs = 130; const setFont = c => { c.font = `900 ${fs}px ${family}`; c.textAlign = "center"; c.textBaseline = "middle"; };
      setFont(ctx); while (ctx.measureText(w.en).width > W - 40 && fs > 30) { fs -= 6; setFont(ctx); }
      const m = document.createElement("canvas"); m.width = W; m.height = H;
      const mc = m.getContext("2d"); setFont(mc); mc.fillStyle = "#000"; mc.fillText(w.en, W / 2, H / 2 + fs * 0.05);
      const md = mc.getImageData(0, 0, W, H).data, pts = [];
      for (let y = 0; y < H; y += 6) for (let x = 0; x < W; x += 6) if (md[(y * W + x) * 4 + 3] > 128) pts.push({ x, y, hit: false });
      const guide = () => {
        ctx.clearRect(0, 0, W, H); setFont(ctx);
        ctx.fillStyle = "rgba(63,169,201,.14)"; ctx.fillText(w.en, W / 2, H / 2 + fs * 0.05);
        ctx.setLineDash([7, 9]); ctx.lineWidth = 3; ctx.strokeStyle = "#8a8f9c"; ctx.strokeText(w.en, W / 2, H / 2 + fs * 0.05); ctx.setLineDash([]);
        pts.forEach(p => p.hit = false);
      };
      guide();
      let drawing = false, last = null, done = false;
      const pos = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
      const stroke = (a, b) => {
        ctx.strokeStyle = "#3FA9C9"; ctx.lineWidth = 18; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        pts.forEach(p => { if (!p.hit && Math.hypot(p.x - b.x, p.y - b.y) < 20) p.hit = true; });
        if (!done && pts.filter(p => p.hit).length / pts.length >= 0.85) {
          done = true; Sound.sfx.good(); star(); cheer(); say("¡Qué bonito trazo!", { speak: false }); Sound.word(w); setTimeout(res, 1300);
        }
      };
      cv.onpointerdown = e => { e.preventDefault(); drawing = true; touch(); last = pos(e); stroke(last, last); try { cv.setPointerCapture(e.pointerId); } catch (x) {} };
      cv.onpointermove = e => { if (!drawing || done) return; touch(); const p = pos(e); stroke(last, p); last = p; };
      cv.onpointerup = cv.onpointercancel = () => { drawing = false; };
      $("#clr").onclick = () => { if (!done) guide(); };
      hearRow(w);
      setTimeout(() => { const s = $("#skipT"); if (s) { s.hidden = false; s.onclick = () => res(); } }, 20000);
    });
  }

  // Completar la palabra: faltan 1 o 2 letras; se eligen entre fichas.
  async function fillTask(w) {
    const letters = [...w.en], n = letters.length >= 5 ? 2 : 1;
    const idxs = shuffle(letters.map((_, i) => i)).slice(0, n).sort((a, b) => a - b), need = idxs.map(i => letters[i]);
    const extras = shuffle([..."abcdefghilmnoprstuw"].filter(c => !need.includes(c))).slice(0, 3);
    const tiles = shuffle(need.concat(extras));
    render(`<div class="card">${tag("✍️ Completa la palabra")}<div class="big-emoji" style="font-size:clamp(70px,16vmin,130px)">${w.emoji}</div>
      <div class="slots" id="slots">${letters.map((c, i) => `<div class="slot">${idxs.includes(i) ? "" : c}</div>`).join("")}</div>
      <div class="tiles">${tiles.map((c, k) => `<button class="tile" data-k="${k}">${c}</button>`).join("")}</div>
      <div class="row"><button class="btn soft" id="hear">🔊</button></div></div>`);
    say("¿Qué letras faltan?", { speak: true }); hearRow(w);
    let pos = 0;
    await new Promise(res => stage.querySelectorAll(".tile").forEach(b => b.onclick = () => {
      touch();
      if (b.textContent === need[pos]) {
        $("#slots").children[idxs[pos]].textContent = need[pos]; b.classList.add("used"); pos++; Sound.sfx.tap();
        if (pos === need.length) { Sound.sfx.good(); star(); cheer(); say("¡Completaste " + w.en + "!", { speak: false, en: "You completed " + w.en + "!" }); Sound.word(w); setTimeout(res, 1300); }
      } else { b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); Sound.sfx.soft(); }
    }));
  }

  // Armar la oración tocando las palabras en orden.
  async function sentenceTask(w) {
    const words = w.sent.split(" "), tiles = shuffle(words.map((t, i) => ({ t, i })));
    render(`<div class="card">${tag("📝 Arma la oración")}<div class="big-emoji" style="font-size:clamp(60px,13vmin,110px)">${w.emoji}</div>
      <div class="sentence" id="sline">&nbsp;</div>
      <div class="tiles">${tiles.map((o, k) => `<button class="tile wordtile" data-k="${k}">${o.t}</button>`).join("")}</div></div>`);
    say("Toca las palabras en orden.", { speak: true });
    let pos = 0;
    await new Promise(res => stage.querySelectorAll(".tile").forEach(b => b.onclick = () => {
      touch();
      if (b.textContent === words[pos]) {
        pos++; b.classList.add("used"); $("#sline").textContent = words.slice(0, pos).join(" "); Sound.sfx.tap();
        if (pos === words.length) { Sound.sfx.good(); star(); cheer(); say("¡Escribiste una oración!", { speak: false }); Sound.speak([{ t: w.sent, lang: "en" }]); setTimeout(res, 2200); }
      } else { b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); Sound.sfx.soft(); }
    }));
  }

  // Memoria de pares: une imagen con palabra.
  async function pairsTask(w, pool) {
    const set = shuffle([w, ...shuffle(pool.filter(x => x !== w)).slice(0, 2)]);
    const cards = shuffle(set.flatMap(x => [{ id: x.id, f: x.emoji, c: "" }, { id: x.id, f: x.en, c: " w" }]));
    render(`<div class="card">${tag("🃏 Memoria de pares")}<p class="instr">${bi("Une la imagen con su palabra")}</p>
      <div class="pairs">${cards.map((c, i) => `<button class="pcard up" data-i="${i}"><span class="front">❓</span><span class="face${c.c}">${c.f}</span></button>`).join("")}</div></div>`);
    say("Mira bien. ¡Se van a esconder!", { speak: true }); await sleep(2600);
    const els = [...stage.querySelectorAll(".pcard")]; els.forEach(e => e.classList.remove("up"));
    say("¿Dónde están las parejas?", { speak: false });
    let open = [], found = 0, lock = false;
    await new Promise(res => els.forEach((el, i) => el.onclick = () => {
      if (lock || el.classList.contains("up")) return;
      touch(); el.classList.add("up"); Sound.sfx.tap(); open.push(i);
      if (open.length < 2) return;
      const [a, b] = open; open = [];
      if (cards[a].id === cards[b].id) {
        found++; els[a].classList.add("done"); els[b].classList.add("done"); Sound.sfx.good(); star(); cheer();
        if (found === 3) { say("¡Todas las parejas!", { speak: false }); setTimeout(res, 1100); }
      } else {
        lock = true; Sound.sfx.soft(); say("Casi. ¡Prueba otra vez!", { speak: false });
        setTimeout(() => { els[a].classList.remove("up"); els[b].classList.remove("up"); lock = false; }, 1000);
      }
    }));
  }

  // Rotación de tareas: nunca la misma dos veces seguidas, así cada bloque se siente distinto.
  const TASKS = {
    say: w => sayTask(w), peek: w => peekWrite(w), fill: w => fillTask(w), trace: w => traceTask(w), build: w => buildTask(w),
    lwrite: async w => { say("Escucha y escribe."); await writeTask(w, { hidePic: true, autoSpeak: true }); },
    sentence: w => sentenceTask(w), listen: (w, p) => gameRound(w, p, "listen"), read: (w, p) => gameRound(w, p, "read"),
    pairs: (w, p) => pairsTask(w, p)
  };
  async function runKind(kind) {
    let w = nextWord(); if (!w) return false;
    if (kind === "sentence" && !w.sent) {
      const alt = shuffle(WORDS.filter(x => Store.get(x.id) && x.sent))[0];
      if (alt) w = alt; else kind = "build";
    }
    await TASKS[kind](w, gamePool()); return true;
  }
  const KIND_MENU = [
    ["say", "🗣️", "Hablar"], ["fill", "✍️", "Completar"], ["peek", "👀", "Mirar y escribir"], ["pairs", "🃏", "Pares"],
    ["sentence", "📝", "Oraciones"], ["listen", "🎧", "Escuchar"], ["read", "📖", "Leer"], ["trace", "🖍️", "Trazar"],
    ["build", "🔤", "Armar"], ["lwrite", "⌨️", "Escribir al oído"]
  ];
  // Ella elige el tipo de ejercicio (o «Sorpréndeme» para ir variando).
  function chooseKind() {
    return new Promise(res => {
      render(`<div class="card"><p class="instr">${bi("¿Qué quieres practicar?")}</p>
        <div class="menu">${KIND_MENU.map(k => `<button class="mbtn" data-k="${k[0]}"><span>${k[1]}</span>${bi(k[2])}</button>`).join("")}
        <button class="mbtn rnd" data-k=""><span>🎲</span>${bi("Sorpréndeme")}</button></div></div>`);
      say("Tú eliges. ¿Qué quieres practicar?");
      stage.querySelector(".menu").onclick = e => {
        const b = e.target.closest(".mbtn"); if (!b) return;
        Sound.sfx.good(); ses.pref = b.dataset.k || null; res();
      };
    });
  }
  async function variety(seq, until) {
    let i = 0; ses.pref = null; ses.change = false;
    if (!until()) await chooseKind();
    while (!until()) {
      if (ses.change) { ses.change = false; await chooseKind(); if (until()) break; }
      if (!(await runKind(ses.pref || seq[i++ % seq.length]))) break;
    }
  }

  async function blockNew() {
    const q = Store.newWords();
    if (!q.length) { say("¡Hoy toca repasar lo que sabes!"); await sleep(1800); }
    for (const w of q) { if (ses.timeUp) break; await newWordTask(w); }
    await variety(["say", "fill", "peek", "pairs", "sentence"], blockOver);
  }

  /* ---------- Bloque 3: juego «Escucha y toca» ---------- */
  function gamePool() {
    let pool = WORDS.filter(w => Store.get(w.id));
    if (pool.length < 3) pool = pool.concat(shuffle(WORDS.filter(w => !Store.get(w.id)))).slice(0, 3);
    return pool;
  }
  // mode "listen": oye y toca la imagen. mode "read": ve la imagen y toca la palabra escrita.
  async function gameRound(target, pool, mode) {
    const opts = shuffle([target, ...shuffle(pool.filter(w => w !== target)).slice(0, 2)]);
    const read = mode === "read";
    render(`<div class="card">${tag(read ? "👀 Look and read" : "🎧 Listen and tick")}${read ? `<div class="big-emoji" style="font-size:clamp(70px,16vmin,130px)">${target.emoji}</div>` : ""}
      <p class="instr">${bi(read ? "Toca la palabra" : "Toca lo que escuchas")}</p>
      <div class="row"><button class="btn soft" id="hear">🔊 ${bi(read ? "Escuchar" : "Otra vez")}</button></div>
      <div class="choices">${opts.map((w, i) => `<button class="choice${read ? " txt" : ""}" data-i="${i}">${read ? w.en : w.emoji}</button>`).join("")}</div></div>`);
    say(read ? "Lee y toca." : "Escucha y toca.", { speak: false });
    if (!read) Sound.word(target);
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
          say("Casi. Inténtalo otra vez.", { speak: false }); Sound.word(target);
        }
      });
    });
  }
  async function blockGame() {
    await variety(["listen", "read", "pairs", "fill", "listen", "read", "sentence"], blockOver);
  }

  /* ---------- Bloque 4: arma la palabra + mini prueba ---------- */
  async function buildTask(w) {
    render(`<div class="card">${tag("🔤 Escucha y arma")}<div class="big-emoji">${w.emoji}</div>
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
          if (pos === letters.length) { Sound.sfx.good(); star(); cheer(); say("¡Armaste " + w.en + "!", { speak: false, en: "You built " + w.en + "!" }); setTimeout(res, 1200); }
        } else { b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); Sound.sfx.soft(); }
      });
    });
  }
  async function blockWrite() {
    const today = Store.introducedToday();
    // Escritura hasta dejar tiempo para la mini prueba (~35 s por palabra nueva).
    const reserve = today.length * 35;
    await variety(["trace", "build", "sentence", "lwrite", "trace", "fill"], () => ses.timeUp || ses.blockElapsed >= ses.blockSecs - reserve);
    // Mini prueba final: recuerdo inmediato de las palabras nuevas de hoy.
    if (today.length) {
      say("¡Mini prueba! Las palabras nuevas de hoy.");
      await sleep(2000);
      for (const w of shuffle(today)) {
        say("¿Cómo se dice? Dilo y escríbelo.");
        const r = await askWord(w);
        if (r === "ok") { star(); cheer(); Sound.sfx.good(); say("¡La recuerdas! Mañana la vemos otra vez.", { speak: false }); Sound.word(w); await sleep(1600); }
        else {
          Sound.sfx.soft(); sayHelp(r, w); await sleep(r === "idk" ? 3600 : 2200);
          await askWord(w, { showWord: true, autoSpeak: true }); star(); Sound.sfx.good();
          say("¡Muy bien! Mañana la repasamos.", { speak: false }); await sleep(1500);
        }
      }
    }
  }

  /* ---------- Pausa activa ---------- */
  const BREAKS = ["¡Salta diez veces como un loro!", "¡Estira los brazos como alas!", "¡Baila conmigo!", "¡Toca tus pies y sacude las manos!"];
  async function activeBreak() {
    ses.breaking = true; let left = 10, skip = false;
    render(`<div class="break">🦜</div><div class="count" id="cnt">10</div>
      <div class="row"><button class="btn soft" id="skip" hidden>${bi("Seguir ➜")}</button></div>`);
    { const b = pickOne(BREAKS); say("Pausa activa. " + b, { en: "Active break! " + EN[b] }); }
    $("#skip").onclick = () => { skip = true; };
    while (left > 0 && !skip) {
      await sleep(1000); left--; const c = $("#cnt"); if (c) c.textContent = left;
      if (left === 5 && $("#skip")) $("#skip").hidden = false;
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
      overlay.innerHTML = `<div style="font-size:90px">😴</div><h2>${bi("Pausa")}</h2><button class="btn hero" id="resume">${bi("Seguir")}</button>`;
      $("#resume").onclick = () => setPaused(false);
    } else { overlay.hidden = true; overlay.innerHTML = ""; touch(); }
  }
  $("#swapBtn").onclick = () => { if (!ses.active || ses.paused) return; ses.change = true; Sound.sfx.tap(); say("¡Listo! Cambiamos de ejercicio al terminar este.", { speak: false }); };
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
      total: mins * 60, blockSecs: mins * 15, stars: 0, newWords: 0, timeUp: false, hints: MAX_HINTS, change: false, pref: null });
    $("#renameBtn").hidden = true; $("#topbar").hidden = false; $("#gear")?.remove();
    const runners = [blockCold, blockNew, blockGame, blockWrite];
    for (let i = 0; i < 4 && !ses.timeUp; i++) {
      // El tiempo que sobra de un bloque corto se reparte en los siguientes (la sesión siempre llena su duración).
      ses.blockIdx = i; ses.blockElapsed = 0; ses.blockSecs = Math.max(60, (ses.total - ses.elapsed) / (4 - i)); drawPips();
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
    say(`¡Lo lograste! Hoy ganaste ${ses.stars} estrellas. ¡Nos vemos mañana!`, { en: `You did it! You earned ${ses.stars} stars today. See you tomorrow!` });
    render(`<div class="big-emoji">🏆</div><div class="home-meta"><span class="chip">⭐ ${ses.stars} today</span>
      <span class="chip">🌱 ${ses.newWords} new words</span><span class="chip">🔥 ${Store.streak()} days</span></div>
      <div class="row"><button class="btn soft" id="more">${bi("Seguir practicando ➜")}</button><button class="btn go" id="bye">${bi("Terminar")}</button></div>`);
    $("#bye").onclick = () => { home(); };
    $("#more").onclick = () => { runExtra(); };
  }
  // Práctica extra si ella quiere seguir: 5 min más de juegos, escritura y hablar con lo que ya conoce.
  async function runExtra() {
    Object.assign(ses, { active: true, paused: false, breaking: false, elapsed: 0, total: 300, blockElapsed: 0, blockSecs: 300,
      blockIdx: 4, idle: 0, stars: 0, newWords: 0, timeUp: false, hints: MAX_HINTS, change: false, pref: null });
    $("#renameBtn").hidden = true; $("#topbar").hidden = false; drawPips(); $("#gear")?.remove();
    say("¡Bonus! Cinco minutos más. ¡Vamos!");
    await sleep(1800);
    await variety(["listen", "say", "pairs", "trace", "read", "fill", "sentence", "lwrite", "build"], () => ses.timeUp);
    await finish();
  }

  /* ---------- Inicio y nombre del loro ---------- */
  function greeting() {
    const n = parrotName();
    const g = [
      { es: `¡Hola, exploradora! Soy ${n}. ¿Lista para volar?`, en: `Hello, explorer! I am ${n}. Ready to fly?` },
      { es: `¡Buenos días! ${n} trae una sorpresa.`, en: `Good morning! ${n} has a surprise.` },
      { es: `¡Hola, hola! ${n} te extrañó mucho.`, en: `Hello, hello! ${n} missed you a lot.` },
      { es: "¡Mira quién llegó! ¡Vamos a jugar con palabras!", en: EN["¡Mira quién llegó! ¡Vamos a jugar con palabras!"] },
      { es: `¡${n} está listo! ¿Y tú?`, en: `${n} is ready! And you?` },
      { es: "¡Qué alegría verte! Hoy aprendemos jugando.", en: EN["¡Qué alegría verte! Hoy aprendemos jugando."] },
      { es: "¡Cuac no, soy loro! ¡Hola! ¿Empezamos?", en: EN["¡Cuac no, soy loro! ¡Hola! ¿Empezamos?"] }];
    return g[Store.dayNum() % g.length];
  }
  function askName(canCancel) {
    return new Promise(res => {
      render(`<div class="card"><p class="instr">${bi(canCancel ? "¿Qué nombre nuevo le ponemos al loro?" : "¿Cómo se llama el loro?")}</p>
        <div class="ans" id="ans"><span id="ansTxt"></span></div><div id="kb" class="kb"></div>
        <div class="row">${canCancel ? `<button class="btn soft" id="noName">${bi("Cancelar")}</button>` : ""}<button class="btn go" id="okName">${bi("Listo ✔")}</button></div></div>`);
      say(canCancel ? "¿Cómo quieres llamarme ahora?" : "¡Hola! Aún no tengo nombre. ¿Me pones uno?");
      let t = ""; const out = $("#ansTxt");
      keyboard($("#kb"), k => { if (k === "back") t = t.slice(0, -1); else if (t.length < 12) t += k; out.textContent = t; });
      const no = $("#noName"); if (no) no.onclick = () => res();
      $("#okName").onclick = () => {
        if (!t) return;
        S().parrot = t[0].toUpperCase() + t.slice(1); Store.save(); res();
      };
    });
  }
  async function home() {
    ses.active = false; $("#topbar").hidden = true; applyPrefs();
    const rn = $("#renameBtn"); rn.hidden = true;
    if (window.__activateUpdate) window.__activateUpdate();
    if (!S().parrot) await askName();
    const can = Store.canStart();
    const stamps = PASSPORT.map(k => {
      const ok = WORDS.filter(w => w.cat === k).every(w => Store.get(w.id));
      return `<div class="stamp ${ok ? "done" : ""}" title="${CATEGORIES[k].label}">${CATEGORIES[k].icon}</div>`;
    }).join("");
    render(`<div class="home-meta"><span class="chip">⭐ ${S().stars}</span><span class="chip">🔥 ${Store.streak()}</span></div>
      <div class="stamps">${stamps}</div>
      <div class="big-emoji">${can ? "🌟" : "🌙"}</div>
      ${can ? `<button class="btn hero" id="start">${bi("¡Empezar!")}</button>` : `<p class="instr">${bi("¡Ya practicaste hoy! Mañana más.")}</p>
        <button class="btn soft" id="more">${bi("Seguir practicando ➜")}</button>`}
      <button id="gear" aria-label="Padres">⚙️</button>`);
    rn.hidden = false;
    rn.onclick = async () => { rn.hidden = true; const old = S().parrot; await askName(true); Store.save(); home(); if (S().parrot !== old) cheer(); };
    { const g = can ? greeting() : { es: `¡Qué gran trabajo hoy! ${parrotName()} te espera mañana.`, en: `Great work today! ${parrotName()} is waiting for you tomorrow.` }; say(g.es, { en: g.en }); }
    if (can) $("#start").onclick = () => { Sound.sfx.good(); runSession(); };
    else $("#more").onclick = () => { Sound.sfx.good(); runExtra(); };
    setupGear();
  }

  /* ---------- Panel de padres (Etapa 4 lo amplía) ---------- */
  function setupGear() {
    const g = $("#gear"); let timer;
    const down = e => { e.preventDefault(); timer = setTimeout(parents, 1000); };
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
      <p><label>Duración (min): <select id="mins">${[15, 20, 25, 30].map(m => `<option ${m === S().settings.minutes ? "selected" : ""}>${m}</option>`).join("")}</select></label>
      &nbsp; <label>Palabras nuevas por día: <select id="npd">${[3, 4, 5, 6, 7, 8].map(m => `<option ${m === S().settings.newPerDay ? "selected" : ""}>${m}</option>`).join("")}</select></label>
      &nbsp; <label><input type="checkbox" id="calm" ${S().settings.calm ? "checked" : ""}> Modo calma</label></p>
      <p><button class="btn soft" id="extra">Dar tiempo extra hoy</button> <button class="btn soft" id="exp">Respaldar</button>
      <label class="btn soft" style="display:inline-block">Restaurar<input type="file" id="imp" accept=".json" hidden></label></p>
      <p id="upd"></p>
      ${location.hash === "#dev" ? '<p><button class="btn soft" id="nextday">(Prueba) Avanzar un día</button></p>' : ""}
      <p><button class="btn soft" id="reset">Reiniciar progreso</button> <button class="btn go" id="close">Cerrar</button></p>
      <p style="font-size:13px">Herramienta de apoyo al aprendizaje; no es una terapia ni reemplaza a su especialista.</p></div>`;
    $("#mins").onchange = e => { S().settings.minutes = +e.target.value; Store.save(); };
    $("#npd").onchange = e => { S().settings.newPerDay = +e.target.value; Store.save(); };
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
  let swReg = null;
  if ("serviceWorker" in navigator) {
    // La versión nueva se activa sola cuando ella está en el inicio (nunca durante una sesión).
    const activate = () => { if (swReg && swReg.waiting && !ses.active) swReg.waiting.postMessage("SKIP_WAITING"); };
    navigator.serviceWorker.register("sw.js").then(reg => {
      swReg = reg; activate();
      reg.addEventListener("updatefound", () => {
        const nw = reg.installing;
        if (nw) nw.addEventListener("statechange", () => { if (nw.state === "installed") activate(); });
      });
    }).catch(() => {});
    window.__activateUpdate = activate;
    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => { if (reloading || ses.active) return; reloading = true; location.reload(); });
  }
  ["pointerdown", "keydown"].forEach(ev => document.addEventListener(ev, touch, true));
  home();
})();
