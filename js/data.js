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
  { id:"milk",   en:"milk",   es:"leche",    emoji:"🥛", cat:"food",    hook:"El loro bebe milk con bigote blanco." }
];

const CATEGORIES = {
  animals:  { label:"Animales",          icon:"🐾" },
  family:   { label:"Familia",           icon:"🏠" },
  colornum: { label:"Colores y Números", icon:"🎨" },
  food:     { label:"Comida",            icon:"🍎" }
};

const LEVELS = ["Nueva", "Aprendiendo", "Casi", "Dominada"];
// Días de espera tras cada recuerdo en frío exitoso (índice = paso).
const INTERVALS = [0, 1, 2, 4, 7, 14];
const MAX_NEW_PER_SESSION = 3;
const COLD_DAYS_TO_LEVEL_UP = 3;
const MAX_COLD_PER_SESSION = 8;
