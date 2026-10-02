import {AudioEngine,formatTime,ScoreStore,MODE_LABELS} from './engine.js';
import {Race} from './race.js';
import {Maze} from './maze.js';
import {Attack} from './attack.js';

const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const escapeHTML=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const games={
  race:{name:'NEON RUSH',category:'01 / RACING',color:'#5cf0e4',Class:Race,scoreLabel:'BEST TIME',unit:'TIME',intro:'Three laps. Eight unpredictable turns. Three rivals. Hold ↑ to accelerate, and make every checkpoint count.',controls:'<span><kbd>←</kbd><kbd>→</kbd> Steer</span><span><kbd>↑</kbd><kbd>↓</kbd> Speed</span><span><kbd>SPACE</kbd> Handbrake</span><span><kbd>B</kbd> Nitro</span>',actions:[['Space','BRAKE'],['KeyB','NITRO']],seeds:[84.8,93.24,98.61,104.37,110.02,119.45,127.89,139.52,147.19,155.71]},
  maze:{name:'DUNGEON RUN',category:'02 / ADVENTURE',color:'#ffbf64',Class:Maze,scoreLabel:'HIGH SCORE',unit:'SCORE',intro:'You are the Blue Wizard. Find keys, unlock every door, and reach the exit. Clear three dungeons to win. Keep eating to stay alive!',controls:'<span><kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd> Move</span><span><kbd>SPACE</kbd> Fireball</span><span>Walk over items to collect</span>',actions:[['Space','FIRE']],seeds:[2850,2400,2050,1750,1500,1200,950,700,450,200]},
  attack:{name:'STAR ASSAULT',category:'03 / SPACE SHOOTER',color:'#f185c4',Class:Attack,scoreLabel:'HIGH SCORE',unit:'SCORE',intro:'Three ships. An endless alien invasion. Dodge, shoot, and survive. New waves arrive every 15 seconds. Make your score a legend.',controls:'<span><kbd>ARROWS</kbd> Move</span><span><kbd>SPACE</kbd> Fire</span><span><kbd>X</kbd> Spread</span><span><kbd>CTRL</kbd> Bomb / detonate</span>',actions:[['Space','FIRE'],['KeyX','SPREAD'],['ControlLeft','BOMB']],seeds:[960,820,690,540,460,350,280,210,130,70]}
};
games.race.arcadeSeeds=[101.8,102.64,103.57,104.43,105.36,106.25,107.18,108.12,109.04,109.76];
games.maze.arcadeSeeds=[2700,2250,1900,1600,1400,1150,900,650,400,200];
const sound=new AudioEngine();
let storageAvailable=true;
const safeRead=(key)=>{try{return localStorage.getItem(key);}catch{storageAvailable=false;return null;}};
const safeWrite=(key,value)=>{try{localStorage.setItem(key,value);return true;}catch{storageAvailable=false;return false;}};
const scores=new ScoreStore(games,safeRead,safeWrite);
const selectedModes={race:safeRead('pixelplay.difficulty.race')==='rookie'?'rookie':'arcade',maze:safeRead('pixelplay.difficulty.maze')==='rookie'?'rookie':'arcade',attack:'classic'};
const demos=Object.fromEntries(Object.entries(games).map(([kind,data])=>[kind,new data.Class($(`#demo-${kind}`),{demo:true})]));
let activeGame=null,activeKind=null,lastTime=performance.now(),returnFocus=null,lastResult=null,toastTimer,starting=false,soundChosen=safeRead('pixelplay.sound')!==null;
const gameDialog=$('#game-dialog'),infoDialog=$('#info-dialog'),overlay=$('#game-overlay');

