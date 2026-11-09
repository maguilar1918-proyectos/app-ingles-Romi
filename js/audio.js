// Audio: voz del navegador (en-US lenta para inglés, es para el loro) + sonidos WebAudio.
const Sound = (() => {
  let ctx = null;
  const enabled = () => Store.data().settings.sound;
  const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
  let voices = [];
  if (synth) { const lv = () => { voices = synth.getVoices(); }; lv(); synth.onvoiceschanged = lv; }

  function pick(prefix) {
    return voices.find(v => v.lang && v.lang.replace("_", "-").toLowerCase().startsWith(prefix.toLowerCase())) || null;
  }

  // items: [{t:"texto", lang:"en"|"es"}]
  function speak(items, onend) {
    if (!synth || !enabled()) { if (onend) setTimeout(onend, 300); return; }
    synth.cancel();
    items.forEach((it, i) => {
      const u = new SpeechSynthesisUtterance(it.t);
      const en = it.lang === "en";
      u.lang = en ? "en-US" : "es-ES";
      const v = pick(en ? "en-US" : "es") || pick(en ? "en" : "es-");
      if (v) u.voice = v;
      u.rate = en ? 0.7 : 0.95;
      u.pitch = en ? 1 : 1.15;
      if (onend && i === items.length - 1) u.onend = onend;
      synth.speak(u);
    });
  }

  // Punto de extensión: si word.audio existe, se usará el archivo grabado.
  function word(w, onend) {
    if (w.audio && enabled()) {
      const a = new Audio(w.audio);
      a.onerror = () => speak([{ t: w.en, lang: "en" }], onend);
      a.onended = onend || null;
      a.play().catch(() => speak([{ t: w.en, lang: "en" }], onend));
      return;
    }
    speak([{ t: w.en, lang: "en" }], onend);
  }
  const stop = () => { if (synth) synth.cancel(); };

  function tone(freq, start, dur, type, gain) {
    if (!enabled()) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || "sine"; o.frequency.value = freq;
      const t0 = ctx.currentTime + start;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain || 0.18, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(ctx.destination);
      o.start(t0); o.stop(t0 + dur + 0.05);
    } catch (e) {}
  }
  const calm = () => Store.data().settings.calm;
  const sfx = {
    tap:  () => tone(520, 0, 0.08, "sine", 0.1),
    good: () => { tone(660, 0, 0.12); tone(880, 0.1, 0.18); if (!calm()) tone(1320, 0.22, 0.2); },
    soft: () => tone(330, 0, 0.25, "sine", 0.1),          // fallo: tono suave, sin castigo
    star: () => { tone(784, 0, 0.1); tone(1047, 0.09, 0.22); },
    win:  () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.12, 0.3))
  };
  return { speak, word, stop, sfx };
})();
