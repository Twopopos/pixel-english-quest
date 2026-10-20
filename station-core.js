// Independent side-story model. No classroom levels or PDF state are imported.
export const SAVE_KEY='pixelEnglishMagicStationV1';
export const WORDS={
 Grow:{meaning:'生长；成长',sentence:'Let the vine grow toward the light.'},
 Float:{meaning:'漂浮',sentence:'The wooden crate can float across the canal.'},
 Reflect:{meaning:'反射；映照',sentence:'The mirror reflects light into the observatory.'}
};
const starts={station:{x:110,y:352},canal:{x:85,y:352},observatory:{x:100,y:362}};
export function restore(raw){
 const s={version:1,scene:'station',accepted:false,primer:false,vine:false,raft:false,mirror:0,lit:false,delivered:false,complete:false,feather:false,words:[],routes:[],position:null};
 if(!raw||raw.version!==1)return s;
 for(const k of ['accepted','primer','vine','raft','lit','delivered','complete','feather'])s[k]=raw[k]===true;
 if(raw.scene in starts)s.scene=raw.scene;
 s.mirror=Number.isInteger(raw.mirror)?Math.max(0,Math.min(2,raw.mirror)):0;
 s.words=Array.isArray(raw.words)?[...new Set(raw.words.filter(w=>w in WORDS))]:[];
 s.routes=Array.isArray(raw.routes)?[...new Set(raw.routes.filter(r=>['high','water'].includes(r)))]:[];
 // Old or corrupt saves must never strand the player beyond a locked gate.
 if(!s.accepted){s.scene='station';s.primer=s.vine=s.raft=s.lit=s.delivered=s.complete=false;s.words=[];s.routes=[];s.feather=false;s.mirror=0;}
 if(s.delivered){s.accepted=s.primer=s.lit=true;s.mirror=2;}
 if(s.complete){s.accepted=s.primer=s.lit=s.delivered=true;s.scene='station';s.mirror=2;}
 if(raw.position&&Number.isFinite(raw.position.x)&&Number.isFinite(raw.position.y))s.position={x:raw.position.x,y:raw.position.y};
 return s;
}
export class StationWorld{
 constructor(raw,onEvent=()=>{}){this.state=restore(raw);this.emit=onEvent;this.clock=0;this.raftX=475;this.raftDir=1;this.drop=0;this.jumpLatch=false;this.camera=0;this.player={...starts[this.state.scene],w:24,h:38,vx:0,vy:0,on:false,face:1};
  const q=this.state.position;if(q&&this.safePosition(q))Object.assign(this.player,q);this.camera=Math.max(0,Math.min(this.width-960,this.player.x-420));}
 get width(){return this.state.scene==='canal'?1660:this.state.scene==='observatory'?1280:1360;}
 safePosition(q){return q.x>=0&&q.x<this.width-24&&q.y>=0&&q.y<440&&!(this.state.scene==='canal'&&q.x>440&&q.x<1120);}
 snapshot(){return {...this.state,position:{x:this.player.x,y:this.player.y}};}
 save(){this.emit({type:'save',state:this.snapshot()});}
 word(w){if(!this.state.words.includes(w)){this.state.words.push(w);this.emit({type:'word',word:w,...WORDS[w]});}}
 place(id,name){this.emit({type:'place',id,name});}
 travel(scene){if(!(scene in starts))return false;this.state.scene=scene;this.state.position=null;this.player={...starts[scene],w:24,h:38,vx:0,vy:0,on:false,face:1};this.camera=0;this.drop=0;this.jumpLatch=false;this.place('station-'+scene,scene==='station'?'PLATFORM 9¾ · THE LETTER BETWEEN WORLDS':scene==='canal'?'THE OWL POST CANAL':'THE LANTERN OBSERVATORY');this.save();return true;}
 platforms(){const s=this.state;if(s.scene==='station')return [{id:'floor',x:0,y:390,w:1360,h:90}];if(s.scene==='observatory')return [{id:'floor',x:0,y:400,w:1280,h:80},{id:'shelf',x:630,y:300,w:170,h:15,oneWay:true}];
  const out=[{id:'left',x:0,y:390,w:460,h:90},{id:'right',x:1120,y:390,w:540,h:90}];
  if(s.vine)out.push({id:'high',x:400,y:240,w:780,h:18,oneWay:true});
  if(s.raft)out.push({id:'raft',x:this.raftX,y:405,w:160,h:16,oneWay:true});return out;}
 step(dt,input={}){dt=Math.min(2,Math.max(0,dt));this.clock+=dt;this.drop=Math.max(0,this.drop-dt);const p=this.player,s=this.state;const previousRaft=this.raftX;
  if(s.scene==='canal'&&s.raft){this.raftX+=this.raftDir*1.7*dt;if(this.raftX>1095){this.raftX=1095;this.raftDir=-1;}if(this.raftX<438){this.raftX=438;this.raftDir=1;}if(p.support==='raft'&&p.on)p.x+=this.raftX-previousRaft;}
  const up=input.up||input.jump,climb=s.scene==='canal'&&s.vine&&Math.abs(p.x+12-423)<28&&p.y+p.h>=236&&up&&!input.left&&!input.right;
  if(!up)this.jumpLatch=false;
  if(input.down&&p.on&&p.support==='high'){this.drop=22;p.y+=5;p.on=false;p.support=null;}
  p.vx=(input.right?3.45:0)-(input.left?3.45:0);if(p.vx)p.face=Math.sign(p.vx);
  if(climb){p.x=411;p.vy=0;p.y-=3.1*dt;p.on=false;p.support=null;if(p.y+p.h<=240){p.y=202;p.on=true;p.support='high';this.jumpLatch=true;}}
  else{if(up&&p.on&&!this.jumpLatch&&!input.down){p.vy=-10.3;p.on=false;this.jumpLatch=true;this.emit({type:'cue',kind:'jump'});}
   const oldBottom=p.y+p.h;p.x=Math.max(8,Math.min(this.width-32,p.x+p.vx*dt));
   if(s.scene==='observatory'&&!s.lit&&p.x+24>900)p.x=876;
   if(s.scene==='station'&&!s.accepted&&p.x>720)p.x=720;
   p.vy=Math.min(14,p.vy+.48*dt);if(input.down&&p.vy>0)p.vy=Math.max(8,p.vy);p.y+=p.vy*dt;p.on=false;p.support=null;
   for(const a of this.platforms().sort((a,b)=>a.y-b.y)){if(this.drop>0&&a.id==='high')continue;if(p.vy>=0&&oldBottom<=a.y+5&&p.y+p.h>=a.y&&p.x+24>a.x&&p.x<a.x+a.w){p.y=a.y-p.h;p.vy=0;p.on=true;p.support=a.id;break;}}
  }
  if(s.scene==='canal'&&p.on&&p.x>650&&p.x<1050){const route=p.support==='high'?'high':p.support==='raft'?'water':null;if(route&&!s.routes.includes(route)){s.routes.push(route);this.save();}}
  if(s.scene==='canal'&&s.vine&&!s.feather&&Math.abs(p.x-895)<30&&Math.abs(p.y+38-240)<20){s.feather=true;this.emit({type:'notice',text:'OWL FEATHER · A little souvenir from the high path.'});this.save();}
  if(p.y>530)this.recall();this.camera+=(Math.max(0,Math.min(this.width-960,p.x+12-440))-this.camera)*Math.min(1,.12*dt);
 }
 recall(){Object.assign(this.player,starts[this.state.scene],{vx:0,vy:0,on:false,support:null});this.camera=0;this.emit({type:'notice',text:'Back on safe ground. Your letter and discoveries are safe.'});}
 objects(){const s=this.state;if(s.scene==='station')return [
  {id:'master',x:245,y:390,label:s.complete?'TALK TO THE STATIONMASTER':s.delivered?'DELIVER THE REPLY':s.accepted?'READ THE ADDRESS':'A LETTER IS WAITING'},
  {id:'primer',x:405,y:390,label:s.primer?'READ YOUR WORD CARDS':'OPEN THE SPELL SATCHEL'},
  {id:'wall',x:790,y:390,label:'ENTER PLATFORM 9¾'},
  ...(s.complete?[{id:'train',x:985,y:390,label:'TAKE ANOTHER LITTLE JOURNEY'}]:[])];
  if(s.scene==='canal')return [{id:'return',x:80,y:390,label:'RETURN TO THE STATION'},{id:'seed',x:375,y:390,label:s.vine?'CLIMB THE VINE · HOLD ↑':'A SEED BESIDE THE VIADUCT'},{id:'crate',x:445,y:390,label:s.raft?'THE RAFT WILL COME BACK':'A WOODEN CRATE BY THE WATER'},{id:'observatory',x:1530,y:390,label:'ENTER THE OBSERVATORY'}];
  return [{id:'return',x:75,y:400,label:'BACK TO THE CANAL'},{id:'mirror',x:510,y:400,label:s.lit?'THE LIGHT HAS FOUND ITS WAY':s.words.includes('Reflect')?'TURN THE MIRROR':'A DUSTY MIRROR'},{id:'recipient',x:1085,y:400,label:s.delivered?'READ THE REPLY':'DELIVER THE LETTER'},{id:'train',x:1190,y:400,label:'TAKE THE NIGHT TRAIN HOME'}];}
 near(){const p=this.player;return this.objects().filter(o=>Math.abs(o.x-p.x-12)<64&&Math.abs(o.y-p.y-p.h)<82).sort((a,b)=>Math.abs(a.x-p.x-12)-Math.abs(b.x-p.x-12))[0]||null;}
 interact(id=this.near()?.id){if(!id||!this.objects().some(o=>o.id===id))return null;const s=this.state;
  if(id==='master'){if(s.complete)return {type:'dialog',title:'THE STATIONMASTER',text:'A letter, a reply, and a light in the window. You have made this little station feel like somewhere again.',action:'close',label:'STAY A LITTLE'};if(s.delivered)return {type:'dialog',title:'THE REPLY',text:'“The lantern is lit. I will be on the next train home.”\nThe stationmaster folds the letter carefully. “Thank you for going all that way.”',action:'complete',label:'LIGHT UP THE STATION'};if(s.accepted)return {type:'dialog',title:'A LETTER BETWEEN WORLDS',text:'To Rowan, at the Lantern Observatory, beyond the Owl Post Canal. A floating crate or a growing vine may help you get there.',action:'close',label:'ON MY WAY'};return {type:'dialog',title:'THE LAST LETTER',text:'“This owl brought back the same envelope three nights in a row. Would you take it to Rowan at the old observatory? Some letters need footsteps, as well as wings.”',action:'accept',label:'I WILL TAKE IT'};}
  if(id==='primer'){if(!s.accepted)return {type:'notice',text:'Someone at the ticket window is looking for a traveller.'};return {type:'dialog',title:'WORDS THAT OPEN THE WORLD',text:'GROW · 生长：a seed becomes a way up.\nFLOAT · 漂浮：wood can carry you over water.\nREFLECT · 反射：a mirror can guide a beam of light.\nChoose a word when you find something it could change.',action:'primer',label:'PACK THE THREE WORD CARDS'};}
  if(id==='wall'){if(!s.accepted||!s.primer)return {type:'notice',text:!s.accepted?'Collect the letter from the stationmaster first.':'Open the spell satchel before stepping through the brick arch.'};return {type:'travel',scene:'canal',label:'PLATFORM 9¾ · BETWEEN DEPARTURES'};}
  if(id==='seed')return s.vine?{type:'notice',text:'Stand beneath the vine and hold W / ↑ / JUMP to climb. S / ↓ drops from the high path.'}:{type:'cards',object:'seed',title:'A small seed reaches toward the broken viaduct.'};
  if(id==='crate')return s.raft?{type:'notice',text:'Jump onto the crate-raft. It travels between both banks and always returns.'}:{type:'cards',object:'crate',title:'The canal is deep. This wooden crate is light.'};
  if(id==='observatory')return {type:'travel',scene:'observatory',label:'THE LANTERN OBSERVATORY'};
  if(id==='return')return {type:'travel',scene:s.scene==='canal'?'station':'canal',label:s.scene==='canal'?'BACK TO THE HIDDEN PLATFORM':'THE OWL POST CANAL'};
  if(id==='mirror'){if(s.lit)return {type:'notice',text:'The arch is open. Follow the light to Rowan.'};if(!s.words.includes('Reflect'))return {type:'cards',object:'mirror',title:'A beam of moonlight falls on the dusty mirror.'};s.mirror=(s.mirror+1)%3;if(s.mirror===2){s.lit=true;this.emit({type:'cue',kind:'light'});this.emit({type:'notice',text:'The lantern answers. The arch is open.'});}else this.emit({type:'notice',text:'The beam misses the lantern. Turn the mirror once more.'});this.save();return null;}
  if(id==='recipient'){if(!s.lit)return {type:'notice',text:'Guide the mirror beam into the high lantern first.'};if(s.delivered)return {type:'dialog',title:'ROWAN',text:'“I thought the station had forgotten this old place. Tell them to leave a light on. I am coming home.”',action:'close',label:'KEEP THE REPLY SAFE'};return {type:'dialog',title:'A WINDOW STILL LIT',text:'Rowan breaks the little wax seal and smiles.\n“I was waiting for a reason to come back.”\nThey hand you a reply. “The night train stops just outside. Will you take this home?”',action:'deliver',label:'TAKE THE REPLY'};}
  if(id==='train'){if(!s.delivered)return {type:'notice',text:'The conductor is waiting for Rowan’s reply. Find Rowan beyond the arch.'};return {type:'travel',scene:s.scene==='station'?'canal':'station',label:s.scene==='station'?'A LITTLE MORE TO DISCOVER':'THE NIGHT TRAIN · HOMEWARD'};}
 }
 perform(action){const s=this.state;if(action==='accept'){s.accepted=true;this.place('station-letter','A letter entrusted to a traveller');}if(action==='primer'&&s.accepted)s.primer=true;if(action==='deliver'&&s.lit){s.delivered=true;this.emit({type:'cue',kind:'letter'});}
  if(action==='complete'&&s.delivered&&!s.complete){s.complete=true;this.emit({type:'complete',memory:'A letter found its way home. Platform 9¾ is bright again.'});}this.save();}
 useWord(object,word){const correct={seed:'Grow',crate:'Float',mirror:'Reflect'};if(!this.state.primer||!(word in WORDS))return false;
  if(correct[object]!==word){this.emit({type:'notice',text:word==='Grow'?'Grow helps living things reach upward. Try a seed.':word==='Float'?'Float helps a light object rest on water. Try the crate.':'Reflect sends light in a new direction. Try a mirror.'});return false;}
  if(object==='seed')this.state.vine=true;if(object==='crate'){this.state.raft=true;this.raftX=438;this.raftDir=1;}if(object==='mirror')this.state.mirror=0;
  this.word(word);this.emit({type:'cue',kind:'magic'});this.emit({type:'notice',text:object==='seed'?'GROW · The viaduct wakes. Hold ↑ beside the vine to climb.':object==='crate'?'FLOAT · Jump onto the raft when it reaches the bank.':'REFLECT · Now turn the mirror to reach the lantern.'});this.save();return true;
 }
 objective(){const s=this.state;if(s.complete)return 'The station is bright again. Stay, explore, or return to your journey.';if(s.delivered)return 'Take the night train back. Deliver Rowan’s reply to the stationmaster.';if(s.scene==='observatory')return s.lit?'The arch is open. Find Rowan on the right.':'Use REFLECT, then turn the mirror until the beam reaches the lantern.';if(s.scene==='canal')return 'Cross the canal: FLOAT on the water, or GROW a path above it.';return !s.accepted?'Find the stationmaster. There is one letter left to deliver.':!s.primer?'Open the spell satchel beside the luggage.':'Walk through the red-brick arch marked 9¾.';}
}