function scoreText(kind,score){return kind==='race'?formatTime(score):score.toLocaleString('en-US');}
function modeButtons(kind,context='board'){
  if(kind==='attack')return '<div class="classic-mode">CLASSIC · ENDLESS WAVES</div>';
  return `<div class="difficulty-picker ${context==='ready'?'ready-picker':''}" role="group" aria-label="${games[kind].name} difficulty">${['arcade','rookie'].map(mode=>`<button type="button" data-set-mode="${mode}" data-mode-kind="${kind}" data-mode-context="${context}" class="${selectedModes[kind]===mode?'selected':''}" aria-pressed="${selectedModes[kind]===mode}"><span>${MODE_LABELS[mode]}</span>${context==='ready'?`<small>${mode==='arcade'?'The full challenge':'Learn the ropes'}</small>`:''}</button>`).join('')}</div>`;
}
function table(kind,full=false){return `<table class="score-table"><thead><tr><th scope="col">RANK</th><th scope="col">PLAYER</th><th scope="col">${games[kind].unit}</th></tr></thead><tbody>${scores.get(kind,selectedModes[kind]).slice(0,full?10:3).map((row,i)=>`<tr><td>${String(i+1).padStart(2,'0')}</td><td>${escapeHTML(row.name)}${i===0?'<span class="crown" aria-label="Champion">♛</span>':''}</td><td>${scoreText(kind,row.score)}</td></tr>`).join('')}</tbody></table>`;}
function renderBoards(){for(const kind of Object.keys(games))$(`[data-board="${kind}"]`).innerHTML=`<div class="board-title"><span><svg class="icon"><use href="#i-trophy"/></svg> LOCAL LEGENDS</span><small>${games[kind].scoreLabel}</small></div>${modeButtons(kind)}${table(kind)}<button class="board-all" data-board-open="${kind}">View the top 10 <svg class="icon"><use href="#i-arrow"/></svg></button>`;}
renderBoards();
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),4000);}

const taunts={
  race:[['{champion} holds the crown.','Got what it takes?'],['Skull does not share the road.','Pass him anyway.'],['Three laps. One chance to shine.','Make every corner count.'],['That racing line looks lonely.','Put your name on it.'],['Six letters. One checkered flag.','Make them remember you.'],['The fastest time is waiting.','Stop watching. Start racing.']],
  maze:[['{champion} owns this dungeon.','Bring your best magic.'],['The ghosts think you’re lost.','Prove them wrong.'],['A key. A fireball. A little nerve.','That’s your kind of magic.'],['Treasure doesn’t collect itself.','Go claim your fortune.'],['Three dungeons. One Blue Wizard.','Make an entrance.'],['A legend is hiding in this maze.','Go find yours.']],
  attack:[['{champion} rules the galaxy.','Time for a new star.'],['The aliens brought an army.','You brought the firepower.'],['Three ships. Endless possibilities.','Make every shot count.'],['Your name belongs in the stars.','Start with the leaderboard.'],['The next wave won’t wait.','Neither should you.'],['The galaxy needs a high score.','You’re cleared for launch.']]
};
const tauntIndex={race:0,maze:0,attack:0};
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
const tauntPaused={race:motionPreference.matches,maze:motionPreference.matches,attack:motionPreference.matches};
function renderChallenge(kind){
  const node=$(`[data-challenge="${kind}"]`);if(!node)return;
  const champion=scores.get(kind,selectedModes[kind])[0].name;
  const [setup,punch]=taunts[kind][tauntIndex[kind]];
  const labels={race:'RACE FOR THE CROWN',maze:'ENTER THE DUNGEON',attack:'DEFEND THE GALAXY'};
  node.innerHTML=`<div class="challenge-meta"><span class="challenge-kicker">YOUR TURN, PLAYER ONE</span><div class="challenge-rotation"><span>${String(tauntIndex[kind]+1).padStart(2,'0')}/${taunts[kind].length}</span><button type="button" data-taunt-toggle="${kind}" aria-label="${tauntPaused[kind]?'Resume':'Pause'} ${games[kind].name} taunts" aria-pressed="${tauntPaused[kind]}" title="${tauntPaused[kind]?'Resume':'Pause'} rotating taunts">${tauntPaused[kind]?'▶':'<svg class="icon" aria-hidden="true"><use href="#i-pause"/></svg>'}</button></div></div><p class="challenge-copy">${escapeHTML(setup.replace('{champion}',champion))}<strong>${escapeHTML(punch)}</strong></p><button class="challenge-play" data-game="${kind}">${labels[kind]}<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></button>`;
}
Object.keys(taunts).forEach((kind,i)=>{
  renderChallenge(kind);
  setInterval(()=>{
    const node=$(`[data-challenge="${kind}"]`);
    if(document.hidden||activeGame||tauntPaused[kind]||node.matches(':hover, :focus-within'))return;
    tauntIndex[kind]=(tauntIndex[kind]+1)%taunts[kind].length;renderChallenge(kind);
  },8000+i*900);
});
motionPreference.addEventListener('change',event=>{if(event.matches)for(const kind of Object.keys(taunts)){tauntPaused[kind]=true;renderChallenge(kind);}});

