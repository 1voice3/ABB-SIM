const $=s=>document.querySelector(s),H=(s,h)=>{$(s).innerHTML=h},PM=Object.fromEntries(P.map(p=>[p[0],p]));
const fresh=()=>({p:{},w:{3:'s',4:'s'},f:{sto1:1,sto2:1},m:'Off',hr:30,fr:0,faults:[],hist:[],cz:{},ld:50,mod:7,us:1,pw:{in:'ok',mot:'uvw'},pid:0});
let S;try{S=JSON.parse(localStorage.getItem('ach180'))||fresh()}catch(e){S=fresh()}
let U={v:'home',st:[],ix:0,ed:null,sel:'Auto',msg:''},ACT={},O={ro:0,ao:0,cur:0,ref:0,rev:0,w:[],a1:{},a2:{}},prevRst=0;
const save=()=>{try{localStorage.setItem('ach180',JSON.stringify(S))}catch(e){}};
const M=()=>MODELS[S.mod];
function dflt(id){const d=PM[id][4],u=k=>g(k)==10;
 return d=='FLA'?M()[1]:d=='HP'?M()[3]:d=='IMAX'?M()[2]:d=='AIMAX'?(u('12.15')?20:10):d=='AI2MIN'?(u('12.25')?4:0):d=='AIMAX2'?(u('12.25')?20:10):d=='AOMAX'?(u('13.15')?20:10):id=='46.02'?(S.us?60:50):d}
function g(id){return id in S.p?S.p[id]:dflt(id)}
function setP(id,v){const p=PM[id];v=+v;if(p[2]=='n')v=Math.max(p[3][0],Math.min(p[3][1],v));if(v===dflt(id))delete S.p[id];else S.p[id]=v;save()}
const fmt=(id,v)=>{const p=PM[id];return p[2]=='e'?(p[3][v]??v):(Math.round(v*1000)/1000)+(p[5]?' '+p[5]:'')};
// ---------- simulation ----------
function ai(t){const dev=S.w[t],u=g(t==14?'12.15':'12.25');if(!dev||dev=='c')return{raw:0,sc:0,bad:0,u:u==2?'V':'mA'};
 let raw=dev=='v'?(S.f['a'+t]??50)/10:4+(S.f['a'+t]??50)*.16,bad=0;if((dev=='v')!=(u==2)){raw=0;bad=1}
 const k=t==14?['12.17','12.18','12.19','12.20']:['12.27','12.28','12.29','12.30'],mn=g(k[0]),mx=g(k[1]);
 const x=mx==mn?0:Math.max(0,Math.min(1,(raw-mn)/(mx-mn)));return{raw,sc:g(k[2])+x*(g(k[3])-g(k[2])),bad,u:u==2?'V':'mA'}}
