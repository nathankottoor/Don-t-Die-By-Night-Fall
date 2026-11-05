/* DEADLIGHT. Original procedural art and synthesized audio. No dependencies. */
(() => {
'use strict';
const $=id=>document.getElementById(id), canvas=$('game'), ctx=canvas.getContext('2d');
const W=1440,H=900,B={x:720,y:450,r:83},keys=new Set(),mouse={x:1000,y:450,down:false};
let mode='title',prior='playing',g,scale=1,ox=0,oy=0,last=0,clock=0,muted=false,audio,best=0;
try{best=Number(localStorage.getItem('deadlight-best'))||0;}catch{}
const rand=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function sound(f,d=.08,type='square',vol=.025){if(muted)return;try{audio ||= new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),v=audio.createGain();o.type=type;o.frequency.setValueAtTime(f,audio.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(30,f*.35),audio.currentTime+d);v.gain.setValueAtTime(vol,audio.currentTime);v.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+d);o.connect(v);v.connect(audio.destination);o.start();o.stop(audio.currentTime+d);}catch{}}
function fresh(){return {player:{x:720,y:590},playerHp:100,playerHit:0,recruitCool:0,inCity:false,city:null,cityVisitedWave:0,hp:1000,wave:0,survived:0,kills:0,cash:0,score:0,ammo:24,mag:24,damage:30,interval:.17,levels:[0,0,0],reload:0,cool:0,enemies:[],bullets:[],particles:[],corpses:[],survivors:[],guards:[],rescued:0,capacity:5,buildWaves:0,buildStarted:0,expansions:0,rescueSent:false,rescueAt:0,survivorEdge:0,guardCool:0,spawn:0,pending:0,break:0,flash:0,shake:0,toast:0};}
g=fresh();
function hud(){ $('playerHealth').hidden=mode==='title';$('playerHealth').textContent=`YOU ${Math.ceil(g.playerHp)} / 100 · E RECRUIT NEARBY HUMAN`; $('playerHealth').style.color=g.playerHp<35?'#ff7777':'#d2f56a';$('baseValue').textContent=`${Math.ceil(g.hp)} / 1000`;$('baseBar').style.width=g.hp/10+'%';$('baseBar').style.background=g.hp<300?'#ff735e':'#d2f56a';$('waveValue').textContent=`WAVE ${String(g.wave).padStart(2,'0')}`;$('moneyValue').textContent=g.cash;$('ammo').textContent=g.inCity?`CAR ${Math.ceil(g.city.hp)}% · CARGO ${g.city.cargo}`:g.reload?`RELOADING ${g.reload.toFixed(1)}s`:`${g.ammo} / ${g.mag}`;$('remaining').textContent=`${g.pending+g.enemies.filter(e=>e.type!=="infectedCivilian").length} ZOMBIES · ${g.enemies.filter(e=>e.type==="infectedCivilian").length} INFECTED CIVILIANS ·  ${g.rescued}/${g.capacity} PEOPLE${g.buildWaves?` · BUILD ${g.buildWaves} WAVES`:""}  ·  SCORE ${g.score}  ·  BEST ${best}`;}
function announce(t){$('toast').textContent=t;g.toast=2.5;}
function start(){B.r=83;g=fresh();mode='playing';$('menu').hidden=true;$('panel').hidden=true;$('hud').hidden=false;$('bottom').hidden=false;nextWave();sound(300,.2,'sine');}
function nextWave(){g.wave++;g.pending=8+Math.floor(g.wave*3.2);g.spawn=.8;g.rescueSent=false;g.rescueAt=Math.floor(g.pending/2);mode='playing';$('panel').hidden=true;announce(`WAVE ${String(g.wave).padStart(2,'0')} · ${g.wave===3?'RUNNERS INBOUND':g.wave===5?'BRUTES INBOUND':'HOLD THE CENTER'}`);hud();}
function panel(label,title,text,button){$('panelLabel').textContent=label;$('panelTitle').textContent=title;$('panelText').textContent=text;$('continue').textContent=button;$('panel').hidden=false;$('upgrades').innerHTML='';$('restart').hidden=true;}
function pause(){if(mode==='playing'||mode==='shop'){prior=mode;mode='paused';mouse.down=false;keys.clear();panel('SIGNAL HELD','Take a breath.','The outpost is waiting. Resume when you’re ready.','RESUME');}else if(mode==='paused'){mode=prior;if(mode==='shop')shop(false);else $('panel').hidden=true;}}
function end(){mode='over';mouse.down=false;best=Math.max(best,g.score);try{localStorage.setItem('deadlight-best',best);}catch{}panel('SIGNAL LOST',g.playerHp<=0?'You were overwhelmed.':'The light went out.',`${g.survived} waves survived · ${g.kills} infected eliminated. Score ${g.score} · Best ${best}`,'RESTART DEFENSE');sound(80,.8,'sawtooth');}
const costs=()=>[70,90+g.levels[0]*65,100+g.levels[1]*75,80+g.levels[2]*60];
function shop(reset=true){mode='shop';if(reset)g.break=18;panel('PERIMETER SECURED',`Wave ${g.wave} survived.`,`+${65+g.wave*15} salvage secured. ${g.buildWaves?`Camp expansion: survive ${g.buildWaves} more full waves.`:`Camp capacity: ${g.rescued}/${g.capacity}. Full camps expand in 2 waves.`}`,'START NEXT WAVE');const labels=[['Repair barricades','Restore 300 integrity'],['Stopping power',`${g.damage} → ${g.damage+10} damage`],['Rapid fire',`${(1/g.interval).toFixed(1)} rounds / sec · +15%`],['Extended magazine',`${g.mag} → ${g.mag+6} rounds`]];labels.forEach((l,i)=>{const b=document.createElement('button');b.className='upgrade';b.innerHTML=`<span><strong>${l[0]}</strong><small>${l[1]}</small></span><b>${costs()[i]} ◈</b>`;b.disabled=g.cash<costs()[i]||(i===0&&g.hp>=1000)||(i===2&&g.levels[1]>=10);b.onclick=()=>{const c=costs()[i];if(g.cash<c)return;g.cash-=c;if(i===0)g.hp=Math.min(1000,g.hp+300);if(i===1){g.damage+=10;g.levels[0]++;}if(i===2){g.interval*=.87;g.levels[1]++;}if(i===3){g.mag+=6;g.ammo=g.mag;g.levels[2]++;}sound(550,.12,'sine');shop(false);hud();};$('upgrades').append(b);});hud();}
function reload(){if(mode!=='playing'||g.reload||g.ammo===g.mag)return;g.reload=1.35;sound(180,.12,'triangle');}
function spawn(){const edge=Math.floor(rand(0,4)),type=g.wave>=5&&Math.random()<.19?'brute':g.wave>=3&&Math.random()<.3?'runner':'walker',stats={walker:[45,34,13,11],runner:[29,69,9,16],brute:[175,23,24,32]}[type];g.enemies.push({x:edge===0?16:edge===1?W-16:rand(15,W-15),y:edge===2?16:edge===3?H-16:rand(15,H-15),type,hp:stats[0]*(1+(g.wave-1)*.13),speed:stats[1]*(1+Math.min(g.wave-1,35)*.018),r:stats[2],value:stats[3],hit:0,attack:rand(0,.4),phase:rand(0,6)});}
function sendSurvivors(){
 const edge=Math.floor(rand(0,4)),x=edge===0?24:edge===1?W-24:rand(100,W-100),y=edge===2?24:edge===3?H-24:rand(100,H-100);
 g.survivorEdge=edge;for(let i=0;i<Math.min(6,3+Math.floor(g.wave/3));i++)g.survivors.push({x:clamp(x+i*23,20,W-20),y:clamp(y+i*20,20,H-20),phase:rand(0,6),hp:40});
 announce('HOSTILE HUMANS · GET CLOSE AND PRESS E TO RECRUIT');sound(800,.18,'sine');
}
function sendInfectedCivilians(){
 const edge=g.survivorEdge^1,count=Math.min(7,2+Math.floor(g.wave/2));
 for(let i=0;i<count;i++){const offset=(i-(count-1)/2)*40;g.enemies.push({x:edge===0?24:edge===1?W-24:W/2+offset,y:edge===2?24:edge===3?H-24:H/2+offset,type:'infectedCivilian',hp:36*(1+(g.wave-1)*.13),speed:49*(1+Math.min(g.wave-1,35)*.018),r:12,value:14,hit:0,attack:rand(0,.4),phase:rand(0,6)});}
 announce('ORANGE: HOSTILE HUMANS · E RECRUIT · RED: INFECTED');
}
function recruitOne(){
 if(mode!=='playing'||g.inCity)return false;
 let candidate=null,dist=72;for(const person of g.survivors){const d=Math.hypot(person.x-g.player.x,person.y-g.player.y);if(d<dist){candidate=person;dist=d;}}
 if(!candidate)return false;
 if(g.rescued>=g.capacity){announce('CAMP FULL · WAIT FOR THE EXPANSION');return true;}
 if(g.recruitCool>0)return true;
 g.survivors.splice(g.survivors.indexOf(candidate),1);g.rescued++;g.recruitCool=.65;g.hp=Math.min(1000,g.hp+60);g.playerHp=Math.min(100,g.playerHp+5);
 if(g.rescued===g.capacity&&!g.buildWaves){g.buildWaves=2;g.buildStarted=g.wave;}
 burst(candidate.x,candidate.y,'#72dfff',15);announce(g.rescued===5?'ALLY RECRUITED · CAR UNLOCKED · CAMP EXPANDING':'ONE HUMAN RECRUITED · NOW YOUR ALLY');sound(650,.2,'sine');hud();return true;
}
function updateSurvivors(dt,peaceful=false){
 g.recruitCool=Math.max(0,g.recruitCool-dt);g.playerHit=Math.max(0,g.playerHit-dt);if(peaceful)return;
 for(const person of g.survivors){const dx=g.player.x-person.x,dy=g.player.y-person.y,d=Math.hypot(dx,dy);if(d>30){const step=Math.min(115*dt,d-30);person.x+=dx/d*step;person.y+=dy/d*step;}
 const bd=Math.hypot(person.x-B.x,person.y-B.y);if(bd<B.r+16){const angle=Math.atan2(person.y-B.y,person.x-B.x);person.x=B.x+Math.cos(angle)*(B.r+16);person.y=B.y+Math.sin(angle)*(B.r+16);}
 if(Math.hypot(person.x-g.player.x,person.y-g.player.y)<39&&!g.playerHit){g.playerHp=Math.max(0,g.playerHp-8);g.playerHit=.7;g.shake=4;burst(g.player.x,g.player.y,'#ff9d66',5);sound(90,.1,'triangle');if(!g.playerHp){hud();end();return;}}
 }
}
function guardFire(dt,peaceful=false){
 while(g.guards.length<g.rescued){const i=g.guards.length,a=i*2.39996;g.guards.push({x:B.x+Math.cos(a)*(B.r+44),y:B.y+Math.sin(a)*(B.r+44),angle:a,cool:0,flash:0,hp:80});}
 if(g.guards.length>g.rescued)g.guards.length=g.rescued;
 for(let i=0;i<g.guards.length;i++){
  const guard=g.guards[i];guard.cool=Math.max(0,guard.cool-dt);guard.flash=Math.max(0,guard.flash-dt);
  let target=null,range=470;if(!peaceful)for(const e of g.enemies){const d=Math.hypot(e.x-guard.x,e.y-guard.y);if(e.hp>0&&d<range&&Math.hypot(e.x-B.x,e.y-B.y)<580){range=d;target=e;}}
  const patrol=i*Math.PI*2/Math.max(1,g.guards.length)+clock*.035;
  let tx=B.x+Math.cos(patrol)*(B.r+65),ty=B.y+Math.sin(patrol)*(B.r+65);
  if(target){guard.angle=Math.atan2(target.y-guard.y,target.x-guard.x);if(range>145){tx=target.x-Math.cos(guard.angle)*130;ty=target.y-Math.sin(guard.angle)*130;}else{tx=guard.x;ty=guard.y;}}
  const dist=Math.hypot(tx-guard.x,ty-guard.y),step=Math.min(dist,105*dt);if(dist>.1){guard.x+=(tx-guard.x)/dist*step;guard.y+=(ty-guard.y)/dist*step;if(!target)guard.angle=Math.atan2(ty-guard.y,tx-guard.x);}
  const bd=Math.hypot(guard.x-B.x,guard.y-B.y);if(bd<B.r+25){const angle=Math.atan2(guard.y-B.y,guard.x-B.x);guard.x=B.x+Math.cos(angle)*(B.r+25);guard.y=B.y+Math.sin(angle)*(B.r+25);}
  guard.x=clamp(guard.x,20,W-20);guard.y=clamp(guard.y,20,H-20);
  if(!target||guard.cool)continue;
  const vx=target.x-guard.x,vy=target.y-guard.y,along=clamp(((B.x-guard.x)*vx+(B.y-guard.y)*vy)/(vx*vx+vy*vy||1),0,1);if(Math.hypot(guard.x+vx*along-B.x,guard.y+vy*along-B.y)<B.r)continue;
  guard.angle=Math.atan2(vy,vx);const dx=Math.cos(guard.angle),dy=Math.sin(guard.angle);g.bullets.push({x:guard.x+dx*25,y:guard.y+dy*25,vx:dx*850,vy:dy*850,life:1,damage:18,ally:true});guard.cool=1.8*Math.max(1,g.guards.length/8);guard.flash=.08;sound(220,.045,'triangle',.012);
 }
}
function burst(x,y,color,n=8){for(let i=0;i<n;i++)g.particles.push({x,y,vx:rand(-100,100),vy:rand(-100,100),life:rand(.15,.5),color});}
function shoot(){if(g.cool||g.reload)return;if(g.ammo<=0){reload();return;}g.ammo--;g.cool=g.interval;g.flash=.065;const p=g.player,a=Math.atan2(mouse.y-p.y,mouse.x-p.x),dx=Math.cos(a),dy=Math.sin(a);g.bullets.push({x:p.x+dx*27,y:p.y+dy*27,vx:dx*1050,vy:dy*1050,life:1.5});sound(rand(100,160),.065,'sawtooth',.035);if(!g.ammo)reload();}
function update(dt){clock+=dt;if(g.inCity&&mode==='playing'){updateCity(dt);return;}if(g.toast>0){g.toast-=dt;if(g.toast<=0)$('toast').textContent='';}if(mode==='shop'){updateSurvivors(dt,true);guardFire(dt,true);hud();g.break-=dt;$('continue').textContent=`START NEXT WAVE · ${Math.ceil(g.break)}s`;if(g.break<=0)nextWave();return;}if(mode!=='playing')return;
 let dx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),dy=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);const len=Math.hypot(dx,dy)||1,p=g.player;p.x=clamp(p.x+dx/len*235*dt,19,W-19);p.y=clamp(p.y+dy/len*235*dt,19,H-19);const bp=Math.hypot(p.x-B.x,p.y-B.y);if(bp<B.r+15){p.x=B.x+(p.x-B.x)/(bp||1)*(B.r+15);p.y=B.y+(p.y-B.y)/(bp||1)*(B.r+15);}
 g.cool=Math.max(0,g.cool-dt);g.flash=Math.max(0,g.flash-dt);g.shake=Math.max(0,g.shake-dt*15);if(g.reload){g.reload=Math.max(0,g.reload-dt);if(!g.reload){g.ammo=g.mag;sound(400,.08,'triangle');}}if(mouse.down)shoot();
 updateSurvivors(dt);if(mode!=='playing')return;guardFire(dt);g.spawn-=dt;if(g.pending&&g.spawn<=0){spawn();g.pending--;g.spawn=Math.max(.13,.7-g.wave*.018);}
 if(!g.rescueSent&&g.pending<=g.rescueAt){g.rescueSent=true;sendSurvivors();sendInfectedCivilians();}
 for(const e of g.enemies){
  e.hit=Math.max(0,e.hit-dt);e.attack-=dt;
  let human=null,range=300;if(Math.hypot(g.player.x-e.x,g.player.y-e.y)<230){for(const person of [...g.survivors,...g.guards]){const d=Math.hypot(person.x-e.x,person.y-e.y);if((person.hp??40)>0&&d<range){human=person;range=d;}}}
  e.humanTarget=human;const target=human||B,d=Math.hypot(target.x-e.x,target.y-e.y),reach=human?e.r+16:B.r+e.r-8;
  if(d>reach){const step=Math.min(e.speed*dt,d-reach);e.x+=(target.x-e.x)/d*step;e.y+=(target.y-e.y)/d*step;}
  else if(e.attack<=0){const damage=e.type==='brute'?34:e.type==='runner'?9:15;e.attack=.8;
   if(human){human.hp=Math.max(0,(human.hp??40)-damage);burst(human.x,human.y,'#ff9977',6);sound(85,.1,'triangle');if(!human.hp){g.corpses.push({x:human.x,y:human.y,r:12,life:16});announce('HUMAN LOST · KEEP ZOMBIES AWAY FROM YOUR PEOPLE');}}
   else{g.hp=Math.max(0,g.hp-damage);g.shake=5;burst(e.x,e.y,'#f3b95f',4);sound(65,.12,'triangle');if(g.hp<=0){end();return;}}
  }
 }
 const lostGuards=g.guards.filter(person=>(person.hp??80)<=0).length;g.guards=g.guards.filter(person=>(person.hp??80)>0);g.rescued=Math.max(0,g.rescued-lostGuards);g.survivors=g.survivors.filter(person=>(person.hp??40)>0);

 for(const b of g.bullets){const oldx=b.x,oldy=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;for(const e of g.enemies){if(e.hp<=0)continue;const vx=b.x-oldx,vy=b.y-oldy,t=clamp(((e.x-oldx)*vx+(e.y-oldy)*vy)/(vx*vx+vy*vy),0,1);if(Math.hypot(e.x-oldx-vx*t,e.y-oldy-vy*t)<e.r+3){e.hp-=b.damage||g.damage;e.hit=.1;b.life=0;burst(e.x,e.y,'#a0ba66',5);if(e.hp<=0){g.kills++;g.cash+=e.value;g.score+=e.value*10;g.corpses.push({x:e.x,y:e.y,r:e.r,life:16});if(g.corpses.length>100)g.corpses.shift();sound(70,.1,'triangle',.015);}break;}}}
 for(const bullet of g.bullets){if(bullet.ally||bullet.life<=0)continue;for(const person of g.survivors){const vx=bullet.vx*dt,vy=bullet.vy*dt,along=clamp(((person.x-bullet.x+vx)*vx+(person.y-bullet.y+vy)*vy)/(vx*vx+vy*vy||1),0,1);if(Math.hypot(person.x-(bullet.x-vx+vx*along),person.y-(bullet.y-vy+vy*along))<15){person.hp=(person.hp??40)-g.damage;bullet.life=0;burst(person.x,person.y,'#d69c70',5);break;}}}g.survivors=g.survivors.filter(person=>(person.hp??40)>0);
 g.enemies=g.enemies.filter(e=>e.hp>0);g.bullets=g.bullets.filter(b=>b.life>0&&b.x>0&&b.x<W&&b.y>0&&b.y<H);for(const p of g.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;}g.particles=g.particles.filter(p=>p.life>0);for(const c of g.corpses)c.life-=dt;g.corpses=g.corpses.filter(c=>c.life>0);
 if(!g.pending&&!g.enemies.length){g.survived++;g.playerHp=Math.min(100,g.playerHp+20);if(g.buildWaves&&g.wave>g.buildStarted){g.buildWaves--;if(!g.buildWaves){g.capacity+=5;g.expansions++;B.r=Math.min(145,83+g.expansions*22);announce('CAMP EXPANDED · +5 PEOPLE');}}g.score+=g.wave*250;g.cash+=65+g.wave*15;g.ammo=g.mag;g.reload=0;mouse.down=false;shop();sound(650,.3,'sine');}hud();}
