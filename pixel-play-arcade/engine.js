export const W = 640, H = 480;
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export const rand = (min, max) => min + Math.random() * (max - min);
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${(seconds % 60).toFixed(2).padStart(5, '0')}`;

export const MODE_LABELS = {arcade:'ARCADE',rookie:'ROOKIE',classic:'CLASSIC'};
export const scoreKey = (kind, mode) => kind === 'attack'
  ? 'pixelplay.scores.attack' : `pixelplay.scores.v2.${kind}.${mode}`;

export class ScoreStore {
  constructor(configs, read, write) {
    this.read = read; this.write = write; this.boards = {};
    const names = ['EDWARD','NEON86','PIXEL8','ACE007','GHOST1','RETROX','BYTE99','NOVA42','WIZKID','LUCKY7'];
    for (const [kind, config] of Object.entries(configs)) {
      this.boards[kind] = {};
      for (const mode of kind === 'attack' ? ['classic'] : ['arcade','rookie']) {
        const key = scoreKey(kind, mode);
        let stored = this.parse(read(key));
        // Original scores belong to the original rules, never to harder Arcade runs.
        if (!stored && mode === 'rookie') {
          stored = this.parse(read(`pixelplay.scores.${kind}`));
          if (stored) write(key, JSON.stringify(stored));
        }
        const seed = mode === 'arcade' ? config.arcadeSeeds : config.seeds;
        this.boards[kind][mode] = stored || seed.map((score, i) => ({name:names[i], score}));
        this.sort(kind, mode);
      }
    }
  }
  parse(raw) {
    try {
      const rows = JSON.parse(raw);
      if (Array.isArray(rows) && rows.length === 10 && rows.every(row =>
        /^[A-Z0-9]{1,6}$/.test(row.name) && Number.isFinite(row.score) && row.score >= 0)) return rows;
    } catch { /* Invalid or unavailable storage falls back to seeded scores. */ }
    return null;
  }
  get(kind, mode) { return this.boards[kind][mode]; }
  sort(kind, mode) { this.get(kind, mode).sort((a,b) => kind === 'race' ? a.score-b.score : b.score-a.score); }
  qualifies(kind, mode, score) {
    if (!Number.isFinite(score) || score < 0) return false;
    const last = this.get(kind, mode)[9].score;
    return kind === 'race' ? score < last : score > last;
  }
  add(kind, mode, record) {
    if (!/^[A-Z0-9]{1,6}$/.test(record.name) || !this.qualifies(kind,mode,record.score)) return {added:false,saved:false};
    this.get(kind, mode).push({...record}); this.sort(kind,mode);
    this.boards[kind][mode] = this.get(kind,mode).slice(0,10);
    return {added:true,saved:this.write(scoreKey(kind,mode),JSON.stringify(this.get(kind,mode)))};
  }
}

export class AudioEngine {
  constructor() { this.enabled = false; this.mode = 'race'; this.beat = 0; this.timer = null; }
  async enable() {
    try {
      this.context ||= new (window.AudioContext || window.webkitAudioContext)();
      await this.context.resume();
      this.enabled = true;
      if (!this.timer) this.timer = setInterval(() => this.music(), 180);
    } catch { this.enabled = false; }
    return this.enabled;
  }
  disable() { this.enabled = false; clearInterval(this.timer); this.timer = null; }
  tone(frequency, duration = .09, type = 'square', volume = .035, slide = 0) {
    if (!this.enabled || !this.context || document.hidden) return;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator(), gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    if (slide) oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, frequency + slide), now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(.001, now + duration);
    oscillator.connect(gain); gain.connect(this.context.destination);
    oscillator.start(now); oscillator.stop(now + duration + .015);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
  music() {
    const notes = {race:[165,220,330,220,196,294,392,294,147,220,294,220,196,247,330,247],maze:[147,220,294,349,165,247,330,392,131,196,262,330,147,220,294,440],attack:[110,165,220,330,131,196,262,392,147,220,294,440,131,196,262,330]}[this.mode];
    const n = this.beat++;
    this.tone(notes[n % notes.length], .12, 'triangle', .025);
    if (n % 4 === 0) this.tone(notes[(n + 4) % notes.length] / 2, .22, 'triangle', .04);
    if (n % 2 === 0) this.tone(80, .06, 'triangle', .02, -45);
  }
  effect(name) {
    if (name === 'shoot') this.tone(650,.075,'square',.018,-450);
    if (name === 'pickup') { this.tone(660,.1,'triangle',.08); setTimeout(() => this.tone(990,.12,'triangle',.06), 80); }
    if (name === 'hit') this.tone(140,.18,'sawtooth',.045,-105);
    if (name === 'bomb') this.tone(90,.5,'sawtooth',.075,-65);
    if (name === 'boost') this.tone(140,.6,'sawtooth',.02,600);
    if (name === 'warning') this.tone(420,.14,'square',.025,170);
    if (name === 'phase') this.tone(240,.45,'triangle',.045,550);
    if (name === 'skid') this.tone(220,.2,'sawtooth',.022,-90);
    if (name === 'win') [330,440,550,660,880].forEach((f,i) => setTimeout(() => this.tone(f,.25,'triangle',.06),i*120));
  }
}

export class Game {
  constructor(canvas, options = {}) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.demo = !!options.demo;
    this.difficulty = options.difficulty || 'arcade';
    this.sound = options.sound; this.onFinish = options.onFinish || (() => {});
    this.keys = new Set(); this.t = 0; this.over = false; this.paused = false; this.particles = [];
    this.ctx.imageSmoothingEnabled = false;
  }
  down(...keys) { return keys.some(key => this.keys.has(key)); }
  pressed(key) { const yes = this.keys.has(key); this.keys.delete(key); return yes; }
  fx(name) { if (!this.demo) this.sound?.effect(name); }
  end(won, score, detail, extra = {}) { if(this.over) return; this.over = true; this.keys.clear(); this.fx(won ? 'win' : 'hit'); if(!this.demo) this.onFinish({won,score,detail,difficulty:this.difficulty,...extra}); }
  burst(x,y,color,count=14) { for(let i=0;i<count;i++) this.particles.push({x,y,vx:rand(-110,110),vy:rand(-110,110),life:rand(.2,.6),color}); }
  updateParticles(dt) { this.particles = this.particles.filter(p => { p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;return p.life>0; }); }
  drawParticles() { for(const p of this.particles){this.ctx.fillStyle=p.color;this.ctx.fillRect(p.x,p.y,4,4);} }
  text(text,x,y,size=12,color='#fff',align='left') { const c=this.ctx;c.fillStyle=color;c.textAlign=align;c.font=`${size}px Arcade, monospace`;c.fillText(text,x,y);c.textAlign='left'; }
  demoLabel(color='#fff') { if(!this.demo)return; const c=this.ctx;c.fillStyle='#04040bb8';c.fillRect(120,405,400,38);this.text('INSERT YOURSELF INTO THE GAME',320,429,10,color,'center'); }
}

export function pixelSprite(ctx, pattern, x, y, scale, palette) {
  for(let row=0;row<pattern.length;row++)for(let col=0;col<pattern[row].length;col++){
    const color=palette[pattern[row][col]];
    if(color){ctx.fillStyle=color;ctx.fillRect(Math.round(x+col*scale),Math.round(y+row*scale),Math.ceil(scale),Math.ceil(scale));}
  }
}

export const SPRITES = {
  ship:['000010000','000121000','000121000','001222100','001232100','012232210','122232221','110212011','000404000','000040000'],
  alien1:['00100000100','00010001000','00111111100','01101110110','11111111111','10111111101','10100000101','00011011000'],
  alien2:['000111000','001111100','011111110','110111011','111111111','001010100','010000010','100000001'],
  alien3:['0001111000','0011111100','0111111110','1100110011','1111111111','0011001100','0110110110','1100000011'],
  wizard:['00001100','00011100','00011110','00111110','00022200','00023300','00411400','04411440','00011000','00111100','00100100'],
  ghost:['0011100','0111110','1101011','1111111','1111111','1111111','1010101'],
  skeleton:['011110','110011','110011','011110','001100','111111','001100','011110','010010'],
  key:['011100','110110','011100','001000','001100','001000','001100'],
  potion:['001100','001100','011110','112211','122221','122221','011110'],
  food:['00011000','00111000','01111110','12222221','12222221','01111110'],
  treasure:['00111100','01122110','11222211','11133111','01111110'],
  bones:['11000011','11100111','00111100','00011000','00111100','11100111','11000011']
};