function setMode(kind,mode,context){
  if(!['race','maze'].includes(kind)||!['rookie','arcade'].includes(mode))return;
  if(activeGame&&!starting)return;
  selectedModes[kind]=mode;safeWrite(`pixelplay.difficulty.${kind}`,mode);renderBoards();renderChallenge(kind);
  if(context==='ready'&&starting){prepareGame();$(`.ready-picker [data-set-mode="${mode}"]`).focus();}
  else if(context==='dialog'){showBoard(kind);$(`#info-dialog [data-set-mode="${mode}"]`).focus();}
  else $(`[data-board="${kind}"] [data-set-mode="${mode}"]`).focus();
}
function updateNav(selected=location.hash==='#high-scores'?'scores':'arcade'){
  $$('[data-nav]').forEach(link=>{const active=link.dataset.nav===selected;link.classList.toggle('active',active);if(active&&link.tagName==='A')link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
}
window.addEventListener('hashchange',()=>updateNav());updateNav();

function updateSoundUI(){const enabled=sound.enabled;$$('[data-action="sound"], [data-action="game-sound"]').forEach(button=>{button.setAttribute('aria-pressed',String(enabled));button.setAttribute('aria-label',`Turn sound ${enabled?'off':'on'}`);$('use',button).setAttribute('href',enabled?'#i-sound':'#i-muted');const label=$('span',button);if(label)label.textContent=enabled?'SOUND ON':'SOUND OFF';});}
async function toggleSound(){soundChosen=true;if(sound.enabled)sound.disable();else{await sound.enable();if(!sound.enabled)toast('Audio is unavailable in this browser. The games still work.');}safeWrite('pixelplay.sound',sound.enabled?'on':'off');updateSoundUI();}

function openGame(kind){
  if(!games[kind])return;returnFocus=document.activeElement;activeKind=kind;lastResult=null;starting=true;
  if(infoDialog.open)infoDialog.close();
  const data=games[kind];gameDialog.style.setProperty('--game-accent',data.color);$('#game-title').textContent=data.name;$('#game-category').textContent=data.category;$('#game-controls').innerHTML=data.controls;$('#touch-actions').innerHTML=data.actions.map(([key,label])=>`<button data-key="${key}" aria-label="${label.toLowerCase()}">${label}</button>`).join('');
  sound.mode=kind;
  if(!soundChosen||safeRead('pixelplay.sound')==='on'){sound.enable().then(updateSoundUI);soundChosen=true;}
  prepareGame();
  gameDialog.showModal();document.body.style.overflow='hidden';$('.pixel-button',overlay).focus();setPauseButton(false);
}
function prepareGame(){
  const data=games[activeKind],difficulty=selectedModes[activeKind];
  activeGame=new data.Class($('#active-game'),{sound,difficulty,onFinish:finishGame});activeGame.paused=true;activeGame.render();
  const summary=activeKind==='race'?(difficulty==='arcade'?'Brake before corners. Feint past Skull. Make every checkpoint.':'Learn the racing line with forgiving grip and slower rivals.'):activeKind==='maze'?(difficulty==='arcade'?'Follow your torch. Outsmart guards. Watch for phasing ghosts.':'Explore the full map with slower enemies and more food.'):data.intro;
  overlay.hidden=false;overlay.classList.add('ready-overlay');overlay.innerHTML=`<div class="eyebrow">YOUR TURN TO MAKE HISTORY</div><h3>READY, PLAYER ONE?</h3><p>${summary}</p>${activeKind==='attack'?'':modeButtons(activeKind,'ready')}<button class="pixel-button" data-action="start-game">LET'S PLAY →</button>`;
  $('#game-mode-label').textContent=MODE_LABELS[difficulty];
}
function startGame(){starting=false;activeGame.paused=false;overlay.hidden=true;overlay.classList.remove('ready-overlay');$('#active-game').focus();lastTime=performance.now();sound.effect('pickup');}
function closeGame(){if(!gameDialog.open)return;activeGame?.keys.clear();activeGame=null;activeKind=null;starting=false;gameDialog.close();gameDialog.classList.remove('expanded');document.body.style.overflow='';sound.mode='race';returnFocus?.focus();}
function setPauseButton(paused){const button=$('[data-action="pause"]');button.classList.toggle('pause-button-active',paused);button.setAttribute('aria-label',paused?'Resume game':'Pause game');button.title=paused?'Resume game (P)':'Pause game (P)';}
function pauseGame(force){if(!activeGame||activeGame.over||starting)return;const paused=typeof force==='boolean'?force:!activeGame.paused;activeGame.paused=paused;activeGame.keys.clear();setPauseButton(paused);overlay.hidden=!paused;if(paused){overlay.innerHTML='<h3>TAKE A BREATHER.</h3><p>Your game is right where you left it.</p><button class="pixel-button" data-action="resume">BACK TO THE ACTION →</button>';$('.pixel-button',overlay).focus();}else $('#active-game').focus();}
function finishGame(result){
  lastResult={...result,difficulty:activeGame.difficulty};activeGame.keys.clear();const kind=activeKind;const qualifies=(kind!=='race'||result.won)&&scores.qualifies(kind,lastResult.difficulty,result.score);overlay.hidden=false;overlay.classList.remove('ready-overlay');
  overlay.innerHTML=`<div class="eyebrow">${result.won?'YOU DID THAT.':'THERE’S ALWAYS ONE MORE TRY.'}</div><h3 style="margin-top:17px">${result.won?'YOU WIN!':'GAME OVER'}</h3><p>${escapeHTML(result.detail)}</p><div class="result-score" style="font:19px var(--pixel);color:${games[kind].color};margin-bottom:13px">${scoreText(kind,result.score)}${kind==='race'?'':' PTS'}</div>${qualifies?`<form class="record-form" id="record-form"><label for="player-name">TOP 10! LEAVE YOUR MARK.</label><div class="record-input-row"><input id="player-name" name="playerName" placeholder="PLAYER" maxlength="6" minlength="1" pattern="[A-Za-z0-9]{1,6}" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-describedby="record-note" required><button class="pixel-button" type="submit">SAVE SCORE</button></div><small id="record-note">Up to 6 letters or numbers · saved on this device</small></form>`:''}<div class="overlay-actions"><button class="pixel-button" data-action="retry">PLAY AGAIN</button><button class="secondary-button" data-action="share-score">SHARE SCORE ↗</button></div>`;
  if(qualifies){$('#player-name').focus();$('#record-form').addEventListener('submit',saveScore);$('#player-name').addEventListener('input',e=>{e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'');});}else $('[data-action="retry"]').focus();
}
function saveScore(e){e.preventDefault();const name=$('#player-name').value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);if(!name)return;const record={name,score:lastResult.score};if(activeKind==='race'&&Number.isFinite(lastResult.remaining))record.remaining=lastResult.remaining;const {saved,added}=scores.add(activeKind,lastResult.difficulty,record);if(!added)return;renderBoards();renderChallenge(activeKind);$('#record-form').innerHTML=`<p style="color:#a9dfb8;margin:0">${escapeHTML(name)}, you're a ${MODE_LABELS[lastResult.difficulty]} legend.${saved?' Score saved!':' Score saved for this visit; browser storage is unavailable.'}</p>`;toast(saved?'High score saved to the '+MODE_LABELS[lastResult.difficulty]+' board.':'Your score is on the board for this visit.');}