function tick(dt){
 const c=t=>S.w[t]=='c'&&S.f['t'+t]?1:0,dv={2:c(8),3:c(9),4:c(10),5:c(11),6:g('11.21')==0?c(14):0},fs=g('46.02'),sc=g('99.04')==1;
 const A1=ai(14),A2=ai(15);O.a1=A1;O.a2=A2;const w=[];
 const sel=g('19.11'),ext=sel==1?2:sel>=3?(dv[sel-1]?2:1):1;
 let cmd=0;if(S.m=='Hand')cmd=1;if(S.m=='Auto'){const cm2=g(ext==1?'20.01':'20.06'),s1=g(ext==1?'20.03':'20.08');if([1,2,3].includes(cm2))cmd=dv[s1]||0}
 let ok=1;[['20.40','Run permissive'],['20.41','Start interlock 1'],['20.42','Start interlock 2'],['20.43','Start interlock 3']].forEach(([id,n])=>{const s=g(id);if(s&&!dv[s]){ok=0;if(cmd)w.push(n+' not satisfied')}});
 if(A1.bad||A2.bad)w.push('Analog input type does not match unit parameter');
 // reference
 let ref=0;if(S.m=='Hand')ref=S.hr;else{const s=g(ext==1?'28.11':'28.15'),c1=dv[g('28.22')]||0,c2=dv[g('28.23')]||0;
  if(c1||c2)ref=c1&&c2?g('28.28'):c1?g('28.26'):g('28.27');else if(s==1)ref=A1.sc;else if(s==2)ref=A2.sc;
  else if(s==16&&g('40.07')){const sp=g('40.16')==3?A1.sc:g('40.21'),e=g('40.31')?A2.sc-sp:sp-A2.sc;S.pid=Math.max(0,Math.min(g('30.14'),S.pid+e*g('40.32')*dt/Math.max(.1,g('40.33'))*5));ref=S.pid}}
 O.ref=ref;
 // faults
 const a={};Object.keys(S.cz).forEach(k=>S.cz[k]&&(a[k]=1));
 const s1=S.w[3]=='s'&&S.f.sto1,s2=S.w[4]=='s'&&S.f.sto2;if(!s1&&!s2)a['5091']=1;else if(!s1)a.FA81=1;else if(!s2)a.FA82=1;
 if(cmd||S.fr>0){if(S.pw.in=='loss')a['3130']=1;if(S.pw.in=='swap')a['3181']=1;if(S.pw.mot=='open')a['3381']=1}
 ACT=a;Object.keys(a).forEach(k=>{if(!S.faults.includes(k)){S.faults.push(k);S.hist.unshift(k);S.hist=S.hist.slice(0,10);if(U.v=='home')U.v='msg'}});
 const rst=g('31.11')?dv[g('31.11')]:0;if(rst&&!prevRst)resetF();prevRst=rst;
 const fault=S.faults.length>0,run=cmd&&ok&&!fault;let tg=run?Math.min(g('30.14'),Math.max(g('30.13'),ref)):0;
 const ac=Math.max(.1,g(sc?'28.72':'23.12')),dc=Math.max(.1,g(sc?'28.73':'23.13'));
 if(tg>S.fr)S.fr=Math.min(tg,S.fr+fs/ac*dt);else if(tg<S.fr){if(tg==0&&(g('21.03')==0||fault))S.fr*=Math.exp(-dt/8);else S.fr=Math.max(tg,S.fr-fs/dc*dt);if(S.fr<.15&&tg==0)S.fr=0}
 O.run=run;O.cmd=cmd;O.fault=fault;O.w=w;O.cur=S.fr>0?g('99.06')*(.25+.75*S.ld/100)*Math.min(1.2,S.fr/Math.max(1,g('99.08'))):0;
 O.rev=(S.pw.mot=='uwv')!=(g('99.16')==1);
 const r=g('10.24');O.ro=r==2?!fault:r==7?S.fr>0:r==14?fault:r==16?(fault||w.length>0):r==54?!!cmd&&!fault:0;
 const as=g('13.12'),v=as==3?S.fr:as==4?O.cur:0,a0=g('13.17'),a1=g('13.18');
 O.ao=g('13.19')+Math.max(0,Math.min(1,a1==a0?0:(v-a0)/(a1-a0)))*(g('13.20')-g('13.19'));O.aoU=g('13.15')==2?'V':'mA';
}
function resetF(){const n=S.faults.length;S.faults=S.faults.filter(k=>ACT[k]);U.msg=S.faults.length?'Cause still active':'';return n!=S.faults.length}
// ---------- panel ----------
const GR={};P.forEach(p=>{const k=p[0].slice(0,2);(GR[k]=GR[k]||[]).push(p[0])});
const GN={'99':'Motor data','10':'Standard DI, RO','11':'Standard DIO, FI, FO','12':'Standard AI','13':'Standard AO','19':'Operation mode','20':'Start/stop/direction','21':'Start/stop mode','22':'Speed reference selection','23':'Speed reference ramp','28':'Frequency reference chain','30':'Limits','31':'Fault functions','40':'Process PID set 1','46':'Monitoring/scaling','58':'Embedded fieldbus'};
const pi=id=>({l:id+' '+PM[id][1],v:()=>fmt(id,g(id)),p:id});
function menu(k){const sc=g('99.04')==1;
 if(k=='main')return{t:'Menu',i:[{l:'Motor data',go:'md'},{l:'Motor control',go:'mc'},{l:'Diagnostics',go:'dg'},{l:'Energy efficiency',go:'ee'},{l:'Parameters',go:'pr'}]};
 if(k=='md')return{t:'Motor data',i:['99.03','99.04','99.10','99.06','99.07','99.08','99.09','99.12','99.16','99.11'].map(id=>({...pi(id),l:PM[id][1].replace('Motor ','').replace('nominal','nom.')})).concat([{l:'Unit selection',v:()=>S.us?'US':'SI',fn:()=>{S.us^=1;save()}}])};
 if(k=='mc')return{t:'Motor control',i:[{l:'Stop mode',v:()=>fmt('21.03',g('21.03')),p:'21.03'},{l:'Acceleration time',v:()=>fmt(sc?'28.72':'23.12',g(sc?'28.72':'23.12')),p:sc?'28.72':'23.12'},{l:'Deceleration time',v:()=>fmt(sc?'28.73':'23.13',g(sc?'28.73':'23.13')),p:sc?'28.73':'23.13'},{l:'Max frequency',v:()=>fmt('30.14',g('30.14')),p:'30.14'},{l:'Min frequency',v:()=>fmt('30.13',g('30.13')),p:'30.13'},{l:'Max current',v:()=>fmt('30.17',g('30.17')),p:'30.17'}]};
 if(k=='dg')return{t:'Diagnostics',i:[{l:'Active fault',fn:()=>{U.v='msg'}},{l:'Fault history',go:'fh'},{l:'Active warnings',go:'aw'},{l:'Connection status',go:'cs'}]};
 if(k=='fh')return{t:'Fault history',i:S.hist.length?S.hist.map(c=>({l:c+' '+F[c][0]})):[{l:'(empty)'}]};
 if(k=='aw')return{t:'Active warnings',i:O.w.length?O.w.map(x=>({l:x})):[{l:'(none)'}]};
 if(k=='cs')return{t:'Connection status',i:[{l:'Fieldbus',v:()=>'No master'},...[[8,'DI1'],[9,'DI2'],[10,'DI3'],[11,'DI4']].map(([t,n])=>({l:n,v:()=>S.w[t]=='c'&&S.f['t'+t]?'1':'0'})),{l:'AI1',v:()=>O.a1.raw.toFixed(2)+' '+O.a1.u},{l:'AI2',v:()=>O.a2.raw.toFixed(2)+' '+O.a2.u},{l:'RO1',v:()=>O.ro?'On':'Off'}]};
 if(k=='ee')return{t:'Energy efficiency',i:[{l:'Saved energy (kWh)',v:()=>'n/a in sim'}]};
 if(k=='pr')return{t:'Parameters',i:[{l:'Complete parameter list',go:'pg'},{l:'Modified parameter list',go:'pm'},{l:'Parameter restore',fn:()=>{S.p={};S.pid=0;save();U.msg='Defaults restored'}}]};
 if(k=='pg')return{t:'Parameter groups',i:Object.keys(GR).map(n=>({l:n+' '+(GN[n]||''),go:'g'+n}))};
 if(k=='pm'){const m=Object.keys(S.p).filter(i=>PM[i]);return{t:'Modified',i:m.length?m.map(pi):[{l:'(none)'}]}}
 if(k[0]=='g')return{t:'Group '+k.slice(1),i:GR[k.slice(1)].map(pi)}}
