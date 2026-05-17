document.addEventListener('DOMContentLoaded', () => {
 const $ = (s, r=document)=>r.querySelector(s);
 const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));
 $$('.nav-link[data-target]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault(); const id=link.dataset.target; if(!id) return; $$('.nav-link').forEach(a=>a.classList.remove('active')); link.classList.add('active'); $$('.view-section').forEach(v=>v.classList.remove('active')); const view=$('#'+id); if(view) view.classList.add('active');}));
 const notif=$('#notifBtn'), drop=$('#notifDropdown'); if(notif&&drop){notif.addEventListener('click',()=>drop.classList.toggle('open')); document.addEventListener('click',e=>{if(!drop.contains(e.target)&&!notif.contains(e.target))drop.classList.remove('open')})}
 if(typeof Chart === 'undefined') return;
 Chart.defaults.color = '#8d9ba8'; Chart.defaults.font.family='Inter, system-ui, sans-serif'; Chart.defaults.plugins.legend.display=false;
 const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim(); const green=cssVar('--accent-green'), blue=cssVar('--accent-blue'), red=cssVar('--accent-red'), orange=cssVar('--accent-orange'), yellow=cssVar('--accent-yellow'), border='rgba(255,255,255,.08)';
 function lineChart(id, data, color=green, fill=true){ const el=$('#'+id); if(!el) return null; return new Chart(el,{type:'line',data:{labels:data.map((_,i)=>i+1),datasets:[{data,borderColor:color,backgroundColor:fill?color+'22':'transparent',fill,pointRadius:0,tension:.42,borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{tooltip:{enabled:false}},scales:{x:{display:false,grid:{display:false}},y:{display:false,grid:{display:false}}}}})}
 function bigLine(id,data,color=green){ const el=$('#'+id); if(!el) return null; return new Chart(el,{type:'line',data:{labels:['00h','04h','08h','12h','16h','20h','24h'],datasets:[{data,borderColor:color,backgroundColor:color+'24',fill:true,pointRadius:3,pointBackgroundColor:color,tension:.42,borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,scales:{x:{grid:{display:false}},y:{grid:{color:border}}}}})}
 function barChart(id,data,color=green){const el=$('#'+id); if(!el) return null; return new Chart(el,{type:'bar',data:{labels:['Jan','Fev','Mar','Abr','Mai','Jun'],datasets:[{data,backgroundColor:color,borderRadius:8}]},options:{responsive:true,maintainAspectRatio:false,scales:{x:{grid:{display:false}},y:{grid:{color:border}}}}})}
 function doughnut(id,val,color=green){const el=$('#'+id); if(!el) return null; return new Chart(el,{type:'doughnut',data:{datasets:[{data:[val,100-val],backgroundColor:[color,'rgba(255,255,255,.08)'],borderWidth:0}]},options:{cutout:'76%',responsive:true,maintainAspectRatio:false}})}
 lineChart('sparkline1',[10,9,12,11,15,13,12],green); lineChart('sparkline2',[160,154,150,148,144,142],blue); lineChart('sparkline3',[12,20,25,31,34,40,45],green); lineChart('carbonImpactChart',[10,20,35,55,84],green);
 bigLine('mainConsumptionChart',[0.8,0.6,1.1,1.4,3.2,1.8,1.0],green); lineChart('sparklineFinance1',[10,14,22,32,45],green); lineChart('sparklineFinance2',[80,85,90,94,94],blue); lineChart('sparklineFinance3',[190,180,165,150,142],orange); lineChart('sparklineFinance4',[120,240,360,520,700,840],green);
 barChart('financeBarChart',[18,25,31,38,40,45],green); bigLine('financeLineChart',[230,215,205,190,185,180],blue); doughnut('roiCircleChart',76,green); doughnut('levelGaugeChart',60,green);
 lineChart('sparklineAmazon1',[20,30,42,54,70,84],green); lineChart('sparklineAmazon2',[1,1.4,1.9,2.3,3.0,3.5],green); lineChart('sparklineAmazon3',[2,3.1,4.2,6.2,7.4,8.4],blue); lineChart('sparklineAmazon4',[4,5.5,6.2,8,10,12.6],orange); bigLine('amazonImpactLineChart',[0,20,14,48,92,72],green); doughnut('amazonMetaChart',76,green);
 const roomCharts={cozinha:lineChart('sparklineRoomCozinha',[1.1,1.4,1.8,2.1,1.7,2.1],red),sala:lineChart('sparklineRoomSala',[.3,.4,.5,.6,.5,.45],orange),quarto:lineChart('sparklineRoomQuarto',[.1,.11,.13,.12,.1,.12],green),escritorio:lineChart('sparklineRoomEscritorio',[.2,.3,.28,.31,.25,.28],blue),banheiro:lineChart('sparklineRoomBanheiro',[.0,1.6,.15,.0,1.3,.0],green)};
 const rooms={
  cozinha:{name:'Cozinha',status:'Pico de consumo detectado',severity:'Crítico',color:red,icon:'fa-utensils',finance:'R$ 2,48 (+32%)',co2:'1,45 kg CO₂',peak:'19h - 21h',top:'Air Fryer (1.8kW)',chart:[900,1200,1600,2100,1800,1300,1700],insight:'Evite usar Air Fryer e Micro-ondas simultaneamente entre 19h e 21h.',devices:[['Air Fryer','1.800 W','R$ 2,48'],['Geladeira','150 W','R$ 0,77'],['Micro-ondas','1.200 W','R$ 0,21'],['Cafeteira','800 W','R$ 0,19'],['Iluminação','48 W','R$ 0,06'],['Tomadas aux.','200 W','R$ 0,17']]},
  sala:{name:'Sala',status:'Fora do padrão',severity:'Médio',color:orange,icon:'fa-couch',finance:'R$ 1,32 (+12%)',co2:'0,62 kg CO₂',peak:'20h - 23h',top:'Ar-condicionado',chart:[200,260,300,450,410,380,420],insight:'Ajuste o ar-condicionado para 23 °C durante o período noturno.',devices:[['Ar-condicionado','1.200 W','R$ 1,10'],['TV','150 W','R$ 0,40'],['Home Theater','80 W','R$ 0,22'],['Iluminação','60 W','R$ 0,08']]},
  quarto:{name:'Quarto',status:'Consumo eficiente',severity:'Normal',color:green,icon:'fa-bed',finance:'R$ 0,38 (-8%)',co2:'0,18 kg CO₂',peak:'22h - 23h',top:'Carregador',chart:[80,90,110,120,100,95,105],insight:'Ambiente eficiente. Mantenha o padrão atual de consumo.',devices:[['Carregador','35 W','R$ 0,05'],['Ventilador','80 W','R$ 0,22'],['Iluminação','20 W','R$ 0,03']]},
  escritorio:{name:'Escritório',status:'Sugestão IA disponível',severity:'Atenção',color:blue,icon:'fa-laptop',finance:'R$ 0,96 (+5%)',co2:'0,34 kg CO₂',peak:'09h - 17h',top:'Computador',chart:[120,180,260,280,260,220,120],insight:'Desligue monitor e periféricos durante pausas longas.',devices:[['Computador','220 W','R$ 0,71'],['Monitor','45 W','R$ 0,16'],['Roteador','18 W','R$ 0,09'],['Luminária','20 W','R$ 0,04']]},
  banheiro:{name:'Banheiro',status:'Uso pontual',severity:'Normal',color:green,icon:'fa-shower',finance:'R$ 0,58 (-4%)',co2:'0,21 kg CO₂',peak:'07h - 08h',top:'Chuveiro',chart:[0,1800,200,0,1600,0,0],insight:'Reduzir o banho em 2 minutos pode economizar R$ 9,00/mês.',devices:[['Chuveiro','5.500 W','R$ 0,52'],['Iluminação','20 W','R$ 0,03'],['Exaustor','40 W','R$ 0,03']]}
 };
 let panelChart=null; function setRoom(id){ const r=rooms[id]; if(!r) return; $$('.room-bento-card').forEach(c=>c.classList.toggle('active',c.dataset.room===id)); $('#panelRoomName').textContent=r.name+' — Detalhes'; const block=$('.panel-kpi-block'); if(block){block.style.borderLeftColor=r.color; block.innerHTML=`<div class="panel-kpi-icon" style="color:${r.color};background:${r.color}1A"><i class="fa-solid ${r.icon}"></i></div><div><div class="text-xs font-bold" style="color:${r.color}">${r.status}</div><div class="text-xs text-muted">${r.severity} • atualizado agora</div></div>`} const rows=$$('.panel-content .d-flex.justify-between.text-xs'); if(rows.length>=4){rows[0].querySelector('span:last-child').textContent=r.finance; rows[0].querySelector('span:last-child').style.color=r.color; rows[1].querySelector('span:last-child').textContent=r.co2; rows[1].querySelector('span:last-child').style.color=r.color; rows[2].querySelector('span:last-child').textContent=r.peak; rows[3].querySelector('span:last-child').textContent=r.top;} const body=$('#panelDeviceTableBody'); if(body){body.innerHTML=r.devices.map(d=>`<tr><td>${d[0]}</td><td>${d[1]}</td><td>${d[2]}</td></tr>`).join('')} const insight=$('#panelRoomInsight'); if(insight) insight.textContent=r.insight; const ctx=$('#panelConsumptionChart'); if(ctx){ if(panelChart) panelChart.destroy(); panelChart=new Chart(ctx,{type:'line',data:{labels:['12h','14h','16h','18h','20h','22h','Agora'],datasets:[{data:r.chart,borderColor:r.color,backgroundColor:r.color+'22',fill:true,pointRadius:2,tension:.38,borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:border}}}}})}}
 
 $$('.room-bento-card[data-room]').forEach(card=>card.addEventListener('click',()=>setRoom(card.dataset.room)));
 const initialRoomWatts={cozinha:2100,sala:450,quarto:120,escritorio:280,banheiro:80};
 Object.keys(rooms).forEach(id=>{ rooms[id].currentW = initialRoomWatts[id] || 0; });
 let selectedRoomId='cozinha';
 const originalSetRoom=setRoom;
 setRoom=function(id){ selectedRoomId=id; originalSetRoom(id); };
 function formatWatts(w){ return (Number(w)||0).toLocaleString('pt-BR')+' W'; }
 function estimateDailyCost(powerW){ return 'R$ '+(((Number(powerW)||0)/1000)*0.92*1.2).toFixed(2).replace('.',','); }
 function refreshRoomCard(roomId, justAdded=false){
   const r=rooms[roomId]; const card=$(`.room-bento-card[data-room="${roomId}"]`); if(!r||!card) return;
   const value=card.querySelector('.room-bento-value'); if(value) value.textContent=formatWatts(r.currentW || 0);
   const meta=card.querySelector('.d-flex.justify-between.text-xs.mb-2 span:last-child');
   if(meta) meta.innerHTML=`<i class="fa-solid fa-plug mr-1"></i> ${r.devices.length} disp.`;
   if(justAdded){ card.classList.remove('device-added'); void card.offsetWidth; card.classList.add('device-added'); }
 }
 function roomLabelOptions(selected){
   return Object.entries(rooms).map(([id,r])=>`<option value="${id}" ${selected===id?'selected':''}>${r.name}</option>`).join('');
 }
 function slugRoomName(name){
   return String(name||'')
     .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
     .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') || 'comodo';
 }
 function uniqueRoomId(base){
   let id=base, i=2;
   while(rooms[id]){ id=`${base}-${i++}`; }
   return id;
 }
 function inferRoomIcon(name){
   const n=String(name||'').toLowerCase();
   if(n.includes('garagem')) return 'fa-car';
   if(n.includes('lavander')) return 'fa-shirt';
   if(n.includes('varanda')||n.includes('jardim')) return 'fa-seedling';
   if(n.includes('banheiro')) return 'fa-shower';
   if(n.includes('quarto')) return 'fa-bed';
   if(n.includes('cozinha')) return 'fa-utensils';
   if(n.includes('sala')) return 'fa-couch';
   if(n.includes('escrit')) return 'fa-laptop';
   return 'fa-house-signal';
 }
 function createRoomCard(roomId, room, justAdded=false){
   const grid=document.querySelector('.rooms-bento-grid'); if(!grid) return;
   if(document.querySelector(`.room-bento-card[data-room="${roomId}"]`)) return;
   const canvasId=`sparklineRoom${roomId.replace(/[^a-zA-Z0-9]/g,'')}`;
   const card=document.createElement('div');
   card.className=`room-bento-card ${justAdded?'room-added':''}`;
   card.dataset.room=roomId;
   card.innerHTML=`
     <div class="room-bento-header">
       <div class="room-bento-icon-box" style="color: ${room.color}; background: ${room.color}1A;"><i class="fa-solid ${room.icon}"></i></div>
       <span class="room-bento-status" style="background: ${room.color}1A; color: ${room.color};">${room.severity || 'Novo'}</span>
     </div>
     <div class="room-bento-name">${room.name}</div>
     <div class="room-bento-value">${formatWatts(room.currentW || 0)}</div>
     <div class="d-flex justify-between text-xs mb-2">
       <span class="text-muted">Eficiência: ${room.efficiency || 82}%</span>
       <span class="text-muted"><i class="fa-solid fa-plug mr-1"></i> ${room.devices.length} disp.</span>
     </div>
     <canvas id="${canvasId}" style="height: 40px; width: 100%;"></canvas>`;
   grid.appendChild(card);
   card.addEventListener('click',()=>setRoom(roomId));
   roomCharts[roomId]=lineChart(canvasId, room.spark || [0,.1,.2,.15,.2,.12], room.color || green);
 }
 function openUtensilModal(){
   const old=document.querySelector('.utensil-modal-backdrop'); if(old) old.remove();
   const back=document.createElement('div');
   back.className='eco-modal-backdrop open utensil-modal-backdrop';
   const selected=selectedRoomId || Object.keys(rooms)[0] || 'cozinha';
   back.innerHTML=`<div class="eco-modal" role="dialog" aria-modal="true" aria-label="Adicionar utensílio">
     <div class="eco-modal-header eco-modal-head">
       <div class="eco-modal-title"><h3 style="margin:0">Adicionar utensílio</h3></div>
       <button type="button" class="eco-modal-close" aria-label="Fechar"><i class="fa-solid fa-xmark"></i></button>
     </div>
     <div class="eco-modal-body">
       <p class="text-muted mb-3">Cadastre um novo utensílio e escolha em qual cômodo ele ficará no Mapa Energético.</p>
       <form id="utensilForm" class="utensil-form">
         <div class="form-row"><label for="utensilName">Nome do utensílio</label><input id="utensilName" name="name" placeholder="Ex: Liquidificador, Notebook, Ventilador" required></div>
         <div class="form-row"><label for="utensilRoom">Cômodo</label><select id="utensilRoom" name="room" required>${roomLabelOptions(selected)}</select></div>
         <div class="form-row"><label for="utensilPower">Potência estimada (W)</label><input id="utensilPower" name="power" type="number" min="1" max="10000" value="120" required><div class="form-help">Use watts. Exemplo: 60 W para lâmpada, 800 W para cafeteira, 1200 W para micro-ondas.</div></div>
         <div class="utensil-modal-actions"><button type="button" class="btn-action utensil-cancel">Cancelar</button><button type="submit" class="btn-action primary"><i class="fa-solid fa-plus"></i> Adicionar</button></div>
       </form>
     </div>
   </div>`;
   document.body.appendChild(back);
   const esc=e=>{ if(e.key==='Escape') close(); };
   const close=()=>{ back.remove(); document.removeEventListener('keydown',esc); };
   back.addEventListener('click',e=>{ if(e.target===back || e.target.closest('.eco-modal-close') || e.target.closest('.utensil-cancel')) close(); });
   document.addEventListener('keydown',esc);
   const form=back.querySelector('#utensilForm');
   form.addEventListener('submit',e=>{
     e.preventDefault();
     const fd=new FormData(form); const name=String(fd.get('name')||'').trim(); const roomId=String(fd.get('room')||Object.keys(rooms)[0]); const power=Math.max(1,Number(fd.get('power')||0));
     if(!name || !rooms[roomId]) return;
     const r=rooms[roomId]; r.devices.push([name, formatWatts(power), estimateDailyCost(power)]); r.currentW=(r.currentW||0)+power;
     r.top = power >= 1000 ? `${name} (${(power/1000).toFixed(1).replace('.',',')}kW)` : r.top;
     refreshRoomCard(roomId,true); setRoom(roomId);
     setTimeout(()=>{ const rows=$$('#panelDeviceTableBody tr'); const last=rows[rows.length-1]; if(last) last.classList.add('new-device-row'); },30);
     if(window.ecoToast) window.ecoToast('Utensílio adicionado', `${name} foi adicionado em ${r.name}.`, 'success');
     close();
   });
   setTimeout(()=>back.querySelector('#utensilName')?.focus(),60);
 }
 function openRoomManagerModal(){
   const old=document.querySelector('.rooms-modal-backdrop'); if(old) old.remove();
   const back=document.createElement('div');
   back.className='eco-modal-backdrop open rooms-modal-backdrop';
   const roomList=()=>Object.entries(rooms).map(([id,r])=>`
     <div class="room-management-item" data-room-row="${id}">
       <div class="room-management-meta">
         <div class="room-management-icon" style="color:${r.color};background:${r.color}1A"><i class="fa-solid ${r.icon}"></i></div>
         <div><div class="room-management-name">${r.name}</div><div class="room-management-sub">${r.devices.length} dispositivos • ${formatWatts(r.currentW || 0)}</div></div>
       </div>
       <button type="button" class="btn-action room-delete-btn" data-delete-room="${id}" title="Remover cômodo"><i class="fa-solid fa-trash"></i></button>
     </div>`).join('');
   back.innerHTML=`<div class="eco-modal" role="dialog" aria-modal="true" aria-label="Gerenciar cômodos">
     <div class="eco-modal-header eco-modal-head">
       <div class="eco-modal-title"><h3 style="margin:0">Gerenciar cômodos</h3></div>
       <button type="button" class="eco-modal-close" aria-label="Fechar"><i class="fa-solid fa-xmark"></i></button>
     </div>
     <div class="eco-modal-body">
       <p class="text-muted mb-3">Adicione novos cômodos ao Mapa Energético ou remova cômodos que não fazem parte do seu ambiente.</p>
       <form id="roomForm" class="utensil-form">
         <div class="form-row"><label for="roomName">Nome do cômodo</label><input id="roomName" name="roomName" placeholder="Ex: Garagem, Lavanderia, Varanda" required></div>
         <div class="form-row"><label for="roomEfficiency">Eficiência inicial (%)</label><input id="roomEfficiency" name="roomEfficiency" type="number" min="1" max="100" value="82" required></div>
         <div class="utensil-modal-actions"><button type="submit" class="btn-action primary"><i class="fa-solid fa-plus"></i> Adicionar cômodo</button></div>
       </form>
       <div class="room-management-list">${roomList()}</div>
     </div>
   </div>`;
   document.body.appendChild(back);
   const esc=e=>{ if(e.key==='Escape') close(); };
   const close=()=>{ back.remove(); document.removeEventListener('keydown',esc); };
   back.addEventListener('click',e=>{
     if(e.target===back || e.target.closest('.eco-modal-close')) close();
     const del=e.target.closest('[data-delete-room]');
     if(del){
       const id=del.dataset.deleteRoom;
       if(Object.keys(rooms).length<=1){ if(window.ecoToast) window.ecoToast('Ação bloqueada','Mantenha pelo menos um cômodo cadastrado.','warning'); return; }
       const removedName=rooms[id]?.name || 'Cômodo';
       delete rooms[id];
       const card=document.querySelector(`.room-bento-card[data-room="${id}"]`); if(card) card.remove();
       if(roomCharts[id]){ try{ roomCharts[id].destroy(); }catch(err){} delete roomCharts[id]; }
       if(selectedRoomId===id){ const next=Object.keys(rooms)[0]; if(next) setRoom(next); }
       const row=back.querySelector(`[data-room-row="${id}"]`); if(row) row.remove();
       if(window.ecoToast) window.ecoToast('Cômodo removido',`${removedName} foi removido do Mapa Energético.`,'success');
     }
   });
   document.addEventListener('keydown',esc);
   back.querySelector('#roomForm').addEventListener('submit',e=>{
     e.preventDefault();
     const fd=new FormData(e.currentTarget);
     const name=String(fd.get('roomName')||'').trim();
     const efficiency=Math.max(1,Math.min(100,Number(fd.get('roomEfficiency')||82)));
     if(!name) return;
     const id=uniqueRoomId(slugRoomName(name));
     rooms[id]={name,status:'Novo ambiente monitorado',severity:'Novo',color:blue,icon:inferRoomIcon(name),finance:'R$ 0,00',co2:'0 kg CO₂',peak:'Sem pico',top:'Sem dispositivos',chart:[0,0,0,0,0,0,0],spark:[0,0,0,0,0,0],insight:'Adicione utensílios para iniciar o monitoramento deste cômodo.',devices:[],currentW:0,efficiency};
     createRoomCard(id,rooms[id],true);
     setRoom(id);
     close();
     if(window.ecoToast) window.ecoToast('Cômodo adicionado',`${name} foi adicionado ao Mapa Energético.`,'success');
   });
   setTimeout(()=>back.querySelector('#roomName')?.focus(),60);
 }
 $$('#addUtensilBtn,#addUtensilPanelBtn').forEach(btn=>btn.addEventListener('click',openUtensilModal));
 $$('#manageRoomsBtn,#manageRoomsPanelBtn').forEach(btn=>btn.addEventListener('click',openRoomManagerModal));
 Object.keys(rooms).forEach(id=>refreshRoomCard(id));
 setRoom('cozinha');
});


// --- Camada extra de interatividade e feedback visual ---
document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  function ensureToastStack(){
    let stack = $('.toast-stack');
    if(!stack){
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      document.body.appendChild(stack);
    }
    return stack;
  }

  window.ecoToast = function(title, message='', type='success'){
    const stack = ensureToastStack();
    const toast = document.createElement('div');
    toast.className = `eco-toast ${type}`;
    toast.innerHTML = `<strong>${title}</strong><span>${message}</span>`;
    stack.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(18px)'; }, 3200);
    setTimeout(() => toast.remove(), 3800);
  };

  function ensureModal(){
    let backdrop = $('.eco-modal-backdrop');
    if(backdrop) return backdrop;
    backdrop = document.createElement('div');
    backdrop.className = 'eco-modal-backdrop';
    backdrop.innerHTML = `
      <div class="eco-modal" role="dialog" aria-modal="true">
        <div class="eco-modal-header">
          <div class="eco-modal-title">EcoWatts</div>
          <button class="eco-modal-close" aria-label="Fechar"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="eco-modal-body"></div>
        <div class="eco-modal-footer">
          <button class="btn-action eco-modal-ok">Fechar</button>
        </div>
      </div>`;
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', (e) => { if(e.target === backdrop) backdrop.classList.remove('open'); });
    $('.eco-modal-close', backdrop).addEventListener('click', () => backdrop.classList.remove('open'));
    $('.eco-modal-ok', backdrop).addEventListener('click', () => backdrop.classList.remove('open'));
    return backdrop;
  }

  window.ecoModal = function(title, html){
    const modal = ensureModal();
    $('.eco-modal-title', modal).textContent = title;
    $('.eco-modal-body', modal).innerHTML = html;
    modal.classList.add('open');
  };

  // Feedback visual ao trocar ambiente no Mapa Energético
  $$('.room-bento-card[data-room]').forEach(card => {
    card.setAttribute('tabindex','0');
    card.setAttribute('role','button');
    card.addEventListener('click', () => {
      const panel = $('.room-analytics-panel');
      if(panel){
        panel.classList.add('is-updating');
        setTimeout(() => panel.classList.remove('is-updating'), 220);
      }
      const roomName = card.querySelector('.room-bento-name')?.textContent || 'Ambiente';
      ecoToast(`${roomName} selecionado`, 'Painel de detalhes atualizado com consumo, dispositivos e recomendação da IA.', 'info');
    });
    card.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });

  // Busca inteligente: no mapa filtra ambientes; nas outras telas destaca/filtra cards da tela atual
  const searchInput = $('.search-input');
  if(searchInput){
    const pill = document.createElement('span');
    pill.className = 'search-count-pill';
    pill.style.display = 'none';
    searchInput.parentElement.appendChild(pill);

    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      const activeView = $('.view-section.active');
      let visible = 0;

      if(!q){
        $$('.room-bento-card').forEach(el => el.classList.remove('room-hidden'));
        $$('.glass-card, .settings-card, .project-item, .impact-card').forEach(el => el.classList.remove('search-hidden','highlight-pulse'));
        pill.style.display = 'none';
        return;
      }

      if(activeView?.id === 'view-map'){
        $$('.room-bento-card[data-room]', activeView).forEach(card => {
          const ok = card.textContent.toLowerCase().includes(q);
          card.classList.toggle('room-hidden', !ok);
          if(ok) visible++;
        });
      } else {
        $$('.glass-card, .settings-card, .project-item, .impact-card', activeView || document).forEach(card => {
          const ok = card.textContent.toLowerCase().includes(q);
          card.classList.toggle('search-hidden', !ok);
          if(ok){ visible++; card.classList.add('highlight-pulse'); setTimeout(()=>card.classList.remove('highlight-pulse'), 900); }
        });
      }
      pill.style.display = 'inline-flex';
      pill.innerHTML = `<i class="fa-solid fa-filter"></i> ${visible} resultado(s)`;
    });
  }

  // Botões do painel do mapa: ação simulada útil para apresentação
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, a.card-link, .integration-item, .project-item, .impact-translated-item, .animal-card');
    if(!btn) return;

    const txt = (btn.textContent || '').trim();
    const activeRoom = ($('#panelRoomName')?.textContent || 'Ambiente').replace('— Detalhes','').trim();

    if(btn.classList.contains('btn-action')){
      if(txt.includes('Aplicar automação')){
        ecoToast('Automação aplicada', `${activeRoom}: ação simulada registrada para reduzir consumo no próximo pico.`, 'success');
      } else if(txt.includes('Ver histórico')){
        ecoModal(`Histórico — ${activeRoom}`, `
          <p class="text-muted">Resumo simulado das últimas medições do ambiente selecionado.</p>
          <div class="modal-grid">
            <div class="modal-metric"><small>Hoje</small><strong>12,4 kWh</strong></div>
            <div class="modal-metric"><small>Semana</small><strong>78,2 kWh</strong></div>
            <div class="modal-metric"><small>Economia</small><strong>R$ 18,60</strong></div>
          </div>
          <p class="text-sm">O comportamento de consumo está concentrado nos horários de maior tarifa. A IA recomenda programar os dispositivos de maior potência fora do intervalo de pico.</p>`);
      } else if(txt.includes('Programar economia')){
        ecoModal(`Programar economia — ${activeRoom}`, `
          <p class="text-muted">Configuração simulada para apresentação.</p>
          <div class="modal-grid">
            <div class="modal-metric"><small>Horário sugerido</small><strong>18h-21h</strong></div>
            <div class="modal-metric"><small>Meta</small><strong>-15%</strong></div>
            <div class="modal-metric"><small>Economia/mês</small><strong>R$ 31,80</strong></div>
          </div>
          <p class="text-sm">A rotina pode reduzir picos automaticamente e enviar alerta quando houver consumo fora do padrão.</p>`);
      }
    }

    if(btn.classList.contains('btn-premium') && txt.includes('Certificado')){
      ecoModal('Certificado de Impacto EcoWatts', `
        <p class="text-muted">Documento demonstrativo para apresentação acadêmica.</p>
        <div class="modal-grid">
          <div class="modal-metric"><small>CO₂ evitado</small><strong>84,2 kg</strong></div>
          <div class="modal-metric"><small>Árvores equivalentes</small><strong>3,5</strong></div>
          <div class="modal-metric"><small>Água preservada</small><strong>8.450 L</strong></div>
        </div>
        <p class="text-sm">Este certificado traduz a economia energética em impacto ambiental compreensível.</p>`);
    }

    if(btn.classList.contains('btn-premium-outline') && txt.includes('Compartilhar')){
      ecoToast('Link preparado', 'Resumo de impacto copiado/simulado para compartilhamento com o grupo.', 'info');
    }

    if(btn.classList.contains('btn-save')){
      ecoToast('Preferências salvas', 'Alterações registradas localmente para a demonstração.', 'success');
    }

    if(btn.classList.contains('btn-settings')){
      ecoModal('Configuração simulada', '<p class="text-muted">Nesta versão de demonstração, esta ação abre um painel explicativo. Na versão com backend, aqui seriam exibidos formulários reais.</p>');
    }
  });

  // Tema claro/escuro na tela de configurações
  const prefCard = Array.from(document.querySelectorAll('.settings-card')).find(card => card.textContent.includes('Preferências'));
  if(prefCard){
    const themeControl = Array.from(prefCard.querySelectorAll('.status-badge')).find(el => el.textContent.includes('Tema escuro'));
    if(themeControl){
      themeControl.addEventListener('click', () => {
        document.body.classList.toggle('theme-light');
        const isLight = document.body.classList.contains('theme-light');
        themeControl.innerHTML = isLight
          ? '<span style="background:var(--accent-green); color:black; padding:2px 8px; border-radius:4px;"><i class="fa-solid fa-sun"></i> Tema claro</span><span style="padding:2px 8px;"><i class="fa-solid fa-moon"></i> Tema escuro</span>'
          : '<span style="background:var(--accent-green); color:black; padding:2px 8px; border-radius:4px;"><i class="fa-solid fa-moon"></i> Tema escuro</span><span style="padding:2px 8px;"><i class="fa-solid fa-sun"></i> Tema claro</span>';
        ecoToast('Tema atualizado', isLight ? 'Tema claro aplicado.' : 'Tema escuro aplicado.', 'info');
        setTimeout(() => window.dispatchEvent(new Event('resize')), 80);
      });
    }
  }

  // Toggles com feedback
  $$('.toggle-switch input').forEach(toggle => {
    toggle.addEventListener('change', () => {
      const label = toggle.closest('.settings-item')?.querySelector('.font-bold')?.textContent || 'Preferência';
      ecoToast(label, toggle.checked ? 'Ativado.' : 'Desativado.', toggle.checked ? 'success' : 'warn');
    });
  });

  // Ajuda rápida no ícone de interrogação
  const helpBtn = Array.from($$('.notif-btn')).find(btn => btn.title === 'Ajuda');
  if(helpBtn){
    helpBtn.addEventListener('click', () => ecoModal('Como usar o EcoWatts', `
      <p class="text-muted">Navegue pela sidebar para alternar entre Central de Comando, Mapa Energético, Eco Pontos, Finanças, Modo Amazônia e Configurações.</p>
      <div class="modal-grid">
        <div class="modal-metric"><small>Mapa</small><strong>Clique nos cômodos</strong></div>
        <div class="modal-metric"><small>IA</small><strong>Veja recomendações</strong></div>
        <div class="modal-metric"><small>Impacto</small><strong>Acompanhe CO₂</strong></div>
      </div>`));
  }

  ecoToast('EcoWatts carregado', 'Arquivos corrigidos e interações ativadas.', 'success');
});



