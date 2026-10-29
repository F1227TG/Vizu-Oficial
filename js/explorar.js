(()=>{
 const categories=[['barbearia','Barbearia','✂','barber-02-corte-de-cabelo','barber','corte'],['cabelo','Cabelo','〰','beauty-02-cabelos','beauty','cabelos'],['unhas','Unhas','◇','beauty-03-unhas','beauty','unhas'],['estetica','Estética','✦','beauty-04-estetica','beauty','estética'],['maquiagem','Maquiagem','◌','beauty-05-maquiagem','beauty','maquiagem'],['bem-estar','Bem-estar','❋','beauty-06-bem-estar','beauty','massagem']];
 const form=document.querySelector('#discover-form'),results=document.querySelector('#results');let selected='';
 const normalize=v=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 document.querySelector('#categories').innerHTML=categories.map(([id,label,icon])=>`<button type="button" data-category="${id}" aria-pressed="false"><span aria-hidden="true">${icon}</span>${label}</button>`).join('');
 function render(){
  const term=normalize(form.elements.query.value.trim()),city=form.elements.city.value.trim();
  const rows=categories.filter(([id,label,,,brand,query])=>(!selected||selected===id)&&(!term||normalize(`${label} ${query} ${brand} ${brand==='barber'?'barba masculino':''} beleza profissional`).includes(term)));
  results.innerHTML=rows.map(([id,label,,image,brand,query])=>{const url=new URL(brand==='barber'?'https://www.barberhuboficial.com.br/html/portal.html':'https://beautyhuboficial.vercel.app/explorar.html');url.searchParams.set(brand==='barber'?'servico':'query',query);if(city)url.searchParams.set(brand==='barber'?'cidade':'location',city);return `<article class="vx-card"><img src="img/marketplace/${image}.webp" alt="Inspiração de ${label.toLowerCase()}" width="1254" height="1254" loading="lazy"><div><span class="vx-demo">Exemplo ilustrativo</span><h3>${label}</h3><p>Descubra profissionais de ${label.toLowerCase()} no ${brand==='barber'?'Barber':'Beauty'} Hub.</p><p>${city?'Pesquisar em '+esc(city):'Escolha sua cidade na plataforma'}</p><a href="${esc(url.href)}">Ver negócios reais ↗</a></div></article>`;}).join('')||'<p class="vx-empty">Nenhum exemplo corresponde à busca. Tente uma especialidade como cabelo, unhas ou barba.</p>';
  document.querySelector('#result-count').textContent=`${rows.length} exemplos de especialidades${selected?' · Categoria selecionada: '+categories.find(c=>c[0]===selected)[1]:''}`;
  document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===selected)));
 }
 form.addEventListener('submit',event=>{event.preventDefault();render();document.querySelector('#resultados').scrollIntoView({block:'start'});});
 document.addEventListener('click',event=>{const b=event.target.closest('[data-category]');if(!b)return;selected=b.dataset.category;form.elements.query.value='';render();document.querySelector('#resultados').scrollIntoView({block:'start'});});
 document.querySelector('#clear-discovery').addEventListener('click',()=>{selected='';form.reset();render();});
 document.querySelector('#choose-city').addEventListener('click',()=>{form.elements.city.focus();form.scrollIntoView({block:'center'});});
 const menu=document.querySelector('.vizu-menu-toggle'),nav=document.querySelector('.vizu-nav');const close=()=>{menu.setAttribute('aria-expanded','false');nav.classList.remove('is-open');};
 menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});nav.addEventListener('click',close);document.addEventListener('keydown',event=>{if(event.key==='Escape'){close();menu.focus();}});
 const motion=document.querySelector('#vx-motion');motion.addEventListener('click',()=>{const paused=document.documentElement.classList.toggle('vx-paused');motion.setAttribute('aria-pressed',String(paused));motion.textContent=paused?'Ativar animações':'Pausar animações';});render();
})();
