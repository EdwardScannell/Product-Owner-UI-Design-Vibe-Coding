'use strict';
const books = [
  {isbn:'9781250368935',title:'Dreamland',author:'Olivie Blake',staff:'Wren',category:'Gothic fiction',genres:['Gothic & horror','Literary fiction'],price:'29.99',format:'Hardcover',tone:'plum',note:'A dark, dreamy novel about wanting something too much. Read it with the lights low.',detail:'Wren’s pick for readers who like their ambition with a shadow. Moody, slippery, and hard to shake.'},
  {isbn:'9781101971383',title:'The Starless Sea',author:'Erin Morgenstern',staff:'Wren',category:'Literary fantasy',genres:['Fantasy','Literary fiction'],price:'21.00',format:'Paperback',tone:'blue',note:'A book about falling into books. Bring snacks; you’ll be down there a while.',detail:'Wren hands this to anyone who misses getting lost in a story. Layered tales, hidden doors, and a lot of wonder.'},
  {isbn:'9780063418028',title:'As Many Souls as Stars',author:'Natasha Siegel',staff:'June',category:'Historical fantasy',genres:['Fantasy'],price:'30.00',format:'Hardcover',tone:'brown',note:'Love that outlasts centuries, with a little supernatural trouble mixed in.',detail:'June’s pick for romance readers who want history and the uncanny on the same page.'},
  {isbn:'9781632367709',title:'Witch Hat Atelier, Vol. 1',author:'Kamome Shirahama',staff:'Theo',category:'Fantasy · Graphic novel',genres:['Fantasy','Graphic novels'],price:'12.99',format:'Paperback',tone:'blue',note:'Some of the most beautiful line work on any shelf in the shop.',detail:'Theo’s favorite place to start someone on manga: gorgeous art and a magic system built on drawing.'},
  {isbn:'9781250829825',title:'Wolf Worm',author:'T. Kingfisher',staff:'Wren',category:'Gothic horror',genres:['Gothic & horror'],price:'29.99',format:'Hardcover',tone:'brown',note:'Creepy, funny, and strange in the best way. Wren’s one exception to her no-horror rule.',detail:'A short, sharp scare with a naturalist’s eye. Perfect for an October evening.'},
  {isbn:'9780061478789',title:'Howl’s Moving Castle',author:'Diana Wynne Jones',staff:'Theo',category:'Fantasy classic',genres:['Fantasy'],price:'11.99',format:'Paperback',tone:'plum',note:'A walking castle, a vain wizard, and a heroine who refuses to be underestimated.',detail:'Theo’s comfort reread. Funny, warm, and stranger than you remember.'},
  {isbn:'9781685891831',title:'Television for Women',author:'Danit Brown',staff:'June',category:'Literary fiction',genres:['Literary fiction'],price:'19.99',format:'Paperback',tone:'brown',note:'Small, honest stories about the parts of life nobody puts on TV.',detail:'June recommends this for readers who like quiet books that land hard.'},
  {isbn:'9781250303790',title:'The Goblin Emperor',author:'Katherine Addison',staff:'Theo',category:'Fantasy',genres:['Fantasy'],price:'19.99',format:'Paperback',tone:'blue',note:'An unlikely heir, a court full of knives, and a lot of kindness. Theo’s favorite slow burn.',detail:'Political fantasy that runs on decency instead of battles. A gentle, absorbing read.'},
  {isbn:'9781250289780',title:'If We Were Villains',author:'M. L. Rio',staff:'Wren',category:'Dark academia',genres:['Gothic & horror','Literary fiction'],price:'18.99',format:'Paperback',tone:'plum',note:'Theater students, Shakespeare, and a secret nobody can stage-whisper away.',detail:'Wren’s pick for fans of dark academia. Tense, literary, and very quotable.'}
];
const readerNotes = {
  Wren:'Wren reads anything with atmosphere: gothic fiction, literary fantasy, and the occasional scare.',
  Theo:'Theo’s shelf leans toward illustrated worlds, comfort fantasy, and stories with heart.',
  June:'June picks quiet, honest fiction and romance with a touch of the otherworldly.'
};
const readerBios = {
  Wren:{intro:'Wren runs the evening shift and the after-dark table at Lanternfield.',more:'She keeps a running list of books best read after sunset and will happily argue for any of them.'},
  Theo:{intro:'Theo looks after the graphic novel wall and the kids’ corner.',more:'He sketches in the margins of his reading log and has strong opinions about cover design.'}
};
const staffReviewUrl = book => `#book-${book.isbn}`;
const state = {view:'reading',staff:'all',genre:'all',query:''};
const $ = (selector,root=document) => root.querySelector(selector);
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const escapeHTML = value => String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function filteredBooks(){
  const q=state.query.trim().toLocaleLowerCase();
  return books.filter(book => (state.staff==='all'||book.staff===state.staff)&&(state.genre==='all'||book.genres.includes(state.genre))&&(!q||[book.title,book.author,book.staff,book.category,book.note,book.detail].join(' ').toLocaleLowerCase().includes(q)));
}
function renderBooks(){
  renderView();
  const matches=filteredBooks();
  $('#genre-select').value=state.genre;
  $('#staff-select').value=state.staff;
  $('#book-grid').innerHTML=matches.map((book,index)=>`<article class="book-card" aria-roledescription="slide" aria-label="${index+1} of ${matches.length}: ${escapeHTML(book.title)}">
    <div class="cover-stage tone-${book.tone}"><button class="cover-button" data-detail="${book.isbn}" aria-label="Read about ${escapeHTML(book.title)}"><img src="assets/${book.isbn}.jpg" alt="${escapeHTML(book.title)} book cover" loading="lazy" width="140" height="210"></button><a class="pick-badge" href="#shelf-talkers/${book.staff.toLowerCase()}" aria-label="Browse ${book.staff}’s shelf"><span class="avatar ${book.staff.toLowerCase()}" aria-hidden="true">${book.staff[0]}</span>${book.staff}’s pick</a></div>
    <div class="card-body"><span class="card-category">${book.category.toUpperCase()}</span><h3><button class="book-title-button" data-detail="${book.isbn}">${escapeHTML(book.title)}</button></h3><p class="book-author">${escapeHTML(book.author)}</p><p class="card-note">${escapeHTML(book.note)}</p><div class="card-links"><a class="card-reader" href="#" data-detail="${book.isbn}" aria-label="Read the staff note on ${escapeHTML(book.title)}">Staff note ${icon('arrow')}</a><a class="card-reader" href="#shelf-talkers">All ${book.staff}’s picks ${icon('arrow')}</a></div><div class="card-meta"><span>${book.format}</span><span class="price">$${book.price}</span></div><button class="reserve-button" data-reserve="${book.isbn}" aria-label="Reserve ${escapeHTML(book.title)}">${icon('bag')}Reserve a copy</button></div>
  </article>`).join('');
  $('#result-count').textContent=`${matches.length} ${matches.length===1?'handpicked read':'handpicked reads'}`;
  $('#empty-state').hidden=matches.length>0;
  $('#book-grid').hidden=matches.length===0;
  $('#carousel-navigation').hidden=matches.length===0;
  $('#book-grid').scrollLeft=0;
  requestAnimationFrame(updateCarousel);
  document.querySelectorAll('.staff-filter').forEach(button=>{const selected=button.dataset.staff===state.staff;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
  document.querySelectorAll('.genre-filter').forEach(button=>{const selected=button.dataset.genre===state.genre;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
  const note=$('#reader-note');note.hidden=state.staff==='all';
  note.innerHTML=state.staff==='all'?'':`${readerNotes[state.staff]} <a href="#shelf-talkers">Meet ${state.staff}</a>`;
}
function renderView(){
  const staffView=state.view==='staff';
  document.body.classList.toggle('staff-view-active',staffView);
  $('.hero').hidden=staffView;
  $('#shelf-talkers').hidden=!staffView;
  document.title=staffView?`${state.staff}’s Shelf — Lanternfield Books`:"The Reading Room — Lanternfield Books";
  document.querySelectorAll('.desktop-nav a, #mobile-nav a').forEach(link=>{
    const selected=link.hash===(staffView?'#shelf-talkers':'#reading-room');
    link.classList.toggle('active',selected);
    if(selected)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
  });
  $('#collection-title').textContent=staffView?`Recommended by ${state.staff}`:'A little shelf discovery.';
  if(staffView){
    $('#profile-staff-select').value=state.staff;
    $('#staff-view-title').textContent=`${state.staff}’s shelf`;
    const bio=readerBios[state.staff];
    $('#staff-view-note').textContent=bio?.intro||readerNotes[state.staff];
    const bioPanel=$('#staff-view-bio');bioPanel.hidden=!bio;
    if(bioPanel.dataset.staff!==state.staff)bioPanel.open=false;
    bioPanel.dataset.staff=state.staff;
    if(bio){
      $('#staff-bio-toggle').textContent=`More about ${state.staff}`;
      $('#staff-bio-text').textContent=bio.more;
      
    }
    $('#staff-view-source').href=`#shelf-talkers`;
    $('#staff-view-source').innerHTML=`All ${state.staff}’s recommendations ${icon('arrow')}`;
    $('#reset-filters').textContent=`Explore ${state.staff}’s picks`;
  }else $('#reset-filters').textContent='Explore all picks';
}
function applyViewRoute(moveFocus=false){
  const hash=location.hash;
  if(hash==='#shelf-talkers'||hash.startsWith('#shelf-talkers/')){
    const selected=hash.split('/')[1];
    state.view='staff';state.staff=Object.keys(readerNotes).find(name=>name.toLowerCase()===selected)||'Wren';
  }else if(!hash||hash==='#'||hash==='#reading-room'){
    state.view='reading';state.staff='all';
  }else return;
  state.genre='all';state.query='';$('#search').value='';renderBooks();
  requestAnimationFrame(()=>{
    window.scrollTo({top:0,behavior:'instant'});
    if(moveFocus&&state.view==='staff')$('#staff-view-title').focus({preventScroll:true});
  });
}
window.addEventListener('hashchange',()=>applyViewRoute(true));
function updateCarousel(){
  const rail=$('#book-grid');const cards=[...rail.querySelectorAll('.book-card')];
  if(!cards.length)return;
  const gap=parseFloat(getComputedStyle(rail).columnGap)||0;
  const step=cards[0].getBoundingClientRect().width+gap;
  const visible=Math.max(1,Math.floor((rail.clientWidth+gap)/step));
  const start=Math.min(cards.length-1,Math.round(rail.scrollLeft/step));
  const end=Math.min(cards.length,start+visible);
  $('#carousel-position').textContent=visible>1?`${start+1}–${end} of ${cards.length}`:`${start+1} of ${cards.length}`;
  $('#carousel-progress-fill').style.width=`${Math.min(100,end/cards.length*100)}%`;
  $('#previous-books').disabled=rail.scrollLeft<3;
  $('#next-books').disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-3;
}
function moveShelf(direction){
  const rail=$('#book-grid');const first=$('.book-card',rail);if(!first)return;
  const gap=parseFloat(getComputedStyle(rail).columnGap)||0;
  const step=first.getBoundingClientRect().width+gap;
  const visible=Math.max(1,Math.floor((rail.clientWidth+gap)/step));
  rail.scrollBy({left:direction*step*visible,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}
$('#book-grid').addEventListener('scroll',()=>requestAnimationFrame(updateCarousel),{passive:true});
$('#book-grid').addEventListener('keydown',event=>{
  if(event.target!==event.currentTarget)return;
  if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();moveShelf(event.key==='ArrowRight'?1:-1);}
});
window.addEventListener('resize',()=>requestAnimationFrame(updateCarousel));
const dialog=$('#book-dialog');let activeBook=null;let returnFocus=null;let requestData=null;
function bookHeader(book){return `<div class="dialog-book"><img src="assets/${book.isbn}.jpg" alt="${escapeHTML(book.title)} book cover" width="140" height="210"><div><span class="category">${escapeHTML(book.category.toUpperCase())}</span><h2 id="dialog-title">${escapeHTML(book.title)}</h2><p class="book-author">${escapeHTML(book.author)}</p><span class="pick-badge-static"><span class="avatar ${book.staff.toLowerCase()}" aria-hidden="true">${book.staff[0]}</span> <span class="book-author">${book.staff}’s pick</span></span><p class="dialog-price">${book.format} · $${book.price}</p></div></div>`;}
function showBook(isbn,mode='detail'){
  const book=books.find(item=>item.isbn===isbn);if(!book)throw new Error('Book not found.');
  activeBook=book;requestData=null;dialog.classList.toggle('reservation-dialog',mode==='reserve');
  if(!dialog.open)returnFocus=document.activeElement;
  $('#dialog-content').innerHTML=bookHeader(book)+`<div class="dialog-main" id="dialog-main"></div>`;
  if(mode==='reserve')renderReservation();else{
    $('#dialog-main').innerHTML=`<h3>On ${book.staff}’s shelf</h3><p class="detail-note">${escapeHTML(book.detail)}</p><button class="primary-button full-width" data-reserve="${book.isbn}">${icon('bag')}Reserve for pickup</button><p class="reservation-help" style="margin-top:12px">Request a copy at Lanternfield’s, 21 Market Row, Harrow Bay.</p>`;
  }
  if(!dialog.open)dialog.showModal();
  dialog.scrollTop=0;
}
function renderReservation(){
  $('#dialog-main').innerHTML=`<h3>Reserve for pickup</h3><p>Lanternfield’s will confirm availability and let you know when your book is ready.</p><a class="pickup-address" href="#visit">${icon('pin')}<div><strong>Pick up at Lanternfield Books ↗</strong><span>21 Market Row · Harrow Bay, NH 00351</span></div></a><form id="reservation-form" class="reservation-form"><label>Your name<input name="name" autocomplete="name" required maxlength="100" placeholder="First and last name"></label><label>Your email<input name="email" autocomplete="email" type="email" required maxlength="254" placeholder="you@example.com"></label><label class="phone-field">Phone number <span class="optional-label">(optional)</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="40" placeholder="(603) 555-0123"></label><button class="primary-button" type="submit">${icon('mail')}Prepare reservation email</button><p class="reservation-help">Your email app opens with a request to Lanternfield’s. Send it there to request your copy. Pickup and the final price are confirmed by the store.</p></form><div class="other-options"><a href="#shelf-talkers">Order on the Lanternfield site</a><a href="tel:+16035550174">Prefer to call? (603) 555-0174</a></div>`;
}
function prepareRequest(form){
  if(!form.reportValidity())return;
  const values=new FormData(form);const name=String(values.get('name')||'').trim();const email=String(values.get('email')||'').trim();const phone=String(values.get('phone')||'').trim();
  if(!name){form.elements.name.setCustomValidity('Please enter your name.');form.elements.name.reportValidity();return;}
  const book=activeBook;
  const body=`Hello Lanternfield’s team,\n\nI’d like to request one copy of ${book.title} by ${book.author} for pickup at your Harrow Bay bookstore.\n\nISBN: ${book.isbn}\nFormat: ${book.format}\nShelf Talker: ${book.staff}\n\nName: ${name}\nEmail: ${email}${phone?`\nPhone: ${phone}`:''}\n\nPlease confirm availability, the current price, and when I can collect it.\n\nThank you!\n${name}`;
  const href=`mailto:shelf@lanternfieldbooks.example?subject=${encodeURIComponent('Pickup request: '+book.title)}&body=${encodeURIComponent(body)}`;
  requestData={body,href,phone};
  $('#dialog-main').innerHTML=`<h3>Your request is ready.</h3><p>One last step: send the email to Lanternfield’s. Your copy is reserved only after the bookstore confirms.</p><div class="request-ready"><p>To: <strong>shelf@lanternfieldbooks.example</strong><br>For: ${escapeHTML(name)}<br>${escapeHTML(email)}${phone?`<br>Phone: ${escapeHTML(phone)}`:''}</p><a class="primary-button" id="open-email" href="${escapeHTML(href)}">${icon('mail')}Open my email app</a><div class="request-actions"><button id="copy-request">Copy request instead</button><button id="edit-request">Edit details</button></div><pre class="request-preview" hidden></pre></div><div class="other-options"><a href="#shelf-talkers">Order on the Lanternfield site</a><a href="tel:+16035550174">Call (603) 555-0174</a></div>`;
  requestData.name=name;requestData.email=email;
  $('#open-email').focus();
}
function closeDialog(){dialog.close();}
dialog.addEventListener('close',()=>{if(returnFocus?.isConnected)returnFocus.focus();});
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog();}});
let toastTimer;
function toast(message){const element=$('#toast');element.textContent=message;element.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{element.hidden=true;},4500);}
document.addEventListener('click',async event=>{
  if(event.target.closest('#previous-books')){moveShelf(-1);return;}
  if(event.target.closest('#next-books')){moveShelf(1);return;}
  const reserve=event.target.closest('[data-reserve]');if(reserve){showBook(reserve.dataset.reserve,'reserve');return;}
  const detail=event.target.closest('[data-detail]');if(detail){event.preventDefault();showBook(detail.dataset.detail);return;}
  const staff=event.target.closest('[data-staff]');if(staff){state.staff=staff.dataset.staff;renderBooks();if(staff.classList.contains('pick-badge'))$('#shelf-talkers').scrollIntoView({behavior:'smooth',block:'start'});return;}
  const genre=event.target.closest('[data-genre]');if(genre){state.genre=genre.dataset.genre;renderBooks();return;}
  if(event.target.closest('.dialog-close'))closeDialog();
  if(event.target.closest('#reset-filters')){if(state.view!=='staff')state.staff='all';state.genre='all';state.query='';$('#search').value='';renderBooks();$('#search').focus();}
  if(event.target.closest('.mobile-menu')){const menu=$('#mobile-nav');menu.hidden=!menu.hidden;$('.mobile-menu').setAttribute('aria-expanded',String(!menu.hidden));}
  if(event.target.closest('#mobile-nav a')){$('#mobile-nav').hidden=true;$('.mobile-menu').setAttribute('aria-expanded','false');}
  if(event.target.closest('#edit-request')){const saved=requestData;renderReservation();const form=$('#reservation-form');form.elements.name.value=saved.name;form.elements.email.value=saved.email;form.elements.phone.value=saved.phone;form.elements.name.focus();}
  if(event.target.closest('#copy-request')&&requestData){
    const preview=$('.request-preview');preview.textContent=`To: shelf@lanternfieldbooks.example\nSubject: Pickup request: ${activeBook.title}\n\n${requestData.body}`;preview.hidden=false;
    try{await navigator.clipboard.writeText(preview.textContent);toast('Request copied. Paste it into an email to Lanternfield’s.');}catch{toast('Select and copy the request shown below.');}
  }
});
document.addEventListener('submit',event=>{if(event.target.id==='reservation-form'){event.preventDefault();prepareRequest(event.target);}});
document.addEventListener('input',event=>{if(event.target.id==='search'){state.query=event.target.value;renderBooks();}if(event.target.name==='name')event.target.setCustomValidity('');});
document.addEventListener('change',event=>{if(event.target.id==='profile-staff-select'){location.hash=`shelf-talkers/${event.target.value.toLowerCase()}`;}if(event.target.id==='genre-select'){state.genre=event.target.value;renderBooks();}if(event.target.id==='staff-select'){state.staff=event.target.value;renderBooks();}});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('#mobile-nav').hidden){$('#mobile-nav').hidden=true;$('.mobile-menu').setAttribute('aria-expanded','false');$('.mobile-menu').focus();}});
applyViewRoute();
renderBooks();

