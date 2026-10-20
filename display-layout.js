// Pure viewport geometry, shared by the launcher and its regression tests.
export function layoutFor(width,height,mode='auto',insets={}){
 const top=Math.max(0,Number(insets.top)||0),right=Math.max(0,Number(insets.right)||0),bottom=Math.max(0,Number(insets.bottom)||0),left=Math.max(0,Number(insets.left)||0);
 const w=Math.max(1,width-left-right),h=Math.max(1,height-top-bottom),wantLandscape=mode==='landscape',wantPortrait=mode==='portrait';
 const rotate=(wantLandscape&&h>w)||(wantPortrait&&w>h);
 return {width:rotate?h:w,height:rotate?w:h,rotation:rotate?90:0,centerX:left+w/2,centerY:top+h/2};
}
export function bottomReserve(height,controlsHeight,groundRatio){
 return Math.ceil(Math.max(0,(controlsHeight+8-height*(1-groundRatio))/groundRatio));
}
