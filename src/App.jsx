import { useState, useEffect, useRef } from “react”;
import { saveToFirebase, subscribeToFirebase } from “./firebase”;

// ─── FECHA NACIMIENTO ────────────────────────────────────────────────────────
const BIRTH = new Date(“2025-09-18”);
function getAgeMonths() {
const now = new Date();
return (now.getFullYear() - BIRTH.getFullYear()) * 12 + (now.getMonth() - BIRTH.getMonth()) -
(now.getDate() < BIRTH.getDate() ? 1 : 0);
}
function getAgeDays() {
return Math.floor((new Date() - BIRTH) / 86400000);
}
function getAgeLabel() {
const m = getAgeMonths();
const days = getAgeDays() - m * 30;
if (m < 1) return `${getAgeDays()} días`;
if (days > 3) return `${m} meses y ${days} días`;
return `${m} meses`;
}

// ─── COLORES ─────────────────────────────────────────────────────────────────
const C = {
bg: “#fdf8f4”, card: “#ffffff”, border: “#f0e8df”,
accent: “#e8856a”, accentSoft: “#fdf0ec”,
green: “#5db87a”, greenSoft: “#edf7f1”,
amber: “#e8a84a”, amberSoft: “#fef7ec”,
purple: “#9b7fe8”, purpleSoft: “#f3f0fd”,
rose: “#e86a8a”, roseSoft: “#fdf0f4”,
cyan: “#4ab8d4”, cyanSoft: “#edf8fc”,
navy: “#2d3a4a”, muted: “#8a9aaa”, faint: “#f5eff9”,
text: “#2d3a4a”, light: “#b0bcc8”,
};

// ─── RUTINA por edad (se adapta automáticamente) ──────────────────────────────
function getRoutine(ageMonths) {
const base = [
{ time:“06:30”, label:“Biberón desayuno”, icon:“🍼”, type:“feed”,
note:“240–270ml Fórmula 2 + 2–5 cazos cereales (sin gluten primero, luego multicereales).”,
placeholder:”¿Cuántos ml tomó? ¿Lo terminó? ¿Cómo amaneció…” },
{ time:“08:00”, label:“Juego y estimulación”, icon:“🌟”, type:“activity”,
note:“30–45 min de juego activo antes de la primera siesta.”,
placeholder:”¿Qué jugasteis? ¿Cómo estuvo de humor…” },
{ time:“09:00”, label:“Siesta corta (1ª)”, icon:“😴”, type:“sleep”,
note:“45–60 min. No dejar pasar más de 2h de vigilia antes de dormir.”,
placeholder:”¿A qué hora se durmió? ¿Cuánto duró…” },
{ time:“10:00”, label:“Vitamina D ☀️”, icon:“💊”, type:“health”,
note:“1 gota diaria sin falta. Con cuchara o en el biberón.”,
placeholder:”¿Se la dio? ¿Cómo fue…” },
{ time:“10:30”, label:“Paseo mañana”, icon:“🌳”, type:“activity”,
note:“30–60 min. Parque de Andalucía (Avda. Valdelaparra), Parque Arroyo de la Vega, Parque Cataluña o Parque Comunidad de Madrid. Evita sol directo. En verano no salgas entre 12–17h.”,
placeholder:”¿A dónde fuisteis? ¿Cómo lo disfrutó…” },
{ time:“11:30”, label:“Biberón media mañana”, icon:“🍼”, type:“feed”,
note:“240–270ml Fórmula 2 + 2–5 cazos cereales.”,
placeholder:”¿Cuántos ml tomó? ¿Observaciones…” },
{ time:“12:30”, label:“Siesta larga (2ª)”, icon:“😴”, type:“sleep”,
note:“1,5–2h. La más importante del día.”,
placeholder:”¿Cuánto duró? ¿Cómo fue…” },
{ time:“14:30”, label:“Puré de verduras + biberón”, icon:“🥣”, type:“food”,
note: ageMonths >= 8
? “~120–150g de puré. AOVE en crudo. Proteína: pollo, ternera, yema de huevo o legumbres (desde 8m). Biberón complemento 100–120ml si no llega.”
: “~90g de puré. AOVE en crudo siempre. Desde día 5 lleva pollo o ternera. Biberón complemento 120–150ml Fórmula 2 después.”,
placeholder:”¿Cuánto puré? ¿Biberón complemento? ¿Nuevo alimento…” },
{ time:“16:00”, label:“Juego / paseo tarde”, icon:“🌆”, type:“activity”,
note:“Paseo tranquilo o juego en casa. Tu momento con Martina.”,
placeholder:”¿Qué hicisteis? ¿Cómo estuvo…” },
{ time:“17:00”, label:“Siesta corta (3ª)”, icon:“😴”, type:“sleep”,
note:“30–45 min. NO dejar dormir después de las 17:30 para no comprometer el sueño nocturno.”,
placeholder:”¿Se durmió? ¿Cuánto duró…” },
{ time:“17:30”, label:“Biberón tarde”, icon:“🍼”, type:“feed”,
note:“240–270ml Fórmula 2 + 2–5 cazos cereales.”,
placeholder:”¿Cuántos ml tomó? ¿Observaciones…” },
{ time:“18:30”, label:“Puré de frutas + biberón”, icon:“🍑”, type:“food”,
note: ageMonths >= 8
? “~120–150g puré de 4–5 frutas + 1 galleta María. Biberón complemento si no llega.”
: “~90g puré de 4 frutas + 1 galleta María. Biberón complemento 120–150ml después. Agua del grifo.”,
placeholder:”¿Cuánto puré? ¿Biberón complemento? ¿Alguna fruta nueva…” },
{ time:“19:30”, label:“Baño 🛁”, icon:“🛁”, type:“routine”,
note:“SIEMPRE baño ANTES del biberón de noche. ~10 min, agua 37°C. Masajito con crema. Luz tenue.”,
placeholder:”¿Cómo fue el baño? ¿Observaciones sobre la piel…” },
{ time:“21:00”, label:“Biberón noche + dormir 🌙”, icon:“🌙”, type:“feed”,
note:“240–270ml Fórmula 2 + cereales, en penumbra DESPUÉS del baño. Si se despierta de noche: 150ml rescate.”,
placeholder:”¿Cuántos ml? ¿Se durmió fácil? ¿Se despertó en la noche…” },
];
return base;
}