// =====================================================
// PATCH FINAL ECOWATTS - interatividade extra e correções
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  function ensureToastWrap(){
    let wrap=$('.eco-toast-wrap');
    if(!wrap){ wrap=document.createElement('div'); wrap.className='eco-toast-wrap'; document.body.appendChild(wrap); }
    return wrap;
  }
  window.ecoToast = window.ecoToast || function(title,msg,type='success'){
    const wrap=ensureToastWrap();
    const toast=document.createElement('div');
    toast.className='eco-toast '+(type==='warn'?'warn':type==='error'?'error':'');
    toast.innerHTML=`<strong>${title}</strong><p>${msg}</p>`;
    wrap.appendChild(toast);
    setTimeout(()=>{ toast.style.opacity='0'; toast.style.transform='translateY(8px)'; setTimeout(()=>toast.remove(),250); },3200);
  };
  window.ecoModal = window.ecoModal || function(title,body){
    const old=$('.eco-modal-backdrop'); if(old) old.remove();
    const back=document.createElement('div');
    back.className='eco-modal-backdrop';
    back.innerHTML=`<div class="eco-modal" role="dialog" aria-modal="true"><div class="eco-modal-head"><h3>${title}</h3><button class="eco-modal-close"><i class="fa-solid fa-xmark"></i></button></div><div class="eco-modal-body">${body}</div></div>`;
    document.body.appendChild(back);
    back.addEventListener('click',e=>{ if(e.target===back || e.target.closest('.eco-modal-close')) back.remove(); });
  };

  // Busca: filtra cards visíveis da tela atual
  const search=$('.search-input');
  if(search && !search.dataset.patchBound){
    search.dataset.patchBound='1';
    search.addEventListener('input',()=>{
      const q=search.value.trim().toLowerCase();
      const active=$('.view-section.active');
      if(!active) return;
      const cards=$$('.glass-card,.room-bento-card,.amazon-metric-card,.project-item,.settings-card', active);
      cards.forEach(card=>{
        if(!q){ card.style.display=''; return; }
        card.style.display=card.textContent.toLowerCase().includes(q)?'':'none';
      });
    });
  }

  // Finance simulator
  const range=$('#financeSimRange');
  if(range && !range.dataset.patchBound){
    range.dataset.patchBound='1';
    const upd=()=>{
      const pct=Number(range.value);
      const base=138;
      const monthly=base*(pct/100);
      $('#financeSimPercent').textContent=pct+'%';
      $('#financeSimMonthly').textContent='R$ '+monthly.toFixed(2).replace('.',',');
      $('#financeSimYearly').textContent='R$ '+(monthly*12).toFixed(2).replace('.',',');
      $('#financeSimCarbon').textContent=Math.round(pct*2.4)+' kg';
    };
    range.addEventListener('input',upd); upd();
  }

  // Amazon chart tabs (destrói/recria gráfico para evitar bug visual)
  const amazonCanvas=$('#amazonImpactLineChart');
  let amazonChart = null;
  const amazonDatasets={
    geral:{label:'Impacto geral',data:[12,28,34,56,83,76],color:'#00e599',unit:'pts'},
    carbono:{label:'CO₂ evitado (kg)',data:[15,28,36,52,76,84.2],color:'#00e599',unit:'kg'},
    agua:{label:'Água preservada (L)',data:[2100,3400,4200,5900,7100,8450],color:'#00a3ff',unit:'L'}
  };
  function renderAmazonChart(type='geral'){
    if(!amazonCanvas || !window.Chart) return;
    const d=amazonDatasets[type]||amazonDatasets.geral;
    if(amazonChart) amazonChart.destroy();
    const ctx=amazonCanvas.getContext('2d');
    const grad=ctx.createLinearGradient(0,0,0,260);
    grad.addColorStop(0, d.color+'44'); grad.addColorStop(1, d.color+'00');
    amazonChart=new Chart(ctx,{type:'line',data:{labels:['Jan','Fev','Mar','Abr','Mai','Jun'],datasets:[{label:d.label,data:d.data,borderColor:d.color,backgroundColor:grad,fill:true,tension:.42,borderWidth:3,pointRadius:4,pointBackgroundColor:d.color}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{beginAtZero:true,border:{dash:[5,5]}}}}});
  }
  if(amazonCanvas){
    renderAmazonChart('geral');
    $$('.amazon-tab').forEach(btn=>btn.addEventListener('click',()=>{
      $$('.amazon-tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      renderAmazonChart(btn.dataset.amazonChart);
    }));
  }

  // Amazon metric cards select chart context
  $$('.amazon-metric-card').forEach(card=>{
    card.addEventListener('click',()=>{
      $$('.amazon-metric-card').forEach(c=>c.classList.remove('active'));
      card.classList.add('active');
      const type=card.dataset.impact==='agua'?'agua':'carbono';
      const tab=$(`.amazon-tab[data-amazon-chart="${type}"]`);
      if(tab) tab.click();
      ecoToast('Métrica selecionada', card.querySelector('small')?.textContent || 'Impacto atualizado', 'info');
    });
  });

  // Projetos e ações do modo Amazônia
  $$('.project-button').forEach(btn=>{
    btn.addEventListener('click',()=> ecoModal(btn.dataset.project || 'Projeto apoiado', `
      <p class="text-muted">Este painel detalha como a economia energética pode ser conectada a iniciativas ambientais do projeto EcoWatts.</p>
      <div class="modal-grid">
        <div class="modal-metric"><small>Contribuição</small><strong>${btn.textContent.includes('42%')?'42%':btn.textContent.includes('15%')?'15%':'28%'}</strong></div>
        <div class="modal-metric"><small>Tipo</small><strong>ESG</strong></div>
        <div class="modal-metric"><small>Status</small><strong>Ativo</strong></div>
      </div>`));
  });
  $$('.amazon-action').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const title=btn.querySelector('strong')?.textContent || 'Ação recomendada';
      ecoModal(title, `
        <p class="text-muted">Ação simulada para a apresentação do EcoWatts. Em uma versão real, essa ação seria integrada a dispositivos inteligentes ou automações IoT.</p>
        <div class="modal-grid">
          <div class="modal-metric"><small>Economia prevista</small><strong>R$ 18,60/mês</strong></div>
          <div class="modal-metric"><small>CO₂ evitado</small><strong>1,2 kg/mês</strong></div>
          <div class="modal-metric"><small>Prioridade</small><strong>Alta</strong></div>
        </div>
        <button class="btn-action primary" onclick="ecoToast('Ação aplicada','Automação simulada ativada com sucesso.','success')">Aplicar agora</button>`);
    });
  });

  // Botão de insight principal
  const cmdBtn=$('.command-apply-btn');
  if(cmdBtn && !cmdBtn.dataset.patchBound){
    cmdBtn.dataset.patchBound='1';
    cmdBtn.addEventListener('click',()=> ecoModal('Sugestão aplicada', `
      <p class="text-muted">A EcoWatts simulou uma automação para reduzir o consumo da cozinha no horário de pico.</p>
      <div class="modal-grid">
        <div class="modal-metric"><small>Economia/mês</small><strong>R$ 18,60</strong></div>
        <div class="modal-metric"><small>Pico reduzido</small><strong>-32%</strong></div>
        <div class="modal-metric"><small>CO₂ evitado</small><strong>1,2 kg</strong></div>
      </div>`));
  }

  // Melhor feedback em botões premium, salvar e ações genéricas
  document.body.addEventListener('click',(e)=>{
    const btn=e.target.closest('button,a.card-link');
    if(!btn) return;
    const txt=(btn.textContent||'').trim();
    if(btn.classList.contains('btn-premium') && txt.includes('Certificado')){
      ecoModal('Certificado de Impacto EcoWatts', `<p class="text-muted">Documento demonstrativo para apresentação acadêmica.</p><div class="modal-grid"><div class="modal-metric"><small>CO₂ evitado</small><strong>84,2 kg</strong></div><div class="modal-metric"><small>Árvores equivalentes</small><strong>3,5</strong></div><div class="modal-metric"><small>Água preservada</small><strong>8.450 L</strong></div></div>`);
    }
    if(btn.classList.contains('btn-premium-outline') && txt.includes('Compartilhar')) ecoToast('Compartilhamento preparado','Resumo de impacto simulado para envio ao grupo.','success');
  });

  // Re-render charts ao trocar de tela para evitar medidas quebradas
  $$('.nav-link[data-target]').forEach(link=>link.addEventListener('click',()=>{
    setTimeout(()=>{ window.dispatchEvent(new Event('resize')); if(link.dataset.target==='view-amazon') renderAmazonChart($('.amazon-tab.active')?.dataset.amazonChart || 'geral'); },120);
  }));
});


