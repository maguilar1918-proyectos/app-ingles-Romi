// Lista de palabras. Para ampliar, agrega objetos al arreglo (hasta ~80 palabras Starters).
// id: único y sin espacios | en: palabra | es: significado | emoji: imagen provisional
// cat: categoría del pasaporte | hook: gancho de memoria con el loro
// audio: (opcional) ruta a un audio grabado, ej. "audio/en/cat.mp3". Si no existe, se usa la voz del navegador.
const WORDS = [
  { id:"cat",    en:"cat",    es:"gato",     emoji:"🐱", cat:"animals", hook:"¡El loro con un gorro de gato! Miau, cat." },
  { id:"dog",    en:"dog",    es:"perro",    emoji:"🐶", cat:"animals", hook:"El perro persigue al loro: dog, dog, dog." },
  { id:"bird",   en:"bird",   es:"pájaro",   emoji:"🐦", cat:"animals", hook:"¡Ese eres tú, loro! Un bird de colores." },
  { id:"fish",   en:"fish",   es:"pez",      emoji:"🐟", cat:"animals", hook:"El loro pesca un fish con su gorro." },
  { id:"mom",    en:"mom",    es:"mamá",     emoji:"👩", cat:"family",  hook:"Mom abraza al loro: mmm, mom." },
  { id:"dad",    en:"dad",    es:"papá",     emoji:"👨", cat:"family",  hook:"Dad lleva al loro en los hombros." },
  { id:"red",    en:"red",    es:"rojo",     emoji:"🔴", cat:"colornum",hook:"El loro se pone una nariz roja: red." },
  { id:"blue",   en:"blue",   es:"azul",     emoji:"🔵", cat:"colornum",hook:"El loro nada en el mar blue." },
  { id:"one",    en:"one",    es:"uno",      emoji:"1️⃣", cat:"colornum",hook:"Un solo loro: one." },
  { id:"two",    en:"two",    es:"dos",      emoji:"2️⃣", cat:"colornum",hook:"Dos alas del loro: two." },
  { id:"apple",  en:"apple",  es:"manzana",  emoji:"🍎", cat:"food",    hook:"El loro come una apple gigante." },
  { id:"milk",   en:"milk",   es:"leche",    emoji:"🥛", cat:"food",    hook:"El loro bebe milk con bigote blanco." },
  // --- Escuela ---
  { id:"book",   en:"book",   es:"libro",     emoji:"📖", cat:"school",  hook:"El loro lee un book gigante." },
  { id:"pen",    en:"pen",    es:"bolígrafo", emoji:"🖊️", cat:"school",  hook:"El loro escribe con una pen en su ala." },
  { id:"pencil", en:"pencil", es:"lápiz",     emoji:"✏️", cat:"school",  hook:"El loro dibuja con un pencil amarillo." },
  { id:"bag",    en:"bag",    es:"mochila",   emoji:"🎒", cat:"school",  hook:"El loro lleva una bag llena de plumas." },
  { id:"ruler",  en:"ruler",  es:"regla",     emoji:"📏", cat:"school",  hook:"El loro mide su cola con una ruler." },
  { id:"teacher",en:"teacher",es:"profesora", emoji:"🧑‍🏫", cat:"school",  hook:"La teacher le enseña al loro a contar." },
  // --- Juguetes ---
  { id:"ball",   en:"ball",   es:"pelota",    emoji:"⚽", cat:"toys",    hook:"El loro patea una ball sin parar." },
  { id:"car",    en:"car",    es:"carro",     emoji:"🚗", cat:"toys",    hook:"El loro maneja un car rojo, ¡piii!" },
  { id:"bike",   en:"bike",   es:"bicicleta", emoji:"🚲", cat:"toys",    hook:"El loro pedalea su bike por el parque." },
  { id:"robot",  en:"robot",  es:"robot",     emoji:"🤖", cat:"toys",    hook:"Un robot baila con el loro." },
  { id:"bear",   en:"bear",   es:"osito",     emoji:"🧸", cat:"toys",    hook:"El loro abraza a su bear de peluche." },
  { id:"boat",   en:"boat",   es:"barco",     emoji:"⛵", cat:"toys",    hook:"El loro navega en un boat de papel." },
  // --- Cuerpo ---
  { id:"hand",   en:"hand",   es:"mano",      emoji:"✋", cat:"body",    hook:"El loro choca su hand con la tuya." },
  { id:"eye",    en:"eye",    es:"ojo",       emoji:"👁️", cat:"body",    hook:"El loro guiña un eye." },
  { id:"ear",    en:"ear",    es:"oreja",     emoji:"👂", cat:"body",    hook:"El loro escucha con su ear grande." },
  { id:"nose",   en:"nose",   es:"nariz",     emoji:"👃", cat:"body",    hook:"El loro se pone nose de payaso." },
  { id:"mouth",  en:"mouth",  es:"boca",      emoji:"👄", cat:"body",    hook:"El loro abre su mouth y canta." },
  { id:"foot",   en:"foot",   es:"pie",       emoji:"🦶", cat:"body",    hook:"El loro baila con un foot en el aire." },
  // --- Ropa ---
  { id:"hat",    en:"hat",    es:"sombrero",  emoji:"🎩", cat:"clothes", hook:"El loro con un hat de mago." },
  { id:"shoes",  en:"shoes",  es:"zapatos",   emoji:"👟", cat:"clothes", hook:"El loro corre con shoes nuevos." },
  { id:"dress",  en:"dress",  es:"vestido",   emoji:"👗", cat:"clothes", hook:"El loro presumido con un dress rosado." },
  { id:"shirt",  en:"shirt",  es:"camiseta",  emoji:"👕", cat:"clothes", hook:"El loro con una shirt de rayas." },
  { id:"socks",  en:"socks",  es:"calcetines",emoji:"🧦", cat:"clothes", hook:"El loro con socks de colores en las patas." },
  // --- Casa ---
  { id:"house",  en:"house",  es:"casa",      emoji:"🏠", cat:"house",   hook:"El loro vive en una house con chimenea." },
  { id:"bed",    en:"bed",    es:"cama",      emoji:"🛏️", cat:"house",   hook:"El loro salta en la bed." },
  { id:"door",   en:"door",   es:"puerta",    emoji:"🚪", cat:"house",   hook:"El loro toca la door: toc, toc." },
  { id:"key",    en:"key",    es:"llave",     emoji:"🔑", cat:"house",   hook:"El loro encuentra una key dorada." },
  { id:"clock",  en:"clock",  es:"reloj",     emoji:"⏰", cat:"house",   hook:"El clock despierta al loro: ring, ring." },
  // --- Acciones ---
  { id:"run",    en:"run",    es:"correr",    emoji:"🏃", cat:"actions", hook:"El loro dice: ¡run, run, run!" },
  { id:"jump",   en:"jump",   es:"saltar",    emoji:"🤸", cat:"actions", hook:"El loro hace jump muy alto." },
  { id:"eat",    en:"eat",    es:"comer",     emoji:"🍽️", cat:"actions", hook:"El loro quiere eat una galleta." },
  { id:"sleep",  en:"sleep",  es:"dormir",    emoji:"😴", cat:"actions", hook:"El loro hace sleep con su gorro de dormir." },
  // --- Naturaleza ---
  { id:"sun",    en:"sun",    es:"sol",       emoji:"☀️", cat:"nature",  hook:"El loro toma sol bajo el sun." },
  { id:"moon",   en:"moon",   es:"luna",      emoji:"🌙", cat:"nature",  hook:"El loro duerme bajo la moon." },
  { id:"star",   en:"star",   es:"estrella",  emoji:"⭐", cat:"nature",  hook:"El loro atrapa una star brillante." },
  { id:"tree",   en:"tree",   es:"árbol",     emoji:"🌳", cat:"nature",  hook:"El loro hace su nido en un tree." },
  { id:"flower", en:"flower", es:"flor",      emoji:"🌸", cat:"nature",  hook:"El loro huele una flower rosada." }
];

const CATEGORIES = {
  animals:  { label:"Animales",          icon:"🐾" },
  family:   { label:"Familia",           icon:"🏠" },
  colornum: { label:"Colores y Números", icon:"🎨" },
  food:     { label:"Comida",            icon:"🍎" },
  school:   { label:"Escuela",           icon:"🎒" },
  toys:     { label:"Juguetes",          icon:"🧸" },
  body:     { label:"Cuerpo",            icon:"🖐️" },
  clothes:  { label:"Ropa",              icon:"👕" },
  house:    { label:"Casa",              icon:"🏠" },
  actions:  { label:"Acciones",          icon:"🏃" },
  nature:   { label:"Naturaleza",        icon:"🌳" }
};

const LEVELS = ["Nueva", "Aprendiendo", "Casi", "Dominada"];
// Días de espera tras cada recuerdo en frío exitoso (índice = paso).
const INTERVALS = [0, 1, 2, 4, 7, 14];
const MAX_NEW_PER_SESSION = 6;   // valor por defecto; se cambia en el panel de padres
const COLD_DAYS_TO_LEVEL_UP = 3;
const MAX_COLD_PER_SESSION = 10;