// ─── JUEGOS por mes ───────────────────────────────────────────────────────────
const GAMES_BY_MONTH = {
6: [
{ icon:“🤸”, title:“Tummy time (boca abajo)”, freq:“Varias veces al día · 5–10 min”,
desc:“Pon a Martina boca abajo sobre una superficie firme. Coloca un espejo o juguete de colores vivos delante para que levante la cabeza. Fundamental para fortalecer cuello, hombros y preparar el gateo. Empieza con 3 min y aumenta.” },
{ icon:“🪞”, title:“Espejo facial”, freq:“Diario · 5 min”,
desc:“Acerca su cara a un espejo irrompible para bebés. Señala sus ojos, nariz, boca mientras nombras las partes. Le fascina la imagen, desarrolla autoconciencia y lenguaje.” },
{ icon:“🎵”, title:“Canciones con movimiento”, freq:“2–3 veces al día”,
desc:”‘Los pollitos’, ‘El patio de mi casa’, palmas. Mueve sus manitas mientras cantas. El ritmo estimula el cerebro y crea vínculo.” },
{ icon:“🧸”, title:“Alcanzar objetos colgantes”, freq:“Diario · 5–10 min”,
desc:“Cuelga juguetes suaves a la altura de sus manos. Anímala a alcanzarlos y agarrarlos. Trabaja coordinación ojo-mano y motricidad fina.” },
{ icon:“🌈”, title:“Estimulación visual con colores”, freq:“Diario”,
desc:“Muestra tarjetas o libros con contrastes fuertes (blanco-negro, colores primarios). A los 6 meses ya distingue todos los colores. Acerca objetos a 30cm.” },
],
7: [
{ icon:“🤸”, title:“Tummy time avanzado”, freq:“Varias veces al día · 10–15 min”,
desc:“Ahora debe aguantar bien. Pon juguetes alrededor para que intente girarse o arrastrarse hacia ellos. Si ya se da la vuelta sola, practica los dos sentidos. Prepara el gateo.” },
{ icon:“🧊”, title:“Exploración de texturas”, freq:“Diario · 5–10 min”,
desc:“Dale objetos de distintas texturas: un trapo suave, una esponja, papel de seda, una pelota con relieve. Nombra cada textura: ‘suave’, ‘rugoso’, ‘frío’. Estimula el tacto y el vocabulario.” },
{ icon:“🫧”, title:“Burbujas de jabón”, freq:“2–3 veces por semana”,
desc:“Sopla burbujas delante de ella. Que intente seguirlas con la mirada y atraparlas. Mejora seguimiento visual, concentración y causa-efecto.” },
{ icon:“🥁”, title:“Percusión con objetos”, freq:“Diario · 5 min”,
desc:“Dale una cuchara de madera y una olla. Que golpee y haga ruido. Trabaja la coordinación bilateral y el concepto causa-efecto. Es ruidoso pero muy valioso.” },
{ icon:“📚”, title:“Lectura de cuentos con imágenes”, freq:“Cada noche antes del baño”,
desc:“Libros de tela o cartón con imágenes grandes y colores. Señala los dibujos, nombra lo que ves. No importa que no entienda las palabras: el tono, la entonación y el ritual le encantan.” },
{ icon:“🏊”, title:“Juego en bañera”, freq:“Noche (durante el baño)”,
desc:“Aprovecha el baño para jugar: juguetes flotantes, verter agua con un vasito. Desarrolla sensorialidad y disfruta del agua. El momento ideal para canciones de agua.” },
{ icon:“🌳”, title:“Exploración en el parque”, freq:“Cada paseo”,
desc:“En el Parque de Andalucía o Arroyo de la Vega: deja que toque hojas, hierba, tierra (vigilando que no se la lleve a la boca). El contacto con la naturaleza estimula todos los sentidos.” },
],
8: [
{ icon:“🚂”, title:“Arrastre y gateo asistido”, freq:“Varias veces al día”,
desc:“Pon un juguete un poco lejos y anímala a llegar hasta él. Si no gatea aún, ayuda poniendo tu mano bajo su barriga. El arrastre es tan válido como el gateo clásico.” },
{ icon:“📦”, title:“Sacar y meter objetos”, freq:“Diario · 10 min”,
desc:“Una caja con objetos variados (tapas, pelotas pequeñas, cubos). Que saque todo y luego intente meterlos. Trabaja pinza, planificación motora y concentración.” },
{ icon:“👋”, title:“Juego de escondite (peekaboo)”, freq:“Varias veces al día”,
desc:“Tápate la cara con las manos o una tela y aparece con ‘¡aquí estoy!’. A los 8 meses entiende la permanencia del objeto. Este juego reduce la ansiedad de separación y provoca risa asegurada.” },
{ icon:“🎭”, title:“Imitación de gestos”, freq:“Diario”,
desc:“Mueve los brazos, saca la lengua, aplaude. Espera a que ella lo imite. La imitación es el primer paso del lenguaje. Aplaude cuando lo consiga.” },
{ icon:“🧩”, title:“Encajables y apilables”, freq:“Diario · 10 min”,
desc:“Cubos apilables de diferentes tamaños, aros en palo. Que intente apilar, encajar. Aunque todo acabe en el suelo, el intento trabaja planificación cognitiva.” },
{ icon:“🎶”, title:“Baile libre”, freq:“Diario”,
desc:“Ponla de pie aguantándola por las axilas, pon música y baila con ella. Le encantará el movimiento. Fortalece piernas y prepara la bipedestación.” },
{ icon:“🌊”, title:“Juego sensorial con agua”, freq:“2–3 veces por semana”,
desc:“Un barreño con un poco de agua tibia, vasos, cucharas. Verter, salpicar, meter la mano. Estimulación sensorial total y conexión contigo.” },
],
9: [
{ icon:“🚶”, title:“Práctica de pie agarrada”, freq:“Varias veces al día”,
desc:“Ayúdala a ponerse de pie agarrándose al sofá o a una mesita baja. Que aguante 10–30 segundos. No la sueltes, solo reduzca el apoyo gradualmente.” },
{ icon:“🫳”, title:“Pinza con alimentos”, freq:“En cada comida”,
desc:“Pon trocitos pequeños de fruta blanda (plátano, pera) o cereales en el plato. Que intente cogerlos con los dedos. Trabaja la pinza fina que necesitará para escribir.” },
{ icon:“🎠”, title:“Juego simbólico básico”, freq:“Diario”,
desc:“Dale un muñeco y muéstrale cómo darle de comer o abrazarlo. Empieza el juego simbólico. Imitar acciones cotidianas activa la empatía y el lenguaje.” },
{ icon:“📱”, title:“Nombrar todo lo que ves”, freq:“Todo el día”,
desc:“Durante el paseo, la comida, el baño: nombra constantemente lo que ves. ‘Esto es un árbol’, ‘mira el perro’. A los 9m el cerebro ya asocia palabra-objeto. La base del habla.” },
{ icon:“🫙”, title:“Abrir y cerrar recipientes”, freq:“Diario”,
desc:“Tuppers, botes con tapa, cajas. Que abra, cierre, meta cosas dentro. Trabaja causa-efecto, motricidad fina y persistencia.” },
],
10: [
{ icon:“👶”, title:“Primeros pasos laterales”, freq:“Diario”,
desc:“Agarrada al sofá, anímala a dar pasos laterales hacia un juguete. Cruising se llama. La mayoría anda sola entre 10–14 meses.” },
{ icon:“🗣️”, title:“Juego de llamar por nombre”, freq:“Diario”,
desc:“Llámala por su nombre desde otra habitación. Cuando responda con sonidos, celebra mucho. Estimula atención conjunta y pre-lenguaje.” },
{ icon:“🎨”, title:“Pintura sensorial con dedos”, freq:“Semanal”,
desc:“Pinturas de dedo no tóxicas o simplemente puré de zanahoria sobre papel. Que embadurne, toque, explore. Arte sensorial sin restricciones.” },
{ icon:“📖”, title:“Señalar en libros”, freq:“Diario”,
desc:”’¿Dónde está el perrito?’ y espera. A los 10m empieza a señalar con el dedo índice. Cuando lo haga, celebra y nombra lo señalado.” },
],
11: [
{ icon:“🎯”, title:“Lanzar y recoger pelotas”, freq:“Diario”,
desc:“Pelotas blandas de varios tamaños. Que las lance, tú se las devuelves. Trabaja turno, anticipación y motricidad gruesa.” },
{ icon:“🏗️”, title:“Construcción y derribo”, freq:“Diario”,
desc:“Construye una torre de 3–4 cubos y deja que la tire. Luego anímala a construir ella. El derribo es tan importante como la construcción: causa-efecto y satisfacción.” },
{ icon:“🫶”, title:“Juego de dar y recibir”, freq:“Todo el día”,
desc:”‘Dámelo’ con la mano extendida. Que te dé el juguete y tú se lo devuelves. Primera conversación no verbal, turno, reciprocidad social.” },
],
12: [
{ icon:“🚶”, title:“Primeros pasos independientes”, freq:“Todo el día”,
desc:“Si aún no camina, no hay prisa: el rango normal es 9–15 meses. Anímala a soltarse del mueble. Alfombra en el suelo para amortiguar caídas. Las caídas son parte del aprendizaje.” },
{ icon:“🖍️”, title:“Garabatos con ceras gruesas”, freq:“Semanal”,
desc:“Ceras blandas gruesas de cera o acuarela. Papel grande en el suelo. Que haga trazos. Primer contacto con el dibujo, agarre palmar.” },
{ icon:“🤝”, title:“Juego paralelo con otros niños”, freq:“Semanal”,
desc:“En el parque, cerca de otros bebés. Aún no juegan juntos, pero se observan y copian. Socialización temprana.” },
],
};