// =====================================================
// PATCH V3 - correções solicitadas pelo usuário
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const green = cssVar('--accent-green') || '#00e599';
  const blue = cssVar('--accent-blue') || '#00a3ff';
  const red = cssVar('--accent-red') || '#ff453a';
  const orange = cssVar('--accent-orange') || '#ff9500';
  const border = 'rgba(255,255,255,.08)';

  // Modal único, seguro e sempre fechável: X, botão Fechar, overlay e ESC.
  let activeModal = null;
  function closeEcoModal(){
    if(activeModal){
      activeModal.classList.remove('open');
      setTimeout(() => { if(activeModal){ activeModal.remove(); activeModal = null; } }, 120);
    }
    document.removeEventListener('keydown', onModalEsc);
  }
  function onModalEsc(e){ if(e.key === 'Escape') closeEcoModal(); }
  window.closeEcoModal = closeEcoModal;
  window.ecoModal = function(title, body){
    if(activeModal) activeModal.remove();
    const back = document.createElement('div');
    back.className = 'eco-modal-backdrop open';
    back.innerHTML = `
      <div class="eco-modal" role="dialog" aria-modal="true" aria-label="${String(title).replace(/"/g,'')}">
        <div class="eco-modal-header eco-modal-head">
          <div class="eco-modal-title"><h3 style="margin:0">${title}</h3></div>
          <button type="button" class="eco-modal-close" aria-label="Fechar"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="eco-modal-body">${body}</div>
        <div class="eco-modal-footer">
          <button type="button" class="btn-action eco-modal-ok">Fechar</button>
        </div>
      </div>`;
    document.body.appendChild(back);
    activeModal = back;
    back.addEventListener('click', (e) => {
      if(e.target === back || e.target.closest('.eco-modal-close') || e.target.closest('.eco-modal-ok')) closeEcoModal();
    });
    document.addEventListener('keydown', onModalEsc);
    const closeBtn = back.querySelector('.eco-modal-close');
    if(closeBtn) closeBtn.focus({preventScroll:true});
  };

  function getChartById(id){
    const canvas = document.getElementById(id);
    if(!canvas || !window.Chart) return null;
    return Chart.getChart(canvas) || null;
  }
  function destroyChart(id){ const chart = getChartById(id); if(chart) chart.destroy(); }
  function renderLineChart(id, labels, data, color, opts={}){
    const canvas = document.getElementById(id);
    if(!canvas || !window.Chart) return null;
    destroyChart(id);
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.clientHeight || 280);
    gradient.addColorStop(0, color + '44');
    gradient.addColorStop(1, color + '00');
    return new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: [{
        label: opts.label || 'Dados',
        data,
        borderColor: color,
        backgroundColor: gradient,
        fill: true,
        tension: opts.tension ?? .42,
        borderWidth: opts.borderWidth || 3,
        pointRadius: opts.pointRadius ?? 4,
        pointBackgroundColor: color,
        pointHoverRadius: 6
      }]},
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 520, easing: 'easeOutQuart' },
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: !!opts.beginAtZero, grid: { color: border } }
        }
      }
    });
  }
  function activateButtonGroup(buttons, active){
    buttons.forEach(btn => btn.classList.toggle('active', btn === active));
  }
  function pulseCardFromCanvas(id){
    const canvas = document.getElementById(id);
    const card = canvas?.closest('.glass-card');
    if(card){ card.classList.remove('is-switching'); void card.offsetWidth; card.classList.add('is-switching'); }
  }

  // 1H / 24H / 7D / 30D do Consumo em Tempo Real.
  const consumptionDatasets = {
    '1h': {
      labels: ['-60m','-50m','-40m','-30m','-20m','-10m','Agora'],
      data: [0.72,0.76,0.81,0.95,1.18,1.06,1.24],
      context: 'Visualizando a última 1 hora • variação suave, sem pico crítico.'
    },
    '24h': {
      labels: ['00h','04h','08h','12h','16h','20h','24h'],
      data: [0.8,0.6,1.1,1.4,3.2,1.8,1.0],
      context: 'Visualizando consumo das últimas 24 horas • pico registrado às 16h.'
    },
    '7d': {
      labels: ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],
      data: [10.8,11.5,12.4,9.8,13.2,15.1,10.6],
      context: 'Visualizando consumo dos últimos 7 dias • sábado teve maior gasto.'
    },
    '30d': {
      labels: ['Sem 1','Sem 2','Sem 3','Sem 4','Atual'],
      data: [78,84,72,91,64],
      context: 'Visualizando consumo mensal por semana • tendência de queda na semana atual.'
    }
  };
  const consumptionButtons = $$('[data-consumption-period]');
  consumptionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      activateButtonGroup(consumptionButtons, btn);
      const d = consumptionDatasets[btn.dataset.consumptionPeriod] || consumptionDatasets['24h'];
      renderLineChart('mainConsumptionChart', d.labels, d.data, green, { label: 'Consumo', beginAtZero: true });
      const ctx = $('#mainConsumptionContext');
      if(ctx) ctx.textContent = d.context;
      pulseCardFromCanvas('mainConsumptionChart');
    });
  });

  // Diário / Semanal / Mensal do gráfico Financeiro Consumo Real vs Meta.
  const financeDatasets = {
    diario: {
      labels: ['00h','04h','08h','12h','16h','20h','24h'],
      data: [7.8,7.2,6.1,5.4,4.8,4.2,3.9],
      context: 'Comparando o consumo de hoje com a meta diária.'
    },
    semanal: {
      labels: ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],
      data: [32,29,28,26,24,22,21],
      context: 'Comparando a semana atual com a meta semanal.'
    },
    mensal: {
      labels: ['Sem 1','Sem 2','Sem 3','Sem 4','Atual'],
      data: [230,215,205,190,180],
      context: 'Comparando o mês atual com a meta mensal.'
    }
  };
  const financeButtons = $$('[data-finance-period]');
  financeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      activateButtonGroup(financeButtons, btn);
      const d = financeDatasets[btn.dataset.financePeriod] || financeDatasets.mensal;
      renderLineChart('financeLineChart', d.labels, d.data, blue, { label: 'Consumo Real vs Meta', beginAtZero: false });
      const ctx = $('#financeLineContext');
      if(ctx) ctx.textContent = d.context;
      pulseCardFromCanvas('financeLineChart');
    });
  });

  // Geral / Carbono / Água do Modo Amazônia + cards inferiores.
  const amazonDatasetsV3 = {
    geral: {
      label: 'Impacto geral', color: green, labels: ['00h','04h','08h','12h','16h','20h','24h'], data: [0,20,14,48,92,72,0],
      summary: [
        ['fa-globe','Impacto vitalício','472,8 kg CO₂e evitados'],
        ['fa-car','Equivalência','2.164 km não rodados'],
        ['fa-bolt','Energia otimizada','371 kWh economizados']
      ]
    },
    carbono: {
      label: 'CO₂ evitado (kg)', color: green, labels: ['Jan','Fev','Mar','Abr','Mai','Jun'], data: [15,28,36,52,76,84.2],
      summary: [
        ['fa-cloud','CO₂ evitado','84,2 kg este mês'],
        ['fa-tree','Árvores equivalentes','3,5 árvores preservadas'],
        ['fa-leaf','Emissões reduzidas','18,5% vs. mês anterior']
      ]
    },
    agua: {
      label: 'Água preservada (L)', color: blue, labels: ['Jan','Fev','Mar','Abr','Mai','Jun'], data: [2100,3400,4200,5900,7100,8450],
      summary: [
        ['fa-droplet','Litros preservados','8.450 L estimados'],
        ['fa-shower','Equivalência','84 banhos economizados'],
        ['fa-recycle','Desperdício hídrico','16,8% de redução']
      ]
    }
  };
  function updateAmazonSummary(type){
    const strip = $('#amazonImpactSummary') || $('.amazon-equivalence-strip');
    const d = amazonDatasetsV3[type] || amazonDatasetsV3.geral;
    if(!strip) return;
    strip.innerHTML = d.summary.map(item => `<div><i class="fa-solid ${item[0]}"></i><small>${item[1]}</small><strong>${item[2]}</strong></div>`).join('');
  }
  function renderAmazonV3(type='geral'){
    const d = amazonDatasetsV3[type] || amazonDatasetsV3.geral;
    renderLineChart('amazonImpactLineChart', d.labels, d.data, d.color, { label: d.label, beginAtZero: true });
    updateAmazonSummary(type);
    pulseCardFromCanvas('amazonImpactLineChart');
  }
  const amazonTabs = $$('.amazon-tab[data-amazon-chart]');
  amazonTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      activateButtonGroup(amazonTabs, btn);
      renderAmazonV3(btn.dataset.amazonChart || 'geral');
    });
  });

  // Modal expansível de desafios em Eco Pontos.
  const challenges = [
    {name:'Coruja Consciente', desc:'Reduza 20% do consumo entre 18h e 22h.', progress:62, reward:'+150 pts', time:'Hoje', diff:'Médio', status:'ativo', impact:'-1,8 kWh / R$ 1,65'},
    {name:'Geladeira Eficiente', desc:'Mantenha a geladeira em consumo estável por 7 dias.', progress:40, reward:'+120 pts', time:'4 dias', diff:'Fácil', status:'ativo', impact:'-0,9 kWh'},
    {name:'Semana Verde', desc:'Fique abaixo da meta semanal de consumo.', progress:74, reward:'+250 pts', time:'5 dias', diff:'Médio', status:'ativo', impact:'-8,0 kWh'},
    {name:'Standby Zero', desc:'Desligue aparelhos em standby por 3 dias.', progress:100, reward:'+90 pts', time:'Concluído', diff:'Fácil', status:'concluido', impact:'R$ 4,20'},
    {name:'Pico Controlado', desc:'Evite picos acima de 2 kW no horário de maior tarifa.', progress:35, reward:'+180 pts', time:'2 dias', diff:'Difícil', status:'ativo', impact:'-32% pico'},
    {name:'Modo Amazônia', desc:'Alcance 100 kg de CO₂ evitado no mês.', progress:76, reward:'+300 pts', time:'12 dias', diff:'Médio', status:'ativo', impact:'100 kg CO₂'},
    {name:'Casa Inteligente', desc:'Aplique 3 automações recomendadas pela IA.', progress:33, reward:'+200 pts', time:'7 dias', diff:'Médio', status:'ativo', impact:'R$ 18,60/mês'},
    {name:'Guardião Amazônico', desc:'Desbloqueie ao atingir o nível Árvore.', progress:0, reward:'+500 pts', time:'Bloqueado', diff:'Especial', status:'bloqueado', impact:'Meta avançada'}
  ];
  function challengeCard(c){
    return `<article class="challenge-card" data-status="${c.status}">
      <div class="challenge-topline"><div class="challenge-name">${c.name}</div><span class="challenge-status ${c.status}">${c.status}</span></div>
      <div class="challenge-desc">${c.desc}</div>
      <div class="progress-container" style="height:6px"><div class="progress-fill" style="width:${c.progress}%"></div></div>
      <div class="challenge-meta">
        <span>Progresso<strong>${c.progress}%</strong></span>
        <span>Recompensa<strong>${c.reward}</strong></span>
        <span>Tempo<strong>${c.time}</strong></span>
        <span>Impacto<strong>${c.impact}</strong></span>
      </div>
      <div class="challenge-actions">
        <button type="button" class="btn-action primary challenge-start" ${c.status==='bloqueado'?'disabled style="opacity:.45;cursor:not-allowed"':''}>${c.status==='ativo'?'Iniciar/acompanhar':c.status==='concluido'?'Ver conquista':'Bloqueado'}</button>
        <button type="button" class="btn-action challenge-detail">Detalhes</button>
      </div>
    </article>`;
  }
  function openChallenges(){
    const body = `
      <p class="text-muted">Veja todos os desafios EcoWatts. Filtre por status e acompanhe recompensa, progresso e impacto estimado.</p>
      <div class="challenge-filters">
        <button type="button" class="challenge-filter active" data-filter="todos">Todos</button>
        <button type="button" class="challenge-filter" data-filter="ativo">Ativos</button>
        <button type="button" class="challenge-filter" data-filter="concluido">Concluídos</button>
        <button type="button" class="challenge-filter" data-filter="bloqueado">Bloqueados</button>
      </div>
      <div class="challenge-modal-grid">${challenges.map(challengeCard).join('')}</div>`;
    window.ecoModal('Todos os desafios EcoWatts', body);
  }
  const challengeLink = $('.challenges-open-link') || Array.from($$('a.card-link')).find(a => a.textContent.includes('Ver todos os desafios'));
  if(challengeLink){
    challengeLink.addEventListener('click', e => { e.preventDefault(); openChallenges(); });
  }
  document.body.addEventListener('click', e => {
    const filter = e.target.closest('.challenge-filter');
    if(filter){
      const modal = filter.closest('.eco-modal');
      modal.querySelectorAll('.challenge-filter').forEach(btn => btn.classList.remove('active'));
      filter.classList.add('active');
      const f = filter.dataset.filter;
      modal.querySelectorAll('.challenge-card').forEach(card => card.classList.toggle('challenge-hidden', f !== 'todos' && card.dataset.status !== f));
      return;
    }
    const start = e.target.closest('.challenge-start');
    if(start && !start.disabled){
      const card = start.closest('.challenge-card');
      const name = card?.querySelector('.challenge-name')?.textContent || 'Desafio';
      if(window.ecoToast) window.ecoToast('Desafio selecionado', `${name}: acompanhamento iniciado.`, 'success');
      return;
    }
    const detail = e.target.closest('.challenge-detail');
    if(detail){
      const card = detail.closest('.challenge-card');
      const name = card?.querySelector('.challenge-name')?.textContent || 'Desafio';
      if(window.ecoToast) window.ecoToast(name, 'Detalhes do desafio exibidos no painel.', 'info');
    }
  });

  // Re-render inicial dos gráficos que têm controles, destruindo instâncias antigas para evitar canvas duplicado.
  setTimeout(() => {
    const activeConsumption = $('[data-consumption-period].active') || $('[data-consumption-period="24h"]');
    if(activeConsumption) activeConsumption.click();
    const activeFinance = $('[data-finance-period].active') || $('[data-finance-period="mensal"]');
    if(activeFinance) activeFinance.click();
    const activeAmazon = $('.amazon-tab.active') || $('.amazon-tab[data-amazon-chart="geral"]');
    if(activeAmazon) activeAmazon.click();
  }, 80);
});