// The structured actions use the same filters and reservation dialog as the page.
// Starting a request never sends mail or asserts that a book is reserved.
if(document.modelContext?.registerTool){
  const lifecycle=new AbortController();
  const register=tool=>{
    try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}
  };
  register({
    name:'browse_staff_picks',title:'Browse Lanternfield’s staff picks',
    description:'Filter the visible book collection by Shelf Talker, genre, and optional search text. Omitted filters reset to all books. Returns the matching titles and ISBNs.',
    inputSchema:{type:'object',properties:{staff:{type:'string',enum:['all','Wren','Theo','June']},genre:{type:'string',enum:['all','Gothic & horror','Fantasy','Literary fiction','Graphic novels']},query:{type:'string',maxLength:200}},additionalProperties:false},
    annotations:{readOnlyHint:false,untrustedContentHint:false},
    execute(input){
      if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Expected a filter object.');
      if(Object.keys(input).some(key=>!['staff','genre','query'].includes(key)))throw new Error('Unknown filter.');
      const {staff='all',genre='all',query=''}=input;
      if(!['all','Wren','Theo','June'].includes(staff))throw new Error('Unknown Shelf Talker.');
      if(!['all','Gothic & horror','Fantasy','Literary fiction','Graphic novels'].includes(genre))throw new Error('Unknown genre.');
      if(typeof query!=='string'||query.length>200)throw new Error('Search text must be 200 characters or fewer.');
      Object.assign(state,{view:'reading',staff,genre,query});history.replaceState(null,'','#reading-room');$('#search').value=query;renderBooks();
      return {count:filteredBooks().length,books:filteredBooks().map(({isbn,title,author,staff})=>({isbn,title,author,staff}))};
    }
  });
  register({
    name:'start_pickup_request',title:'Start a Lanternfield’s pickup request',
    description:'Open the reservation form for a book by ISBN. This only starts a draft; it does not send email, reserve stock, or place an order. The visitor must send their email and receive confirmation from Lanternfield’s.',
    inputSchema:{type:'object',properties:{isbn:{type:'string',pattern:'^[0-9]{13}$'}},required:['isbn'],additionalProperties:false},
    annotations:{readOnlyHint:false,untrustedContentHint:false},
    execute(input){
      if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(key=>key!=='isbn'))throw new Error('Expected a book ISBN.');
      if(typeof input.isbn!=='string'||!books.some(book=>book.isbn===input.isbn))throw new Error('Book not found in this collection.');
      showBook(input.isbn,'reserve');return {isbn:activeBook.isbn,title:activeBook.title,status:'draft_not_sent',confirmationRequiredFrom:'Lanternfield Books'};
    }
  });
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
