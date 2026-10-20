/* The host bridge owns only the optional entrance and pause/resume boundary. */
window.installStationQuest=function(host){
 const KEY='pixelEnglishStationUnlockedV1';let unlocked=false,active=false,frame=null,oldFocus=null,inertState=[];
 try{unlocked=localStorage.getItem(KEY)==='true';}catch{}
 const style=document.createElement('style');style.textContent=`
 #magicStationEntrance{font-family:JourneyBodyPixel,monospace;font-size:12px;border-radius:0;background:#294952;color:#f7e2b3;border:2px solid #c8ad73;padding:10px 13px;box-shadow:inset 0 0 0 2px #18333f,0 3px 0 #172a36;}
 #magicStationEntrance.station-ending-entry{position:fixed;z-index:10022;top:max(12px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);max-width:90vw;white-space:nowrap;}
 #magicStationOverlay{position:fixed;inset:0;background:#122632;z-index:10050;display:flex;flex-direction:column;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom);}
 #magicStationOverlay iframe{border:0;width:100%;flex:1;min-height:0;background:#122632;}
 #magicStationFallback{font:12px JourneyBodyPixel,monospace;display:flex;gap:16px;align-items:center;justify-content:space-between;color:#d7cda9;padding:6px 12px;background:#152b38;}
 #magicStationFallback button{font-size:11px;padding:5px 8px;border-radius:0;}
 #magicStationEntrance[hidden],#magicStationOverlay[hidden]{display:none!important}
 @media(max-width:650px){#magicStationEntrance{font-size:10px;padding:9px}#magicStationFallback{font-size:9px}#magicStationFallback button{font-size:9px;}}
 `;document.head.append(style);
 const button=document.createElement('button');button.id='magicStationEntrance';button.type='button';button.textContent='OWL POST · PLATFORM 9¾';button.hidden=true;button.setAttribute('aria-label','进入魔法车站送信支线');
 const actions=document.querySelector('header .actions');actions.append(button);
 const overlay=document.createElement('section');overlay.id='magicStationOverlay';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','魔法车站：旧车站来信');
 const fallback=document.createElement('div');fallback.id='magicStationFallback';const label=document.createElement('span');label.textContent='SIDE STORY · progress is saved automatically';const close=document.createElement('button');close.textContent='RETURN TO JOURNEY';close.type='button';fallback.append(label,close);overlay.append(fallback);document.body.append(overlay);
 function refresh(){if(active)return;const s=host.state();if(s.completed||s.exploring){unlocked=true;try{localStorage.setItem(KEY,'true');}catch{}}
  const eligible=unlocked&&!s.busy&&(s.completed||s.exploring||s.home);button.hidden=!eligible;
  button.classList.toggle('station-ending-entry',s.ending);if(s.ending&&button.parentElement!==document.body)document.body.append(button);else if(!s.ending&&button.parentElement!==actions)actions.append(button);
 }
 function open(){if(active||button.hidden)return;active=true;oldFocus=document.activeElement;host.pause();overlay.hidden=false;
  inertState=[...document.body.children].filter(n=>n!==overlay&&n.tagName!=='SCRIPT'&&n.tagName!=='STYLE').map(n=>[n,n.inert]);for(const [n]of inertState)n.inert=true;
  frame=document.createElement('iframe');frame.title='The Letter Between Worlds — Platform 9¾';frame.src='./station.html';overlay.append(frame);frame.onload=()=>frame.contentWindow?.postMessage({source:'pixel-magic-host',type:'config',muted:host.muted()},location.origin);frame.focus();document.body.style.overflow='hidden';
 }
 let oldOverflow='';button.onclick=()=>{oldOverflow=document.body.style.overflow;open();};
 function exit(){if(!active)return;frame?.contentWindow?.postMessage({source:'pixel-magic-host',type:'closing'},location.origin);frame?.remove();frame=null;overlay.hidden=true;for(const[n,v]of inertState)n.inert=v;inertState=[];document.body.style.overflow=oldOverflow;active=false;host.resume();refresh();(oldFocus?.isConnected?oldFocus:button).focus({preventScroll:true});}
 close.onclick=exit;
 window.addEventListener('message',e=>{if(!active||e.origin!==location.origin||e.source!==frame?.contentWindow||e.data?.source!=='pixel-magic-station')return;const d=e.data;if(d.type==='exit')exit();if(d.type==='word'&&['Grow','Float','Reflect'].includes(d.word))host.word(d.word);if(d.type==='place'&&['station-station','station-canal','station-observatory','station-letter'].includes(d.id))host.place(d.id,d.name);if(d.type==='complete')host.complete();if(d.type==='mute')host.setMuted(d.muted===true);});
 // Keep the original ending's keyboard trap, with one additional reachable exit.
 document.addEventListener('keydown',e=>{if(active){if(e.key==='Tab'&&document.activeElement===close){e.preventDefault();frame?.focus();}return;}const s=host.state();if(e.key!=='Tab'||!s.ending||button.hidden)return;const ids=s.trailEnding?['trailContinueBtn','trailReplayBtn','trailHomeBtn']:['endingPlayAgainBtn','endingHomeBtn','endingNewGameBtn'];const list=ids.map(id=>document.getElementById(id)).filter(b=>b&&!b.disabled);list.push(button);e.preventDefault();e.stopImmediatePropagation();const i=list.indexOf(document.activeElement);list[(i+(e.shiftKey?-1:1)+list.length)%list.length].focus({preventScroll:true});},true);
 refresh();setInterval(refresh,400);
};
