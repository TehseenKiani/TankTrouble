import {steering,preferences,controlPosition,clamp} from './touch-math.js';
export class TouchControls {
 static deps=null; static vector={x:0,y:0}; static firing=false; static editing=false; static active=null; static pointer=null; static firePointer=null; static saved={}; static frame=null;
 static isEnabled(){return typeof window!=='undefined'&&(matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0||innerWidth<=900);}
 static createInputManager(id){
  let last='',controller=null,turn=0;
  return {getPlayerId:()=>id,reset:()=>{TouchControls.reset();last='';},update(){
   const t=TouchControls,d=t.deps;if(!d)return;
   const gc=d.GameSession.getGameController(),game=d.GameSession.getGame();if(!gc)return;
   if(!t.active)t.active=id;
   const enabled=t.isEnabled()&&t.active===id&&!t.editing&&!document.querySelector('dialog[open]')&&game?.input.enabled&&!document.hidden;
   const tank=gc.getTank(id);
   const s=enabled&&tank?steering(t.vector.x,t.vector.y,tank.getRotation(),t.prefs.deadzone/100,turn):{forward:false,left:false,right:false,turn:0};turn=s.turn;
   const fire=enabled&&t.firing;
   const signature=[s.forward,s.left,s.right,fire,gc.getState()].join(',');
   if(gc!==controller||last!==signature){gc.setInputState(d.InputState.withState(id,s.forward,false,s.left,s.right,fire));last=signature;controller=gc;}
  }};
 }
 static get orientation(){return innerWidth>innerHeight?'landscape':'portrait';}
 static get prefs(){return preferences(this.saved[this.orientation],this.orientation==='landscape');}
 static save(p){this.saved[this.orientation]=preferences(p,this.orientation==='landscape');try{localStorage.setItem('tank-touch-layout-v1',JSON.stringify(this.saved));}catch{}this.position();}
 static reset(){this.vector={x:0,y:0};this.firing=false;this.pointer=null;this.firePointer=null;this.knob?.style.setProperty('transform','translate(0,0)');this.fire?.classList.remove('pressed');}
 static init(deps){
  this.deps=deps;try{this.saved=JSON.parse(localStorage.getItem('tank-touch-layout-v1'))||{};}catch{this.saved={};}
  if(typeof this.saved!=='object'||Array.isArray(this.saved))this.saved={};
  const main=document.querySelector('#mainContent');
  this.tools=document.createElement('div');this.tools.id='touchTools';this.tools.innerHTML='<button type="button" data-controls>Controls</button><button type="button" data-landscape>Landscape</button><button type="button" data-menu>Menu</button><button type="button" data-done hidden>Done</button><span role="status"></span>';main.prepend(this.tools);
  this.zone=document.createElement('div');this.zone.id='touchControlZone';this.zone.innerHTML='<div id="touchJoystick" aria-label="Movement joystick"><span></span></div><button type="button" id="touchFire" aria-label="Fire">FIRE</button>';main.insertBefore(this.zone,document.querySelector('#playerPanel'));
  this.joystick=this.zone.firstElementChild;this.knob=this.joystick.firstElementChild;this.fire=this.zone.lastElementChild;
  this.tools.querySelector('[data-menu]').onclick=()=>{document.body.classList.toggle("touch-menu-open");this.schedule();};
  this.tools.querySelector('[data-controls]').onclick=()=>this.settings();
  this.tools.querySelector('[data-done]').onclick=()=>{this.editing=false;this.reset();this.layout();};
  this.tools.querySelector('[data-landscape]').onclick=()=>this.landscape();
  for(const [element,key] of [[this.joystick,'j'],[this.fire,'f']]){
   const owner=key==='j'?'pointer':'firePointer';
   element.addEventListener('pointerdown',e=>{if(e.button!==0||this[owner]!==null)return;e.preventDefault();this[owner]=e.pointerId;element.setPointerCapture(e.pointerId);if(this.editing)this.moveControl(e,key);else if(key==='j')this.moveStick(e);else{this.firing=true;this.fire.classList.add('pressed');}});
   element.addEventListener('pointermove',e=>{if(this[owner]!==e.pointerId)return;e.preventDefault();if(this.editing)this.moveControl(e,key);else if(key==='j')this.moveStick(e);});
   const release=e=>{if(this[owner]!==e.pointerId)return;this[owner]=null;if(key==='j'){this.vector={x:0,y:0};this.knob.style.transform='translate(0,0)';}else{this.firing=false;this.fire.classList.remove('pressed');}};
   for(const event of ['pointerup','pointercancel','lostpointercapture'])element.addEventListener(event,release);
  }
  window.addEventListener('blur',()=>this.reset());document.addEventListener('visibilitychange',()=>this.reset());
  const resize=()=>{this.reset();this.schedule();};window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);document.addEventListener('fullscreenchange',resize);
  deps.GameSession.addControllerChangeListener(()=>this.schedule());deps.Users.addEventListener(()=>this.schedule(),this);
  this.layout();
 }
 static moveStick(e){const r=this.joystick.getBoundingClientRect(),radius=r.width/2;let x=(e.clientX-r.left-radius)/radius,y=(e.clientY-r.top-radius)/radius;const length=Math.max(1,Math.hypot(x,y));x/=length;y/=length;this.vector={x,y};this.knob.style.transform='translate('+x*radius*.65+'px,'+y*radius*.65+'px)';}
 static moveControl(e,key){const r=this.zone.getBoundingClientRect();this.save({...this.prefs,[key+'x']:clamp((e.clientX-r.left)/r.width*100,0,100),[key+'y']:clamp((e.clientY-r.top)/r.height*100,0,100)});}
 static position(){if(!this.zone)return;const p=this.prefs;this.zone.parentElement.style.setProperty('--touch-control-row',Math.max(p.joystick,p.fire)+16+'px');const r=this.zone.getBoundingClientRect();for(const [el,key,size] of [[this.joystick,'j',p.joystick],[this.fire,'f',p.fire]]){el.style.width=el.style.height=size+'px';el.style.left=controlPosition(p[key+'x'],size,r.width)+'px';el.style.top=controlPosition(p[key+'y'],size,r.height)+'px';el.style.opacity=p.opacity/100;}}
 static schedule(){if(this.frame)return;this.frame=requestAnimationFrame(()=>{this.frame=null;this.layout();});}
 static layout(){const enabled=this.isEnabled();document.body.classList.toggle('touch-mode',enabled);document.body.classList.toggle('touch-landscape',enabled&&this.orientation==='landscape');document.body.classList.toggle('touch-editing',this.editing);this.tools.querySelector('[data-done]').hidden=!this.editing;
  const ids=this.deps.Users.getAllPlayerIds();if(!ids.includes(this.active))this.active=ids[0]||null;
  if(!enabled){for(const id of ids)if(this.deps.Inputs.getAssignedInputSetId(id)==='touch')this.deps.Inputs.addInputManager(id,this.deps.Inputs.getAvailableInputSetId());}
  if(enabled){for(const id of this.deps.Users.getAllPlayerIds()){if(this.deps.Inputs.getAssignedInputSetId(id)!=='touch')this.deps.Inputs.addInputManager(id,'touch');}this.position();}
  this.deps.ResizeManager.refresh();
  requestAnimationFrame(()=>{for(const [game,id,viewport] of [[this.deps.GameSession.getGame(),'game',this.deps.GAME_VIEWPORT],[this.deps.UIPlayerPanel.phaserInstance,'playerPanel',this.deps.PLAYER_PANEL_VIEWPORT]])if(game?.scale&&game.isBooted)this.deps.updateCanvasViewport(game,document.getElementById(id).getBoundingClientRect(),viewport,this.deps.UIConstants.CANVAS_PIXEL_RATIO);this.position();});
 }
 static async landscape(){this.reset();const status=this.tools.querySelector('[role=status]');try{if(document.fullscreenElement){await document.exitFullscreen();screen.orientation?.unlock?.();status.textContent='';return;}if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();if(screen.orientation?.lock)await screen.orientation.lock('landscape');else throw Error();status.textContent='';}catch{status.textContent='Rotate your device sideways for landscape.';}this.schedule();}
 static settings(){this.reset();const dialog=document.createElement('dialog');dialog.className='touchSettings';const p=this.prefs;dialog.innerHTML='<h2>Touch controls</h2><p>'+this.orientation+' layout · saved on this device</p><label>Controlled player <select data-player></select></label>';
  const select=dialog.querySelector('select');for(const [index,id] of this.deps.Users.getAllPlayerIds().entries()){const option=document.createElement('option');option.value=id;option.textContent='Player '+(index+1);select.append(option);}select.value=this.active;select.onchange=()=>{this.reset();this.active=select.value;};
  for(const [key,label,min,max] of [['joystick','Joystick size',80,200],['fire','Fire size',56,150],['opacity','Opacity',30,100],['deadzone','Joystick dead zone',8,30],['jx','Joystick horizontal position',0,100],['jy','Joystick vertical position',0,100],['fx','Fire horizontal position',0,100],['fy','Fire vertical position',0,100]]){const row=document.createElement('label');row.textContent=label+' ';const output=document.createElement('output');output.textContent=p[key];const input=document.createElement('input');input.type='range';input.min=min;input.max=max;input.value=p[key];input.oninput=()=>{output.textContent=input.value;this.save({...this.prefs,[key]:Number(input.value)});};row.append(output,input);dialog.append(row);}
  const button=(label,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;dialog.append(b);};button('Swap sides',()=>{const a=this.prefs;this.save({...a,jx:a.fx,fx:a.jx,jy:a.fy,fy:a.jy});dialog.close();});button('Reset layout',()=>{this.save(preferences(null,this.orientation==='landscape'));dialog.close();});button('Drag controls',()=>{this.editing=true;dialog.close();this.layout();});button('Done',()=>dialog.close());dialog.addEventListener('close',()=>{this.reset();dialog.remove();});document.body.append(dialog);dialog.showModal();
 }
}