function key(k){U.msg='';const cur=U.v=='menu'?menu(U.st[U.st.length-1]):null,e=U.ed;
 if(k=='off'){S.m='Off';U.v=U.v=='msg'?'msg':'home';U.ed=null}
 else if(k=='ah'){U.v='sel';U.sel=S.m=='Auto'?'Auto':'Hand'}
 else if(U.v=='sel'){if(k=='l'||k=='r')U.sel=U.sel=='Auto'?'Hand':'Auto';if(k=='ok'){if(U.sel=='Hand'&&S.m!='Hand')S.hr=O.ref;S.m=U.sel;U.v='home'}if(k=='bk')U.v='home'}
 else if(U.v=='msg'){if(k=='ok'){resetF();if(!S.faults.length)U.v='home'}if(k=='bk')U.v=U.st.length?'menu':'home'}
 else if(U.v=='home'){if(k=='ok'){U.v='menu';U.st=['main'];U.ix=0}if(k=='bk'){U.v='opts';U.ix=0}}
 else if(U.v=='opts'){const n=3;if(k=='u')U.ix=(U.ix+n-1)%n;if(k=='d')U.ix=(U.ix+1)%n;if(k=='bk')U.v='home';if(k=='ok'){if(U.ix==0){U.ed={id:'REF',val:S.hr};U.v='edit'}else if(U.ix==1)U.v='msg';else{U.st=['aw'];U.v='menu';U.ix=0}}}
 else if(U.v=='edit'){const p=e.id=='REF'?null:PM[e.id];
  if(k=='bk'){U.ed=null;U.v=e.id=='REF'?'home':'menu'}
  else if(p&&p[2]=='e'){const ks=Object.keys(p[3]).map(Number),i=ks.indexOf(+e.val);if(k=='u'||k=='r')e.val=ks[(i+1)%ks.length];if(k=='d'||k=='l')e.val=ks[(i+ks.length-1)%ks.length]}
  else{const rg=p?p[3][1]-p[3][0]:500,st=rg>=1000?1:rg<=1?.01:.1,m=(k=='l'||k=='r')?10:1;if(k=='u'||k=='r')e.val=Math.round((+e.val+st*m)*100)/100;if(k=='d'||k=='l')e.val=Math.round((+e.val-st*m)*100)/100}
  if(k=='ok'){if(e.id=='REF')S.hr=Math.max(0,+e.val);else setP(e.id,e.val);U.ed=null;U.v=e.id=='REF'?'home':'menu'}}
 else if(U.v=='menu'){const it=cur.i;if(k=='u')U.ix=(U.ix+it.length-1)%it.length;if(k=='d')U.ix=(U.ix+1)%it.length;
  if(k=='bk'){U.st.pop();U.ix=0;if(!U.st.length)U.v='home'}
  if(k=='ok'){const x=it[U.ix];if(x.go){U.st.push(x.go);U.ix=0}else if(x.p){U.ed={id:x.p,val:g(x.p)};U.v='edit'}else if(x.fn)x.fn()}}
 save();paint()}
