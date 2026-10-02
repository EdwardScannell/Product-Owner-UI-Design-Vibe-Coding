export const TIME_ZONE = 'America/New_York';
export const PREVIEW_LEAD_HOURS = 48;
export const LOCATIONS = {
  wrenford: { name: 'Wrenford', address: '128 Orchard Street', city: 'Wrenford, MA 00412', phone: '(617) 555-0141', tel: '+16175550141', weekdayClose: 17, weekendClose: 16, hours: 'Wed–Fri 7am–5pm · Sat–Sun 8am–4pm', squareId: 'DEMO' },
  calder: { name: 'Calder Falls', address: '42 Mill Pond Road', city: 'Calder Falls, MA 00418', phone: '(617) 555-0142', tel: '+16175550142', weekdayClose: 16, weekendClose: 15, hours: 'Wed–Fri 8am–4pm · Sat–Sun 8am–3pm' },
  pellharbor: { name: 'Pell Harbor', address: '9 Quayside Row', city: 'Pell Harbor, MA 00421', phone: '(617) 555-0143', tel: '+16175550143', weekdayClose: 17, weekendClose: 16, hours: 'Wed–Fri 7am–5pm · Sat–Sun 8am–4pm' }
};
export function easternParts(epoch = Date.now()) {
  const pieces = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(epoch));
  return Object.fromEntries(pieces.filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
}
export function easternDate(epoch = Date.now()) { const p=easternParts(epoch);return `${p.year}-${p.month}-${p.day}`; }
export function addDays(iso, days) { const d=new Date(`${iso}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10); }
export function weekday(iso) { return new Date(`${iso}T12:00:00Z`).getUTCDay(); }
export function isDate(iso) { return /^\d{4}-\d{2}-\d{2}$/.test(iso) && !isNaN(Date.parse(`${iso}T12:00:00Z`)) && new Date(`${iso}T12:00:00Z`).toISOString().slice(0,10)===iso; }
export function pickupEpoch(iso, time) {
  if (!isDate(iso) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return NaN;
  const target=Date.parse(`${iso}T${time}:00Z`);let guess=target;
  for(let i=0;i<3;i++){const p=easternParts(guess);const represented=Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second);guess+=target-represented;}
  return guess;
}
export function dateLabel(iso, long=false) { if(!isDate(iso))return 'Choose your day';return new Intl.DateTimeFormat('en-US',{timeZone:TIME_ZONE,weekday:long?'long':'short',month:long?'long':'short',day:'numeric'}).format(new Date(`${iso}T12:00:00Z`)); }
export function timeLabel(time) { const [h,m]=time.split(':').map(Number);return `${h%12||12}:${String(m).padStart(2,'0')} ${h<12?'AM':'PM'}`; }
export function slotsFor(locationId,iso,now=Date.now(),leadHours=PREVIEW_LEAD_HOURS) {
  const location=LOCATIONS[locationId];if(!location||!isDate(iso))return [];
  const day=weekday(iso);if(day===1||day===2)return [];
  const max=addDays(easternDate(now),35);if(iso>max)return [];
  const close=day===0||day===6?location.weekendClose:location.weekdayClose;
  const slots=[];for(let minutes=9*60;minutes<close*60;minutes+=15){const time=`${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;if(pickupEpoch(iso,time)>=now+leadHours*3600000)slots.push(time);}
  return slots;
}
export function availableDates(locationId,now=Date.now(),limit=6) { const result=[];const start=easternDate(now);for(let i=0;i<=35&&result.length<limit;i++){const iso=addDays(start,i);if(slotsFor(locationId,iso,now).length)result.push(iso);}return result; }
export function validatePickup(locationId,iso,time,now=Date.now()) {
  if(!LOCATIONS[locationId])return 'Choose a pickup bakery.';
  if(!isDate(iso))return 'Choose a pickup date.';
  if([1,2].includes(weekday(iso)))return 'Our bakeries are closed on Mondays and Tuesdays. Please choose another day.';
  if(iso>addDays(easternDate(now),35))return 'Choose a pickup date within the next five weeks.';
  if(!time)return 'Choose a pickup time.';
  if(!Number.isFinite(pickupEpoch(iso,time)))return 'Choose a valid pickup time.';
  if(pickupEpoch(iso,time)<now+PREVIEW_LEAD_HOURS*3600000)return 'Please allow at least 48 hours before pickup in this preview.';
  if(!slotsFor(locationId,iso,now).includes(time))return 'That time is outside this bakery’s pickup hours. Please choose another time.';
  return null;
}
export function publishedRefund(iso,now=Date.now()) {
  if(!isDate(iso))return {percent:null,label:'Please ask the bakery to confirm your refund.'};
  const days=Math.round((Date.parse(`${iso}T12:00:00Z`)-Date.parse(`${easternDate(now)}T12:00:00Z`))/86400000);
  const percent=days>=7?100:days===5?75:days===3?50:days===1?25:days<=0?0:null;
  return {percent,days,label:percent===null?'This notice period needs bakery review. The published policy does not specify 2, 4, or 6 days.':`${percent}% listed for ${days>=7?'at least 7 days':days<=0?'same-day cancellation':`${days} day${days===1?'':'s'}’ notice`}.`};
}
