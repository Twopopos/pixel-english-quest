/* Keep the game document untransformed internally: its camera, PDF and input
   coordinates remain correct even when the outer viewport rotates on Safari. */
import {layoutFor} from './display-layout.js?v=12.1';
const root=document.getElementById('displayRoot'),stage=document.getElementById('displayStage'),frame=document.getElementById('gameFrame'),safe=document.getElementById('displaySafeArea');
if(location.hash==='#station')frame.src='./station.html';
let mode='portrait',mobile=false,ownedFullscreen=false,changing=false,requestId=0;
try{const v=sessionStorage.getItem('pixelEnglishDisplayModeV1');if(v==='landscape'||v==='portrait')mode=v;}catch{}
function nativeSize(){const v=window.visualViewport;return {width:v?.width||innerWidth,height:v?.height||innerHeight,left:v?.offsetLeft||0,top:v?.offsetTop||0};}
function config(){return {source:'pixel-display-host',type:'config',mode,mobile,landscape:mobile&&mode==='landscape',width:stage.clientWidth,height:stage.clientHeight};}
function tell(target=frame.contentWindow){try{target?.postMessage(config(),location.origin);}catch{}}
function layout(){requestId=0;const v=nativeSize(),c=getComputedStyle(safe),insets={top:parseFloat(c.paddingTop)||0,right:parseFloat(c.paddingRight)||0,bottom:parseFloat(c.paddingBottom)||0,left:parseFloat(c.paddingLeft)||0};
 mobile=matchMedia('(hover:none) and (pointer:coarse)').matches||navigator.maxTouchPoints>0||Math.min(v.width,v.height)<=600;
 const q=layoutFor(v.width,v.height,mobile?mode:'auto',insets);
 root.style.left=v.left+'px';root.style.top=v.top+'px';root.style.width=v.width+'px';root.style.height=v.height+'px';
 stage.style.width=q.width+'px';stage.style.height=q.height+'px';stage.style.left=q.centerX+'px';stage.style.top=q.centerY+'px';stage.style.transform=`translate(-50%,-50%) rotate(${q.rotation}deg)`;
 root.dataset.mode=mode;root.dataset.rotation=String(q.rotation);root.dataset.logicalWidth=String(q.width);root.dataset.logicalHeight=String(q.height);tell();
}
function schedule(){if(!requestId)requestId=requestAnimationFrame(layout);}
function accepted(source){try{return source===frame.contentWindow||source?.parent===frame.contentWindow;}catch{return false;}}
async function toggle(){if(changing)return;changing=true;mode=mode==='landscape'?'portrait':'landscape';try{sessionStorage.setItem('pixelEnglishDisplayModeV1',mode);}catch{}layout();
 // Only a user pressing the orientation button can request native fullscreen.
 try{if(mode==='landscape'){
   if(window.parent===window&&!document.fullscreenElement&&root.requestFullscreen){await root.requestFullscreen();ownedFullscreen=true;}
   if(window.parent===window&&screen.orientation?.lock)await screen.orientation.lock('landscape');
  }else{try{screen.orientation?.unlock?.();}catch{}if(ownedFullscreen&&document.fullscreenElement&&document.exitFullscreen)await document.exitFullscreen();ownedFullscreen=false;}
 }catch{/* CSS viewport rotation already supplies the requested orientation. */}
 finally{changing=false;schedule();}
}
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===frame.contentWindow&&e.data?.source==='pixel-magic-station'&&e.data.type==='exit'&&frame.getAttribute('src')==='./station.html'){frame.src='./quest-game.html';history.replaceState(null,'',location.pathname+location.search);return}if(e.origin!==location.origin||!accepted(e.source)||e.data?.source!=='pixel-display-client')return;if(e.data.type==='ready')tell(e.source);if(e.data.type==='toggle')toggle();});
window.addEventListener('resize',schedule);window.addEventListener('orientationchange',schedule);window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)ownedFullscreen=false;schedule();});frame.addEventListener('load',()=>{tell();document.getElementById('displayLoading').hidden=true;});layout();