function paint(){const L=[];let led='';
 if(U.v=='home'||U.v=='opts'&&0){const rev=O.rev?'Rev':'Fwd';L.push(`<b>${S.m}</b>  ${rev}`,'',`Target  ${O.ref.toFixed(1)} Hz`,`Actual  ${S.fr.toFixed(1)} Hz`,'',`<i>Options</i>     <i>Menu</i>`);if(S.faults.length)L.push('Fault: '+S.faults[0])}
 else if(U.v=='opts'){L.push('<b>Options</b>');['Reference value','Active faults','Active warnings'].forEach((x,i)=>L.push((U.ix==i?'▶ ':'  ')+x))}
 else if(U.v=='sel'){L.push('<b>Control location</b>','',(U.sel=='Hand'?'▶ ':'  ')+'Hand',(U.sel=='Auto'?'▶ ':'  ')+'Auto','','◀ ▶ select, OK confirm')}
 else if(U.v=='msg'){if(S.faults.length){const c=S.faults[0],f=F[c];L.push(`<b class=r>Fault ${c}</b>`,f[0],...wrap(f[1],26).slice(0,3),'OK = reset');if(ACT[c])L.push('(cause still present)')}else L.push('No active faults')}
 else if(U.v=='edit'){const e=U.ed,p=e.id=='REF'?null:PM[e.id];L.push('<b>'+(p?e.id+' '+p[1]:'Reference value')+'</b>','',p&&p[2]=='e'?'▶ '+(p[3][e.val]??e.val):'▶ '+e.val+' '+(p?p[5]||'':'Hz'),'',p&&p[2]=='n'?`range ${p[3][0]}…${p[3][1]}`:'',`default ${p?fmt(e.id,dflt(e.id)):''}`,'OK save   Back cancel')}
 else{const m=menu(U.st[U.st.length-1]);L.push('<b>'+m.t+'</b>');const n=U.ix,s=Math.max(0,Math.min(n-2,m.i.length-5));m.i.slice(s,s+5).forEach((x,j)=>L.push((s+j==n?'▶ ':'  ')+x.l+(x.v?' <i>'+x.v()+'</i>':'')))}
 if(U.msg)L.push('<i>'+U.msg+'</i>');
 H('#lcd',L.join('\n'));
 const l=$('#led');l.className=S.faults.length?'led red':O.w.length||(S.m=='Hand'&&S.hr==0&&0)?'led gb':O.run?'led grn':'led off';
 $('#stat').innerHTML=`<span>RO1 ${O.ro?'energized':'off'}</span><span>AO1 ${O.ao.toFixed(1)} ${O.aoU}</span><span>${O.cur.toFixed(1)} A</span><span>${O.rev?'reverse':'forward'}</span>`;
 $('#warn').textContent=O.w.join(' | ')}