// ─── VACUNAS ──────────────────────────────────────────────────────────────────
const VACCINES = [
{ month: 0,  label:“Recién nacido”,     done: true,  items:[“Hepatitis B (1ª dosis)”] },
{ month: 2,  label:“2 meses”,           done: true,  items:[“Hexavalente (DTPa-VPI-Hib-HB) 1ª”,“Neumococo 13v 1ª”,“Rotavirus 1ª (oral)”,“Meningococo B 1ª”] },
{ month: 4,  label:“4 meses”,           done: true,  items:[“Hexavalente 2ª”,“Neumococo 13v 2ª”,“Rotavirus 2ª (oral)”,“Meningococo B 2ª”] },
{ month: 6,  label:“6 meses”,           done: true,  items:[“Hexavalente 3ª”,“Neumococo 13v 3ª”,“Rotavirus 3ª (oral, si aplica)”,“Meningococo B 3ª”] },
{ month: 12, label:“12 meses”,          done: false, items:[“Triple vírica SRP 1ª (sarampión, rubeola, parotiditis)”,“Varicela 1ª”,“Meningococo C”,“Neumococo 13v (refuerzo)”] },
{ month: 15, label:“15 meses”,          done: false, items:[“Triple vírica SRP 2ª”,“Varicela 2ª”,“Meningococo B (refuerzo)”] },
{ month: 18, label:“18 meses”,          done: false, items:[“Hexavalente (refuerzo DTPa-VPI-Hib)”] },
{ month: 36, label:“3 años”,            done: false, items:[“Varicela (si no se puso)”] },
{ month: 72, label:“6 años”,            done: false, items:[“DTPa (refuerzo)”,“Triple vírica SRP (refuerzo)”,“VPH (niñas, en Madrid)”] },
];

// ─── REVISIONES PEDIÁTRICAS ───────────────────────────────────────────────────
const CHECKUPS = [
{ month:0,  label:“Alta maternidad / 1ª semana”, done:true,  desc:“Control peso, ictericia, prueba talón (PKU), audición neonatal.” },
{ month:1,  label:“1 mes”,                        done:true,  desc:“Peso, talla, perímetro cefálico. Valoración desarrollo neurológico. Dudas lactancia.” },
{ month:2,  label:“2 meses + vacunas”,            done:true,  desc:“Control crecimiento. Valoración cadera. Primera ronda vacunas.” },
{ month:4,  label:“4 meses + vacunas”,            done:true,  desc:“Control crecimiento. Valoración visual y auditiva básica.” },
{ month:6,  label:“6 meses + vacunas”,            done:true,  desc:“Control. Inicio alimentación complementaria. Flúor si agua sin fluorar.” },
{ month:9,  label:“9 meses”,                      done:false, desc:“Control desarrollo psicomotor (se sienta, pinza, balbuceo). Hemoglobina (anemia).” },
{ month:12, label:“12 meses + vacunas”,           done:false, desc:“Control. Valoración marcha. Test M-CHAT (autismo). Transición leche vaca o continuación F3.” },
{ month:15, label:“15 meses + vacunas”,           done:false, desc:“Valoración lenguaje (al menos 3–5 palabras). Control crecimiento.” },
{ month:18, label:“18 meses”,                     done:false, desc:“Valoración desarrollo global. Autonomía en alimentación.” },
{ month:24, label:“2 años”,                       done:false, desc:“Valoración lenguaje (frases de 2 palabras). Visión. Higiene dental.” },
{ month:36, label:“3 años”,                       done:false, desc:“Agudeza visual. Valoración escolar. Vacuna varicela si procede.” },
];

// ─── HITOS DEL DESARROLLO ────────────────────────────────────────────────────
const MILESTONES = [
{ month:2,  icon:“😊”, label:“Primera sonrisa social”, desc:“Sonríe en respuesta a tu cara o voz. Si no aparece antes de los 3 meses, coméntalo al pediatra.” },
{ month:3,  icon:“🗣️”, label:“Primeros gorjeos (aah, eeh)”, desc:“Emite vocales y sonidos guturales. Responde cuando le hablas.” },
{ month:4,  icon:“👐”, label:“Agarra objetos”, desc:“Cierra el puño sobre un objeto que le pones en la mano. Control de la mano.” },
{ month:5,  icon:“🔄”, label:“Se da la vuelta”, desc:“De boca abajo a boca arriba primero, luego al revés. Varía: algunos lo hacen antes, otros después.” },
{ month:6,  icon:“🪑”, label:“Se sienta con apoyo”, desc:“Con cojines alrededor. Todavía no se sostiene sola. La espalda debe estar recta.” },
{ month:6,  icon:“🍼”, label:“Inicia alimentación complementaria”, desc:“Primer puré. Gran hito: el paso de solo leche a explorar sabores y texturas.” },
{ month:7,  icon:“📢”, label:“Balbuceo (ba-ba, ma-ma)”, desc:“Repite sílabas. ‘Mamá’ y ‘papá’ aún no tienen significado, pero son el inicio del lenguaje.” },
{ month:7,  icon:“🙈”, label:“Ansiedad de separación”, desc:“Llora cuando te vas. Es un hito positivo: significa que ha formado apego seguro contigo.” },
{ month:8,  icon:“🧊”, label:“Permanencia del objeto”, desc:“Entiende que algo existe aunque no lo vea. Por eso el peekaboo le encanta ahora.” },
{ month:8,  icon:“🚼”, label:“Se sienta sola sin apoyo”, desc:“Se sostiene sentada sin necesitar manos. Gran hito postural.” },
{ month:9,  icon:“🤏”, label:“Pinza index-pulgar”, desc:“Agarra objetos pequeños con dos dedos. Fundamental para la autonomía futura.” },
{ month:9,  icon:“🐛”, label:“Gateo o arrastre”, desc:“No todos gatean igual: arrastre, gateo clásico, posición de oso. Todos son válidos.” },
{ month:10, icon:“👆”, label:“Señala con el dedo índice”, desc:“Señala lo que quiere o lo que le llama la atención. Primer gesto comunicativo intencional.” },
{ month:11, icon:“🗺️”, label:“Entiende instrucciones simples”, desc:”‘Dame’, ‘no’, ‘ven aquí’. Entiende unas 10–20 palabras aunque no las diga aún.” },
{ month:12, icon:“🚶”, label:“Primeros pasos (rango: 9–15m)”, desc:“Si no camina a los 15 meses, comentar al pediatra. No hay prisa antes de eso.” },
{ month:12, icon:“💬”, label:“Primera palabra con significado”, desc:”‘Mamá’, ‘papá’, ‘agua’, ‘no’. Una palabra que usa siempre para lo mismo.” },
{ month:18, icon:“🗣️”, label:“5–20 palabras”, desc:“Vocabulario en expansión. Si a los 18m tiene menos de 6 palabras, consultar al pediatra.” },
{ month:24, icon:“💬”, label:“Frases de 2 palabras”, desc:”‘Mamá agua’, ‘más pan’. Si no aparecen a los 2 años, valorar.” },
];

