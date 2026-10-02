import {Game,clamp,rand,distance,pixelSprite,SPRITES} from './engine.js';

const CELL=21,OX=110,OY=51;
export class Maze extends Game {
  constructor(canvas,options){super(canvas,options);this.kind='maze';this.arcade=this.difficulty!=='rookie';this.level=1;this.health=100;this.score=0;this.keyCount=0;this.facing={x:1,y:0};this.shotCooldown=0;this.hurtCooldown=0;this.spawnClock=0;this.fireballs=[];this.flash=0;this.message=this.arcade?'FOLLOW YOUR TORCH. WATCH THE GHOSTS.':'FIND KEYS. OPEN EVERY DOOR.';this.messageTime=4;this.moveClock=0;this.generate();if(this.demo){this.t=5;this.health=84;}}
  generate(){
    this.grid=Array.from({length:20},()=>Array(20).fill(1));
    const carve=(x,y)=>{this.grid[y][x]=0;const dirs=[[2,0],[-2,0],[0,2],[0,-2]].sort(()=>Math.random()-.5);for(const[dx,dy]of dirs){const nx=x+dx,ny=y+dy;if(nx>0&&ny>0&&nx<19&&ny<19&&this.grid[ny][nx]===1){this.grid[y+dy/2][x+dx/2]=0;carve(nx,ny);}}};carve(1,1);
    // Extra passages keep the dungeon navigable; later levels have fewer shortcuts.
    for(let i=0;i<95-this.level*17;i++){const x=2+Math.floor(rand(0,16)),y=2+Math.floor(rand(0,16));if((this.grid[y-1][x]===0&&this.grid[y+1][x]===0)||(this.grid[y][x-1]===0&&this.grid[y][x+1]===0))this.grid[y][x]=0;}
    this.player={x:1.5,y:1.5};this.items=[];this.enemies=[];this.doors=[];this.bones=[];this.fireballs=[];this.spawnClock=0;this.keyCount=0;
    const free=[];for(let y=1;y<19;y++)for(let x=1;x<19;x++)if(this.grid[y][x]===0&&(x>3||y>3))free.push({x:x+.5,y:y+.5});
    const take=()=>free.splice(Math.floor(Math.random()*free.length),1)[0];
    const doorCount=this.level+1;
    // Doors sit in reachable alcoves, so a key can never be locked behind itself.
    const candidates=free.filter(p=>{const x=Math.floor(p.x),y=Math.floor(p.y);return [[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>this.grid[y+dy]?.[x+dx]===0).length===1;});
    const exit=candidates.sort((a,b)=>(b.x+b.y)-(a.x+a.y))[0]||{x:17.5,y:17.5};this.exit={...exit};free.splice(free.findIndex(p=>p.x===exit.x&&p.y===exit.y),1);
    for(let i=0;i<doorCount;i++){
      for(const p of [...candidates,...free]){
        const index=free.findIndex(f=>f.x===p.x&&f.y===p.y);if(index<0)continue;
        this.doors.push({...p,open:false});
        if(!this.layoutConnected()){this.doors.pop();continue;}
        free.splice(index,1);break;
      }
    }
    for(let i=0;i<this.doors.length+1;i++)this.items.push({...take(),type:'key'});
    for(let i=0;i<(this.arcade?16-this.level*2:25-this.level*3);i++)this.items.push({...take(),type:'food'});
    for(let i=0;i<3;i++)this.items.push({...take(),type:'potion'});
    for(let i=0;i<14;i++)this.items.push({...take(),type:'treasure'});
    this.items.push({...take(),type:'gold'});
    for(let attempts=0;attempts<35&&this.bones.length<3+this.level;attempts++){
      const candidate=take();if(!candidate)break;
      this.bones.push(candidate);
      // Reject a bone pile if it disconnects any part of the dungeon.
      // Checking all four neighbors alone is insufficient at junctions.
      if(!this.layoutConnected())this.bones.pop();
    }
    const guardedItems=this.items.filter(i=>i.type==='key').concat(this.items.filter(i=>i.type==='gold'),this.items.filter(i=>i.type==='food'));
    for(let i=0;i<10+(this.level-1)*5;i++){
      const type=i%2?'ghost':'skeleton';let p,guard;
      if(this.arcade&&type==='skeleton'){
        guard=guardedItems[Math.floor(i/2)%guardedItems.length];
        const nearby=free.filter(p=>distance(p,guard)<3&&distance(p,this.player)>5).sort((a,b)=>distance(a,guard)-distance(b,guard));
        const candidate=nearby.find(p=>{const path=this.pathTo(p,guard,true);return path.length>0&&path.length<6;});
        if(candidate)p=free.splice(free.indexOf(candidate),1)[0];
      }
      p ||= take();
      if(this.arcade&&p&&distance(p,this.player)<5){const far=free.findIndex(p=>distance(p,this.player)>=5);if(far>=0){free.push(p);p=free.splice(far,1)[0];}}
      if(p)this.enemies.push(this.makeEnemy(p,type,guard));
    }
    this.demoTarget=null;this.demoPath=[];
    this.visible=new Set();this.explored=new Set();this.visionClock=0;this.updateVision();
  }
  makeEnemy(p,type,guard){return {...p,type,home:guard?{x:guard.x,y:guard.y}:{...p},move:rand(0,.4),phaseCooldown:rand(5,9),phaseTimer:0,phaseTarget:null};}
  enemySpeed(enemy){return this.arcade?([1.8,2.2,2.6][this.level-1])*(enemy.type==='ghost'?1.04:.96):.64+this.level*.13;}
  canSee(x,y){return !this.arcade||this.demo||this.visible.has(`${Math.floor(x)},${Math.floor(y)}`);}
  lineOfSight(tx,ty){
    let x=Math.floor(this.player.x),y=Math.floor(this.player.y);
    const dx=Math.abs(tx-x),dy=-Math.abs(ty-y),sx=x<tx?1:-1,sy=y<ty?1:-1;let error=dx+dy;
    while(x!==tx||y!==ty){
      const twice=2*error;if(twice>=dy){error+=dy;x+=sx;}if(twice<=dx){error+=dx;y+=sy;}
      if(x===tx&&y===ty)return true;
      if(this.grid[y]?.[x]!==0||this.doors.some(d=>!d.open&&Math.floor(d.x)===x&&Math.floor(d.y)===y))return false;
    }
    return true;
  }
  updateVision(){
    if(!this.arcade||this.demo){if(!this.visible.size)for(let y=0;y<20;y++)for(let x=0;x<20;x++){this.visible.add(`${x},${y}`);this.explored.add(`${x},${y}`);}return;}
    this.visible.clear();
    for(let y=Math.max(0,Math.floor(this.player.y-5.5));y<Math.min(20,this.player.y+5.5);y++)for(let x=Math.max(0,Math.floor(this.player.x-5.5));x<Math.min(20,this.player.x+5.5);x++){
      if(Math.hypot(x+.5-this.player.x,y+.5-this.player.y)<=5.5&&this.lineOfSight(x,y)){const key=`${x},${y}`;this.visible.add(key);this.explored.add(key);}
    }
  }
  phaseLanding(enemy){
    if(distance(enemy,this.player)<2||distance(enemy,this.player)>7)return null;
    const x=Math.floor(enemy.x),y=Math.floor(enemy.y);
    if(Math.hypot(enemy.x-x-.5,enemy.y-y-.5)>.23)return null;
    const choices=[];
    for(const[dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
      const landing={x:x+dx*2+.5,y:y+dy*2+.5};
      if(this.grid[y+dy]?.[x+dx]===1&&!this.blocked(landing.x,landing.y,true)&&distance(landing,this.player)>=1.4&&distance(landing,this.player)<distance(enemy,this.player)-.3)choices.push(landing);
    }
    return choices.sort((a,b)=>distance(a,this.player)-distance(b,this.player))[0]||null;
  }
  updateEnemies(dt){
    for(const enemy of this.enemies){
      if(this.arcade&&enemy.type==='ghost'){
        enemy.phaseCooldown-=dt;
        if(enemy.phaseTarget){
          enemy.phaseTimer-=dt;
          if(enemy.phaseTimer<=0){
            if(distance(enemy.phaseTarget,this.player)>=1.1&&!this.blocked(enemy.phaseTarget.x,enemy.phaseTarget.y,true)){
              this.burst(OX+enemy.x*CELL,OY+enemy.y*CELL,'#b8a1ef',8);enemy.x=enemy.phaseTarget.x;enemy.y=enemy.phaseTarget.y;
            }
            enemy.phaseTarget=null;enemy.phaseCooldown=7;enemy.target=null;enemy.move=0;
          }
          continue;
        }
        if(enemy.phaseCooldown<=0){const landing=this.phaseLanding(enemy);if(landing){enemy.phaseTarget=landing;enemy.phaseTimer=.85;if(this.canSee(enemy.x,enemy.y)||this.canSee(landing.x,landing.y))this.fx('phase');continue;}}
      }
      enemy.move-=dt;
      if(enemy.move<=0){
        enemy.move=this.arcade?.28:.35+Math.random()*.3;
        const goal=this.arcade&&enemy.type==='skeleton'&&distance(enemy.home,this.player)>5.5?enemy.home:this.player;
        enemy.target=this.pathTo(enemy,goal,true)[0];
      }
      if(enemy.target){
        const d=distance(enemy,enemy.target);
        if(d>.025){const step=Math.min(d,this.enemySpeed(enemy)*dt);const nx=enemy.x+(enemy.target.x-enemy.x)/d*step,ny=enemy.y+(enemy.target.y-enemy.y)/d*step;if(!this.blocked(nx,ny,true)){enemy.x=nx;enemy.y=ny;}}
      }
      if(distance(enemy,this.player)<.57&&this.hurtCooldown<=0&&!this.demo){this.health-=10;this.hurtCooldown=1.1;this.fx('hit');this.burst(OX+this.player.x*CELL,OY+this.player.y*CELL,'#fa668a',8);}
    }
  }
  layoutConnected(){
    const blocked=new Set([...this.bones,...this.doors.filter(d=>!d.open)].map(b=>`${Math.floor(b.x)},${Math.floor(b.y)}`));
    const seen=new Set(['1,1']),queue=[[1,1]];
    for(let j=0;j<queue.length;j++)for(const[dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
      const x=queue[j][0]+dx,y=queue[j][1]+dy,key=`${x},${y}`;
      if(this.grid[y]?.[x]===0&&!blocked.has(key)&&!seen.has(key)){seen.add(key);queue.push([x,y]);}
    }
    const floor=this.grid.reduce((total,row)=>total+row.filter(v=>v===0).length,0);
    return seen.size===floor-blocked.size&&this.doors.every(door=>{
      const x=Math.floor(door.x),y=Math.floor(door.y);
      return [[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>seen.has(`${x+dx},${y+dy}`));
    });
  }
  blocked(x,y,enemy=false){const gx=Math.floor(x),gy=Math.floor(y);if(this.grid[gy]?.[gx]!==0)return true;if(this.bones.some(b=>Math.floor(b.x)===gx&&Math.floor(b.y)===gy))return true;const door=this.doors.find(d=>!d.open&&Math.floor(d.x)===gx&&Math.floor(d.y)===gy);if(door){if(!enemy&&this.keyCount>0){door.open=true;this.keyCount--;this.score+=100;this.fx('pickup');this.message=this.doors.every(d=>d.open)?'ALL DOORS OPEN. FIND THE EXIT!':'DOOR OPEN +100';this.messageTime=2;}else return true;}return false;}
  pathTo(start,target,enemy=false){
    const sx=Math.floor(start.x),sy=Math.floor(start.y),tx=Math.floor(target.x),ty=Math.floor(target.y);const q=[[sx,sy]],seen=new Set([`${sx},${sy}`]),prev=new Map();
    for(let i=0;i<q.length;i++){const [x,y]=q[i];if(x===tx&&y===ty){const path=[];let at=[x,y];while(at[0]!==sx||at[1]!==sy){path.unshift({x:at[0]+.5,y:at[1]+.5});at=prev.get(at.join(','));if(!at)return [];}return path;}
      for(const[dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,key=`${nx},${ny}`;if(seen.has(key)||this.grid[ny]?.[nx]!==0)continue;if(this.bones.some(b=>Math.floor(b.x)===nx&&Math.floor(b.y)===ny))continue;if(this.doors.some(d=>!d.open&&Math.floor(d.x)===nx&&Math.floor(d.y)===ny)&&(enemy||this.keyCount===0))continue;seen.add(key);prev.set(key,[x,y]);q.push([nx,ny]);}}
    return [];
  }
  fire(){if(this.shotCooldown>0)return;this.shotCooldown=.18;this.fireballs.push({x:this.player.x,y:this.player.y,vx:this.facing.x*10,vy:this.facing.y*10,life:1.8});this.fx('shoot');}
  update(dt){
    if(this.paused||this.over)return;this.t+=dt;this.health-=2*dt;this.shotCooldown-=dt;this.hurtCooldown-=dt;this.messageTime-=dt;this.flash=Math.max(0,this.flash-dt);this.spawnClock+=dt;
    let dx=0,dy=0;
    if(this.demo){
      this.health=80+Math.sin(this.t*.2)*12;
      if(!this.demoPath.length){const target=this.items.filter(i=>i.type==='treasure'||i.type==='key').sort((a,b)=>distance(a,this.player)-distance(b,this.player)).find(i=>this.pathTo(this.player,i).length)||this.exit;this.demoPath=this.pathTo(this.player,target);}
      if(this.demoPath.length){const next=this.demoPath[0];if(distance(this.player,next)<.12)this.demoPath.shift();else{dx=clamp(next.x-this.player.x,-1,1);dy=clamp(next.y-this.player.y,-1,1);}}
      if(Math.sin(this.t*4)>.7)this.fire();
    }else{dx=(this.down('ArrowRight','KeyD')?1:0)-(this.down('ArrowLeft','KeyA')?1:0);dy=(this.down('ArrowDown','KeyS')?1:0)-(this.down('ArrowUp','KeyW')?1:0);if(this.down('Space'))this.fire();}
    if(dx||dy){const norm=Math.hypot(dx,dy);dx/=norm;dy/=norm;this.facing=Math.abs(dx)>Math.abs(dy)?{x:Math.sign(dx),y:0}:{x:0,y:Math.sign(dy)};const speed=3.9*dt;const padding=.21;
      const nx=this.player.x+dx*speed;if(!this.blocked(nx+Math.sign(dx)*padding,this.player.y-.16)&&!this.blocked(nx+Math.sign(dx)*padding,this.player.y+.16))this.player.x=nx;
      const ny=this.player.y+dy*speed;if(!this.blocked(this.player.x-.16,ny+Math.sign(dy)*padding)&&!this.blocked(this.player.x+.16,ny+Math.sign(dy)*padding))this.player.y=ny;
    }
    this.items=this.items.filter(item=>{if(distance(item,this.player)>.55)return true;
      if(item.type==='key'){this.keyCount++;this.fx('pickup');}
      if(item.type==='food'){this.health=Math.min(100,this.health+10);this.fx('pickup');}
      if(item.type==='treasure'||item.type==='gold'){this.score+=item.type==='gold'?200:50;this.fx('pickup');}
      if(item.type==='potion'){const remove=Math.ceil(this.enemies.length/2);for(const e of this.enemies.slice(0,remove))this.burst(OX+e.x*CELL,OY+e.y*CELL,'#bd8aff');this.enemies.splice(0,remove);this.flash=.22;this.fx('bomb');this.message='POTION! HALF THE HORDE VANISHES.';this.messageTime=2;}
      return false;
    });
    for(const ball of this.fireballs){ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;ball.life-=dt;if(this.blocked(ball.x,ball.y,true))ball.life=0;for(const enemy of this.enemies){if(!enemy.dead&&distance(ball,enemy)<.48){enemy.dead=true;ball.life=0;this.burst(OX+enemy.x*CELL,OY+enemy.y*CELL,enemy.type==='ghost'?'#b7e4d6':'#e1d2ad',8);this.fx('hit');break;}}}
    this.fireballs=this.fireballs.filter(b=>b.life>0);this.enemies=this.enemies.filter(e=>!e.dead);
    this.visionClock-=dt;if(this.visionClock<=0){this.updateVision();this.visionClock=.08;}
    this.updateEnemies(dt);
    if(this.spawnClock>=5){this.spawnClock-=5;const cells=[];for(let y=1;y<19;y++)for(let x=1;x<19;x++)if(!this.blocked(x+.5,y+.5,true)&&Math.hypot(x-this.player.x,y-this.player.y)>5)cells.push({x:x+.5,y:y+.5});const p=cells[Math.floor(Math.random()*cells.length)];if(p)this.enemies.push(this.makeEnemy(p,Math.random()<.5?'ghost':'skeleton'));}
    if(distance(this.player,this.exit)<.6&&this.doors.every(d=>d.open)){if(this.level===3){if(this.demo){this.level=1;this.generate();}else this.end(true,this.score,'All three dungeons cleared. The Blue Wizard lives to cast another day!');}else{this.level++;this.health=Math.min(100,this.health+20);this.generate();this.message=`LEVEL ${this.level}  +20 HEALTH`;this.messageTime=3;this.fx('win');}}
    if(this.health<=0&&!this.demo){this.health=0;this.end(false,this.score,`You reached dungeon ${this.level}. Food restores 10 HP; keep moving and watch your health!`);}
    if(this.demo&&this.t>85){this.t=0;this.generate();}this.updateParticles(dt);
  }
  sprite(type,x,y,scale=1.7){const palettes={wizard:{1:'#5597ee',2:'#c5dbed',3:'#354f86',4:'#9675cd'},ghost:{1:'#92d3c0'},skeleton:{1:'#c8c6ab'},key:{1:'#f6c853'},potion:{1:'#9271d4',2:'#d690f8'},food:{1:'#c47847',2:'#f6c780'},treasure:{1:'#d38b3b',2:'#ecc45f',3:'#fbeaaf'},bones:{1:'#a59d81'}};pixelSprite(this.ctx,SPRITES[type],x-SPRITES[type][0].length*scale/2,y-SPRITES[type].length*scale/2,scale,palettes[type]);}
  render(){
    const c=this.ctx;c.fillStyle='#13121b';c.fillRect(0,0,640,480);
    // Stonework surrounds the playable 20 × 20 board.
    for(let y=50;y<480;y+=22)for(let x=0;x<640;x+=44){c.fillStyle=(x+y)%3?'#26242b':'#2c2831';c.fillRect(x+(y%44?0:-22),y,42,20);c.fillStyle='#37303a';c.fillRect(x+(y%44?0:-22),y,42,2);}
    c.fillStyle='#080c12';c.fillRect(OX-5,OY-5,430,430);
    for(let y=0;y<20;y++)for(let x=0;x<20;x++){const px=OX+x*CELL,py=OY+y*CELL;if(this.grid[y][x]){c.fillStyle='#3c424b';c.fillRect(px,py,CELL,CELL);c.fillStyle='#535760';c.fillRect(px,py,CELL,3);c.fillStyle='#262c36';c.fillRect(px,py+18,CELL,3);c.fillRect(px+10,py+3,2,7);c.fillRect(px+3,py+11,2,7);c.fillStyle='#464b52';c.fillRect(px+1,py+10,19,1);}else{c.fillStyle=(x+y)%3===0?'#1f2630':'#20232c';c.fillRect(px,py,CELL,CELL);c.fillStyle='#2a2d34';c.fillRect(px+3,py+4,3,2);}}
    const ex=OX+this.exit.x*CELL,ey=OY+this.exit.y*CELL;const unlocked=this.doors.every(d=>d.open);c.fillStyle=unlocked?'#357d6c':'#48413d';c.fillRect(ex-9,ey-9,18,18);c.fillStyle=unlocked?'#81e6b3':'#847552';c.fillRect(ex-7,ey-7,14,3);c.fillRect(ex-5,ey-2,10,3);c.fillRect(ex-3,ey+3,6,3);
    for(const door of this.doors){const x=OX+door.x*CELL-10,y=OY+door.y*CELL-10;c.fillStyle=door.open?'#534734':'#b18247';c.fillRect(x,y,20,20);c.fillStyle=door.open?'#28282c':'#523c2c';c.fillRect(x+3,y+3,14,14);if(!door.open){c.fillStyle='#d9b268';c.fillRect(x+5,y,2,21);c.fillRect(x+13,y,2,21);c.fillRect(x+8,y+9,4,4);}}
    for(const bone of this.bones)this.sprite('bones',OX+bone.x*CELL,OY+bone.y*CELL,1.7);
    for(const item of this.items){if(!this.canSee(item.x,item.y))continue;if(item.type==='gold'){this.sprite('treasure',OX+item.x*CELL,OY+item.y*CELL,2);c.fillStyle='#ffee8a';if(Math.sin(this.t*5)>0)c.fillRect(OX+item.x*CELL+8,OY+item.y*CELL-10,3,3);}else this.sprite(item.type,OX+item.x*CELL,OY+item.y*CELL,1.7);}
    for(const enemy of this.enemies){
      if(this.canSee(enemy.x,enemy.y)){
        this.sprite(enemy.type,OX+enemy.x*CELL,OY+enemy.y*CELL+Math.sin(this.t*4+enemy.x)*1.5,1.8);
        if(this.arcade&&enemy.type==='skeleton'){c.fillStyle='#dbac71';c.fillRect(OX+enemy.x*CELL-7,OY+enemy.y*CELL+11,14,2);}
      }
      if(enemy.phaseTarget){
        for(const p of [enemy,enemy.phaseTarget])if(this.canSee(p.x,p.y)){
          c.strokeStyle=Math.sin(this.t*22)>0?'#e6b8ff':'#9972d7';c.lineWidth=2;c.beginPath();c.arc(OX+p.x*CELL,OY+p.y*CELL,10+(1-enemy.phaseTimer/.85)*9,0,Math.PI*2);c.stroke();c.lineWidth=1;
        }
      }
    }
    const px=OX+this.player.x*CELL,py=OY+this.player.y*CELL;c.fillStyle='#74a7ef16';c.beginPath();c.arc(px,py,23,0,Math.PI*2);c.fill();if(this.hurtCooldown<=0||Math.sin(this.t*30)>0)this.sprite('wizard',px,py,2.1);
    for(const b of this.fireballs){if(!this.canSee(b.x,b.y))continue;const x=OX+b.x*CELL,y=OY+b.y*CELL;c.fillStyle='#f47d40';c.fillRect(x-4,y-4,8,8);c.fillStyle='#ffe59b';c.fillRect(x-2,y-2,4,4);c.fillStyle='#f9a33a50';c.fillRect(x-b.vx*.6-2,y-b.vy*.6-2,5,5);}this.drawParticles();
    if(this.arcade&&!this.demo){
      for(let y=0;y<20;y++)for(let x=0;x<20;x++){
        const key=`${x},${y}`;if(this.visible.has(key))continue;
        c.fillStyle=this.explored.has(key)?'#090912c9':'#090912';c.fillRect(OX+x*CELL,OY+y*CELL,CELL,CELL);
      }
      c.save();c.beginPath();c.rect(OX,OY,420,420);c.clip();const glow=c.createRadialGradient(px,py,12,px,py,112);glow.addColorStop(0,'#ffc66c0d');glow.addColorStop(.65,'#ffc66c03');glow.addColorStop(1,'#00000038');c.fillStyle=glow;c.fillRect(OX,OY,420,420);c.restore();
      this.text('TORCH',582,350,7,'#efc797','center');this.text(`${Math.round(this.explored.size/4)}% MAP`,582,371,7,'#ad9dc0','center');
    }
    c.fillStyle='#121019';c.fillRect(0,0,640,45);this.text(`LEVEL ${this.level}`,15,20,10,'#e2c79a');this.text('HP',15,37,8,'#b6a7a1');c.fillStyle='#342735';c.fillRect(43,28,132,9);c.fillStyle=this.health>35?'#93cbaa':'#ee786f';c.fillRect(43,28,132*this.health/100,9);this.text(`${Math.ceil(this.health)}`,186,37,9,'#e3ddc9');this.text(`KEYS ${this.keyCount}`,253,27,10,'#e2c165');this.text(`${String(this.score).padStart(5,'0')} PTS`,623,27,11,'#fae7ba','right');
    this.text('DOORS',54,83,7,'#a29999','center');this.text(`${this.doors.filter(d=>d.open).length}/${this.doors.length}`,54,104,12,'#dec07e','center');
    this.sprite('key',54,150,2.8);this.text('UNLOCK',54,177,6,'#b49e7d','center');this.sprite('food',54,227,2.7);this.text('+10 HP',54,255,6,'#b49e7d','center');this.sprite('potion',54,304,2.7);this.text('MAGIC',54,332,6,'#b49e7d','center');
    this.text('BLUE',582,85,7,'#7b9fd2','center');this.text('WIZARD',582,103,7,'#7b9fd2','center');this.sprite('wizard',582,143,3.5);this.text('FIND',583,235,6,'#ab9d89','center');this.text('THE',583,252,6,'#ab9d89','center');this.text('EXIT',583,269,6,unlocked?'#85e8b6':'#ab9d89','center');
    if(this.flash>0){c.fillStyle=`rgba(178,132,240,${this.flash*2})`;c.fillRect(0,45,640,435);}
    if(this.messageTime>0&&!this.demo){c.fillStyle='#130b20e0';c.fillRect(95,441,450,28);this.text(this.message,320,459,8,'#f0d59c','center');}this.demoLabel('#f2cb88');
  }
}