function circle(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
const foliage=Array.from({length:60},(_,i)=>{const a=i*2.39996,r=200+(i%7)*53;return {x:720+Math.cos(a)*r,y:450+Math.sin(a)*r,tree:i%3===0,size:i%3===0?28+i%12:12+i%8};}).filter(f=>f.x>40&&f.x<W-40&&f.y>60&&f.y<H-45&&Math.abs(f.x-720)>65&&Math.abs(f.y-450)>65);
const debris=Array.from({length:220},()=>({x:rand(0,W),y:rand(0,H),r:rand(1,4),a:rand(0,6)}));
function draw(){ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);ctx.fillStyle='#080e0d';ctx.fillRect(0,0,innerWidth,innerHeight);ctx.translate(ox,oy);ctx.scale(scale,scale);ctx.save();if(g.inCity){drawCity();ctx.restore();return;}if(g.shake&&mode==='playing')ctx.translate(rand(-g.shake,g.shake),rand(-g.shake,g.shake));ctx.fillStyle='#17201b';ctx.fillRect(0,0,W,H);
 ctx.strokeStyle='#35433535';ctx.lineWidth=1;for(let x=0;x<W;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(let y=0;y<H;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
 ctx.fillStyle='#273029';ctx.fillRect(0,400,W,100);ctx.fillRect(670,0,100,H);ctx.setLineDash([20,20]);ctx.strokeStyle='#77806135';ctx.beginPath();ctx.moveTo(0,450);ctx.lineTo(W,450);ctx.moveTo(720,0);ctx.lineTo(720,H);ctx.stroke();ctx.setLineDash([]);
 for(const d of debris){ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.a);ctx.fillStyle='#65715a36';ctx.fillRect(0,0,d.r*3,d.r);ctx.restore();}ctx.strokeStyle='#5b6c4b';ctx.lineWidth=4;ctx.strokeRect(9,9,W-18,H-18);
 for(const c of g.corpses){ctx.globalAlpha=Math.min(.6,c.life/6);circle(c.x,c.y,c.r*1.2,'#422d27');ctx.fillStyle='#536040';ctx.fillRect(c.x-c.r,c.y-4,c.r*2,8);}ctx.globalAlpha=1;
 for(const f of foliage){circle(f.x+7,f.y+9,f.size+5,'#0005');if(f.tree){ctx.fillStyle='#5a4a34';ctx.fillRect(f.x-4,f.y-3,8,25);circle(f.x,f.y,f.size,'#244832');circle(f.x-8,f.y-7,f.size*.7,'#31553a');circle(f.x+9,f.y+2,f.size*.6,'#3c6040');}else{circle(f.x-7,f.y, f.size,'#35583a');circle(f.x+7,f.y-4,f.size*.8,'#466a43');circle(f.x,f.y+5,f.size*.65,'#2c4b32');}}
 if(g.buildWaves||g.expansions){ctx.strokeStyle=g.buildWaves?'#dfb96c':'#8b9866';ctx.lineWidth=6;ctx.setLineDash(g.buildWaves?[10,8]:[]);ctx.beginPath();ctx.arc(B.x,B.y,g.buildWaves?Math.min(145,B.r+22):B.r,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);if(g.buildWaves){ctx.fillStyle='#f1d799';ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.fillText('EXPANDING · '+g.buildWaves+' WAVES',B.x,B.y-B.r-35);}for(let i=0;i<Math.min(g.expansions,4);i++){const a=i*Math.PI/2;ctx.fillStyle='#475e4b';ctx.fillRect(B.x+Math.cos(a)*98-18,B.y+Math.sin(a)*98-15,36,30);ctx.strokeStyle='#9da87a';ctx.lineWidth=2;ctx.strokeRect(B.x+Math.cos(a)*98-18,B.y+Math.sin(a)*98-15,36,30);}}
 const glow=ctx.createRadialGradient(B.x,B.y,30,B.x,B.y,210);glow.addColorStop(0,'#d2f56a25');glow.addColorStop(1,'#d2f56a00');ctx.fillStyle=glow;ctx.fillRect(B.x-210,B.y-210,420,420);
 ctx.save();ctx.translate(B.x,B.y);ctx.fillStyle='#090e0c';ctx.fillRect(-86,-73,180,163);ctx.fillStyle='#465044';ctx.fillRect(-72,-66,144,132);ctx.fillStyle='#27382e';ctx.fillRect(-63,-57,126,114);ctx.strokeStyle='#71806a';ctx.lineWidth=2;ctx.strokeRect(-63,-57,126,114);for(let y=-45;y<50;y+=15){ctx.strokeStyle='#4c5d46';ctx.beginPath();ctx.moveTo(-60,y);ctx.lineTo(60,y);ctx.stroke();}ctx.fillStyle='#17251b';ctx.fillRect(-34,-30,68,56);ctx.fillStyle='#c9df8e';ctx.font='bold 19px monospace';ctx.textAlign='center';ctx.fillText('09',0,-2);ctx.font='8px monospace';ctx.fillText('DEADLIGHT',0,15);
 for(let i=0;i<12;i++){const a=i*Math.PI/6;ctx.save();ctx.rotate(a);ctx.fillStyle=i%2?'#746b4b':'#5c5a41';ctx.fillRect(83,-20,12,40);ctx.fillStyle='#a9a079';ctx.fillRect(86,-17,2,34);ctx.restore();}for(const x of [-68,68])for(const y of [-60,60]){circle(x,y,5,g.hp<300&&Math.sin(clock*8)>0?'#ff745f':'#dbf7a0');}if(g.hp<700){ctx.strokeStyle='#0b110d';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-55,-40);ctx.lineTo(-25,-14);ctx.lineTo(-40,12);ctx.stroke();}if(g.hp<350){circle(47,35,15+Math.sin(clock*15)*4,'#ed8a3555');circle(45,33,8,'#fac361');}ctx.restore();
 for(const s of g.survivors){const a=Math.atan2(g.player.y-s.y,g.player.x-s.x);ctx.save();ctx.translate(s.x,s.y);ctx.rotate(a);const stride=Math.sin(clock*18+s.phase)*5;ctx.fillStyle='#9b683f';ctx.fillRect(-13,-8+stride,12,5);ctx.fillRect(-13,3-stride,12,5);circle(0,0,12,'#dc9d61');circle(5,0,7,'#d6c1a0');ctx.restore();ctx.strokeStyle='#ffbd7a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(s.x,s.y,20,0,7);ctx.stroke();ctx.fillStyle='#ffcd9b';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText(g.rescued>=g.capacity?'HOSTILE · CAMP FULL':Math.hypot(s.x-g.player.x,s.y-g.player.y)<72?'E · RECRUIT ONE':'HOSTILE HUMAN',s.x,s.y-28);}
 for(const guard of g.guards){ctx.save();ctx.translate(guard.x,guard.y);ctx.rotate(guard.angle);circle(3,5,14,'#0006');circle(0,0,12,'#66c6df');ctx.fillStyle='#31566c';ctx.fillRect(-10,-10,15,20);circle(5,0,7,'#d6c1a0');ctx.fillStyle='#abc9ce';ctx.fillRect(9,-3,18,5);if(guard.flash){ctx.fillStyle='#b8efff';ctx.beginPath();ctx.moveTo(26,-7);ctx.lineTo(44,0);ctx.lineTo(26,7);ctx.fill();}ctx.restore();ctx.fillStyle='#99e4f6';ctx.font='9px monospace';ctx.textAlign='center';ctx.fillText('ALLY',guard.x,guard.y-21);ctx.fillStyle='#432d2b';ctx.fillRect(guard.x-13,guard.y+19,26,3);ctx.fillStyle='#72dfff';ctx.fillRect(guard.x-13,guard.y+19,26*(guard.hp??80)/80,3);}
 for(const e of g.enemies){const target=e.humanTarget||B,a=Math.atan2(target.y-e.y,target.x-e.x);ctx.save();ctx.translate(e.x,e.y);ctx.rotate(a);circle(3,5,e.r,'#0005');ctx.fillStyle=e.hit?'#f1f7c9':e.type==='brute'?'#916a51':e.type==='runner'?'#ac9e66':e.type==='infectedCivilian'?'#b65f65':'#7e9567';ctx.fillRect(2,-e.r*.85,e.r+6,5);ctx.fillRect(2,e.r*.6,e.r+6,5);circle(0,0,e.r,ctx.fillStyle);circle(e.r*.45,0,e.r*.55,e.hit?'#fff3b4':'#a8b884');circle(e.r*.8,-3,2,'#ef9b67');ctx.restore();if(e.type==='infectedCivilian'){ctx.strokeStyle='#ff7777';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,20,0,7);ctx.moveTo(e.x-5,e.y-5);ctx.lineTo(e.x+5,e.y+5);ctx.moveTo(e.x+5,e.y-5);ctx.lineTo(e.x-5,e.y+5);ctx.stroke();ctx.fillStyle='#ff9999';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText('INFECTED',e.x,e.y-28);}}
 if(g.rescued>=5){drawCar(980,610,0);ctx.fillStyle='#d2f56a';ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.fillText('E · DRIVE TO CITY',980,565);}
 const p=mode==='title'?{x:860,y:590}:g.player,a=Math.atan2(mouse.y-p.y,mouse.x-p.x);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a);circle(3,5,17,'#0007');circle(0,0,14,g.playerHit?'#ff8669':'#b6c7a0');ctx.fillStyle='#4c6654';ctx.fillRect(-12,-12,18,24);circle(6,0,8,'#d0c6a3');ctx.fillStyle='#18251e';ctx.fillRect(8,-5,26,7);ctx.fillStyle='#8d9b80';ctx.fillRect(28,-4,7,5);if(g.flash){ctx.fillStyle='#fff2a9';ctx.beginPath();ctx.moveTo(33,-8);ctx.lineTo(57,0);ctx.lineTo(33,8);ctx.fill();}ctx.restore();
 for(const b of g.bullets){ctx.strokeStyle=b.ally?'#72dfff':'#f5eab0';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-b.vx*.012,b.y-b.vy*.012);ctx.stroke();}for(const p of g.particles){ctx.globalAlpha=Math.min(1,p.life*4);circle(p.x,p.y,3,p.color);}ctx.globalAlpha=1;
 const vignette=ctx.createRadialGradient(720,450,240,720,450,850);vignette.addColorStop(0,'#0000');vignette.addColorStop(1,'#020908c0');ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);if(mode==='playing'){ctx.strokeStyle='#e2f9ae';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(mouse.x,mouse.y,9,0,7);ctx.moveTo(mouse.x-14,mouse.y);ctx.lineTo(mouse.x-5,mouse.y);ctx.moveTo(mouse.x+5,mouse.y);ctx.lineTo(mouse.x+14,mouse.y);ctx.moveTo(mouse.x,mouse.y-14);ctx.lineTo(mouse.x,mouse.y-5);ctx.stroke();}ctx.restore();}