// ─── COMPRA ───────────────────────────────────────────────────────────────────
const SHOPPING = [
{ cat:“🍼 Leche y cereales”, weekly:true, items:[
{ n:“Fórmula 2 — Aptamil 2 / Nan Optipro 2 / Blemil Plus 2 / Hero Baby 2”, tip:“~1.300ml/día · 5 tomas. Mínimo 2 latas grandes o 10 bricks semanales.” },
{ n:“Cereales SIN GLUTEN — Nestlé 8C sin gluten / Nutriben Arroz / Hero Baby Arroz-Maíz”, tip:“Terminar PRIMERO estos. 2–5 cazos rasados por biberón.” },
{ n:“Cereales MULTICEREALES — Nestlé Multicereales / Nutriben Multicereales / Hero Baby Multicereales”, tip:“Cuando se acaben los sin gluten. Misma dosis. Con hierro y calcio.” },
{ n:“Galletas María Fontaneda — 1 paquete cada 3–4 semanas”, tip:“1 galleta/ración puré frutas. 1 paquete ~30 galletas dura casi un mes.” },
]},
{ cat:“🥕 Verduras para el puré”, weekly:true, items:[
{ n:“Patata — 600g/semana (3 medianas)”, tip:“1 patata mediana ~200g por tarro. 3 tarros/semana.” },
{ n:“Calabaza — 300g/semana (un trozo)”, tip:“~100g por tarro. Lo que sobre congélalo.” },
{ n:“Judía verde — 150g/semana”, tip:“~50g por tarro (un puñado). Fresca o congelada.” },
{ n:“Zanahoria — 3 unidades/semana”, tip:“1 zanahoria mediana por tarro.” },
{ n:“Calabacín — 2 unidades/semana”, tip:“Medio calabacín por tarro.” },
{ n:“Puerro — 1 unidad/semana”, tip:“Solo la parte blanca. ~20g por tarro, 1 puerro para toda la semana.” },
{ n:“Boniato — 1 mediano/semana (rotación patata)”, tip:“Sustituye a la patata 1–2 veces/semana. ~200g por tarro.” },
{ n:“Penca de acelga — 2–3 pencas/semana”, tip:“Solo la penca blanca, sin hoja verde (nitratos). ~30g por tarro.” },
{ n:“AOVE — botella 500ml (dura 3–4 semanas)”, tip:“Chorro en crudo sobre el puré antes de servir. Imprescindible.” },
]},
{ cat:“🍌 Frutas para el puré”, weekly:true, items:[
{ n:“Naranja — 4 unidades/semana”, tip:“Media naranja por ración · 7 días.” },
{ n:“Pera — 4 unidades/semana”, tip:“Media pera por ración · 7 días.” },
{ n:“Plátano — 4–5 unidades/semana”, tip:“Medio plátano por ración · 7 días.” },
{ n:“Manzana golden — 4 unidades/semana”, tip:“Media manzana por ración.” },
{ n:“Melocotón / albaricoque — 3–4 unidades/semana”, tip:“Sin piel hasta los 9 meses. Muy maduro.” },
{ n:“Mango — 1 unidad/semana”, tip:“Muy nutritivo. Sin piel. Rota con otras frutas.” },
]},
{ cat:“🍖 Proteínas”, weekly:true, items:[
{ n:“Pechuga de pollo fresca — 120g/semana”, tip:“30g por tarro · 3 tarros/semana = 90g. Compra 120g para margen. Alterna con ternera.” },
{ n:“Ternera (blanca o roja) — 120g/semana (semanas alternas)”, tip:“Misma dosis. Alterna semanas: una pollo, otra ternera.” },
]},
{ cat:“🥚 Próximos alimentos (desde 8 meses)”, weekly:false, items:[
{ n:“Huevos camperos”, tip:“Solo YEMA cocida dura. Clara a los 12 meses.” },
{ n:“Lentejas rojas peladas”, tip:“Se deshacen solas al triturar. Ricas en hierro.” },
{ n:“Merluza / pescadilla fresca”, tip:“Sin espinas, al vapor. Desde los 8 meses.” },
{ n:“Yogur Danone Bio natural”, tip:“De postre tras la comida. Empezar con 1 cucharadita.” },
]},
{ cat:“🧴 Salud e higiene”, weekly:false, items:[
{ n:“Vitamina D gotas”, tip:“1 gota diaria. La que recete el pediatra.” },
{ n:“Crema hidratante bebé”, tip:“Masajito después del baño.” },
{ n:“Gel bebé pH neutro”, tip:“Para el baño diario.” },
{ n:“Termómetro de baño”, tip:“Agua siempre a 37°C.” },
]},
{ cat:“🫙 Utensilios”, weekly:false, items:[
{ n:“Tarros cristal 400g”, tip:“Prepara lunes, miércoles y viernes. Aguanta 48h en nevera.” },
{ n:“Batidora / Thermomix”, tip:“Textura completamente lisa.” },
]},
];

