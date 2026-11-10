// Recompensas: monedas, accesorios del loro, stickers, cofre diario, reto semanal, jardín y escudos.
// Solo lógica y datos: la pantalla vive en app.js.
const Rewards = (() => {
  const S = () => Store.data();
  const ACCESSORIES = [
    { id: "flower", e: "🌸", pos: "head", cost: 10 }, { id: "bow", e: "🎀", pos: "head", cost: 12 },
    { id: "hat", e: "🎩", pos: "head", cost: 15 }, { id: "glasses", e: "🕶️", pos: "face", cost: 18 },
    { id: "cap", e: "🧢", pos: "head", cost: 20 }, { id: "scarf", e: "🧣", pos: "neck", cost: 25 },
    { id: "phones", e: "🎧", pos: "head", cost: 30 }, { id: "crown", e: "👑", pos: "head", cost: 40 }
  ];
  const STICKERS = ["🚀", "🌈", "🦄", "🍭", "🎈", "🐳", "🌻", "🍓", "⭐", "🎸", "🐢", "🦋",
    "🍕", "⚽", "🎨", "🐙", "🍦", "🌙", "🦖", "🐼", "🎁", "🏰", "🚲", "🍀"];
  const RARE = ["🏅", "🥇", "💎", "🎖️"]; // premios del reto semanal
  const PLANTS = ["🌱", "🌿", "🌷", "🌻"]; // Nueva, Aprendiendo, Casi, Dominada
  const WEEK_GOAL = 5;

  // 1 moneda por cada 5 estrellas, más premios, menos lo gastado.
  const coins = () => Math.max(0, Math.floor(S().stars / 5) + (S().bonus || 0) - (S().spent || 0));
  const add = n => { S().bonus = (S().bonus || 0) + n; };

  function buy(id) {
    const a = ACCESSORIES.find(x => x.id === id);
    if (!a || S().owned.includes(id)) return "no";
    if (coins() < a.cost) return "poor";
    S().spent = (S().spent || 0) + a.cost; S().owned.push(id); S().worn = id; Store.save(); return "ok";
  }
  function wear(id) { S().worn = id || ""; Store.save(); }

  function pickNew(list) {
    const left = list.filter(s => !S().stickers.includes(s));
    if (!left.length) return null;
    const s = left[Math.floor(Math.random() * left.length)];
    S().stickers.push(s); return s;
  }

  // Cofre: uno por día, solo después de terminar la sesión.
  const chestReady = () => Store.today().done && S().chestDay !== Store.dayNum();
  function openChest() {
    if (!chestReady()) return null;
    S().chestDay = Store.dayNum();
    const sticker = pickNew(STICKERS), coinsWon = sticker ? 3 : 8;
    add(coinsWon); Store.save(); return { sticker, coins: coinsWon };
  }

  // Reto semanal: practicar WEEK_GOAL días entre lunes y domingo.
  const week = () => Math.floor((Store.dayNum() + 3) / 7); // el día 0 (1970-01-01) fue jueves
  function weekDays() {
    const start = week() * 7 - 3; let n = 0;
    for (let d = start; d <= Store.dayNum(); d++) if (S().days[d] && S().days[d].done) n++;
    return n;
  }
  const weeklyReady = () => S().weekClaimed !== week() && weekDays() >= WEEK_GOAL;
  function claimWeekly() {
    if (!weeklyReady()) return null;
    S().weekClaimed = week(); add(20);
    const sticker = pickNew(RARE); Store.save(); return { sticker, coins: 20 };
  }

  // Jardín: cada palabra conocida es una planta que crece con su nivel.
  const garden = () => WORDS.filter(w => Store.get(w.id)).map(w => ({ w, level: Store.get(w.id).level, plant: PLANTS[Store.get(w.id).level] }));
  // Escudo de una estación: todas sus palabras en nivel «Casi» o más.
  const shield = cat => WORDS.filter(w => w.cat === cat).every(w => Store.get(w.id) && Store.get(w.id).level >= 2);

  // Últimos 28 días terminando hoy.
  function calendar() {
    const t = Store.dayNum(), out = [];
    for (let d = t - 27; d <= t; d++) {
      out.push({ num: new Date(d * 864e5).getUTCDate(), done: !!(S().days[d] && S().days[d].done), today: d === t });
    }
    return out;
  }

  return { ACCESSORIES, STICKERS, RARE, PLANTS, WEEK_GOAL, coins, buy, wear, chestReady, openChest, week, weekDays,
    weeklyReady, claimWeekly, garden, shield, calendar };
})();