const wrap=(t,n)=>{const o=[];let l='';t.split(' ').forEach(w=>{if((l+w).length>n){o.push(l);l=''}l+=w+' '});o.push(l);return o};
// ---------- wiring ----------
const OPT={d:[['','Open (unwired)'],['c','Contact to 24 V (T21)']],a:[['','Not wired'],['v','0…10 V signal'],['a','4…20 mA signal'],['c','Dry contact (DI5)']],s:[['','Open'],['s','Safety contact to S+']]};
function wiring(){let h='<h2>Control terminals</h2><p class=n>Functions shown are the HVAC default macro. Tap a field device to land a wire. DCOM/DGND wiring is not simulated.</p>';
 T.forEach(([n,nm,d,k])=>{h+=`<div class="tr ${k=='x'?'dim':''}"><span class=tn>${n}</span><span class=tl><b>${nm}</b><small>${d}</small>`;
  if(OPT[k])h+=`<select data-t=${n}>${OPT[k].map(([v,l])=>`<option value="${v}" ${(S.w[n]||'')==v?'selected':''}>${l}</option>`).join('')}</select>`;
  const dev=S.w[n];if(dev=='c'||dev=='s'){const key=dev=='s'?'sto'+(n-2):'t'+n;h+=`<label class=sw><input type=checkbox data-c=${key} ${S.f[key]?'checked':''}> contact closed</label>`}
  if(dev=='v'||dev=='a')h+=`<label class=sw>signal <input type=range min=0 max=100 data-a=a${n} value=${S.f['a'+n]??50}> <span id=av${n}></span></label>`;
  if(n==7||n==5||n==6)h+=`<small id=ro${n}></small>`;if(n==17)h+='<small id=aov></small>';h+='</span></div>'});
 h+=`<h2>Power wiring</h2><div class=tr><span class=tl><b>Input L1/L2/L3</b><select id=pwin><option value=ok ${S.pw.in=='ok'?'selected':''}>All three phases landed</option><option value=loss ${S.pw.in=='loss'?'selected':''}>One phase missing</option><option value=swap ${S.pw.in=='swap'?'selected':''}>Supply and motor leads swapped</option></select></span></div>
 <div class=tr><span class=tl><b>Motor T1/U T2/V T3/W</b><select id=pwmo><option value=uvw ${S.pw.mot=='uvw'?'selected':''}>U-V-W to T1-T2-T3</option><option value=uwv ${S.pw.mot=='uwv'?'selected':''}>Two leads swapped</option><option value=open ${S.pw.mot=='open'?'selected':''}>One lead not connected</option></select><small>Swapped leads or par 99.16 = UWV reverses rotation; both cancel out.</small></span></div>`;
 H('#wiring',h);live()}