// City expeditions pause the camp simulation and preserve its exact wave state.
const cityBuildings=Array.from({length:12},(_,i)=>({x:220+(i%4)*300,y:110+Math.floor(i/4)*270,w:160,h:150}));
function drawCar(x,y,a){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle='#060b09';ctx.fillRect(-27,-22,54,44);ctx.fillStyle='#b1b879';ctx.fillRect(-30,-17,60,34);ctx.fillStyle='#304c50';ctx.fillRect(2,-13,13,26);ctx.fillStyle='#4e615b';ctx.fillRect(-22,-12,15,24);ctx.fillStyle='#fff2b1';ctx.fillRect(27,-14,4,7);ctx.fillRect(27,7,4,7);ctx.restore();}
function useCar(){
 if(mode!=='playing')return;
 if(g.inCity){if(Math.hypot(g.city.x-85,g.city.y-450)>95){announce('RETURN TO THE WEST EXIT TO GO HOME');return;}leaveCity(false);return;}
 if(g.rescued<5){announce('RECRUIT 5 PEOPLE TO UNLOCK THE CITY CAR');return;}
 if(Math.hypot(g.player.x-980,g.player.y-610)>90){announce('FIND THE CAR SOUTHEAST OF CAMP · PRESS E');return;}
 if(g.cityVisitedWave===g.wave){announce('CITY CLEARED THIS WAVE · RETURN NEXT WAVE');return;}
 g.cityVisitedWave=g.wave;g.inCity=true;mouse.down=false;keys.clear();g.city={x:85,y:450,a:0,hp:100,cargo:0,hit:0,enemies:Array.from({length:18},(_,i)=>({x:450+(i%6)*155,y:300+Math.floor(i/6)*200,dead:false})),loot:Array.from({length:9},(_,i)=>({x:420+(i%3)*300,y:320+Math.floor(i/3)*270,taken:false}))};announce('CITY RUN · WASD DRIVE · COLLECT GOLD CRATES · E AT WEST EXIT');hud();
}
function leaveCity(wrecked){const cargo=wrecked?Math.floor(g.city.cargo/2):g.city.cargo;g.cash+=cargo;g.inCity=false;g.player.x=960;g.player.y=660;keys.clear();mouse.down=false;announce(wrecked?'CAR TOWED HOME · HALF CARGO RECOVERED':'BACK AT CAMP · +'+cargo+' SALVAGE');hud();}
function updateCity(dt){
 const c=g.city;let dx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),dy=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);const len=Math.hypot(dx,dy)||1;
 const blocked=(x,y)=>cityBuildings.some(b=>x>b.x-24&&x<b.x+b.w+24&&y>b.y-24&&y<b.y+b.h+24);
 if(dx||dy)c.a=Math.atan2(dy,dx);const nx=clamp(c.x+dx/len*320*dt,32,W-32),ny=clamp(c.y+dy/len*320*dt,32,H-32);if(!blocked(nx,c.y))c.x=nx;if(!blocked(c.x,ny))c.y=ny;
 c.hit=Math.max(0,c.hit-dt);for(const z of c.enemies){if(z.dead)continue;const d=Math.hypot(c.x-z.x,c.y-z.y);if(d<370&&d>1){const zx=z.x+(c.x-z.x)/d*50*dt,zy=z.y+(c.y-z.y)/d*50*dt;if(!blocked(zx,zy)){z.x=zx;z.y=zy;}}if(d<36){z.dead=true;g.kills++;g.score+=100;if(!c.hit){c.hp-=12;c.hit=.3;sound(65,.12,'triangle');}if(c.hp<=0){leaveCity(true);return;}}}
 for(const l of c.loot)if(!l.taken&&Math.hypot(l.x-c.x,l.y-c.y)<45){l.taken=true;c.cargo+=40;sound(600,.1,'sine');}
 $('toast').textContent=Math.hypot(c.x-85,c.y-450)<95?'E · RETURN TO CAMP':'CITY · WASD / ARROWS DRIVE · GOLD CRATES = SALVAGE';hud();$('waveValue').textContent='CITY RUN';$('remaining').textContent='CAMP WAVES PAUSED · WEST EXIT TO RETURN';
}
function drawCity(){
 const c=g.city;ctx.fillStyle='#202729';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#b1aa6655';ctx.lineWidth=2;ctx.setLineDash([20,20]);for(const y of [50,320,590,860]){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}ctx.setLineDash([]);
 for(const b of cityBuildings){ctx.fillStyle='#0b1114';ctx.fillRect(b.x+9,b.y+10,b.w,b.h);ctx.fillStyle='#3d4b4e';ctx.fillRect(b.x,b.y,b.w,b.h);ctx.strokeStyle='#697673';ctx.strokeRect(b.x,b.y,b.w,b.h);for(let x=15;x<b.w;x+=32)for(let y=17;y<b.h;y+=35){ctx.fillStyle=(x+y)%3?'#9a9c6944':'#121d23';ctx.fillRect(b.x+x,b.y+y,14,18);}}
 ctx.strokeStyle='#82e2b2';ctx.lineWidth=3;ctx.strokeRect(30,370,110,160);ctx.fillStyle='#a6f3c9';ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.fillText('CAMP EXIT',85,355);
 for(const l of c.loot)if(!l.taken){ctx.fillStyle='#e6bd63';ctx.fillRect(l.x-12,l.y-12,24,24);ctx.fillStyle='#544b2d';ctx.fillRect(l.x-2,l.y-12,4,24);}
 for(const z of c.enemies){circle(z.x,z.y,12,z.dead?'#4e3432':'#a47e68');if(!z.dead){circle(z.x+3,z.y-2,6,'#b7bb82');}}
 drawCar(c.x,c.y,c.a);if(c.hit){ctx.strokeStyle='#ff775e';ctx.lineWidth=5;ctx.strokeRect(3,3,W-6,H-6);}
}
function resize(){canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;scale=Math.min(innerWidth/W,innerHeight/H);ox=(innerWidth-W*scale)/2;oy=(innerHeight-H*scale)/2;}
window.addEventListener('resize',resize);resize();
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();keys.add(k);if(k==='e'&&!e.repeat){if(!recruitOne())useCar();}if(k==='r')reload();if(k==='escape'&&!e.repeat)pause();});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
canvas.addEventListener('pointermove',e=>{mouse.x=(e.clientX-ox)/scale;mouse.y=(e.clientY-oy)/scale;});canvas.addEventListener('pointerdown',e=>{if(e.button===0&&mode==='playing'){mouse.x=(e.clientX-ox)/scale;mouse.y=(e.clientY-oy)/scale;mouse.down=true;sound(1,.001,'sine',.0001);}});window.addEventListener('pointerup',()=>mouse.down=false);canvas.addEventListener('contextmenu',e=>e.preventDefault());
function loseFocus(){keys.clear();mouse.down=false;if(mode==='playing'||mode==='shop')pause();}window.addEventListener('blur',loseFocus);document.addEventListener('visibilitychange',()=>{if(document.hidden)loseFocus();});
$('start').onclick=start;$('pause').onclick=pause;$('continue').onclick=()=>{if(mode==='paused')pause();else if(mode==='over')start();else if(mode==='shop')nextWave();};$('mute').onclick=()=>{muted=!muted;$('mute').textContent=muted?'SOUND OFF':'SOUND ON';$('mute').setAttribute('aria-pressed',String(muted));};
function frame(t){const dt=Math.min((t-last)/1000,.04)||0;last=t;update(dt);draw();requestAnimationFrame(frame);}requestAnimationFrame(frame);
// Explicit opt-in test bridge; absent during normal play.
if(new URLSearchParams(location.search).has('test'))window.deadlightTest={get state(){return g;},get mode(){return mode;},update,start,nextWave,spawn,shoot,reload,pause,shop,sendSurvivors,sendInfectedCivilians,useCar,recruitOne,mouse,keys};
})();
