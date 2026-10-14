export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function steering(x,y,rotation,deadzone=.16,previous=0){
 if(Math.hypot(x,y)<deadzone)return {forward:false,left:false,right:false,turn:0};
 const angle=Math.atan2(x,-y)-rotation;
 const error=Math.atan2(Math.sin(angle),Math.cos(angle));
 const threshold=previous===Math.sign(error)?.035:.085;
 const turn=Math.abs(error)>threshold?Math.sign(error):0;
 return {forward:Math.abs(error)<1.05,left:turn<0,right:turn>0,turn};
}
export function preferences(value,landscape=false){
 const defaults={joystick:128,fire:88,opacity:80,deadzone:16,jx:18,jy:landscape?65:50,fx:82,fy:landscape?65:50};
 const bounds={joystick:[80,200],fire:[56,150],opacity:[30,100],deadzone:[8,30],jx:[0,100],jy:[0,100],fx:[0,100],fy:[0,100]};
 return Object.fromEntries(Object.entries(defaults).map(([k,v])=>[k,typeof value?.[k]==='number'&&Number.isFinite(value[k])?clamp(value[k],...bounds[k]):v]));
}
export function controlPosition(percent,size,extent){return clamp(extent*percent/100,Math.min(size/2,extent/2),Math.max(extent-size/2,extent/2));}