function live(){const o=O;[5,6,7].forEach(n=>{const e=$('#ro'+n);if(e)e.textContent=n==7?`NO-COM ${o.ro?'closed':'open'}`:n==5?`NC-COM ${o.ro?'open':'closed'}`:'common'});
 [14,15].forEach(n=>{const e=$('#av'+n);if(e){const a=n==14?o.a1:o.a2;e.textContent=`${a.raw.toFixed(2)} ${a.u}${a.bad?' (type ≠ unit par!)':''} → ${a.sc.toFixed(1)}`}});const e=$('#aov');if(e)e.textContent=`${o.ao.toFixed(2)} ${o.aoU}`}
// ---------- params tab ----------
function plist(q=''){q=q.toLowerCase();let h='',last='';P.forEach(p=>{if(q&&!(p[0]+p[1]).toLowerCase().includes(q))return;const gr=p[0].slice(0,2);if(gr!=last&&!q){h+=`<h3>${gr} ${GN[gr]||''}</h3>`;last=gr}
 h+=`<div class="pr ${p[0] in S.p?'mod':''}" data-p=${p[0]}><span><b>${p[0]}</b> ${p[1]}${p[6]?' <sup title="default inferred">◦</sup>':''}</span><em>${fmt(p[0],g(p[0]))}</em></div>`});H('#plist',h||'<p class=n>No match.</p>')}
function sheet(id){const p=PM[id],v=g(id);let inp=p[2]=='e'?`<select id=sv>${Object.entries(p[3]).map(([k,l])=>`<option value=${k} ${k==v?'selected':''}>[${k}] ${l}</option>`).join('')}</select>`:`<input id=sv type=number step=any value="${v}"><small>range ${p[3][0]}…${p[3][1]} ${p[5]||''}</small>`;
 H('#sheet',`<div class=card><h3>${id} ${p[1]}</h3>${inp}<small>default: ${fmt(id,dflt(id))}</small><div class=row><button id=sok>Save</button><button id=sdef class=g>Default</button><button id=scn class=g>Cancel</button></div></div>`);$('#sheet').hidden=0;
 $('#sok').onclick=()=>{setP(id,$('#sv').value);$('#sheet').hidden=1;plist($('#q').value);paint()};$('#sdef').onclick=()=>{delete S.p[id];save();$('#sheet').hidden=1;plist($('#q').value);paint()};$('#scn').onclick=()=>$('#sheet').hidden=1}
// ---------- faults / study ----------
function faults(){let h=`<div class=card><b>${S.faults.length?'Active: '+S.faults.map(c=>c+' '+F[c][0]).join(', '):'No active faults'}</b><button id=frst>Reset (OK in message view)</button><small id=fmsg></small></div><h2>Inject a cause</h2><p class=n>Switch a cause on, watch the drive trip, then switch it off and reset. STO and phase-loss faults come from the Wiring tab.</p>`;
 CAUSES.forEach(c=>h+=`<label class="tr sw2"><input type=checkbox data-z=${c} ${S.cz[c]?'checked':''}><span class=tl><b>${c} ${F[c][0]}</b><small>${F[c][1]}</small></span></label>`);
 h+='<h2>Other events in the simulator</h2>';['3130','3181','3381','5091','FA81','FA82'].forEach(c=>h+=`<div class="tr"><span class=tl><b>${c} ${F[c][0]}</b><small>${F[c][1]}</small></span></div>`);
 h+='<p class=n>Descriptions come from the quick installation guide or are named in the firmware manual. The full fault and warning table (firmware manual, Fault tracing chapter) was not available to this build: look up causes and fixes there.</p>';H('#faults',h)}