const helpContent={
  race:`<h3>The fast lane to a high score.</h3><p>Finish <strong>3 laps</strong> on a track with eight randomized turns. Turn 5 is a hairpin: watch for braking boards and red-and-white arrows. Use the handbrake to tighten your turn.</p><p>Your race clock counts <strong>up</strong>; faster times rank higher. Your separate time reserve starts at 35 seconds. Both the checkpoint after the hairpin and the start line add <strong>15 seconds</strong>. Finish before the reserve runs out.</p><p>You face three computer drivers. The silver car with a skull actively blocks passing. Nitrous boosts speed for 3 seconds, followed by 7 seconds of recovery.</p>`,
  maze:`<h3>A blue wizard. Three dangerous dungeons.</h3><p>Explore a randomized <strong>20 × 20 maze</strong>. Collect keys, unlock every door, then find the green exit stairs. Clear all three levels to win. Opened doors count even if you use a different route.</p><p>Start with <strong>100 HP</strong>, losing 2 each second. Food restores 10 HP, and enemies deal 10 damage on contact. Skeletons and ghosts die to one fireball. Bone piles block your path.</p><p>Walk over items to collect them. Potions instantly clear half the enemies. Treasure is worth <strong>50 points</strong>, the one gold treasure per level is worth <strong>200</strong>, and each unlocked door is worth <strong>100</strong>. A new enemy appears every 5 seconds; later levels start with five more enemies and fewer resources.</p>`,
  attack:`<h3>Space is big. Your mission is simple.</h3><p>Defend the galaxy with <strong>3 ships</strong>. Move around the bottom quarter of the screen. Fire straight ahead with Space or at 30° left and right with X.</p><p>The first wave has 15 aliens. Every <strong>15 seconds</strong>, a new wave arrives with five more aliens and 5% more speed. Green invaders sweep side to side (10 points), violet aliens dive diagonally and wrap around the screen (20), and pink aliens circle and teleport upward (30).</p><p>Press <strong>Control</strong> to launch a bomb and press it again to detonate. The blast expands from the bomb, and missiles fire from your ship in twelve directions. The bomb recharges in 10 seconds. A 100-point mothership appears in the first 20 seconds of each minute after the first minute.</p>`
};
helpContent.race+='<h3>Arcade puts your driving to the test.</h3><p>Arcade has a longer track, faster rivals, and real loss of grip above the corner speed shown on screen. Brake early for the hairpin. Hard barrier impacts cause a spin and cost time.</p><p><strong>Skull is your toughest rival.</strong> Watch the amber indicator: the car signals, commits to blocking one lane, then recovers. Feint one way, pass on the other, and save nitro for the opening. Rookie keeps the original, more forgiving race. Each mode has its own leaderboard.</p>';
helpContent.maze+='<h3>Arcade rewards smart exploration.</h3><p>Your torch reveals nearby passages; explored rooms stay dimly visible. Food drops to 14, 12, then 10 pieces, while enemies get faster every level. Skeletons guard keys and supplies; ghosts pursue you and can phase through one wall.</p><p><strong>Purple rings warn you before a ghost phases.</strong> Shoot it during the warning or keep moving away from its landing point. Rookie keeps the full map, slower enemies, and more food. Scores are separate for each mode.</p>';
function showInfo(html){$('#info-content').innerHTML=html;const title=$('h2',$('#info-content'));if(title)title.id='info-title';if(!infoDialog.open){returnFocus=document.activeElement;infoDialog.showModal();document.body.style.overflow='hidden';}}
function closeInfo(){infoDialog.close();if(!gameDialog.open)document.body.style.overflow='';returnFocus?.focus();updateNav();}
function showHelp(kind='race'){showInfo(`<div class="eyebrow">A QUICK FIELD GUIDE</div><h2>HOW TO PLAY</h2><div class="help-tabs" role="group" aria-label="Game instructions">${Object.entries(games).map(([k,g])=>`<button data-help="${k}" class="${k===kind?'selected':''}" aria-pressed="${k===kind}">${g.name}</button>`).join('')}</div>${helpContent[kind]}<div class="help-controls">${games[kind].controls}</div><p class="info-footnote">On a phone or tablet, use the on-screen controls. Press P to pause and Escape to leave. Audio starts after you interact and can be muted anytime.</p><button class="pixel-button info-play" data-game="${kind}">PLAY ${games[kind].name} →</button>`);}
function showBoard(kind){showInfo(`<div class="eyebrow">THE NAMES TO BEAT · ${MODE_LABELS[selectedModes[kind]]}</div><h2>${games[kind].name}<br>LOCAL LEGENDS</h2><div style="--accent:${games[kind].color};--accent-rgb:173,131,245">${modeButtons(kind,'dialog')}${table(kind,true)}</div><p class="info-footnote">${kind==='race'?'Complete all 3 laps. Lower times rank higher.':'Higher scores rank higher.'} ${kind==='attack'?'':'Rookie and Arcade have separate boards. Original scores are kept in Rookie. '}Finish in the top 10 to enter up to six letters or numbers. Saved on this browser.</p><button class="pixel-button info-play" data-game="${kind}">TAKE YOUR SHOT →</button>`);}

