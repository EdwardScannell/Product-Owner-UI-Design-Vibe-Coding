import {Game, clamp, rand, W, H, formatTime} from './engine.js';

export class Race extends Game {
  constructor(canvas,options) {
    super(canvas,options);this.kind='race';this.arcade=this.difficulty!=='rookie';this.trackLength=this.arcade?7000:5600;this.distance=0;this.speed=0;this.x=0;this.reserve=35;this.lap=1;this.boost=0;this.cooldown=0;this.message='3 LAPS. MAKE THEM COUNT.';this.messageTime=3;this.lastCheckpoint=-1;this.lastLap=0;this.roadPhase=0;
    this.slip=0;this.spin=0;this.crashCooldown=0;this.contactCooldown=0;this.crashes=0;this.steering=0;this.skidSound=0;
    this.turns=Array.from({length:8},(_,i)=>i===4?1.85:rand(this.arcade?.6:.25,this.arcade?1.15:.95)*(Math.random()<.5?-1:1));
    this.rivals=[{distance:120,lane:-.6,speed:this.arcade?245:218,color:'#e9bb56',style:'clean'},{distance:260,lane:.52,speed:this.arcade?255:231,color:'#db77bb',style:'late'},{distance:330,lane:.05,speed:this.arcade?265:239,color:'#77808f',skull:true,style:'skull'}];
    for(const car of this.rivals)Object.assign(car,{velocity:car.speed,state:'cruise',stateTime:0,blockCooldown:0,signal:0,targetLane:car.lane});
    if(!this.arcade)this.rivals[2].distance=70;
    if(this.demo){this.distance=650;this.speed=240;this.t=12.4;this.rivals[0].distance=1000;this.rivals[1].distance=1320;this.rivals[2].distance=870;}
  }
  curvature(at=this.distance) { const p=((at%this.trackLength)+this.trackLength)%this.trackLength/this.trackLength*8;const i=Math.floor(p);return this.turns[i]*Math.pow(Math.sin((p-i)*Math.PI),2); }
  safeSpeed(at=this.distance){
    if(!this.arcade)return 265;
    const curve=Math.abs(this.curvature(at));
    return curve<.15?350-curve*(98.5/.15):clamp(265-curve*90,98,265);
  }
  cornerAhead(){
    let limit=350,ahead=0;
    for(let gap=0;gap<=650;gap+=30){const speed=this.safeSpeed(this.distance+gap);if(speed<limit){limit=speed;ahead=gap;}}
    const turn=Math.floor(((this.distance+ahead)%this.trackLength)/this.trackLength*8)+1;
    return {limit:Math.round(limit/5)*5,ahead,turn};
  }
  updateRivals(dt){
    for(const car of this.rivals){
      if(!this.arcade){
        car.distance+=car.speed*dt*(1-Math.abs(this.curvature(car.distance))*.13);
        if(car.skull&&car.distance-this.distance>0&&car.distance-this.distance<270)car.lane+=(this.x-car.lane)*dt*1.25;
      }else{
        const braking=car.skull?240:car.style==='late'?210:180;
        let target=car.speed;
        for(let gap=0;gap<=300;gap+=40){
          const corner=this.safeSpeed(car.distance+gap)+(car.skull?7:car.style==='late'?2:-3);
          target=Math.min(target,Math.sqrt(corner*corner+2*braking*gap));
        }
        car.velocity+=clamp(target-car.velocity,-braking*dt,85*dt);car.distance+=car.velocity*dt;
        car.blockCooldown=Math.max(0,car.blockCooldown-dt);car.stateTime-=dt;
        if(car.skull){
          const gap=car.distance-this.distance;
          if(car.state==='cruise'&&car.blockCooldown===0&&gap>28&&gap<350&&this.speed>car.velocity-20){
            car.state='signal';car.stateTime=.48;car.targetLane=clamp(this.x+this.steering*.18,-.83,.83);car.signal=car.targetLane>=car.lane?1:-1;
            this.message=`SKULL BLOCKING ${car.signal>0?'RIGHT':'LEFT'} — FEINT!`;this.messageTime=1.5;this.fx('warning');
          }else if(car.state==='signal'&&car.stateTime<=0){car.state='block';car.stateTime=1.15;}
          else if(car.state==='block'&&car.stateTime<=0){car.state='recover';car.stateTime=2.6;car.signal=0;}
          else if(car.state==='recover'&&car.stateTime<=0){car.state='cruise';car.blockCooldown=.5;}
          // Commit to one lane, then recover: a well-timed feint can beat the block.
          if(car.state==='block')car.lane+=clamp(car.targetLane-car.lane,-1.35*dt,1.35*dt);
          else if(car.state==='cruise')car.lane+=clamp(-this.curvature(car.distance)*.22-car.lane,-.45*dt,.45*dt);
        }else{
          const racingLine=(car.style==='clean'?-.46:.46)-this.curvature(car.distance)*.14;
          car.lane+=clamp(racingLine-car.lane,-.55*dt,.55*dt);
        }
        car.lane=clamp(car.lane,-.85,.85);
      }
      const gap=car.distance-this.distance;
      if(Math.abs(gap)<28&&Math.abs(car.lane-this.x)<.27&&this.speed>car.velocity-10&&this.contactCooldown<=0&&!this.demo){
        this.speed*=this.arcade?.52:.71;car.distance+=20;this.x+=this.x>car.lane?.15:-.15;this.contactCooldown=1.2;this.fx('hit');
        this.message=car.skull?'SKULL SLAMS THE DOOR. TRY A FEINT.':'CONTACT! FIND A CLEAN PASS.';this.messageTime=1.7;
      }
    }
  }
  update(dt) {
    if(this.paused||this.over)return;
    this.t+=dt;this.reserve-=dt;this.cooldown=Math.max(0,this.cooldown-dt);this.boost=Math.max(0,this.boost-dt);this.messageTime-=dt;this.spin=Math.max(0,this.spin-dt);this.crashCooldown=Math.max(0,this.crashCooldown-dt);this.contactCooldown-=dt;this.skidSound-=dt;
    const curve=this.curvature(); const handbrake=this.down('Space');
    if(this.demo){this.speed=236-Math.abs(curve)*28;this.x=Math.sin(this.t*.6)*.23;this.reserve=40;}
    else {
      const braking=this.down('ArrowDown','KeyS')||handbrake;
      if(this.down('ArrowUp','KeyW')&&!(this.arcade&&braking)&&this.spin<=0)this.speed+=88*dt;else this.speed-=30*dt;
      if(this.down('ArrowDown','KeyS'))this.speed-=(this.arcade?200:140)*dt;
      if(handbrake)this.speed-=(this.arcade?235:120)*dt;
      if(this.down('KeyB')&&this.cooldown<=0&&this.spin<=0){this.boost=3;this.cooldown=10;this.fx('boost');this.message='NITRO ACTIVATED';this.messageTime=2;}
      const maxSpeed=this.boost>0?350:265;this.speed=clamp(this.speed,0,maxSpeed);
      if(this.boost>0&&!(this.arcade&&braking))this.speed=Math.min(maxSpeed,this.speed+150*dt);
      const steering=(this.down('ArrowRight','KeyD')?1:0)-(this.down('ArrowLeft','KeyA')?1:0);
      this.steering=steering;
      if(this.arcade){
        const excess=Math.max(0,this.speed-this.safeSpeed());
        this.slip+=(excess/110-this.slip)*Math.min(1,dt*7);
        const grip=clamp(1-this.slip*.72,.24,1);
        if(this.spin<=0)this.x+=steering*dt*(handbrake?2.15:1.55)*grip*Math.max(.3,Math.min(1,this.speed/55));
        this.x-=Math.sign(curve)*(Math.abs(curve)*(this.speed/265)**2*.55+this.slip*2.5)*dt;
        if(this.slip>.2){
          if(Math.random()<dt*22)this.burst(320+this.x*87,446,'#c3b2bf',2);
          if(this.skidSound<=0){this.fx('skid');this.skidSound=.7;}
        }
        if(Math.abs(this.x)>1.27&&this.speed>120&&this.crashCooldown<=0){
          this.crashes++;this.spin=.85;this.crashCooldown=2;this.speed*=.23;this.boost=0;this.slip=0;this.x=clamp(this.x,-1.18,1.18);
          this.message='BARRIER HIT! BRAKE BEFORE THE TURN.';this.messageTime=2.2;this.burst(320+this.x*87,428,'#ffb578',24);this.fx('hit');
        }
        this.x=clamp(this.x,-1.5,1.5);
        if(Math.abs(this.x)>1.08)this.speed=Math.max(0,this.speed-145*dt);
      }else{
        this.x+=steering*dt*(handbrake?2.05:1.4)*Math.min(1,this.speed/55);
        this.x-=curve*(this.speed/265)**2*dt*.72;this.x=clamp(this.x,-1.55,1.55);
        if(Math.abs(this.x)>1.08){this.speed=Math.max(65,this.speed-180*dt);if(Math.random()<dt*8)this.burst(320+this.x*130,438,'#d0a7ac',3);}
      }
    }
    this.distance+=this.speed*dt;this.roadPhase=this.distance;
    this.updateRivals(dt);
    const lap=Math.floor(this.distance/this.trackLength);const progress=this.distance%this.trackLength/this.trackLength;
    if(progress>=.65&&this.lastCheckpoint<lap){this.lastCheckpoint=lap;this.reserve+=15;this.message='CHECKPOINT +15 SECONDS';this.messageTime=2.6;this.fx('pickup');}
    if(lap>this.lastLap){this.lastLap=lap;this.reserve+=15;this.message=`LAP ${Math.min(3,lap+1)} / 3  +15 SECONDS`;this.messageTime=2.6;this.fx('pickup');}
    this.lap=Math.min(3,lap+1);
    if(this.distance>=this.trackLength*3){if(this.demo){this.distance=400;this.lastCheckpoint=-1;this.lastLap=0;this.t=0;this.rivals.forEach((c,i)=>c.distance=550+i*150);}else this.end(true,this.t,`Three laps complete! ${this.reserve.toFixed(1)} seconds left in reserve. Position ${this.position()} of 4.`,{remaining:this.reserve});}
    if(this.reserve<=0&&!this.demo)this.end(false,this.t,`Your time reserve ran out on lap ${this.lap}. Cross checkpoints for 15 extra seconds. Hold ↑ to accelerate!`);
    this.updateParticles(dt);
  }
  position(){return 1+this.rivals.filter(c=>c.distance>this.distance).length;}
  roadAt(z){const curve=this.curvature(this.distance+z*1700);return 320+curve*(1-z)*Math.sin(z*Math.PI)*145-this.x*z*z*135;}
  drawCar(x,y,scale,color,skull=false,player=false,signal=0){
    const c=this.ctx;c.save();c.translate(x,y);c.scale(scale,scale);
    if(player&&this.spin>0)c.rotate(this.spin*Math.PI*5);
    else if(player&&this.slip>.2)c.rotate(-Math.sign(this.curvature())*Math.min(.22,this.slip*.15));
    c.fillStyle='#090817';c.fillRect(-30,2,60,8);c.fillStyle='#151321';c.fillRect(-29,-30,11,28);c.fillRect(18,-30,11,28);
    c.fillStyle=color;c.fillRect(-22,-42,44,44);c.fillRect(-16,-55,32,25);c.fillRect(-27,-27,54,17);
    c.fillStyle='#221932';c.fillRect(-12,-49,24,17);c.fillStyle='#c1e6ed';c.fillRect(-10,-47,20,4);c.fillStyle='#e2e8e8';c.fillRect(-27,-9,11,6);c.fillRect(16,-9,11,6);c.fillStyle='#fff8';c.fillRect(-20,-24,40,3);
    c.fillStyle='#090c13';c.fillRect(-18,0,36,5);c.fillStyle='#ff647f';c.fillRect(-24,-5,8,5);c.fillRect(16,-5,8,5);
    if(skull){
      c.fillStyle='#f9f3e7';c.fillRect(-9,-36,18,13);c.fillRect(-5,-23,10,5);c.fillStyle='#2b2030';c.fillRect(-6,-33,4,4);c.fillRect(2,-33,4,4);c.fillRect(-1,-27,2,3);
      this.text('SKULL',0,-64,7,signal?'#ffb07e':'#d8d4e8','center');
      if(signal&&Math.sin(this.t*18)>0){c.fillStyle='#ff9259';c.fillRect(signal>0?23:-30,-22,8,14);}
    }
    if(player&&this.boost>0){c.fillStyle='#59e8ff';c.fillRect(-15,6,7,rand(12,36));c.fillRect(8,6,7,rand(12,36));c.fillStyle='#fff';c.fillRect(-13,6,3,12);c.fillRect(10,6,3,12);}
    c.restore();
  }
  render(){
    const c=this.ctx;const sky=c.createLinearGradient(0,0,0,260);sky.addColorStop(0,'#171137');sky.addColorStop(.65,'#643569');sky.addColorStop(1,'#d37683');c.fillStyle=sky;c.fillRect(0,0,W,H);
    c.fillStyle='#ffc088';c.beginPath();c.arc(335,177,56,0,Math.PI*2);c.fill();c.fillStyle='#9e5070';for(let y=165;y<225;y+=10)c.fillRect(270,y,130,4);
    const shift=Math.sin(this.t*.045)*22;c.fillStyle='#24203d';c.beginPath();c.moveTo(0,230);for(let x=0;x<=670;x+=26)c.lineTo(x,191-Math.sin(x*.018+shift*.01)*25-Math.sin(x*.067)*13);c.lineTo(640,250);c.fill();
    c.fillStyle='#16152d';c.beginPath();c.moveTo(0,228);for(let x=0;x<=660;x+=35)c.lineTo(x,220-Math.abs(Math.sin(x*.026+1))*34);c.lineTo(640,260);c.fill();
    c.fillStyle='#271e30';c.fillRect(0,240,640,240);
    for(let y=238;y<480;y+=2){
      const z=(y-237)/243;const half=9+z*z*335;const center=this.roadAt(z);const stripe=(Math.floor(this.distance*.055+14/(z+.07))%2===0);
      c.fillStyle=stripe?'#222329':'#282730';c.fillRect(center-half,y,half*2,3);
      c.fillStyle=stripe?'#f0dadd':'#bc405d';c.fillRect(center-half-4-z*10,y,4+z*10,3);c.fillRect(center+half,y,4+z*10,3);
      if(stripe){c.fillStyle='#dcd2ca';c.fillRect(center-half/3,y,1+z*4,3);c.fillRect(center+half/3,y,1+z*4,3);}
      if(y%14===0){c.fillStyle='#493048';c.fillRect(0,y,center-half-14,1);c.fillRect(center+half+14,y,640-center-half,1);}
    }
    const curve=this.curvature();
    for(let i=0;i<8;i++){
      const z=((i/8+this.distance*.00028)%1);if(z<.15)continue;
      const y=237+z*243,x=this.roadAt(z)+(11+z*z*350)*(curve>0?-1:1),size=3+z*17;
      c.fillStyle='#242030';c.fillRect(x,y-size,size*.12,size*2);
      c.fillStyle= Math.abs(curve)>1.1?'#e85763':'#c7a8ca';c.fillRect(x-size/2,y-size*1.2,size*1.3,size*.85);
      if(Math.abs(curve)>1.1)this.text('»',x+size*.1,y-size*.55,Math.max(7,size*.75),'#fff','center');
      else if(i%2===0)this.text(String((4-i%4)*50),x+size*.1,y-size*.57,Math.max(4,size*.35),'#161523','center');
    }
    const progress=this.distance%this.trackLength/this.trackLength;const checkpointDistance=progress<.65?(.65-progress)*this.trackLength:(1-progress)*this.trackLength;
    if(checkpointDistance<1200){const z=1-checkpointDistance/1200;const y=235+z*z*175;const half=20+z*245;const center=this.roadAt(z);const tall=20+z*105;c.fillStyle='#d8c6da';c.fillRect(center-half,y-tall,4+z*6,tall);c.fillRect(center+half,y-tall,4+z*6,tall);const sq=Math.max(4,half*2/18);for(let row=0;row<2;row++)for(let col=0;col<18;col++){c.fillStyle=(row+col)%2?'#eee6ea':'#272332';c.fillRect(center-half+col*sq,y-tall+row*sq,sq+1,sq+1);}}
    const cars=this.rivals.map(car=>({car,gap:car.distance-this.distance})).filter(({gap})=>gap>-25&&gap<1800).sort((a,b)=>b.gap-a.gap);
    for(const {car,gap}of cars){const z=1-gap/1850;const y=237+z*z*211;this.drawCar(this.roadAt(z)+car.lane*(12+z*z*240),y,.1+z*z*.85,car.color,car.skull,false,car.signal);}
    const sway=this.down('ArrowLeft')?-6:this.down('ArrowRight')?6:0;this.drawCar(320+this.x*87+sway,448,1.28,'#45dfe7',false,true);this.drawParticles();
    c.fillStyle='#100d20d9';c.fillRect(0,0,640,61);this.text('TIME',20,22,9,'#b6a4c2');this.text(formatTime(this.t),20,45,15,'#f3e5f0');this.text('LAP',285,22,9,'#b6a4c2');this.text(`${this.lap}/3`,295,45,15,'#e9dceb');this.text('POSITION',615,22,9,'#b6a4c2','right');this.text(`${this.position()}/4`,615,45,15,'#68e9e2','right');
    this.text(`${Math.ceil(this.reserve)}s RESERVE`,22,85,9,this.reserve<10?'#ff7988':'#e9c9cb');this.text(`${Math.floor(this.speed)} KM/H`,618,462,12,'#e7e7e8','right');
    if(this.arcade&&!this.demo){
      const next=this.cornerAhead();const warning=this.speed>next.limit+20;
      this.text(`TURN ${next.turn}${next.turn===5?' HAIRPIN':''}  ${next.limit} KM/H`,618,84,9,warning?'#ffb095':'#a7d4db','right');
      if(this.slip>.3)this.text('LOSING GRIP — BRAKE',320,377,12,'#ffae97','center');
    }
    c.fillStyle='#142030';c.fillRect(21,449,112,9);c.fillStyle=this.cooldown<=0?'#65f1e1':'#7762a9';c.fillRect(21,449,112*(1-this.cooldown/10),9);this.text(this.boost>0?'BOOST!':this.cooldown<=0?'NITRO READY':`NITRO ${Math.ceil(this.cooldown)}s`,22,441,7,'#80c8d5');
    if(this.messageTime>0&&!this.demo){c.fillStyle='#130b2199';c.fillRect(52,107,536,35);this.text(this.message,320,128,10,'#b4ffff','center');}
    if(!this.demo&&this.speed<5&&this.t<5)this.text('HOLD ↑ TO ACCELERATE',320,340,14,'#91fff0','center');
    this.demoLabel('#77eee4');
  }
}