let sci=0;function study(res){const s=SC[sci];let h=`<h2>Practice scenarios</h2><select id=scs>${SC.map((x,i)=>`<option value=${i} ${i==sci?'selected':''}>${x.n}</option>`).join('')}</select><div class=card><p>${s.d}</p><small>Wire: ${Object.entries(s.w).map(([t,d])=>'T'+t+(d=='c'?' contact':d=='v'?' 0-10 V':' 4-20 mA')).join(', ')}<br>Set: ${Object.entries(s.p).map(([i,v])=>i+' = '+fmt(i,v)).join(', ')}</small>${s.hint?'<small>'+s.hint+'</small>':''}<div class=row><button id=chk>Check my setup</button><button id=ans class=g>Load answer</button></div>${res?'<div class=res>'+res+'</div>':''}</div>
 <h2>Drive and load</h2><label class=f>Drive model (460 V)<select id=mod>${MODELS.map((m,i)=>`<option value=${i} ${i==S.mod?'selected':''}>ACH180-04x-${m[0]}</option>`).join('')}</select></label><label class=f>Motor load ${S.ld}%<input type=range id=ld min=0 max=100 value=${S.ld}></label>
 <div class=row><button id=rst class=g>Restore factory defaults</button><button id=wipe class=g>Reset everything</button></div>
 <h2>ABB English documents</h2>${DOCS.map(([n,c])=>`<a class=doc target=_blank rel=noopener href="https://search.abb.com/library/Download.aspx?DocumentID=${c}&LanguageCode=en&DocumentPartId=1&Action=Launch">${n}<small>${c}</small></a>`).join('')}<p class=n>Frequency-domain simulation: speed-reference groups are not modeled. Defaults marked ◦ were inferred from the manual's default I/O tables.</p>`;H('#study',h)}
function check(){const s=SC[sci];let r='';const ok=b=>b?'✓ ':'✗ ';
 [8,9,10,11,14,15].forEach(t=>{const want=s.w[t]||'',have=S.w[t]||'';r+=ok(want==have)+'T'+t+': '+(have||'unwired')+(want==have?'':' (expected '+(want||'unwired')+')')+'<br>'});
 Object.entries(s.p).forEach(([i,v])=>r+=ok(g(i)==v)+i+' = '+fmt(i,g(i))+(g(i)==v?'':' (expected '+fmt(i,v)+')')+'<br>');study(r)}
// ---------- events ----------
document.addEventListener('click',e=>{const t=e.target.closest('[data-k],[data-p],[data-tab],#frst,#chk,#ans,#rst,#wipe');if(!t)return;
 if(t.dataset.k)key(t.dataset.k);else if(t.dataset.tab)tab(t.dataset.tab);else if(t.dataset.p)sheet(t.dataset.p);else if(t.id=='frst'){const m=resetF();$('#fmsg').textContent=S.faults.length?'Cause still active: switch it off first.':'';faults()}
 else if(t.id=='chk')check();else if(t.id=='ans'){const s=SC[sci];S.p={...s.p};S.w={3:'s',4:'s',...s.w};save();study('Answer loaded.');plist();paint()}
 else if(t.id=='rst'){S.p={};save();plist();paint()}else if(t.id=='wipe'){if(confirm('Erase all simulator settings?')){S=fresh();save();location.reload()}}});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset.t!==undefined){const n=+t.dataset.t;t.value?S.w[n]=t.value:delete S.w[n];if(t.value=='s'&&S.f['sto'+(n-2)]===undefined)S.f['sto'+(n-2)]=1;save();wiring()}
 else if(t.dataset.c){S.f[t.dataset.c]=t.checked?1:0;save()}else if(t.dataset.z){S.cz[t.dataset.z]=t.checked;save()}
 else if(t.id=='pwin'){S.pw.in=t.value;save()}else if(t.id=='pwmo'){S.pw.mot=t.value;save()}else if(t.id=='scs'){sci=+t.value;study()}else if(t.id=='mod'){S.mod=+t.value;save();plist();paint()}});
document.addEventListener('input',e=>{const t=e.target;if(t.dataset.a){S.f[t.dataset.a]=+t.value;save()}else if(t.id=='ld'){S.ld=+t.value;save()}else if(t.id=='q')plist(t.value)});
function tab(n){document.querySelectorAll('main>section').forEach(s=>s.hidden=s.id!=n);document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.tab==n));if(n=='wiring')wiring();if(n=='faults')faults();if(n=='study')study()}
let last=performance.now();setInterval(()=>{const n=performance.now(),dt=Math.min(.5,(n-last)/1000);last=n;tick(dt);paint();live();if(!$('#faults').hidden&&!document.activeElement?.dataset?.z)$('#frst')&&0},100);
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
tick(.1);plist();tab('panel');