const shareURL=new URL(location.href);shareURL.hash='';
const shareText='Good times. High scores. Meet me at PIXEL//PLAY — three free arcade games, right in your browser.';
$('#share-x').href=`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareURL.href)}`;
$('#share-facebook').href=`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareURL.href)}`;
$('#share-whatsapp').href=`https://wa.me/?text=${encodeURIComponent(shareText+' '+shareURL.href)}`;
async function copyLink(text=shareURL.href){try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(text);else{const input=document.createElement('textarea');input.value=text;input.style.position='fixed';input.style.opacity='0';document.body.append(input);input.select();if(!document.execCommand('copy'))throw new Error('copy failed');input.remove();}toast('Copied. Pass it to your player two.');}catch{showInfo(`<div class="eyebrow">PASS THE CONTROLLER</div><h2>SHARE THE ARCADE</h2><p>Copy this link and send it to a friend.</p><input aria-label="Arcade sharing link" readonly value="${escapeHTML(text)}" style="width:100%;padding:12px;background:#110b19;border:1px solid #76558a;color:#dfc8ee;border-radius:4px">`);}}
async function share(score=false){const text=score&&lastResult?`I ${activeKind==='race'?'finished in '+formatTime(lastResult.score):'scored '+lastResult.score.toLocaleString()+' points'} on ${games[activeKind].name} (${MODE_LABELS[lastResult.difficulty]}) at PIXEL//PLAY. Your turn!`:shareText;if(navigator.share){try{await navigator.share({title:'PIXEL//PLAY Arcade',text,url:shareURL.href});}catch(error){if(error.name!=='AbortError')await copyLink(`${text} ${shareURL.href}`);}}else await copyLink(score?`${text} ${shareURL.href}`:shareURL.href);}

