import {bottomReserve} from './display-layout.js';
(()=>{
const embedded=window.top!==window;let displayHost=window.parent;try{for(let ancestor=window.parent;ancestor!==window;ancestor=ancestor.parent){if(ancestor.document.getElementById('displayRoot')){displayHost=ancestor;break}if(ancestor===ancestor.parent)break}}catch{}
const station=!!document.getElementById('stationApp');let mode='portrait',mobile=false,lastSize='';
const button=document.createElement('button');button.type='button';button.id='orientationToggle';button.hidden=true;
const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='./display-client.css';document.head.append(sheet);
const actions=document.querySelector(station?'.topActions':'header .actions');if(!actions)return;actions.prepend(button);
let fitRequest=0;
function fitScene(){fitRequest=0;if(!mobile||mode!=='landscape')return;const controls=document.querySelector(station?'.controls':'.mobile'),footer=station?document.querySelector('#stationApp footer'):null,footerHeight=footer?footer.getBoundingClientRect().height+4:0;document.body.style.setProperty('--display-footer-height',footerHeight+'px');const strip=(controls?.getBoundingClientRect().height||60)+footerHeight;document.body.style.setProperty('--scene-bottom-reserve',bottomReserve(document.documentElement.clientHeight,strip,station?405/480:365/426)+'px');}
function scheduleFit(){if(!fitRequest)fitRequest=requestAnimationFrame(fitScene);}
sheet.addEventListener('load',scheduleFit);window.addEventListener('resize',scheduleFit);document.fonts?.ready?.then(scheduleFit);
function render(){const landscape=mobile&&mode==='landscape';document.body.classList.toggle('phone-landscape',landscape);document.body.classList.toggle('phone-display-mobile',mobile);
 button.hidden=!mobile;button.textContent=landscape?'↶ 竖屏':'↷ 横屏';button.setAttribute('aria-label',landscape?'切换竖屏显示':'切换横屏并适配手机屏幕');button.setAttribute('aria-pressed',String(landscape));
 if(!station){const floating=!document.body.classList.contains('game-active')||document.body.classList.contains('ending-active');button.classList.toggle('orientation-floating',floating);if(floating&&button.parentElement!==document.body)document.body.append(button);else if(!floating&&button.parentElement!==actions)actions.prepend(button);}
 // Forward only display configuration to the optional station frame.
 const child=document.querySelector('#magicStationOverlay iframe');child?.contentWindow?.postMessage({source:'pixel-display-host',type:'config',mode,mobile,landscape},location.origin);
 scheduleFit();
}
button.onclick=()=>{document.activeElement?.blur();window.dispatchEvent(new Event('blur'));if(embedded)displayHost.postMessage({source:'pixel-display-client',type:'toggle'},location.origin);else{try{sessionStorage.setItem('pixelEnglishDisplayModeV1',mode==='landscape'?'portrait':'landscape')}catch{}location.href=station?'./index.html#station':'./index.html';}};
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.data?.source!=='pixel-display-host'||e.data.type!=='config'||!(e.source===displayHost||e.source===window.parent))return;const size=String(e.data.width)+'x'+String(e.data.height),changed=mode!==e.data.mode||mobile!==!!e.data.mobile||lastSize!==size;lastSize=size;mode=e.data.mode==='landscape'?'landscape':'portrait';mobile=!!e.data.mobile;if(changed)window.dispatchEvent(new Event('blur'));render();});
const observer=new MutationObserver(()=>render());observer.observe(document.body,{attributes:true,attributeFilter:['class']});
if(embedded)displayHost.postMessage({source:'pixel-display-client',type:'ready'},location.origin);
// A station opened directly can still reach the launcher with one tap.
else{mobile=matchMedia('(hover:none) and (pointer:coarse)').matches||Math.min(innerWidth,innerHeight)<=600;render();}
})();
