import {Game,clamp,rand,distance,pixelSprite,SPRITES} from './engine.js';

export class Attack extends Game {
  constructor(canvas,options){super(canvas,options);this.kind='attack';this.level=1;this.score=0;this.lives=3;this.player={x:320,y:421};this.enemies=[];this.bullets=[];this.enemyBullets=[];this.fireCooldown=0;this.spreadCooldown=0;this.invulnerable=1.5;this.bombCharge=10;this.bomb=null;this.rings=[];this.nextWave=15;this.nextMother=rand(60,80);this.mother=null;this.stars=Array.from({length:95},()=>({x:rand(0,640),y:rand(0,480),size:rand(1,2.5),speed:rand(10,35),phase:rand(0,6)}));this.spawnWave(15);if(this.demo){this.t=8;this.score=240;this.enemies.forEach((e,i)=>{e.x=125+(i%5)*93;e.y=104+Math.floor(i/5)*56;e.shot=rand(.5,4);});}}
  spawnWave(count){for(let i=0;i<count;i++){const type=i%3;this.enemies.push({x:80+(i%10)*52,y:-30-Math.floor(i/10)*48,type,phase:rand(0,6),direction:Math.random()<.5?-1:1,turn:rand(0,2),shot:rand(2.5,7),alive:true});}}
  fire(spread=false){if((spread?this.spreadCooldown:this.fireCooldown)>0)return;if(spread)this.spreadCooldown=.26;else this.fireCooldown=.16;for(const angle of spread?[-Math.PI/6,Math.PI/6]:[0])this.bullets.push({x:this.player.x,y:this.player.y-17,vx:Math.sin(angle)*410,vy:-Math.cos(angle)*410,life:2});this.fx('shoot');}
  launchBomb(){if(this.bomb){this.detonate();return;}if(this.bombCharge<10)return;this.bombCharge=0;this.bomb={x:this.player.x,y:this.player.y-15,life:2.2};this.fx('boost');}
  detonate(){if(!this.bomb)return;this.rings.push({x:this.bomb.x,y:this.bomb.y,r:0,life:.75});for(let i=0;i<12;i++){const a=i*Math.PI/6;this.bullets.push({x:this.player.x,y:this.player.y,vx:Math.sin(a)*330,vy:Math.cos(a)*330,life:2.2,bomb:true});}this.burst(this.bomb.x,this.bomb.y,'#f7a6ed',32);this.bomb=null;this.fx('bomb');}
  damage(){if(this.invulnerable>0||this.demo)return;this.lives--;this.invulnerable=2.2;this.burst(this.player.x,this.player.y,'#f5a2d6',22);this.fx('hit');if(this.lives<=0)this.end(false,this.score,`You defended the galaxy through wave ${this.level}. Every great pilot has one more run in them.`);}
  update(dt){
    if(this.over||this.paused)return;this.t+=dt;this.fireCooldown-=dt;this.spreadCooldown-=dt;this.invulnerable-=dt;this.bombCharge=Math.min(10,this.bombCharge+dt);
    for(const s of this.stars){s.y+=s.speed*dt;if(s.y>480){s.y=0;s.x=rand(0,640);}}
    if(this.demo){this.player.x=320+Math.sin(this.t*.85)*215;this.player.y=420+Math.cos(this.t)*17;this.fire();if(Math.sin(this.t*.5)>.7)this.fire(true);if(this.t%18<.05)this.launchBomb();}
    else{const dx=(this.down('ArrowRight','KeyD')?1:0)-(this.down('ArrowLeft','KeyA')?1:0),dy=(this.down('ArrowDown','KeyS')?1:0)-(this.down('ArrowUp','KeyW')?1:0);const norm=Math.hypot(dx,dy)||1;this.player.x=clamp(this.player.x+dx/norm*285*dt,22,618);this.player.y=clamp(this.player.y+dy/norm*245*dt,360,454);if(this.down('Space'))this.fire();if(this.down('KeyX'))this.fire(true);if(this.pressed('ControlLeft')||this.pressed('ControlRight'))this.launchBomb();}
    if(this.t>=this.nextWave){this.nextWave+=15;this.level++;this.spawnWave(15+(this.level-1)*5);this.fx('pickup');}
    if(this.t>=this.nextMother){this.nextMother=60*(Math.floor(this.t/60)+1)+rand(0,20);this.mother={x:-50,y:64};}
    if(this.mother){this.mother.x+=115*dt;if(this.mother.x>700)this.mother=null;}
    const speed=1.05**(this.level-1);
    for(const e of this.enemies){
      e.turn+=dt;e.shot-=dt;
      if(e.y<85){e.y+=35*speed*dt;}
      else if(e.type===0){e.x+=e.direction*40*speed*dt;if(e.x>614||e.x<26){e.x=clamp(e.x,26,614);e.direction*=-1;e.y+=20;}}
      else if(e.type===1){e.x+=e.direction*33*speed*dt;e.y+=10*speed*dt;if(e.turn>2.3){e.turn=0;e.direction=Math.random()<.5?-1:1;}if(e.x<-15)e.x=655;if(e.x>655)e.x=-15;}
      else{e.x+=Math.cos(e.turn*2+e.phase)*48*speed*dt*e.direction;e.y+=(14+Math.sin(e.turn*2+e.phase)*25)*speed*dt;if(e.turn>5){e.turn=0;e.y=Math.max(75,e.y-60);e.direction=Math.random()<.5?-1:1;this.burst(e.x,e.y,'#bf89e6',5);}e.x=clamp(e.x,20,620);}
      if(e.shot<=0&&e.y>60){e.shot=rand(4,9)/Math.min(2,speed);this.enemyBullets.push({x:e.x,y:e.y+10,vx:clamp((this.player.x-e.x)*.1,-30,30),vy:105*speed});}
      if(distance(e,this.player)<23){e.alive=false;this.damage();}
      if(e.y>465){e.alive=false;this.damage();}
    }
    if(this.bomb){this.bomb.y-=170*dt;this.bomb.life-=dt;if(this.bomb.life<=0||this.bomb.y<58)this.detonate();}
    for(const b of this.bullets){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;for(const e of this.enemies){if(e.alive&&distance(b,e)<17){e.alive=false;b.life=0;this.score+=(e.type+1)*10;this.burst(e.x,e.y,['#85d7cf','#c68cef','#f4aa9b'][e.type],9);break;}}if(this.mother&&Math.abs(b.x-this.mother.x)<35&&Math.abs(b.y-this.mother.y)<17){this.score+=100;b.life=0;this.burst(this.mother.x,this.mother.y,'#f6bd70',30);this.mother=null;this.fx('pickup');}}
    for(const b of this.enemyBullets){b.x+=b.vx*dt;b.y+=b.vy*dt;if(distance(b,this.player)<13){b.y=600;this.damage();}}
    for(const r of this.rings){r.r+=450*dt;r.life-=dt;for(const e of this.enemies){if(e.alive&&Math.abs(distance(e,r)-r.r)<22){e.alive=false;this.score+=(e.type+1)*10;this.burst(e.x,e.y,'#f09bd6',8);}}this.enemyBullets=this.enemyBullets.filter(b=>Math.abs(distance(b,r)-r.r)>35);}
    this.rings=this.rings.filter(r=>r.life>0);this.enemies=this.enemies.filter(e=>e.alive);this.bullets=this.bullets.filter(b=>b.life>0&&b.y>-20&&b.y<500&&b.x>-20&&b.x<660);this.enemyBullets=this.enemyBullets.filter(b=>b.y<490);
    if(this.demo&&this.t>80){this.level=1;this.t=0;this.nextWave=15;this.score=0;this.enemies=[];this.enemyBullets=[];this.spawnWave(15);}this.updateParticles(dt);
  }
  render(){
    const c=this.ctx;const bg=c.createRadialGradient(420,190,15,320,240,400);bg.addColorStop(0,'#201435');bg.addColorStop(.5,'#101020');bg.addColorStop(1,'#070a16');c.fillStyle=bg;c.fillRect(0,0,640,480);
    for(const s of this.stars){c.globalAlpha=.35+Math.sin(this.t+s.phase)*.22;c.fillStyle=s.size>2?'#b9a1d0':'#d4cee8';c.fillRect(s.x,s.y,s.size,s.size);}c.globalAlpha=1;
    c.strokeStyle='#38274e70';c.beginPath();c.ellipse(544,254,43,43,0,0,Math.PI*2);c.stroke();c.beginPath();c.ellipse(544,254,70,14,-.35,0,Math.PI*2);c.stroke();
    for(const e of this.enemies){if(e.y<43)continue;const palette={1:['#70cec1','#ae82e8','#edab99'][e.type]};pixelSprite(c,SPRITES[`alien${e.type+1}`],e.x-15,e.y-11,2.8,palette);}
    if(this.mother){const {x,y}=this.mother;c.fillStyle='#bd668a';c.fillRect(x-27,y-5,54,13);c.fillRect(x-19,y-13,38,10);c.fillStyle='#e8a8c8';c.fillRect(x-12,y-18,24,8);c.fillStyle='#fce29b';for(let i=-21;i<=21;i+=14)c.fillRect(x+i,y+4,5,4);}
    for(const b of this.bullets){c.fillStyle=b.bomb?'#f8b1ec':'#92ebe6';c.fillRect(b.x-2,b.y-7,4,12);c.fillStyle='#e7ffff';c.fillRect(b.x-1,b.y-6,2,7);}
    for(const b of this.enemyBullets){c.fillStyle='#f19b9f';c.fillRect(b.x-2,b.y-4,4,9);c.fillStyle='#fff0ba';c.fillRect(b.x-1,b.y,2,3);}
    if(this.bomb){c.fillStyle='#ec9cdd';c.beginPath();c.arc(this.bomb.x,this.bomb.y,7,0,Math.PI*2);c.fill();c.strokeStyle='#cd80fb66';c.beginPath();c.arc(this.bomb.x,this.bomb.y,12+Math.sin(this.t*15)*3,0,Math.PI*2);c.stroke();}
    for(const r of this.rings){c.strokeStyle=`rgba(228,142,241,${r.life})`;c.lineWidth=4;c.beginPath();c.arc(r.x,r.y,r.r,0,Math.PI*2);c.stroke();c.lineWidth=1;}
    if(this.invulnerable<=0||Math.sin(this.t*30)>0||this.demo){pixelSprite(c,SPRITES.ship,this.player.x-18,this.player.y-21,4,{1:'#b7c6de',2:'#6ab5d4',3:'#ec99cb',4:Math.sin(this.t*22)>0?'#b381ff':'#f0b5e3'});}
    this.drawParticles();c.fillStyle='#0c0b17dc';c.fillRect(0,0,640,43);this.text(`WAVE ${String(this.level).padStart(2,'0')}`,17,27,11,'#c9a1e2');this.text(`${String(this.score).padStart(5,'0')}`,320,27,15,'#e6d8f1','center');this.text('SHIPS',505,25,8,'#a495bb');for(let i=0;i<this.lives;i++)pixelSprite(c,SPRITES.ship,563+i*22,14,1.6,{1:'#b6c4d9',2:'#ca8ddb',3:'#ffe7f0',4:'#c592f8'});
    c.fillStyle='#0d0a16d9';c.fillRect(0,456,640,24);this.text('BOMB',18,472,7,'#b4a0c4');c.fillStyle='#352443';c.fillRect(61,463,101,7);c.fillStyle=this.bombCharge>=10?'#c395ef':'#89639e';c.fillRect(61,463,101*this.bombCharge/10,7);this.text(this.bomb?'CTRL: DETONATE':this.bombCharge>=10?'READY':`${Math.ceil(10-this.bombCharge)}s`,175,471,7,'#d8a1db');this.text(`NEXT WAVE ${Math.ceil(this.nextWave-this.t)}s`,621,471,7,'#7f7396','right');
    this.demoLabel('#e7afe1');
  }
}