document.addEventListener('click',async e=>{
  const mode=e.target.closest('[data-set-mode]');if(mode){setMode(mode.dataset.modeKind,mode.dataset.setMode,mode.dataset.modeContext);return;}
  const taunt=e.target.closest('[data-taunt-toggle]');if(taunt){const kind=taunt.dataset.tauntToggle;tauntPaused[kind]=!tauntPaused[kind];renderChallenge(kind);$(`[data-taunt-toggle="${kind}"]`).focus();return;}
  const nav=e.target.closest('[data-nav]');if(nav)updateNav(nav.dataset.nav);
  const game=e.target.closest('[data-game]');if(game){openGame(game.dataset.game);return;}
  const board=e.target.closest('[data-board-open]');if(board){showBoard(board.dataset.boardOpen);return;}
  const help=e.target.closest('[data-help]');if(help){showHelp(help.dataset.help);return;}
  const button=e.target.closest('[data-action]');if(!button)return;
  switch(button.dataset.action){
    case 'sound':case 'game-sound':await toggleSound();break;
    case 'help':showHelp();break;
    case 'close-info':closeInfo();break;
    case 'close-game':closeGame();break;
    case 'start-game':startGame();break;
    case 'pause':pauseGame();break;
    case 'resume':pauseGame(false);break;
    case 'expand':{const expanded=gameDialog.classList.toggle('expanded');button.setAttribute('aria-label',expanded?'Restore game size':'Expand game');button.title=expanded?'Restore game size':'Expand game';break;}
    case 'retry':{const kind=activeKind;activeGame=null;gameDialog.close();openGame(kind);startGame();break;}
    case 'share':share();break;
    case 'share-score':share(true);break;
    case 'copy':copyLink();break;
    case 'privacy':showInfo('<div class="eyebrow">NO SECRETS. JUST HIGH SCORES.</div><h2>YOUR PRIVACY</h2><p>PIXEL//PLAY stores your high scores and sound preference in this browser. There are no advertising cookies or analytics trackers.</p><p>When you join the Player One Club, your email address and consent date are saved on this arcade’s server for new-game announcements and tournament invitations. We do not sell or share your email. This local edition collects signups; email delivery and tournament scheduling are not yet connected.</p><p>Changed your mind? Enter your address below to remove it from the club on this server.</p><form id="unsubscribe-form"><label for="unsubscribe-email">Email address</label><div class="email-field" style="margin-top:10px"><input id="unsubscribe-email" type="email" autocomplete="email" required placeholder="Your email address"><button type="submit">UNSUBSCRIBE</button></div><p id="unsubscribe-status" aria-live="polite"></p></form><p class="info-footnote">You can remove local scores by clearing this site’s browser storage. Sharing opens your chosen service, which has its own privacy policy.</p>');$('#unsubscribe-form').addEventListener('submit',unsubscribe);break;
  }
});

