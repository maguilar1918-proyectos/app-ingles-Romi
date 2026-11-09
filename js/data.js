// Lista de palabras. Para ampliar, agrega objetos al arreglo (el orden define qué palabras entran primero).
// id: único y sin espacios | en: palabra | es: significado | emoji: imagen provisional
// cat: categoría (estación) del pasaporte | hook: gancho de memoria con el loro
// sent: (opcional) oración corta en inglés para armar | audio: (opcional) ruta a un audio grabado, ej. "audio/en/cat.mp3".
const WORDS = [
  // ===== Estación 1: Animales =====
  { id:"cat",      en:"cat",      es:"gato",      emoji:"🐱", cat:"animals", sent:"I have a cat.",        hook:"¡El loro con un gorro de gato! Miau, cat." },
  { id:"dog",      en:"dog",      es:"perro",     emoji:"🐶", cat:"animals", sent:"I have a dog.",        hook:"El perro persigue al loro: dog, dog, dog." },
  { id:"bird",     en:"bird",     es:"pájaro",    emoji:"🐦", cat:"animals", sent:"I see a bird.",        hook:"¡Ese eres tú, loro! Un bird de colores." },
  { id:"fish",     en:"fish",     es:"pez",       emoji:"🐟", cat:"animals", sent:"I see a fish.",        hook:"El loro pesca un fish con su gorro." },
  { id:"lion",     en:"lion",     es:"león",      emoji:"🦁", cat:"animals", sent:"The lion is big.",     hook:"El lion le hace cosquillas al loro con su melena." },
  { id:"elephant", en:"elephant", es:"elefante",  emoji:"🐘", cat:"animals", sent:"The elephant is big.", hook:"El loro se columpia en la trompa del elephant." },
  // ===== Estación 2: Familia =====
  { id:"mom",      en:"mom",      es:"mamá",      emoji:"👩", cat:"family",  sent:"I love my mom.",       hook:"Mom abraza al loro: mmm, mom." },
  { id:"dad",      en:"dad",      es:"papá",      emoji:"👨", cat:"family",  sent:"I love my dad.",       hook:"Dad lleva al loro en los hombros." },
  { id:"sister",   en:"sister",   es:"hermana",   emoji:"👧", cat:"family",  sent:"My sister is nice.",   hook:"Mi sister y el loro juegan a las escondidas." },
  { id:"brother",  en:"brother",  es:"hermano",   emoji:"👦", cat:"family",  sent:"My brother is nice.",  hook:"Mi brother le enseña trucos al loro." },
  { id:"grandma",  en:"grandma",  es:"abuela",    emoji:"👵", cat:"family",  sent:"I love my grandma.",   hook:"Grandma le teje un gorrito al loro." },
  { id:"grandpa",  en:"grandpa",  es:"abuelo",    emoji:"👴", cat:"family",  sent:"I love my grandpa.",   hook:"Grandpa le cuenta cuentos al loro." },
  // ===== Estación 3: Colores y números =====
  { id:"red",      en:"red",      es:"rojo",      emoji:"🔴", cat:"colornum",sent:"I like red.",          hook:"El loro se pone una nariz roja: red." },
  { id:"blue",     en:"blue",     es:"azul",      emoji:"🔵", cat:"colornum",sent:"I like blue.",         hook:"El loro nada en el mar blue." },
  { id:"yellow",   en:"yellow",   es:"amarillo",  emoji:"🟡", cat:"colornum",sent:"I like yellow.",       hook:"El loro pinta el sol de yellow." },
  { id:"green",    en:"green",    es:"verde",     emoji:"🟢", cat:"colornum",sent:"I like green.",        hook:"El loro se esconde entre hojas green." },
  { id:"one",      en:"one",      es:"uno",       emoji:"1️⃣", cat:"colornum",sent:"I have one apple.",    hook:"Un solo loro: one." },
  { id:"two",      en:"two",      es:"dos",       emoji:"2️⃣", cat:"colornum",sent:"I have two apples.",   hook:"Dos alas del loro: two." },
  { id:"three",    en:"three",    es:"tres",      emoji:"3️⃣", cat:"colornum",sent:"I have three apples.", hook:"Tres loritos en una rama: three." },
  { id:"four",     en:"four",     es:"cuatro",    emoji:"4️⃣", cat:"colornum",sent:"I have four apples.",  hook:"Cuatro patas tiene el gato del loro: four." },
  // ===== Estación 4: Comida =====
  { id:"apple",    en:"apple",    es:"manzana",   emoji:"🍎", cat:"food",    sent:"I eat an apple.",      hook:"El loro come una apple gigante." },
  { id:"banana",   en:"banana",   es:"plátano",   emoji:"🍌", cat:"food",    sent:"I eat a banana.",      hook:"El loro resbala con una banana." },
  { id:"milk",     en:"milk",     es:"leche",     emoji:"🥛", cat:"food",    sent:"I drink milk.",        hook:"El loro bebe milk con bigote blanco." },
  { id:"bread",    en:"bread",    es:"pan",       emoji:"🍞", cat:"food",    sent:"I eat bread.",         hook:"El loro lleva el bread en su sombrero." },
  { id:"egg",      en:"egg",      es:"huevo",     emoji:"🥚", cat:"food",    sent:"I eat an egg.",        hook:"El loro se sienta sobre un egg." },
  { id:"water",    en:"water",    es:"agua",      emoji:"💧", cat:"food",    sent:"I drink water.",       hook:"El loro se baña bajo el water." },
  // ===== Escuela =====
  { id:"book",   en:"book",   es:"libro",     emoji:"📖", cat:"school",  sent:"I have a book.",   hook:"El loro lee un book gigante." },
  { id:"pen",    en:"pen",    es:"bolígrafo", emoji:"🖊️", cat:"school",  sent:"I have a pen.",    hook:"El loro escribe con una pen en su ala." },
  { id:"pencil", en:"pencil", es:"lápiz",     emoji:"✏️", cat:"school",  sent:"I have a pencil.", hook:"El loro dibuja con un pencil amarillo." },
  { id:"bag",    en:"bag",    es:"mochila",   emoji:"🎒", cat:"school",  sent:"I have a bag.",    hook:"El loro lleva una bag llena de plumas." },
  { id:"ruler",  en:"ruler",  es:"regla",     emoji:"📏", cat:"school",  sent:"I have a ruler.",  hook:"El loro mide su cola con una ruler." },
  { id:"teacher",en:"teacher",es:"profesora", emoji:"🧑‍🏫", cat:"school",  hook:"La teacher le enseña al loro a contar." },
  // ===== Juguetes =====
  { id:"ball",   en:"ball",   es:"pelota",    emoji:"⚽", cat:"toys",    sent:"I have a ball.",   hook:"El loro patea una ball sin parar." },
  { id:"car",    en:"car",    es:"carro",     emoji:"🚗", cat:"toys",    sent:"I have a car.",    hook:"El loro maneja un car rojo, ¡piii!" },
  { id:"bike",   en:"bike",   es:"bicicleta", emoji:"🚲", cat:"toys",    sent:"I have a bike.",   hook:"El loro pedalea su bike por el parque." },
  { id:"robot",  en:"robot",  es:"robot",     emoji:"🤖", cat:"toys",    sent:"I have a robot.",  hook:"Un robot baila con el loro." },
  { id:"bear",   en:"bear",   es:"osito",     emoji:"🧸", cat:"toys",    sent:"I have a bear.",   hook:"El loro abraza a su bear de peluche." },
  { id:"boat",   en:"boat",   es:"barco",     emoji:"⛵", cat:"toys",    sent:"I see a boat.",    hook:"El loro navega en un boat de papel." },
  // ===== Cuerpo =====
  { id:"hand",   en:"hand",   es:"mano",      emoji:"✋", cat:"body",    hook:"El loro choca su hand con la tuya." },
  { id:"eye",    en:"eye",    es:"ojo",       emoji:"👁️", cat:"body",    hook:"El loro guiña un eye." },
  { id:"ear",    en:"ear",    es:"oreja",     emoji:"👂", cat:"body",    hook:"El loro escucha con su ear grande." },
  { id:"nose",   en:"nose",   es:"nariz",     emoji:"👃", cat:"body",    hook:"El loro se pone nose de payaso." },
  { id:"mouth",  en:"mouth",  es:"boca",      emoji:"👄", cat:"body",    hook:"El loro abre su mouth y canta." },
  { id:"foot",   en:"foot",   es:"pie",       emoji:"🦶", cat:"body",    hook:"El loro baila con un foot en el aire." },
  // ===== Ropa =====
  { id:"hat",    en:"hat",    es:"sombrero",  emoji:"🎩", cat:"clothes", sent:"I have a hat.",    hook:"El loro con un hat de mago." },
  { id:"shoes",  en:"shoes",  es:"zapatos",   emoji:"👟", cat:"clothes", sent:"I have shoes.",    hook:"El loro corre con shoes nuevos." },
  { id:"dress",  en:"dress",  es:"vestido",   emoji:"👗", cat:"clothes", sent:"I have a dress.",  hook:"El loro presumido con un dress rosado." },
  { id:"shirt",  en:"shirt",  es:"camiseta",  emoji:"👕", cat:"clothes", sent:"I have a shirt.",  hook:"El loro con una shirt de rayas." },
  { id:"socks",  en:"socks",  es:"calcetines",emoji:"🧦", cat:"clothes", sent:"I have socks.",    hook:"El loro con socks de colores en las patas." },
  // ===== Casa =====
  { id:"house",  en:"house",  es:"casa",      emoji:"🏠", cat:"house",   sent:"I see a house.",   hook:"El loro vive en una house con chimenea." },
  { id:"bed",    en:"bed",    es:"cama",      emoji:"🛏️", cat:"house",   sent:"I have a bed.",    hook:"El loro salta en la bed." },
  { id:"door",   en:"door",   es:"puerta",    emoji:"🚪", cat:"house",   sent:"I see a door.",    hook:"El loro toca la door: toc, toc." },
  { id:"key",    en:"key",    es:"llave",     emoji:"🔑", cat:"house",   sent:"I have a key.",    hook:"El loro encuentra una key dorada." },
  { id:"clock",  en:"clock",  es:"reloj",     emoji:"⏰", cat:"house",   sent:"I see a clock.",   hook:"El clock despierta al loro: ring, ring." },
  // ===== Acciones =====
  { id:"run",    en:"run",    es:"correr",    emoji:"🏃", cat:"actions", sent:"I can run.",       hook:"El loro dice: ¡run, run, run!" },
  { id:"jump",   en:"jump",   es:"saltar",    emoji:"🤸", cat:"actions", sent:"I can jump.",      hook:"El loro hace jump muy alto." },
  { id:"eat",    en:"eat",    es:"comer",     emoji:"🍽️", cat:"actions", sent:"I can eat.",       hook:"El loro quiere eat una galleta." },
  { id:"sleep",  en:"sleep",  es:"dormir",    emoji:"😴", cat:"actions", sent:"I can sleep.",     hook:"El loro hace sleep con su gorro de dormir." },
  // ===== Naturaleza =====
  { id:"sun",    en:"sun",    es:"sol",       emoji:"☀️", cat:"nature",  sent:"I see the sun.",   hook:"El loro toma sol bajo el sun." },
  { id:"moon",   en:"moon",   es:"luna",      emoji:"🌙", cat:"nature",  sent:"I see the moon.",  hook:"El loro duerme bajo la moon." },
  { id:"star",   en:"star",   es:"estrella",  emoji:"⭐", cat:"nature",  sent:"I see a star.",    hook:"El loro atrapa una star brillante." },
  { id:"tree",   en:"tree",   es:"árbol",     emoji:"🌳", cat:"nature",  sent:"I see a tree.",    hook:"El loro hace su nido en un tree." },
  { id:"flower", en:"flower", es:"flor",      emoji:"🌸", cat:"nature",  sent:"I see a flower.",  hook:"El loro huele una flower rosada." }
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
// Estaciones del pasaporte original (sellos en la pantalla de inicio).
const PASSPORT = ["animals", "family", "colornum", "food"];

// MODO PRUEBAS: true = se puede empezar una sesión cuantas veces se quiera. Poner en false en la versión final.
const TESTING_UNLIMITED = true;

const LEVELS = ["Nueva", "Aprendiendo", "Casi", "Dominada"];
// Días de espera tras cada recuerdo en frío exitoso (índice = paso).
const INTERVALS = [0, 1, 2, 4, 7, 14];
const MAX_NEW_PER_SESSION = 6;   // valor por defecto; se cambia en el panel de padres
const COLD_DAYS_TO_LEVEL_UP = 3;
const MAX_COLD_PER_SESSION = 10;