// ─── TIPOS ────────────────────────────────────────────────────────────────────
const TYPE = {
sleep:    { bg:”#eef4ff”, text:”#5b8dee”, dot:”#5b8dee”, label:“Sueño” },
feed:     { bg:C.purpleSoft, text:C.purple,  dot:C.purple,  label:“Biberón” },
food:     { bg:C.greenSoft,  text:C.green,   dot:C.green,   label:“Puré + biberón” },
health:   { bg:C.amberSoft,  text:C.amber,   dot:C.amber,   label:“Salud” },
activity: { bg:C.cyanSoft,   text:C.cyan,    dot:C.cyan,    label:“Actividad” },
routine:  { bg:C.roseSoft,   text:C.rose,    dot:C.rose,    label:“Rutina” },
};

const SK = “martina_v6”;
function todayKey() { return new Date().toISOString().split(“T”)[0]; }
function fmtDate(d) { return new Date(d+“T12:00:00”).toLocaleDateString(“es-ES”,{weekday:“long”,day:“numeric”,month:“long”}); }
function addDays(dateStr, n) {
const d = new Date(dateStr+“T12:00:00”); d.setDate(d.getDate()+n);
return d.toISOString().split(“T”)[0];
}

export default function App() {
const ageMonths = getAgeMonths();
const ROUTINE = getRoutine(ageMonths);

const [logs, setLogs]           = useState({});
const [tab, setTab]             = useState(“hoy”);
const [histDate, setHistDate]   = useState(todayKey());
const [modal, setModal]         = useState(null);
const [noteText, setNoteText]   = useState(””);
const [mood, setMood]           = useState(null);
const [openGame, setOpenGame]   = useState(null);
const [openMile, setOpenMile]   = useState(null);
const [openCheck, setOpenCheck] = useState(null);
const [shopCk, setShopCk]       = useState({});
const [reminders, setReminders] = useState([]);
const [newRemTitle, setNewRemTitle] = useState(””);
const [newRemDate, setNewRemDate]   = useState(””);
const [vacDone, setVacDone]     = useState({});
const [checkDone, setCheckDone] = useState({});
const [mileDone, setMileDone]   = useState({});
const [synced, setSynced]       = useState(false);

// Suscripción en tiempo real a Firebase
useEffect(()=>{
const unsub = subscribeToFirebase((data) => {
setLogs(data.logs||{});
setShopCk(data.shop||{});
setReminders(data.reminders||[]);
setVacDone(data.vacDone||{});
setCheckDone(data.checkDone||{});
setMileDone(data.mileDone||{});
setSynced(true);
});
return () => unsub();
},[]);

// Guardar en Firebase con debounce (tras primera carga)
useEffect(()=>{
if(!synced) return;
const timer = setTimeout(()=>{
saveToFirebase({logs,shop:shopCk,reminders,vacDone,checkDone,mileDone});
}, 800);
return () => clearTimeout(timer);
},[logs,shopCk,reminders,vacDone,checkDone,mileDone,synced]);

const getLog = (date,time) => logs[`${date}_${time}`];
const progress = (date) => Math.round(ROUTINE.filter(r=>logs[`${date}_${r.time}`]).length/ROUTINE.length*100);

function openModal(date,item){
setModal({date,item,key:`${date}_${item.time}`});
const ex = logs[`${date}_${item.time}`];
setNoteText(ex?.note||””); setMood(ex?.mood||null);
}
function confirmLog(){
if(!modal) return;
setLogs(l=>({…l,[modal.key]:{label:modal.item.label,type:modal.item.type,note:noteText,mood,
at:new Date().toLocaleTimeString(“es-ES”,{hour:“2-digit”,minute:“2-digit”}),date:modal.date}}));
setModal(null);
}
function removeLog(date,item){ setLogs(l=>{const n={…l};delete n[`${date}_${item.time}`];return n;}); }

function last7(){
return Array.from({length:7},(_,i)=>{
const d=new Date(); d.setDate(d.getDate()-(6-i));
return {key:d.toISOString().split(“T”)[0],label:d.toLocaleDateString(“es-ES”,{weekday:“short”,day:“numeric”})};
});
}

const today = todayKey();
const pct   = progress(today);

// juegos para el mes actual
const currentGames = GAMES_BY_MONTH[ageMonths] || GAMES_BY_MONTH[7];

// próxima vacuna y revisión
const nextVac = VACCINES.find(v => v.month > ageMonths && !vacDone[v.month]);
const nextCheck = CHECKUPS.find(c => c.month > ageMonths && !checkDone[c.month]);
const upcomingReminders = reminders.filter(r => !r.done && r.date >= today).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,3);

// alertas pendientes hoy
const alerts = [];
if(nextVac && nextVac.month <= ageMonths+1) alerts.push(`💉 Próximas vacunas: ${nextVac.label}`);
if(nextCheck && nextCheck.month <= ageMonths+1) alerts.push(`🩺 Revisión ${nextCheck.label} próximamente`);
upcomingReminders.forEach(r => { if(r.date === today) alerts.push(`🔔 Hoy: ${r.title}`); });

const TABS = [
[“hoy”,“📋”,“Hoy”],
[“juegos”,“🎮”,“Juegos”],
[“desarrollo”,“🌱”,“Hitos”],
[“salud”,“🩺”,“Salud”],
[“compra”,“🛒”,“Compra”],
];

return (
<div style={{background:C.bg,minHeight:“100vh”,color:C.text,fontFamily:”‘Georgia’,serif”,maxWidth:480,margin:“0 auto”}}>

```
  {/* HEADER */}
  <div style={{background:"linear-gradient(135deg,#fff5f0,#fff0f5)",padding:"18px 18px 12px",position:"sticky",top:0,zIndex:50,borderBottom:`1px solid ${C.border}`,boxShadow:"0 2px 12px rgba(232,133,106,0.08)"}}>
    <div style={{display:"flex",alignItems:"center",gap:12}}>
      <div style={{width:50,height:50,borderRadius:"50%",background:"linear-gradient(135deg,#ffb3a0,#ff8fab)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,boxShadow:"0 3px 12px rgba(232,133,106,0.35)"}}>🌸</div>
      <div style={{flex:1}}>
        <div style={{fontSize:22,fontWeight:"bold",color:C.navy,letterSpacing:".3px"}}>Martina</div>
        <div style={{fontSize:12,color:C.muted}}>{getAgeLabel()} · Plan a partir de los {ageMonths} meses</div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{background:pct===100?"#edf7f1":C.accentSoft,color:pct===100?C.green:C.accent,borderRadius:20,padding:"4px 12px",fontSize:13,fontWeight:"bold",border:`1px solid ${pct===100?C.green+"44":C.accent+"44"}`}}>{pct}%</div>
        <div style={{fontSize:10,color:C.muted,marginTop:2}}>completado hoy</div>
      </div>
    </div>
    <div style={{background:C.border,borderRadius:4,height:4,marginTop:12,overflow:"hidden"}}>
      <div style={{background:`linear-gradient(90deg,${C.accent},${C.rose})`,width:`${pct}%`,height:"100%",borderRadius:4,transition:"width .6s ease"}}/>
    </div>

    {/* Alertas del día */}
    {alerts.length>0&&(
      <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:4}}>
        {alerts.map((a,i)=>(
          <div key={i} style={{fontSize:11,padding:"5px 10px",background:C.amberSoft,borderRadius:8,color:C.amber,border:`1px solid ${C.amber}33`}}>{a}</div>
        ))}
      </div>
    )}
  </div>

  {/* TABS */}
  <div style={{display:"flex",background:"#ffffff",borderBottom:`1px solid ${C.border}`,boxShadow:"0 1px 6px rgba(0,0,0,0.04)"}}>
    {TABS.map(([id,ic,lb])=>(
      <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"9px 2px",background:"transparent",border:"none",borderBottom:`3px solid ${tab===id?C.accent:"transparent"}`,color:tab===id?C.accent:C.muted,cursor:"pointer",fontSize:10,fontFamily:"Georgia,serif",transition:"all .2s"}}>
        <div style={{fontSize:18,marginBottom:2}}>{ic}</div>{lb}
      </button>
    ))}
  </div>

  {/* ══════════════════════════════════════════════════
      TAB: HOY
  ══════════════════════════════════════════════════ */}
  {tab==="hoy"&&(
    <div style={{padding:16,paddingBottom:40}}>
      <div style={{color:C.muted,fontSize:12,marginBottom:14,textTransform:"capitalize",fontStyle:"italic"}}>{fmtDate(today)}</div>

      <div style={{padding:"10px 14px",background:"linear-gradient(135deg,#fff5f0,#fff0f5)",border:`1px solid ${C.accent}33`,borderRadius:12,marginBottom:16,fontSize:11,color:C.accent,lineHeight:1.8}}>
        🍼 <strong>Tomas:</strong> 06:30 · 11:30 · 14:30 puré · 17:30 · 18:30 puré · 21:00
      </div>

      {/* Selector historial rápido */}
      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:12}}>
        {last7().map(day=>{
          const p=progress(day.key); const isTd=day.key===today;
          return(
            <button key={day.key} onClick={()=>{ setHistDate(day.key); }}
              style={{flexShrink:0,padding:"6px 10px",borderRadius:10,border:`1px solid ${isTd?C.accent:C.border}`,background:isTd?C.accentSoft:"#fff",color:isTd?C.accent:C.muted,cursor:"pointer",minWidth:56,textAlign:"center"}}>
              <div style={{fontSize:9,textTransform:"capitalize"}}>{day.label}</div>
              <div style={{fontSize:11,fontWeight:"bold",color:p>0?C.green:C.light,marginTop:1}}>{p>0?`${p}%`:"·"}</div>
            </button>
          );
        })}
      </div>

      {(histDate!==today)&&(
        <div style={{padding:"8px 12px",background:C.amberSoft,borderRadius:10,marginBottom:12,fontSize:12,color:C.amber}}>
          📅 Viendo {fmtDate(histDate)}
          <button onClick={()=>setHistDate(today)} style={{marginLeft:10,fontSize:11,color:C.accent,background:"transparent",border:"none",cursor:"pointer",textDecoration:"underline"}}>Volver a hoy</button>
        </div>
      )}

      {ROUTINE.map(item=>{
        const log=getLog(histDate,item.time);
        const tc=TYPE[item.type];
        return(
          <div key={item.time} style={{marginBottom:8,background:log?tc.bg:"#fff",border:`1px solid ${log?tc.dot+"44":C.border}`,borderRadius:14,overflow:"hidden",boxShadow:"0 1px 6px rgba(0,0,0,0.04)"}}>
            <div onClick={()=>log?removeLog(histDate,item):openModal(histDate,item)}
              style={{display:"flex",gap:10,padding:"12px 14px",cursor:"pointer"}}>
              <div style={{fontSize:22,flexShrink:0,paddingTop:2}}>{item.icon}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                  <span style={{fontSize:10,color:C.muted,fontFamily:"monospace",background:C.faint,padding:"1px 5px",borderRadius:4}}>{item.time}</span>
                  <span style={{fontSize:10,padding:"1px 7px",borderRadius:10,background:tc.bg,color:tc.text,border:`1px solid ${tc.dot}22`}}>{tc.label}</span>
                  {log&&<span style={{fontSize:10,color:C.green,marginLeft:"auto",fontWeight:"bold"}}>✓ {log.at}</span>}
                </div>
                <div style={{fontSize:14,color:log?C.navy:C.muted,fontWeight:log?"bold":"normal"}}>{item.label}</div>
                <div style={{fontSize:11,color:C.light,marginTop:2,lineHeight:1.5}}>{item.note}</div>
              </div>
              <div style={{width:24,height:24,borderRadius:"50%",border:`2px solid ${log?tc.dot:C.border}`,background:log?tc.dot:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,flexShrink:0,marginTop:2}}>{log?"✓":""}</div>
            </div>
            {log&&(
              <div style={{padding:"0 14px 12px"}}>
                {log.mood&&<span style={{fontSize:18,marginRight:8,display:"inline-block",marginBottom:4}}>{log.mood}</span>}
                {log.note?(
                  <div onClick={()=>openModal(histDate,item)} style={{padding:"7px 12px",background:"#fff",borderRadius:8,fontSize:12,color:C.muted,borderLeft:`3px solid ${tc.dot}`,lineHeight:1.5,cursor:"pointer"}}>
                    📝 {log.note}
                  </div>
                ):(
                  <div onClick={()=>openModal(histDate,item)} style={{padding:"6px 12px",background:C.faint,borderRadius:8,fontSize:11,color:C.light,cursor:"pointer",border:`1px dashed ${C.border}`}}>
                    + Añadir observación...
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  )}

  {/* ══════════════════════════════════════════════════
      TAB: JUEGOS
  ══════════════════════════════════════════════════ */}
  {tab==="juegos"&&(
    <div style={{padding:16,paddingBottom:40}}>
      <div style={{padding:"12px 14px",background:"linear-gradient(135deg,#f0fdf4,#e8f7ff)",border:`1px solid ${C.green}33`,borderRadius:14,marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:"bold",color:C.green,marginBottom:4}}>🎮 Juegos para {ageMonths} meses</div>
        <div style={{fontSize:12,color:C.muted,lineHeight:1.6}}>
          Adaptados a la etapa actual de Martina. El juego es su trabajo: cada actividad estimula áreas clave del desarrollo.
        </div>
      </div>

      {currentGames.map((g,i)=>(
        <div key={i} style={{marginBottom:10,background:"#fff",border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",boxShadow:"0 1px 6px rgba(0,0,0,0.04)"}}>
          <button onClick={()=>setOpenGame(openGame===i?null:i)}
            style={{width:"100%",padding:"14px 16px",display:"flex",alignItems:"center",gap:12,background:"transparent",border:"none",color:C.text,cursor:"pointer",textAlign:"left"}}>
            <div style={{width:44,height:44,borderRadius:12,background:C.greenSoft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{g.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:"bold",color:C.navy}}>{g.title}</div>
              <div style={{fontSize:11,color:C.green,marginTop:2}}>{g.freq}</div>
            </div>
            <span style={{color:C.light,fontSize:16}}>{openGame===i?"▲":"▼"}</span>
          </button>
          {openGame===i&&(
            <div style={{padding:"0 16px 16px",borderTop:`1px solid ${C.border}`}}>
              <div style={{fontSize:13,color:C.muted,lineHeight:1.7,marginTop:12}}>{g.desc}</div>
            </div>
          )}
        </div>
      ))}

      {/* Juegos de semanas anteriores */}
      {ageMonths>6&&(
        <div style={{marginTop:6}}>
          <div style={{fontSize:12,color:C.muted,marginBottom:10,padding:"0 4px"}}>Juegos de etapas anteriores (siguen siendo válidos)</div>
          {Object.entries(GAMES_BY_MONTH)
            .filter(([m])=>parseInt(m)<ageMonths)
            .reverse()
            .map(([m,games])=>(
              <div key={m} style={{marginBottom:8,padding:"10px 14px",background:C.faint,borderRadius:12,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:"bold"}}>{m} meses</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {games.map((g,i)=>(
                    <span key={i} style={{fontSize:12,padding:"3px 10px",background:"#fff",borderRadius:20,border:`1px solid ${C.border}`,color:C.muted}}>{g.icon} {g.title}</span>
                  ))}
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  )}

  {/* ══════════════════════════════════════════════════
      TAB: HITOS DESARROLLO
  ══════════════════════════════════════════════════ */}
  {tab==="desarrollo"&&(
    <div style={{padding:16,paddingBottom:40}}>
      <div style={{padding:"12px 14px",background:"linear-gradient(135deg,#fef9ec,#fff5f0)",border:`1px solid ${C.amber}33`,borderRadius:14,marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:"bold",color:C.amber,marginBottom:4}}>🌱 Hitos del desarrollo</div>
        <div style={{fontSize:12,color:C.muted,lineHeight:1.6}}>
          Marca los que ya ha conseguido. Recuerda: hay un rango normal amplio. Si te preocupa algo, consúltalo en la revisión del pediatra.
        </div>
      </div>

      {MILESTONES.map((m,i)=>{
        const isPast = m.month <= ageMonths;
        const isCurrent = m.month === ageMonths || m.month === ageMonths+1;
        const done = mileDone[i];
        return(
          <div key={i} style={{marginBottom:8,background:"#fff",border:`2px solid ${done?C.green+"55":isCurrent?C.amber+"55":C.border}`,borderRadius:14,overflow:"hidden",opacity:m.month>ageMonths+2?0.5:1}}>
            <div style={{display:"flex",gap:10,padding:"12px 14px",cursor:isPast||isCurrent?"pointer":"default"}}
              onClick={()=>isPast||isCurrent?setMileDone(d=>({...d,[i]:!d[i]})):null}>
              <div style={{width:40,height:40,borderRadius:10,background:done?C.greenSoft:isCurrent?C.amberSoft:C.faint,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{m.icon}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                  <span style={{fontSize:10,padding:"1px 7px",borderRadius:10,background:done?C.greenSoft:isCurrent?C.amberSoft:C.faint,color:done?C.green:isCurrent?C.amber:C.light}}>{m.month} meses</span>
                  {isCurrent&&!done&&<span style={{fontSize:10,color:C.amber,fontWeight:"bold"}}>● Ahora</span>}
                  {done&&<span style={{fontSize:10,color:C.green,fontWeight:"bold",marginLeft:"auto"}}>✓ Conseguido</span>}
                </div>
                <div style={{fontSize:14,fontWeight:"bold",color:C.navy}}>{m.label}</div>
                <button onClick={(e)=>{e.stopPropagation();setOpenMile(openMile===i?null:i)}}
                  style={{fontSize:11,color:C.accent,background:"transparent",border:"none",cursor:"pointer",padding:"2px 0",marginTop:2}}>
                  {openMile===i?"▲ menos":"▼ más info"}
                </button>
                {openMile===i&&<div style={{fontSize:12,color:C.muted,lineHeight:1.6,marginTop:6}}>{m.desc}</div>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )}

  {/* ══════════════════════════════════════════════════
      TAB: SALUD (vacunas + revisiones + recordatorios)
  ══════════════════════════════════════════════════ */}
  {tab==="salud"&&(
    <div style={{padding:16,paddingBottom:40}}>

      {/* VACUNAS */}
      <div style={{fontSize:15,fontWeight:"bold",color:C.navy,marginBottom:10}}>💉 Calendario de vacunas</div>
      {VACCINES.map((v,i)=>{
        const isPast = v.month < ageMonths;
        const isCurrent = v.month === ageMonths || (v.month <= ageMonths+1 && v.month >= ageMonths);
        const done = vacDone[v.month] || v.done;
        return(
          <div key={i} style={{marginBottom:8,background:"#fff",border:`2px solid ${done?C.green+"44":isCurrent?C.accent+"55":C.border}`,borderRadius:12,padding:"12px 14px",opacity:v.month>ageMonths+2?0.45:1}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:done?C.greenSoft:isCurrent?C.accentSoft:C.faint,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                {done?"✅":"💉"}
              </div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                  <span style={{fontSize:12,fontWeight:"bold",color:C.navy}}>{v.label}</span>
                  {isCurrent&&!done&&<span style={{fontSize:10,background:C.accentSoft,color:C.accent,padding:"1px 7px",borderRadius:10,fontWeight:"bold"}}>Próxima</span>}
                  {done&&<span style={{fontSize:10,color:C.green}}>Administrada</span>}
                </div>
                <div style={{fontSize:11,color:C.muted,lineHeight:1.6}}>{v.items.join(" · ")}</div>
              </div>
              {!v.done&&(
                <button onClick={()=>setVacDone(d=>({...d,[v.month]:!d[v.month]}))}
                  style={{padding:"5px 10px",fontSize:11,background:done?C.greenSoft:C.accentSoft,color:done?C.green:C.accent,border:"none",borderRadius:8,cursor:"pointer"}}>
                  {done?"✓":"Marcar"}
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* REVISIONES */}
      <div style={{fontSize:15,fontWeight:"bold",color:C.navy,marginTop:20,marginBottom:10}}>🩺 Revisiones pediátricas</div>
      {CHECKUPS.map((c,i)=>{
        const isCurrent = c.month === ageMonths || c.month === ageMonths+1;
        const done = checkDone[c.month] || c.done;
        return(
          <div key={i} style={{marginBottom:8,background:"#fff",border:`2px solid ${done?C.green+"44":isCurrent?C.purple+"55":C.border}`,borderRadius:12,padding:"12px 14px",opacity:c.month>ageMonths+2?0.45:1}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:done?C.greenSoft:isCurrent?C.purpleSoft:C.faint,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                {done?"✅":"🩺"}
              </div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2,flexWrap:"wrap"}}>
                  <span style={{fontSize:12,fontWeight:"bold",color:C.navy}}>{c.label}</span>
                  {isCurrent&&!done&&<span style={{fontSize:10,background:C.purpleSoft,color:C.purple,padding:"1px 7px",borderRadius:10,fontWeight:"bold"}}>Próxima</span>}
                </div>
                <div style={{fontSize:11,color:C.muted,lineHeight:1.5}}>{c.desc}</div>
                {!c.done&&(
                  <button onClick={(e)=>{e.stopPropagation();setOpenCheck(openCheck===i?null:i)}}
                    style={{fontSize:11,color:C.accent,background:"transparent",border:"none",cursor:"pointer",padding:"2px 0",marginTop:4}}>
                    {openCheck===i?"▲ cerrar":"▼ notas"}
                  </button>
                )}
                {openCheck===i&&(
                  <textarea
                    defaultValue={logs[`checkup_${c.month}`]?.note||""}
                    onBlur={e=>setLogs(l=>({...l,[`checkup_${c.month}`]:{note:e.target.value}}))}
                    placeholder="Anota preguntas para el pediatra, resultados, observaciones..."
                    style={{width:"100%",marginTop:6,padding:8,background:C.faint,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12,fontFamily:"Georgia,serif",resize:"none",height:70,boxSizing:"border-box",color:C.text}}
                  />
                )}
              </div>
              {!c.done&&(
                <button onClick={()=>setCheckDone(d=>({...d,[c.month]:!d[c.month]}))}
                  style={{padding:"5px 10px",fontSize:11,background:done?C.greenSoft:C.purpleSoft,color:done?C.green:C.purple,border:"none",borderRadius:8,cursor:"pointer",flexShrink:0}}>
                  {done?"✓":"Marcar"}
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* RECORDATORIOS */}
      <div style={{fontSize:15,fontWeight:"bold",color:C.navy,marginTop:20,marginBottom:10}}>🔔 Recordatorios</div>
      <div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:14,padding:14,marginBottom:12}}>
        <input value={newRemTitle} onChange={e=>setNewRemTitle(e.target.value)}
          placeholder="Ej: Cita pediatra, comprar vitamina D..."
          style={{width:"100%",padding:"9px 12px",background:C.faint,border:`1px solid ${C.border}`,borderRadius:10,fontSize:13,fontFamily:"Georgia,serif",color:C.text,boxSizing:"border-box",marginBottom:8}}/>
        <div style={{display:"flex",gap:8}}>
          <input type="date" value={newRemDate} onChange={e=>setNewRemDate(e.target.value)}
            style={{flex:1,padding:"9px 12px",background:C.faint,border:`1px solid ${C.border}`,borderRadius:10,fontSize:13,fontFamily:"Georgia,serif",color:C.text}}/>
          <button onClick={()=>{
            if(!newRemTitle.trim()) return;
            setReminders(r=>[...r,{id:Date.now(),title:newRemTitle.trim(),date:newRemDate||today,done:false}]);
            setNewRemTitle(""); setNewRemDate("");
          }} style={{padding:"9px 16px",background:C.accent,color:"#fff",border:"none",borderRadius:10,fontSize:13,fontWeight:"bold",cursor:"pointer"}}>
            + Añadir
          </button>
        </div>
      </div>
      {reminders.length===0&&(
        <div style={{textAlign:"center",color:C.light,fontSize:13,padding:20}}>No hay recordatorios. Añade citas, compras o alertas.</div>
      )}
      {reminders.sort((a,b)=>a.date.localeCompare(b.date)).map((r,i)=>(
        <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",marginBottom:6,background:r.done?C.greenSoft:"#fff",border:`1px solid ${r.done?C.green+"44":r.date<today?"#ffdddd":C.border}`,borderRadius:12}}>
          <button onClick={()=>setReminders(rs=>rs.map(x=>x.id===r.id?{...x,done:!x.done}:x))}
            style={{width:22,height:22,borderRadius:6,border:`2px solid ${r.done?C.green:C.border}`,background:r.done?C.green:"transparent",color:"#fff",fontSize:11,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {r.done?"✓":""}
          </button>
          <div style={{flex:1}}>
            <div style={{fontSize:13,color:r.done?C.muted:C.navy,textDecoration:r.done?"line-through":"none"}}>{r.title}</div>
            <div style={{fontSize:10,color:r.date<today&&!r.done?"#e86a6a":C.muted,marginTop:1}}>
              {r.date===today?"Hoy":r.date<today&&!r.done?"Vencido · ":""}{r.date}
            </div>
          </div>
          <button onClick={()=>setReminders(rs=>rs.filter(x=>x.id!==r.id))}
            style={{fontSize:16,color:C.light,background:"transparent",border:"none",cursor:"pointer",padding:"0 4px"}}>×</button>
        </div>
      ))}
    </div>
  )}

  {/* ══════════════════════════════════════════════════
      TAB: COMPRA
  ══════════════════════════════════════════════════ */}
  {tab==="compra"&&(
    <div style={{padding:16,paddingBottom:40}}>
      <div style={{padding:"10px 14px",background:C.amberSoft,border:`1px solid ${C.amber}33`,borderRadius:12,marginBottom:14,fontSize:12,color:C.amber,lineHeight:1.6}}>
        🛒 Secciones <strong>sin etiqueta</strong> son compras puntuales. Las demás hay que reponerlas cada semana.
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
        <button onClick={()=>setShopCk({})} style={{fontSize:11,color:C.rose,background:"transparent",border:`1px solid ${C.rose}44`,borderRadius:8,padding:"4px 10px",cursor:"pointer"}}>Resetear lista</button>
      </div>
      {SHOPPING.map((sec,si)=>(
        <div key={si} style={{marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:"bold",color:sec.weekly?C.amber:C.accent,marginBottom:8,padding:"7px 12px",background:sec.weekly?C.amberSoft:C.accentSoft,borderRadius:10,display:"flex",alignItems:"center",gap:6}}>
            {sec.weekly&&<span style={{fontSize:10,background:C.amber,color:"#fff",borderRadius:6,padding:"1px 6px",fontWeight:"bold"}}>SEMANAL</span>}
            {sec.cat}
          </div>
          {sec.items.map((item,ii)=>{
            const ck=`${si}_${ii}`, checked=shopCk[ck];
            return(
              <div key={ii} onClick={()=>setShopCk(s=>({...s,[ck]:!s[ck]}))}
                style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",marginBottom:5,background:checked?C.greenSoft:"#fff",border:`1px solid ${checked?C.green+"44":C.border}`,borderRadius:12,cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,0.03)"}}>
                <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${checked?C.green:C.border}`,background:checked?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,flexShrink:0,marginTop:1}}>{checked?"✓":""}</div>
                <div>
                  <div style={{fontSize:13,color:checked?C.muted:C.navy,textDecoration:checked?"line-through":"none"}}>{item.n}</div>
                  {item.tip&&<div style={{fontSize:11,color:C.light,marginTop:2,lineHeight:1.4}}>{item.tip}</div>}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  )}

  {/* ══════════════════════════════════════════════════
      MODAL OBSERVACIONES
  ══════════════════════════════════════════════════ */}
  {modal&&(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:100,display:"flex",alignItems:"flex-end"}}
      onClick={e=>e.target===e.currentTarget&&setModal(null)}>
      <div style={{background:"#fff",width:"100%",borderRadius:"22px 22px 0 0",padding:24,borderTop:`3px solid ${C.accent}`,maxHeight:"80vh",overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{width:46,height:46,borderRadius:12,background:C.accentSoft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{modal.item.icon}</div>
          <div>
            <div style={{fontSize:16,fontWeight:"bold",color:C.navy}}>{modal.item.label}</div>
            <div style={{fontSize:11,color:C.muted}}>{modal.item.time} · {fmtDate(modal.date)}</div>
          </div>
        </div>

        <div style={{fontSize:11,color:C.muted,marginBottom:8}}>¿Cómo ha ido?</div>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {["😊","😐","😢","🤒","😴"].map(m=>(
            <button key={m} onClick={()=>setMood(mood===m?null:m)}
              style={{fontSize:24,background:mood===m?C.accentSoft:"#f8f8f8",border:`2px solid ${mood===m?C.accent:C.border}`,borderRadius:12,padding:"6px 10px",cursor:"pointer"}}>{m}</button>
          ))}
        </div>

        <div style={{fontSize:11,color:C.muted,marginBottom:6}}>📝 Observaciones</div>
        <textarea value={noteText} onChange={e=>setNoteText(e.target.value)}
          placeholder={modal.item.placeholder||"Anota algo sobre esta toma o momento..."}
          style={{width:"100%",padding:12,background:C.faint,border:`1px solid ${C.border}`,borderRadius:12,color:C.text,fontSize:13,fontFamily:"Georgia,serif",resize:"none",height:90,boxSizing:"border-box",lineHeight:1.5}}/>

        <div style={{display:"flex",gap:10,marginTop:14}}>
          <button onClick={()=>setModal(null)} style={{flex:1,padding:14,background:"#f8f8f8",border:`1px solid ${C.border}`,borderRadius:12,color:C.muted,fontSize:14,cursor:"pointer"}}>Cancelar</button>
          <button onClick={confirmLog} style={{flex:2,padding:14,background:`linear-gradient(135deg,${C.accent},${C.rose})`,border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:"bold",cursor:"pointer",boxShadow:`0 4px 14px ${C.accent}44`}}>✓ Completado</button>
        </div>
      </div>
    </div>
  )}

</div>
```

);
}