// --- V6: MAPA DA CASA COM 4 SENSORES PADRÃO + VISOR ESP32 ---
document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  if (!$('#sensorCardsGrid')) return;

  const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const green = cssVar('--accent-green') || '#00E599';
  const blue = cssVar('--accent-blue') || '#00A3FF';
  const red = cssVar('--accent-red') || '#FF453A';
  const orange = cssVar('--accent-orange') || '#FF9500';
  const border = 'rgba(255,255,255,.08)';
  const sensorStorageKey = 'ecowatts-residential-sensors-v7';
  const iconChoices = [
    { icon:'fa-utensils', label:'Cozinha', color:red },
    { icon:'fa-couch', label:'Sala', color:orange },
    { icon:'fa-bed', label:'Quarto', color:green },
    { icon:'fa-bath', label:'Banheiro', color:blue },
    { icon:'fa-desktop', label:'Escritório', color:blue },
    { icon:'fa-shirt', label:'Lavanderia', color:green },
    { icon:'fa-car', label:'Garagem', color:orange },
    { icon:'fa-lightbulb', label:'Iluminação', color:orange },
    { icon:'fa-plug', label:'Tomadas', color:green },
    { icon:'fa-bolt', label:'Energia', color:green },
    { icon:'fa-snowflake', label:'Ar-condicionado', color:blue },
    { icon:'fa-wind', label:'Ventilação', color:blue },
    { icon:'fa-tv', label:'TV', color:blue },
    { icon:'fa-microchip', label:'Sensor', color:green },
    { icon:'fa-kitchen-set', label:'Eletrodomésticos', color:red },
    { icon:'fa-fan', label:'Ventilador', color:blue }
  ];

  function escapeHtml(value){
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }
  function findIconChoice(icon){ return iconChoices.find(item => item.icon === icon) || iconChoices[0]; }
  function saveSensors(){
    try { localStorage.setItem(sensorStorageKey, JSON.stringify(sensors)); } catch(e) {}
  }
  function loadSensors(defaultSensors){
    try {
      const stored = JSON.parse(localStorage.getItem(sensorStorageKey) || 'null');
      if (Array.isArray(stored) && stored.length === 4) return stored;
    } catch(e) {}
    return JSON.parse(JSON.stringify(defaultSensors));
  }

  const defaultSensors = [
    { id:'sensor-1', label:'Sensor da Cozinha', room:'Cozinha', status:'online', watts:2100, voltage:127, color:red, icon:'fa-utensils', tip:'Evite usar Air Fryer e Micro-ondas juntos no horário de pico.', appliances:[
      {name:'Air Fryer', type:'Cozinha', watts:1800}, {name:'Geladeira', type:'Cozinha', watts:150}, {name:'Micro-ondas', type:'Cozinha', watts:1200}
    ], history:[900,1200,1500,2100,1900,1700,2100] },
    { id:'sensor-2', label:'Sensor da Sala', room:'Sala', status:'online', watts:450, voltage:127, color:orange, icon:'fa-couch', tip:'Ajuste o ar-condicionado para 23 °C para reduzir a conta sem perder conforto.', appliances:[
      {name:'TV', type:'Entretenimento', watts:150}, {name:'Ar-condicionado', type:'Climatização', watts:1200}, {name:'Iluminação', type:'Luz', watts:60}
    ], history:[240,310,380,450,430,390,450] },
    { id:'sensor-3', label:'Sensor do Quarto', room:'Quarto', status:'online', watts:120, voltage:127, color:green, icon:'fa-bed', tip:'Consumo normal. Tire carregadores da tomada quando não estiverem em uso.', appliances:[
      {name:'Ventilador', type:'Climatização', watts:80}, {name:'Carregador', type:'Tomada', watts:35}
    ], history:[80,90,100,120,110,95,120] },
    { id:'sensor-4', label:'Sensor Livre', room:'Área de serviço', status:'online', watts:280, voltage:127, color:blue, icon:'fa-plug-circle-bolt', tip:'Cadastre os aparelhos conectados para entender melhor este ponto da casa.', appliances:[
      {name:'Máquina de lavar', type:'Lavanderia', watts:500}
    ], history:[60,120,180,280,210,160,280] }
  ];

  let sensors = loadSensors(defaultSensors);
  let selectedSensorId = sensors[0].id;
  let sensorDetailChart = null;

  function formatWatts(w){ return `${Math.round(Number(w)||0).toLocaleString('pt-BR')} W`; }
  function formatAmp(w, v=127){ return `${((Number(w)||0)/(Number(v)||127)).toFixed(1).replace('.',',')} A`; }
  function applianceCountText(n){ return n === 1 ? '1 aparelho' : `${n} aparelhos`; }
  function getSelected(){ return sensors.find(s => s.id === selectedSensorId) || sensors[0]; }
  function toast(title, msg='', type='success'){
    if (window.ecoToast) window.ecoToast(title, msg, type);
  }

  function renderCards(){
    const grid = $('#sensorCardsGrid');
    grid.innerHTML = sensors.map(sensor => `
      <article class="sensor-card ${sensor.status === 'offline' ? 'offline' : ''} ${sensor.id === selectedSensorId ? 'active' : ''}" data-sensor-id="${sensor.id}" style="--sensor-glow:${sensor.color}18">
        <div class="sensor-card-header">
          <div class="sensor-icon-box" style="color:${sensor.color}; background:${sensor.color}1A"><i class="fa-solid ${sensor.icon}"></i></div>
          <span class="sensor-status-pill ${sensor.status}"><i class="fa-solid fa-circle"></i>${sensor.status === 'online' ? 'Online' : 'Offline'}</span>
        </div>
        <div class="sensor-card-name">${escapeHtml(sensor.label)}</div>
        <div class="sensor-card-room"><i class="fa-solid fa-location-dot mr-1"></i>${escapeHtml(sensor.room)}</div>
        <div class="sensor-card-reading">${formatWatts(sensor.watts)}</div>
        <div class="sensor-card-meta">
          <span><i class="fa-solid fa-plug mr-1"></i>${applianceCountText(sensor.appliances.length)}</span>
          <span>Atualizado agora</span>
        </div>
        <div class="sensor-card-actions">
          <button type="button" class="sensor-mini-btn" data-configure-sensor="${sensor.id}"><i class="fa-solid fa-gear"></i> Configurar</button>
          <button type="button" class="sensor-mini-btn" data-add-appliance-to="${sensor.id}"><i class="fa-solid fa-plus"></i> Aparelho</button>
        </div>
      </article>
    `).join('');
  }

  function updateSummary(){
    const online = sensors.filter(s => s.status === 'online');
    const total = online.reduce((sum,s)=>sum+(Number(s.watts)||0),0);
    const highest = [...sensors].sort((a,b)=>(b.watts||0)-(a.watts||0))[0];
    const selected = getSelected();
    $('#sensorTotalNow') && ($('#sensorTotalNow').textContent = formatWatts(total));
    $('#sensorOnlineCount') && ($('#sensorOnlineCount').textContent = `${online.length}/4`);
    $('#sensorHighestRoom') && ($('#sensorHighestRoom').textContent = highest?.room || '—');
    $('#sensorHighestValue') && ($('#sensorHighestValue').textContent = highest ? `${formatWatts(highest.watts)} agora` : 'sem leitura');
    $('#esp32Watts') && ($('#esp32Watts').textContent = formatWatts(selected.watts));
    $('#esp32Voltage') && ($('#esp32Voltage').textContent = `${selected.voltage || 127} V`);
    $('#esp32Current') && ($('#esp32Current').textContent = formatAmp(selected.watts, selected.voltage));
    $('#esp32Status') && ($('#esp32Status').textContent = selected.status === 'online' ? 'Online' : 'Offline');
  }

  function updatePanel(){
    const sensor = getSelected();
    if (!sensor) return;
    if ($('#panelRoomName')) $('#panelRoomName').textContent = `${sensor.label} — ${sensor.room}`;
    if ($('#sensorPanelStatus')) {
      $('#sensorPanelStatus').className = `sensor-status-pill ${sensor.status}`;
      $('#sensorPanelStatus').innerHTML = `<i class="fa-solid fa-circle"></i>${sensor.status === 'online' ? 'Online' : 'Offline'}`;
    }
    $('#selectedSensorReading') && ($('#selectedSensorReading').textContent = formatWatts(sensor.watts));
    $('#selectedSensorUpdated') && ($('#selectedSensorUpdated').textContent = 'Atualizado há 2 segundos');
    $('#selectedSensorRoom') && ($('#selectedSensorRoom').textContent = sensor.room);
    $('#selectedSensorVoltage') && ($('#selectedSensorVoltage').textContent = `${sensor.voltage || 127} V`);
    $('#selectedSensorCurrent') && ($('#selectedSensorCurrent').textContent = formatAmp(sensor.watts, sensor.voltage));
    $('#selectedSensorApplianceCount') && ($('#selectedSensorApplianceCount').textContent = sensor.appliances.length);
    $('#sensorSimpleTip') && ($('#sensorSimpleTip').textContent = sensor.tip || 'Acompanhe o consumo e desligue aparelhos que não estiver usando.');

    const body = $('#sensorApplianceTableBody');
    if (body) {
      body.innerHTML = sensor.appliances.length ? sensor.appliances.map((app, idx) => `
        <tr>
          <td><div class="device-info-cell"><i class="fa-solid fa-plug"></i><span>${app.name}<br><small class="text-muted">${app.type || 'Aparelho'}</small></span></div></td>
          <td class="font-bold">${formatWatts(app.watts)}</td>
          <td><button type="button" class="remove-appliance-btn" data-remove-appliance="${idx}" title="Remover"><i class="fa-solid fa-trash"></i></button></td>
        </tr>
      `).join('') : `<tr><td colspan="3" class="text-muted">Nenhum aparelho cadastrado neste sensor.</td></tr>`;
    }

    const canvas = $('#sensorDetailChart');
    if (canvas && typeof Chart !== 'undefined') {
      if (sensorDetailChart) sensorDetailChart.destroy();
      sensorDetailChart = new Chart(canvas, {
        type:'line',
        data:{ labels:['-60s','-50s','-40s','-30s','-20s','-10s','Agora'], datasets:[{ data:sensor.history, borderColor:sensor.color, backgroundColor:sensor.color+'22', fill:true, pointRadius:2, tension:.38, borderWidth:2 }] },
        options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ x:{grid:{display:false}}, y:{grid:{color:border}} } }
      });
    }
    updateSummary();
  }

  function selectSensor(id){
    selectedSensorId = id;
    renderCards();
    updatePanel();
  }

  function closeModal(backdrop, escHandler){
    backdrop.remove();
    if (escHandler) document.removeEventListener('keydown', escHandler);
  }

  function openConfigureSensorModal(sensorId = selectedSensorId){
    const sensor = sensors.find(s=>s.id===sensorId) || getSelected();
    const old = document.querySelector('.sensor-config-modal'); if (old) old.remove();
    const back = document.createElement('div');
    back.className = 'eco-modal-backdrop open sensor-config-modal';
    back.innerHTML = `<div class="eco-modal" role="dialog" aria-modal="true" aria-label="Configurar sensor">
      <div class="eco-modal-header eco-modal-head">
        <div class="eco-modal-title"><h3 style="margin:0">Configurar sensor</h3></div>
        <button type="button" class="eco-modal-close" aria-label="Fechar"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="eco-modal-body">
        <div class="sensor-modal-note"><strong>Sensor físico fixo:</strong> o EcoWatts trabalha com 4 sensores conectados ao ESP32. Você pode renomear e escolher onde cada sensor está instalado.</div>
        <form id="sensorConfigForm" class="utensil-form sensor-form-grid">
          <div class="form-row full"><label for="sensorLabel">Nome do sensor</label><input id="sensorLabel" name="label" value="${escapeHtml(sensor.label)}" required></div>
          <div class="form-row"><label for="sensorRoom">Cômodo</label><input id="sensorRoom" name="room" value="${escapeHtml(sensor.room)}" placeholder="Ex: Cozinha, Sala, Quarto" required></div>
          <div class="form-row"><label for="sensorVoltage">Tensão estimada (V)</label><select id="sensorVoltage" name="voltage"><option value="127" ${sensor.voltage==127?'selected':''}>127 V</option><option value="220" ${sensor.voltage==220?'selected':''}>220 V</option></select></div>
          <div class="form-row full"><label>Ícone do sensor</label><input type="hidden" id="sensorIcon" name="icon" value="${escapeHtml(sensor.icon || 'fa-microchip')}"><div class="sensor-icon-picker" role="radiogroup" aria-label="Escolha o ícone do sensor">${iconChoices.map(item => `<button type="button" class="sensor-icon-option ${item.icon === sensor.icon ? 'active' : ''}" data-icon-choice="${item.icon}" data-icon-color="${item.color}" title="${item.label}" aria-label="${item.label}"><i class="fa-solid ${item.icon}"></i><span>${item.label}</span></button>`).join('')}</div><div class="form-help">Escolha o símbolo que representa este sensor no Mapa da Casa.</div></div>
          <div class="form-row full"><label for="sensorTip">Dica/resumo simples</label><input id="sensorTip" name="tip" value="${escapeHtml(sensor.tip || '')}" placeholder="Ex: Evite usar aparelhos fortes juntos no horário de pico"></div>
          <div class="utensil-modal-actions full"><button type="button" class="btn-action utensil-cancel">Cancelar</button><button type="submit" class="btn-action primary"><i class="fa-solid fa-check"></i> Salvar sensor</button></div>
        </form>
      </div>
    </div>`;
    document.body.appendChild(back);
    const esc = e => { if (e.key === 'Escape') closeModal(back, esc); };
    back.addEventListener('click', e => { if (e.target === back || e.target.closest('.eco-modal-close') || e.target.closest('.utensil-cancel')) closeModal(back, esc); });
    document.addEventListener('keydown', esc);
    back.querySelectorAll('[data-icon-choice]').forEach(btn => {
      btn.addEventListener('click', () => {
        back.querySelectorAll('[data-icon-choice]').forEach(item => item.classList.remove('active'));
        btn.classList.add('active');
        const input = back.querySelector('#sensorIcon');
        if (input) input.value = btn.dataset.iconChoice || 'fa-microchip';
      });
    });
    back.querySelector('#sensorConfigForm').addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      sensor.label = String(fd.get('label') || sensor.label).trim();
      sensor.room = String(fd.get('room') || sensor.room).trim();
      sensor.voltage = Number(fd.get('voltage') || sensor.voltage || 127);
      const selectedIcon = String(fd.get('icon') || sensor.icon || 'fa-microchip');
      const iconChoice = findIconChoice(selectedIcon);
      sensor.icon = selectedIcon;
      sensor.color = iconChoice.color || sensor.color;
      sensor.tip = String(fd.get('tip') || sensor.tip || '').trim();
      saveSensors();
      selectSensor(sensor.id);
      toast('Sensor atualizado', `${sensor.label} foi configurado para ${sensor.room}.`, 'success');
      closeModal(back, esc);
    });
    setTimeout(()=>back.querySelector('#sensorLabel')?.focus(),60);
  }

  function openAddApplianceModal(sensorId = selectedSensorId){
    const selected = sensors.find(s=>s.id===sensorId) || getSelected();
    const old = document.querySelector('.appliance-modal'); if (old) old.remove();
    const back = document.createElement('div');
    back.className = 'eco-modal-backdrop open appliance-modal';
    const options = sensors.map(s=>`<option value="${s.id}" ${s.id===selected.id?'selected':''}>${s.label} — ${s.room}</option>`).join('');
    back.innerHTML = `<div class="eco-modal" role="dialog" aria-modal="true" aria-label="Adicionar aparelho">
      <div class="eco-modal-header eco-modal-head">
        <div class="eco-modal-title"><h3 style="margin:0">Adicionar aparelho</h3></div>
        <button type="button" class="eco-modal-close" aria-label="Fechar"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="eco-modal-body">
        <p class="text-muted mb-3">Cadastre um aparelho e vincule a um dos 4 sensores da casa.</p>
        <form id="applianceForm" class="utensil-form sensor-form-grid">
          <div class="form-row full"><label for="applianceName">Nome do aparelho</label><input id="applianceName" name="name" placeholder="Ex: Geladeira, TV, Ventilador" required></div>
          <div class="form-row"><label for="applianceSensor">Sensor</label><select id="applianceSensor" name="sensor" required>${options}</select></div>
          <div class="form-row"><label for="applianceType">Tipo</label><select id="applianceType" name="type"><option>Cozinha</option><option>Climatização</option><option>Entretenimento</option><option>Iluminação</option><option>Tomada</option><option>Lavanderia</option><option>Outro</option></select></div>
          <div class="form-row full"><label for="appliancePower">Potência estimada (W)</label><input id="appliancePower" name="power" type="number" min="1" max="10000" value="120" required><div class="form-help">Exemplos: lâmpada 60 W, TV 150 W, micro-ondas 1200 W, chuveiro 5500 W.</div></div>
          <div class="utensil-modal-actions full"><button type="button" class="btn-action utensil-cancel">Cancelar</button><button type="submit" class="btn-action primary"><i class="fa-solid fa-plus"></i> Adicionar</button></div>
        </form>
      </div>
    </div>`;
    document.body.appendChild(back);
    const esc = e => { if (e.key === 'Escape') closeModal(back, esc); };
    back.addEventListener('click', e => { if (e.target === back || e.target.closest('.eco-modal-close') || e.target.closest('.utensil-cancel')) closeModal(back, esc); });
    document.addEventListener('keydown', esc);
    back.querySelector('#applianceForm').addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const sensor = sensors.find(s=>s.id===fd.get('sensor')) || selected;
      const name = String(fd.get('name') || '').trim();
      const type = String(fd.get('type') || 'Aparelho');
      const watts = Math.max(1, Number(fd.get('power') || 0));
      if (!name) return;
      sensor.appliances.push({name,type,watts});
      sensor.watts = Math.round((Number(sensor.watts)||0) + watts * 0.18);
      sensor.history = [...sensor.history.slice(1), sensor.watts];
      saveSensors();
      selectSensor(sensor.id);
      toast('Aparelho adicionado', `${name} foi vinculado ao ${sensor.label}.`, 'success');
      closeModal(back, esc);
    });
    setTimeout(()=>back.querySelector('#applianceName')?.focus(),60);
  }

  function simulateReading(){
    const sensor = getSelected();
    const delta = Math.round((Math.random() * 260) - 90);
    sensor.watts = Math.max(0, Math.round((sensor.watts || 0) + delta));
    sensor.history = [...sensor.history.slice(1), sensor.watts];
    saveSensors();
    selectSensor(sensor.id);
    toast('Nova leitura simulada', `${sensor.label}: ${formatWatts(sensor.watts)}.`, 'success');
  }

  $('#sensorCardsGrid').addEventListener('click', e => {
    const configure = e.target.closest('[data-configure-sensor]');
    const add = e.target.closest('[data-add-appliance-to]');
    const card = e.target.closest('.sensor-card');
    if (configure) { e.stopPropagation(); openConfigureSensorModal(configure.dataset.configureSensor); return; }
    if (add) { e.stopPropagation(); openAddApplianceModal(add.dataset.addApplianceTo); return; }
    if (card) selectSensor(card.dataset.sensorId);
  });
  $('#sensorApplianceTableBody')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-remove-appliance]');
    if (!btn) return;
    const sensor = getSelected();
    const idx = Number(btn.dataset.removeAppliance);
    const removed = sensor.appliances.splice(idx,1)[0];
    if (removed) {
      sensor.watts = Math.max(0, Math.round((sensor.watts || 0) - (removed.watts || 0) * 0.18));
      sensor.history = [...sensor.history.slice(1), sensor.watts];
      saveSensors();
      selectSensor(sensor.id);
      toast('Aparelho removido', `${removed.name} saiu do ${sensor.label}.`, 'success');
    }
  });
  ['#configureSelectedSensorBtn','#configureSensorPanelBtn'].forEach(sel => $(sel)?.addEventListener('click',()=>openConfigureSensorModal(selectedSensorId)));
  ['#addApplianceBtn','#addApplianceSmallBtn','#addAppliancePanelBtn'].forEach(sel => $(sel)?.addEventListener('click',()=>openAddApplianceModal(selectedSensorId)));
  $('#simulateReadingBtn')?.addEventListener('click', simulateReading);

  // Atualização simulada do visor ESP32, mantendo claro que poderá receber dados reais depois.
  setInterval(() => {
    sensors.forEach(sensor => {
      if (sensor.status !== 'online') return;
      const delta = Math.round((Math.random() * 90) - 35);
      sensor.watts = Math.max(0, Math.round((sensor.watts || 0) + delta));
      sensor.history = [...sensor.history.slice(1), sensor.watts];
    });
    saveSensors();
    renderCards();
    updatePanel();
  }, 5000);

  renderCards();
  updatePanel();

  // Marketplace Logic
  let marketplaceBalance = 2450;
  const balanceEl = document.getElementById('marketplaceBalance');
  document.querySelectorAll('#view-marketplace .btn-premium-outline').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const btnEl = e.currentTarget;
      if (btnEl.disabled) return;
      const text = btnEl.textContent;
      const pointsMatch = text.match(/(\d+\.?\d*)\s*pts/);
      if (pointsMatch) {
        const pointsCost = parseInt(pointsMatch[1].replace('.', ''));
        if (marketplaceBalance >= pointsCost) {
          marketplaceBalance -= pointsCost;
          if (balanceEl) balanceEl.textContent = marketplaceBalance.toLocaleString('pt-BR');
          window.ecoToast('Resgate Concluído', 'Cupom enviado para o seu e-mail.', 'success');
          btnEl.textContent = 'Resgatado';
          btnEl.disabled = true;
          btnEl.style.opacity = '0.5';
          btnEl.style.cursor = 'not-allowed';
          
          // Verifica botões que não podem mais ser resgatados
          document.querySelectorAll('#view-marketplace .btn-premium-outline').forEach(otherBtn => {
             const otherMatch = otherBtn.textContent.match(/(\d+\.?\d*)\s*pts/);
             if (otherMatch && !otherBtn.disabled) {
                 const otherCost = parseInt(otherMatch[1].replace('.', ''));
                 if (marketplaceBalance < otherCost) {
                     otherBtn.disabled = true;
                     otherBtn.textContent = `Faltam ${otherCost - marketplaceBalance} pts`;
                 }
             }
          });
        } else {
          window.ecoToast('Saldo Insuficiente', 'Você não tem pontos suficientes.', 'error');
        }
      }
    });
  });

  const btnHistorico = document.getElementById('btn-historico-resgates');
  if (btnHistorico) {
    btnHistorico.addEventListener('click', () => {
      window.ecoModal('Histórico de Resgates', `
        <p class="text-muted mb-3">Veja o histórico das recompensas que você já resgatou no Marketplace.</p>
        <div class="data-table" style="max-height: 250px; overflow-y: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); font-size: 11px; text-transform: uppercase;">
                <th style="padding: 10px;">Data</th>
                <th style="padding: 10px;">Recompensa</th>
                <th style="padding: 10px;">Pontos</th>
                <th style="padding: 10px;">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px;">
                <td style="padding: 12px 10px;">Ontem</td>
                <td style="padding: 12px 10px;">5% OFF Conta de Luz</td>
                <td style="padding: 12px 10px; color: var(--accent-red);">-500 pts</td>
                <td style="padding: 12px 10px;"><span class="badge-premium" style="font-size: 10px; padding: 4px 8px; background: rgba(0,229,153,0.1); color: var(--accent-green);">Aprovado</span></td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px;">
                <td style="padding: 12px 10px;">12/05/2026</td>
                <td style="padding: 12px 10px;">Garrafa Térmica (Brinde)</td>
                <td style="padding: 12px 10px; color: var(--accent-red);">-1.200 pts</td>
                <td style="padding: 12px 10px;"><span class="badge-premium" style="font-size: 10px; padding: 4px 8px; background: rgba(0,163,255,0.1); color: var(--accent-blue);">Enviado</span></td>
              </tr>
              <tr style="font-size: 13px;">
                <td style="padding: 12px 10px;">28/04/2026</td>
                <td style="padding: 12px 10px;">Cupom R$ 20 Supermercado</td>
                <td style="padding: 12px 10px; color: var(--accent-red);">-800 pts</td>
                <td style="padding: 12px 10px;"><span class="badge-premium" style="font-size: 10px; padding: 4px 8px; background: rgba(0,229,153,0.1); color: var(--accent-green);">Aprovado</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      `);
    });
  }

});