const playKeys=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyW','KeyA','KeyS','KeyD','KeyX','KeyB','ControlLeft','ControlRight']);
document.addEventListener('keydown',e=>{if(!gameDialog.open||infoDialog.open||!activeGame)return;if(e.target.matches('input,textarea'))return;if(e.code==='KeyP'&&!e.repeat){e.preventDefault();pauseGame();return;}if(activeGame.paused||activeGame.over)return;if(playKeys.has(e.code)){e.preventDefault();if(!e.repeat||!e.code.startsWith('Control'))activeGame.keys.add(e.code);}});
document.addEventListener('keyup',e=>{activeGame?.keys.delete(e.code);});
document.addEventListener('pointerdown',e=>{const button=e.target.closest('[data-key]');if(!button||!activeGame||activeGame.paused)return;e.preventDefault();button.setPointerCapture(e.pointerId);activeGame.keys.add(button.dataset.key);});
for(const event of ['pointerup','pointercancel','lostpointercapture'])document.addEventListener(event,e=>{const button=e.target.closest('[data-key]');if(button)activeGame?.keys.delete(button.dataset.key);});
gameDialog.addEventListener('cancel',e=>{e.preventDefault();closeGame();});infoDialog.addEventListener('cancel',e=>{e.preventDefault();closeInfo();});
infoDialog.addEventListener('click',e=>{if(e.target===infoDialog){const r=infoDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeInfo();}});
window.addEventListener('blur',()=>{activeGame?.keys.clear();pauseGame(true);});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseGame(true);lastTime=performance.now();});
function animate(now){const dt=Math.min((now-lastTime)/1000,.04);lastTime=now;if(!document.hidden){if(activeGame){activeGame.update(dt);activeGame.render();}else for(const demo of Object.values(demos)){demo.update(dt);demo.render();}}requestAnimationFrame(animate);}
document.fonts.ready.then(()=>requestAnimationFrame(animate));
updateSoundUI();

$('#signup-form').addEventListener('submit',async e=>{
  e.preventDefault();const form=e.currentTarget,input=$('#email'),message=$('#signup-message'),button=$('button',form);if(!form.reportValidity())return;
  const email=input.value.trim();button.disabled=true;button.textContent='JOINING…';message.className='';message.textContent='Saving your place in the club…';
  try{const response=await fetch('/api/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,consent:true})});let data;try{data=await response.json();}catch{throw new Error('The signup service is not connected on this host yet. Please try again once it is available.');}if(!response.ok)throw new Error(data.error||'Could not save your email. Please try again.');message.className='success';message.textContent='You’re on the list! Your email is saved for early access and tournament news.';input.value='';toast('Welcome to the Player One Club.');}
  catch(error){message.className='error';message.textContent=error.message==='Failed to fetch'?'The signup service is offline. Please try again soon.':error.message;}
  finally{button.disabled=false;button.innerHTML='COUNT ME IN <svg class="icon"><use href="#i-arrow"/></svg>';}
});
async function unsubscribe(e){e.preventDefault();const message=$('#unsubscribe-status'),button=$('button',e.target);button.disabled=true;try{const res=await fetch('/api/unsubscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:$('#unsubscribe-email').value.trim()})});const data=await res.json();if(!res.ok)throw new Error(data.error||'Please try again.');message.textContent='If that email was on this server’s list, it has been removed.';}catch{message.textContent='The signup service is unavailable. Please try again when it is online.';}finally{button.disabled=false;}}

// Small read-only hooks for local smoke checks; no player shortcuts or score mutations.
Object.defineProperty(window,'arcadeStatus',{get:()=>({active:activeKind,difficulty:activeGame?.difficulty,paused:activeGame?.paused,over:activeGame?.over,level:activeGame?.level,health:activeGame?.health,score:activeGame?.score,speed:activeGame?.speed,raceDistance:activeGame?.distance,player:activeGame?.player?{...activeGame.player}:null,skull:activeGame?.rivals?.find(car=>car.skull)?{...activeGame.rivals.find(car=>car.skull)}:null,sound:sound.enabled,storageAvailable,demos:Object.keys(demos)})});
