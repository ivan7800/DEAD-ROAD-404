import type {GameState} from './state.ts';

export const OPENING = 'Octubre de 1992. Buscas a Vera, tu hermana. Anoche llamó desde el motel MILE 404. Dijo que tu voz ya estaba allí.';

const links = [
 'El registro del motel señala THE LAST LIGHT, la parada de los evacuados. Busca allí quién subió al último coche.',
 'Los pedidos llevan el sello del ayuntamiento. Busca en el pueblo quién ordenó evacuar y por qué dejaron de llegar coches.',
 'El expediente lleva el sello de WXR-404. La emisora grabó la última llamada del pueblo. Busca allí la cinta original.',
 'Orden de evacuación de Umbral: sigue las balizas hasta el KM 96. Alguien sigue manteniendo esa ruta abierta.',
 'El mapa termina en el peaje del KM 120. El registro del último coche debería explicar por qué tu voz llegó antes que tú.'
];

export function storyLink(s:GameState, completed:number):string {
 const link=links[completed-1]??'';
 if(completed!==1)return link;
 return link+' '+(s.mission.choice==='rescue'?'Vera se abrocha el cinturón. «Conduce tú. Si oyes que yo contesto por radio, baja el volumen».':
  'El asiento de Vera queda vacío. Cuando enciendes la radio, su voz grabada te pide que busques a Mara.');
}

export function storyOnArrival(s:GameState):string {
 switch(s.km){
  case 0:return s.chapterOne.stage==='complete'?storyLink(s,1):'';
  case 24:if(s.chapterTwo.stage==='complete')return storyLink(s,2);
   return (s.chapterOne.decision==='preserve'?
   'La cinta de SUNSPUR repite el número de mesa de Vera.':'En el papel del motel, alguien ha dibujado una mesa junto al letrero THE LAST LIGHT.')+
   (s.encounterChoice==='help'?' El hombre del arcén te contó que las cruces señalan la vieja evacuación.':s.encounterChoice==='trade'?' El bidón del desconocido lleva el mismo sello que la cinta del motel.':'');
  case 48:if(s.chapterThree.stage==='complete')return storyLink(s,3);
   return s.chapterTwo.mara==='trust'?'Mara te pidió que buscaras su nombre en el monumento. Ahora el pueblo está delante de ti.':
   'En el pueblo encuentras el mismo sello del ticket. El monumento queda al otro lado de la plaza.';
  case 72:if(s.chapterFour.stage==='complete')return storyLink(s,4);
   return s.chapterThree.witness==='believe'?'Elías te enseñó a reconocer la alarma del pueblo. Suenan los mismos golpes en WXR-404.':
   'El reloj de la emisora también se detuvo. El expediente municipal indica que aquí se abrió el canal.';
  case 96:if(s.chapterFive.stage==='complete')return storyLink(s,5);
   return s.chapterFour.nora==='help'?'Nora te dejó una indicación: busca las balizas, no sigas el cuentakilómetros.':
   'La orden de evacuación menciona dos balizas que el cuentakilómetros no puede medir.';
  case 120:return s.chapterFive.decision==='remember'?'El trazado del Agrimensor llega al peaje. Todavía puedes leer los nombres.':
   'Ya no recuerdas los nombres del mapa. Solo queda el último número: KM 120.';
  default:return '';
 }
}

export function journalStory(s:GameState){
 const has=(id:GameState['campaign']['milestones'][number])=>s.campaign.milestones.includes(id);
 const facts=[OPENING];
 if(has('vera'))facts.push('Vera transportaba las cintas de WXR-404. Reconoce la voz que se hace pasar por el conductor.');
 if(has('ledger'))facts.push('THE LAST LIGHT recibió a los evacuados. El libro de huéspedes apunta al pueblo.');
 if(has('townArchive'))facts.push('El pueblo desapareció el 17 de octubre, a las 03:13.');
 if(has('radioArchive'))facts.push('Umbral abrió el canal a las 02:17. La grabación guardó voces y la ruta de evacuación.');
 if(has('mileLog'))facts.push('El Agrimensor repite la ruta. Los nombres del mapa permiten distinguir a los desaparecidos de sus copias.');
 if(has('endLedger'))facts.push('El peaje registra otra vuelta del Firebird. La voz del canal necesita un conductor que le responda.');
 const questions=s.ending?[]:[!has('vera')?'¿Cómo llegó tu voz antes que tú?':!has('radioArchive')?'¿Qué abrió el canal y por qué desapareció el pueblo?':
  !has('endLedger')?'¿Qué necesita la carretera para repetir la ruta?':'¿Qué voces podrá reconocer alguien fuera de la carretera?'];
 const clues:string[]=[];
 if(has('fuse'))clues.push('SUNSPUR · El fusible marca 02:17 → 217 kHz.');
 if(has('dinerTicket'))clues.push('THE LAST LIGHT · Pedido de la mesa cuatro, año 1992.');
 if(has('townMemorial'))clues.push('PUEBLO · El campanario quedó detenido a las 03:13.');
 if(has('radioArchive'))clues.push('WXR-404 · Estudio 02:17. Terminal del refugio 03:13.');
 if(has('mileBothBeacons'))clues.push('KM 96 · El indicador de las balizas marca 24 / 96.');
 if(has('endSign'))clues.push('PEAJE · Junta el kilometraje 120 y la primera cifra de 404.');
 const decisions:string[]=[];
 if(s.mission.choice)decisions.push({rescue:'Vera viaja contigo.',take:'Cobraste a Vera. Viajas sin ella.',leave:'Dejaste a Vera en el motel. Viajas sin ella.'}[s.mission.choice]);
 if(s.chapterOne.decision)decisions.push(s.chapterOne.decision==='preserve'?'Guardaste la cinta de SUNSPUR.':'Quemaste la cinta de SUNSPUR.');
 if(s.encounterChoice)decisions.push({help:'Diste dos raciones al hombre del arcén.',trade:'Cambiaste una pieza por combustible en el arcén.',leave:'Dejaste atrás al hombre del arcén.'}[s.encounterChoice]);
 if(s.chapterTwo.mara)decisions.push(s.chapterTwo.mara==='trust'?'Escuchaste a Mara.':'Te apartaste de Mara.');
 if(s.chapterTwo.ending)decisions.push(s.chapterTwo.ending==='broadcast'?'Emitiste la grabación del restaurante.':'Enterraste la grabación del restaurante.');
 if(s.chapterThree.witness)decisions.push(s.chapterThree.witness==='believe'?'Creíste a Elías.':'Dudaste de Elías.');
 if(s.chapterThree.decision)decisions.push(s.chapterThree.decision==='transmit'?'Enviaste el registro fuera del pueblo.':'Sellaste el registro en el campanario.');
 if(s.chapterFour.nora)decisions.push(s.chapterFour.nora==='help'?'Aceptaste la ayuda de Nora.':'Rechazaste la ayuda de Nora.');
 if(s.chapterFour.decision)decisions.push(s.chapterFour.decision==='broadcast'?'Emitiste los nombres desde WXR-404.':'Cortaste el enlace de Umbral.');
 if(s.chapterFive.decision)decisions.push(s.chapterFive.decision==='remember'?'Conservaste los nombres y el mapa.':'Enterraste el mapa con los nombres.');
 return {facts,questions,clues,decisions};
}
