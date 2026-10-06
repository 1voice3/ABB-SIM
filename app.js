const $=s=>document.querySelector(s),H=(s,h)=>{$(s).innerHTML=h},PM=Object.fromEntries(P.map(p=>[p[0],p]));
const fresh=()=>({p:{},w:{3:'s',4:'s',12:'dgnd'},f:{t3:1,t4:1},m:'Off',hr:30,fr:0,faults:[],hist:[],cz:{},ld:50,mod:7,us:1,pw:{in:'ok',mot:'uvw'},pid:0});
let S;try{S=JSON.parse(localStorage.getItem('ach180c'))||fresh()}catch(e){S=fresh()}
let U={v:'home',st:[],ix:0,ed:null,sel:'Auto',msg:''},ACT={},O={ro:0,ao:0,cur:0,ref:0,rev:0,w:[],a1:{},a2:{},dv:{}},prevRst=0,DT=.1,HY={},LP={},slT=0,ar=0,sleep=0;
const save=()=>{try{localStorage.setItem('ach180c',JSON.stringify(S))}catch(e){}},M=()=>MODELS[S.mod];
const MODD={'99.06':()=>M()[1],'99.10':()=>M()[3],'99.07':()=>S.us?460:400,'99.08':()=>S.us?60:50,'99.09':()=>S.us?1750:1450,'30.17':()=>M()[2]};
function dflt(id){if(D60[id])return D60[id][S.us?1:0];if(MODD[id])return MODD[id]();return PM[id][4]}
const g=id=>id in S.p?S.p[id]:dflt(id);
function setP(id,v){const p=PM[id];if(p[2]=='r')return;v=p[2]=='x'&&typeof v=='string'?parseInt(v,16)||0:+v;if(p[2]=='n'||p[2]=='x'){const lo=p[3][0],hi=p[3][1];if(hi>lo)v=Math.max(lo,Math.min(hi,v))}if(v===dflt(id))delete S.p[id];else S.p[id]=v;save()}
const unitOf=p=>p[5]&&p[5]!='NoUnit'?' '+p[5]:'';
const fmt=(id,v)=>{const p=PM[id];if(p[2]=='r')return String(rd(id));if(p[2]=='e')return p[3][v]??v;if(p[2]=='x')return (+v).toString(16).toUpperCase().padStart(4,'0')+'h';return(Math.round(v*1000)/1000)+unitOf(p)}
function rd(id){const o=O,f=S.fr,fn=Math.max(1,g('99.08')),r=x=>Math.round(x*100)/100,dvb=[2,3,4,5,6].reduce((a,k,i)=>a|(o.dv[k]?1<<i:0),0);
 return({'01.01':r(f/fn*g('99.09')),'01.06':r(f),'01.07':r(o.cur),'01.10':f>0?r(S.ld*.9):0,'01.11':r(g('99.07')*1.414),'01.13':r(g('99.07')*Math.min(1,f/fn)),'01.14':r(1.732*g('99.07')*o.cur*.8/1000),'01.17':r(1.732*g('99.07')*o.cur*.8/1000*.9),'03.01':S.hr,'04.01':S.faults[0]||0,'04.06':o.w.length,'05.02':0,'05.11':r(o.cur/M()[1]*50),
 '06.11':(S.faults.length?8:0)|(f>0&&Math.abs(f-o.ref)<.3?256:0),'06.16':1|(o.ready?8:0)|(o.ext==1?1024:2048),'07.05':'AHVDC 2.20.0.0','10.01':dvb,'10.02':dvb,'10.21':o.ro?1:0,'12.11':r(o.a1.raw||0),'12.12':r(o.a1.sc||0),'12.21':r(o.a2.raw||0),'12.22':r(o.a2.sc||0),'13.11':r(o.ao),'19.01':S.m,
 '22.01':r(o.ref/fn*g('99.09')),'22.87':r(o.ref/fn*g('99.09')),'28.96':r(o.ref),'28.97':r(o.ref),'35.01':r(g('35.50')+o.cur/M()[1]*20),'40.01':r(S.pid),'40.02':r(o.a2.sc||0),'40.03':r(g('40.16')==3?o.a1.sc:g('40.21')),'40.04':r(o.pe||0)})[id]??0}
// ---------- signals at terminals ----------
const X=t=>S.f['x'+t]??0,PC=t=>S.f['a'+t]??50;
function volt(t){const k=S.w[t];if(!k)return null;if(k=='c24')return S.f['t'+t]?24:null;if(k=='c0')return S.f['t'+t]?0:null;if(k=='vs')return X(t);if(k=='v')return PC(t)/10;if(k=='s')return S.f['t'+t]?24:0;return null}
function cur(t){const k=S.w[t];return k=='a'||k=='l'?4+PC(t)*.16:k=='cs'?X(t):null}
function di(t){const k=S.w[t];if(!k)return 0;const v=volt(t),dc=S.w[12];if(v==null)return 0;
 const vc=dc=='dgnd'?0:dc=='p24'?24:dc=='vs'?X(12):null;if(vc==null)return 0;const d=Math.abs(v-vc);return HY[t]=d>=15?1:d<=5?0:(HY[t]||0)}
function ai(t){const k=S.w[t],U_=g(t==14?'12.15':'12.25')==2?'V':'mA',pr=t==14?['12.17','12.18','12.19','12.20','12.16']:['12.27','12.28','12.29','12.30','12.26'];
 let raw=0,bad=0,v=(k=='v'||k=='vs')?volt(t):null,c=(k=='a'||k=='l'||k=='cs')?cur(t):null;
 if(k=='l'&&S.w[21]!='loop')c=0;if(v!=null){if(U_=='V')raw=v;else bad=1}else if(c!=null){if(U_=='mA')raw=c;else bad=1}
 raw=Math.min(raw,U_=='V'?11:22);const mn=g(pr[0]),mx=g(pr[1]),x=mx==mn?0:Math.max(0,Math.min(1,(raw-mn)/(mx-mn))),sc=g(pr[2])+x*(g(pr[3])-g(pr[2])),tau=g(pr[4]);
 LP[t]=LP[t]==null||!tau?sc:LP[t]+(sc-LP[t])*Math.min(1,DT/(tau+DT));return{raw,sc:LP[t],bad,u:U_,loop:k=='l'&&S.w[21]!='loop'}}
// ---------- simulation ----------
function tick(dt){DT=dt;const dv={2:di(8),3:di(9),4:di(10),5:di(11),6:g('11.21')==0?di(14):0},fs=g('46.02'),sc=g('99.04')==1,w=[],A1=g('11.21')==0?{raw:0,sc:0,u:'V'}:ai(14),A2=ai(15);
 O.a1=A1;O.a2=A2;O.dv=dv;if(A1.bad||A2.bad)w.push('Analog signal type does not match unit parameter');if(A1.loop||A2.loop)w.push('2-wire transmitter has no loop supply (T21)');
 [21,23,17,18,20,24,1,22].forEach(t=>{if((S.w[t]=='vs'||S.w[t]=='cs')&&X(t)>.5)w.push('External signal on output terminal T'+t)});
 const ovOn=g('70.02')>0&&g('70.03')>0&&dv[+g('70.03')+1],sel=+g('19.11'),ext=sel==1?2:sel>=3?(dv[sel-1]?2:1):1;O.ext=ext;
 let cmd=S.m=='Hand'?1:0;if(S.m=='Auto'){const cm=g(ext==1?'20.01':'20.06'),s1=g(ext==1?'20.03':'20.08');if([1,2,3].includes(+cm))cmd=dv[s1]||0}
 if(ovOn){cmd=1;w.push('Override active')}else ar=0;
 let ok=1;const mask=+g('70.10');[['20.40','Run permissive'],['20.41','Start interlock 1'],['20.42','Start interlock 2'],['20.43','Start interlock 3']].forEach(([id,n],i)=>{const s=g(id);if(s&&!dv[s]&&(!ovOn||(mask>>i)&1)){ok=0;if(cmd)w.push(n+' not satisfied')}});
 const cref=()=>{const c1=dv[g('28.22')]||0,c2=dv[g('28.23')]||0;return c1||c2?(c1&&c2?g('28.28'):c1?g('28.26'):g('28.27')):null};
 const pidc=force=>{const fb=A2.sc,sp=g('40.16')==3?A1.sc:g('40.21'),e=g('40.31')?fb-sp:sp-fb;O.pe=e;
  if(!sleep){S.pid=Math.max(0,Math.min(g('30.14'),S.pid+e*g('40.32')*dt/Math.max(.1,g('40.33'))*5));const lv=g('40.43');if(lv>0&&S.fr>0&&S.fr<=lv){slT+=dt;if(slT>=g('40.44'))sleep=1}else slT=0;return S.pid}
  if(e>g('40.47')){sleep=0;slT=0}return 0};
 let ref=0;
 if(ovOn){const m=+g('70.04');ref=m==1?A1.sc:m==2?A2.sc:m==5?0:m==6?pidc():m==0?(cref()??0):g('70.06');if(m==5)cmd=0}
 else if(S.m=='Hand')ref=S.hr;
 else{const s=+g(ext==1?'28.11':'28.15'),c=cref();ref=c!=null?c:s==1?A1.sc:s==2?A2.sc:s==16&&g('40.07')?pidc():0}
 if(!cmd||!ok){sleep=0;slT=0}
 if(g('28.51')&1)[[52,53],[54,55],[56,57]].forEach(([a,b])=>{const lo=g('28.'+a),hi=g('28.'+b);if(hi>lo&&ref>lo&&ref<hi)ref=S.fr<(lo+hi)/2?lo:hi});
 O.ref=ref;if(sleep&&!ovOn)w.push('PID sleep');
 // STO (>=13 V = logic 1, per quick guide)
 const c1=(volt(3)??0)>=13,c2=(volt(4)??0)>=13,stoBlock=!c1||!c2;let a={};Object.keys(S.cz).forEach(k=>{if(!S.cz[k]||!F[k])return;if(F[k][3]=='fault')a[k]=1;else if(F[k][3]=='warning')w.push(k+' '+F[k][0])});
 if(stoBlock){if(c1!=c2){if(!c1)a.FA81=1;else a.FA82=1}else{const md=[['F','F'],['F','W'],['F','E'],['W','W'],['E','E'],['N','N']][+g('31.22')]||['F','F'],ind=md[(cmd||S.fr>0)?0:1];if(ind=='F')a['5091']=1;else if(ind=='W')w.push('A5A0 Safe torque off');else if(ind=='E')w.push('B5A0 STO event (log only)')}}
 if(cmd||S.fr>0){if(S.pw.in=='loss'&&g('31.21'))a['3130']=1;if(S.pw.in=='swap'&&g('31.23'))a['3181']=1;if(S.pw.mot=='open'&&g('31.19'))a['3381']=1}
 if(ovOn)Object.keys(a).forEach(k=>{if(!HP.includes(k))delete a[k]});
 ACT=a;if(ovOn)S.faults=S.faults.filter(k=>HP.includes(k));
 Object.keys(a).forEach(k=>{if(!S.faults.includes(k)){S.faults.push(k);S.hist.unshift(k);S.hist=S.hist.slice(0,10);if(U.v=='home')U.v='msg'}});
 if(ovOn&&g('70.20')==1)S.faults=S.faults.filter(k=>{if(a[k])return true;if(g('70.02')==2||ar<g('70.21')){ar++;return false}return true});
 const rst=g('31.11')?dv[g('31.11')]:0;if(rst&&!prevRst)resetF();prevRst=rst;
 const fault=S.faults.length>0,run=cmd&&ok&&!fault&&!stoBlock&&!sleep;O.ready=!fault&&!stoBlock;
 const tg=run?Math.min(g('30.14'),Math.max(g('30.13'),ref)):0,ac=Math.max(.1,g(sc?'28.72':'23.12')),dc=Math.max(.1,g(sc?'28.73':'23.13'));
 if(tg>S.fr)S.fr=Math.min(tg,S.fr+fs/ac*dt);else if(tg<S.fr){if(tg==0&&(g('21.03')==0||fault||stoBlock))S.fr*=Math.exp(-dt/8);else S.fr=Math.max(tg,S.fr-fs/dc*dt);if(S.fr<.15&&tg==0)S.fr=0}
 O.run=run;O.cmd=cmd;O.fault=fault;O.w=w;O.cur=S.fr>0&&!(S.pw.mot=='open')?g('99.06')*(.25+.75*S.ld/100)*Math.min(1.2,S.fr/Math.max(1,g('99.08'))):0;
 O.rev=(S.pw.mot=='uwv')!=(g('99.16')==1);
 const r=g('10.24');O.ro=r==2?O.ready:r==7?S.fr>0:r==14?fault:r==16?(fault||w.length>0):r==54?!!cmd&&!fault:0;
 const as=g('13.12'),v=as==3?S.fr:as==4?O.cur:0,a0=g('13.17'),a1=g('13.18');
 O.ao=g('13.19')+Math.max(0,Math.min(1,a1==a0?0:(v-a0)/(a1-a0)))*(g('13.20')-g('13.19'));O.aoU=g('13.15')==2?'V':'mA'}
function resetF(){const n=S.faults.length;S.faults=S.faults.filter(k=>ACT[k]);U.msg=S.faults.length?'Cause still active':'';return n!=S.faults.length}
// ---------- panel ----------
const GR={};P.forEach(p=>{const k=p[0].slice(0,2);(GR[k]=GR[k]||[]).push(p[0])});
const pi=id=>({l:id+' '+PM[id][1],v:()=>fmt(id,g(id)),p:id});
function menu(k){const sc=g('99.04')==1,A=sc?'28.72':'23.12',D=sc?'28.73':'23.13';
 if(k=='main')return{t:'Menu',i:[{l:'Motor data',go:'md'},{l:'Motor control',go:'mc'},{l:'Diagnostics',go:'dg'},{l:'Energy efficiency',go:'ee'},{l:'Parameters',go:'pr'}]};
 if(k=='md')return{t:'Motor data',i:['99.03','99.04','99.10','99.06','99.07','99.08','99.09','99.12','99.16','99.11'].map(id=>({...pi(id),l:PM[id][1].replace('Motor ','').replace('nominal','nom.')})).concat([{l:'Unit selection',v:()=>S.us?'US':'SI',fn:()=>{S.us^=1;save()}}])};
 if(k=='mc')return{t:'Motor control',i:[{l:'Stop mode',v:()=>fmt('21.03',g('21.03')),p:'21.03'},{l:'Acceleration time',v:()=>fmt(A,g(A)),p:A},{l:'Deceleration time',v:()=>fmt(D,g(D)),p:D},{l:'Max frequency',v:()=>fmt('30.14',g('30.14')),p:'30.14'},{l:'Min frequency',v:()=>fmt('30.13',g('30.13')),p:'30.13'},{l:'Max current',v:()=>fmt('30.17',g('30.17')),p:'30.17'}]};
 if(k=='dg')return{t:'Diagnostics',i:[{l:'Active fault',fn:()=>{U.v='msg'}},{l:'Fault history',go:'fh'},{l:'Active warnings',go:'aw'},{l:'Connection status',go:'cs'}]};
 if(k=='fh')return{t:'Fault history',i:S.hist.length?S.hist.map(c=>({l:c+' '+F[c][0]})):[{l:'(empty)'}]};
 if(k=='aw')return{t:'Active warnings',i:O.w.length?O.w.map(x=>({l:x})):[{l:'(none)'}]};
 if(k=='cs')return{t:'Connection status',i:[{l:'Fieldbus',v:()=>'No master'},...[[2,'DI1'],[3,'DI2'],[4,'DI3'],[5,'DI4']].map(([t,n])=>({l:n,v:()=>O.dv[t]?'1':'0'})),{l:'AI1',v:()=>(O.a1.raw||0).toFixed(2)+' '+O.a1.u},{l:'AI2',v:()=>(O.a2.raw||0).toFixed(2)+' '+O.a2.u},{l:'RO1',v:()=>O.ro?'On':'Off'}]};
 if(k=='ee')return{t:'Energy efficiency',i:[{l:'Saved energy (kWh)',v:()=>'n/a in sim'}]};
 if(k=='pr')return{t:'Parameters',i:[{l:'Complete parameter list',go:'pg'},{l:'Modified parameter list',go:'pm'},{l:'Parameter restore',fn:()=>{S.p={};S.pid=0;save();U.msg='Defaults restored'}}]};
 if(k=='pg')return{t:'Parameter groups',i:Object.keys(GR).map(n=>({l:n+' '+(GN[n]||''),go:'g'+n}))};
 if(k=='pm'){const m=Object.keys(S.p).filter(i=>PM[i]);return{t:'Modified',i:m.length?m.map(pi):[{l:'(none)'}]}}
 if(k[0]=='g')return{t:'Group '+k.slice(1),i:GR[k.slice(1)].map(pi)}}
function key(k){U.msg='';const cur_=U.v=='menu'?menu(U.st[U.st.length-1]):null,e=U.ed;
 if(k=='off'){S.m='Off';U.v=U.v=='msg'?'msg':'home';U.ed=null}
 else if(k=='ah'){U.v='sel';U.sel=S.m=='Auto'?'Auto':'Hand'}
 else if(U.v=='sel'){if(k=='l'||k=='r')U.sel=U.sel=='Auto'?'Hand':'Auto';if(k=='ok'){if(U.sel=='Hand'&&S.m!='Hand')S.hr=O.ref;S.m=U.sel;U.v='home'}if(k=='bk')U.v='home'}
 else if(U.v=='msg'){if(k=='ok'){resetF();if(!S.faults.length)U.v='home'}if(k=='bk')U.v=U.st.length?'menu':'home'}
 else if(U.v=='home'){if(k=='ok'){U.v='menu';U.st=['main'];U.ix=0}if(k=='bk'){U.v='opts';U.ix=0}}
 else if(U.v=='opts'){if(k=='u')U.ix=(U.ix+2)%3;if(k=='d')U.ix=(U.ix+1)%3;if(k=='bk')U.v='home';if(k=='ok'){if(U.ix==0){U.ed={id:'REF',val:S.hr};U.v='edit'}else if(U.ix==1)U.v='msg';else{U.st=['aw'];U.v='menu';U.ix=0}}}
 else if(U.v=='edit'){const p=e.id=='REF'?null:PM[e.id];
  if(k=='bk'){U.ed=null;U.v=e.id=='REF'?'home':'menu'}
  else if(p&&p[2]=='e'){const ks=Object.keys(p[3]).map(Number),i=ks.indexOf(+e.val);if(k=='u'||k=='r')e.val=ks[(i+1)%ks.length];if(k=='d'||k=='l')e.val=ks[(i+ks.length-1)%ks.length]}
  else{const rg=p?p[3][1]-p[3][0]:500,st=rg>=1000?1:rg<=1?.01:.1,m=(k=='l'||k=='r')?10:1;if(k=='u'||k=='r')e.val=Math.round((+e.val+st*m)*100)/100;if(k=='d'||k=='l')e.val=Math.round((+e.val-st*m)*100)/100}
  if(k=='ok'){if(e.id=='REF')S.hr=Math.max(0,+e.val);else setP(e.id,e.val);U.ed=null;U.v=e.id=='REF'?'home':'menu'}}
 else if(U.v=='menu'){const it=cur_.i;if(k=='u')U.ix=(U.ix+it.length-1)%it.length;if(k=='d')U.ix=(U.ix+1)%it.length;
  if(k=='bk'){U.st.pop();U.ix=0;if(!U.st.length)U.v='home'}
  if(k=='ok'){const x=it[U.ix];if(x.go){U.st.push(x.go);U.ix=0}else if(x.p){if(PM[x.p][2]!='r'){U.ed={id:x.p,val:g(x.p)};U.v='edit'}else U.msg='Read-only'}else if(x.fn)x.fn()}}
 save();paint()}
const wrap=(t,n)=>{const o=[];let l='';t.split(' ').forEach(w=>{if((l+w).length>n){o.push(l);l=''}l+=w+' '});o.push(l);return o};
function paint(){const L=[];
 if(U.v=='home'){L.push(`<b>${S.m}</b>  ${O.rev?'Rev':'Fwd'}`,'',`Target  ${O.ref.toFixed(1)} Hz`,`Actual  ${S.fr.toFixed(1)} Hz`,'',`<i>Options</i>     <i>Menu</i>`);if(S.faults.length)L.push('Fault: '+S.faults[0])}
 else if(U.v=='opts'){L.push('<b>Options</b>');['Reference value','Active faults','Active warnings'].forEach((x,i)=>L.push((U.ix==i?'▶ ':'  ')+x))}
 else if(U.v=='sel'){L.push('<b>Control location</b>','',(U.sel=='Hand'?'▶ ':'  ')+'Hand',(U.sel=='Auto'?'▶ ':'  ')+'Auto','','◀ ▶ select, OK confirm')}
 else if(U.v=='msg'){if(S.faults.length){const c=S.faults[0],f=F[c];L.push(`<b class=r>Fault ${c}</b>`,f[0],...wrap(f[1],26).slice(0,3),'OK = reset');if(ACT[c])L.push('(cause still present)')}else L.push('No active faults')}
 else if(U.v=='edit'){const e=U.ed,p=e.id=='REF'?null:PM[e.id];L.push('<b>'+(p?e.id+' '+p[1]:'Reference value')+'</b>','',p&&p[2]=='e'?'▶ '+(p[3][e.val]??e.val):'▶ '+e.val+' '+(p?p[5]||'':'Hz'),'',p&&p[2]=='n'?`range ${p[3][0]}…${p[3][1]}`:'',`default ${p?fmt(e.id,dflt(e.id)):''}`,'OK save   Back cancel')}
 else{const m=menu(U.st[U.st.length-1]);L.push('<b>'+m.t+'</b>');const n=U.ix,s=Math.max(0,Math.min(n-2,m.i.length-5));m.i.slice(s,s+5).forEach((x,j)=>L.push((s+j==n?'▶ ':'  ')+x.l+(x.v?' <i>'+x.v()+'</i>':'')))}
 if(U.msg)L.push('<i>'+U.msg+'</i>');H('#lcd',L.join('\n'));
 $('#led').className=S.faults.length?'led red':O.w.length?'led gb':O.run?'led grn':'led off';
 $('#stat').innerHTML=`<span>RO1 ${O.ro?'energized':'off'}</span><span>AO1 ${O.ao.toFixed(1)} ${O.aoU}</span><span>${O.cur.toFixed(1)} A</span><span>${O.rev?'reverse':'forward'}</span>`;$('#warn').textContent=O.w.join(' | ')}
// ---------- wiring ----------
const KIND={8:'d',9:'d',10:'d',11:'d',14:'a',15:'a',3:'s',4:'s',12:'c',21:'p'};
function opts(n){const k=KIND[n];let o=[['','Not wired']];
 if(k=='d')o.push(['c24','Contact to +24 V (T21)'],['c0','Contact to DGND (T22)']);
 if(k=='a'){o.push(['v','0…10 V signal (BAS)'],['a','4…20 mA signal'],['l','2-wire transmitter (loop from T21)']);if(n==14)o.push(['c24','DI5: contact to +24 V'],['c0','DI5: contact to DGND'])}
 if(k=='s')o.push(['s','Safety contact to S+ (24 V)']);
 if(k=='c')o=[['','Unwired (DIs read 0)'],['dgnd','Jumper to DGND: source / PNP'],['p24','Jumper to +24 V: sink / NPN']];
 if(k=='p')o.push(['loop','Loop supply to field devices']);
 o.push(['vs','Variable DC voltage source'],['cs','Variable current source']);return o}
function ctl(n){const k=S.w[n];if(!k)return'';
 if(['c24','c0','s'].includes(k))return`<label class=sw><input type=checkbox data-c=t${n} ${S.f['t'+n]?'checked':''}> contact closed</label>`;
 if(['v','a','l'].includes(k))return`<label class=sw>signal <input type=range min=0 max=100 data-a=a${n} value=${PC(n)}> <b id=vv${n}>${PC(n)}%</b></label>`;
 if(k=='vs'||k=='dgnd'&&0)return`<label class=sw>volts <input type=range min=0 max=30 step=.1 data-x=x${n} value=${X(n)}> <b id=vv${n}>${X(n).toFixed(1)} V</b></label>`;
 if(k=='cs')return`<label class=sw>mA <input type=range min=0 max=25 step=.1 data-x=x${n} value=${X(n)}> <b id=vv${n}>${X(n).toFixed(1)} mA</b></label>`;return''}
function wiring(){let h=`<h2>Control terminals</h2><p class=n>Every terminal takes a field device. Variable sources go 0–30 V DC or 0–25 mA. Function labels are the HVAC default macro.</p><div class=card><b>DI logic</b><small>Source (PNP): DCOM to DGND, contacts to +24 V. Sink (NPN): DCOM to +24 V, contacts to DGND. A DI reads 1 when the voltage between DI and DCOM is 15 V or more, 0 at 5 V or less (recalled, verify). STO reads 1 at 13 V or more (quick guide).</small><div class=row><button id=wdef class=g>Wire HVAC default</button><button id=wclr class=g>Clear field wiring</button></div></div>`;
 T.forEach(([n,nm,d,k])=>{h+=`<div class="tr"><span class=tn>${n}</span><span class=tl><b>${nm}</b><small>${d}</small><select data-t=${n}>${opts(n).map(([v,l])=>`<option value="${v}" ${(S.w[n]||'')==v?'selected':''}>${l}</option>`).join('')}</select>${ctl(n)}<small class=mz id=m${n}></small></span></div>`});
 h+=`<h2>Power wiring</h2><div class=tr><span class=tl><b>Input L1/L2/L3</b><select id=pwin><option value=ok ${S.pw.in=='ok'?'selected':''}>All three phases landed</option><option value=loss ${S.pw.in=='loss'?'selected':''}>One phase missing</option><option value=swap ${S.pw.in=='swap'?'selected':''}>Supply and motor leads swapped</option></select></span></div>
 <div class=tr><span class=tl><b>Motor T1/U T2/V T3/W</b><select id=pwmo><option value=uvw ${S.pw.mot=='uvw'?'selected':''}>U-V-W to T1-T2-T3</option><option value=uwv ${S.pw.mot=='uwv'?'selected':''}>Two leads swapped</option><option value=open ${S.pw.mot=='open'?'selected':''}>One lead not connected</option></select><small>Swapped leads or par 99.16 = UWV reverses rotation; both cancel out. Detection depends on 31.19, 31.21, 31.23.</small></span></div>`;H('#wiring',h);live()}
function meas(n){const k=S.w[n],V=volt(n),C=cur(n),o=O;
 if(n==21)return k=='vs'||k=='cs'?`${V??0} V applied to an output!`:'24.0 V (aux out)';if(n==23)return k=='vs'||k=='cs'?'External signal on 10 V output!':'10.0 V (ref out)';
 if(n==17)return`${o.ao.toFixed(2)} ${o.aoU} (drive output)`;if([22,13,16,2,27].includes(n))return k=='vs'?`${X(n).toFixed(1)} V applied to a common!`:'0 V (common)';
 if(n==1)return'24 V (STO supply)';if(n==6)return k=='vs'?`field supply ${X(6).toFixed(1)} V`:'common';
 if(n==7||n==5){const sup=S.w[6]=='vs'?X(6):null,cl=n==7?o.ro:!o.ro;return sup==null?`${n==7?'NO':'NC'}-COM ${cl?'closed':'open'}`:`${n==7?'NO':'NC'}: ${cl?sup.toFixed(1):'0.0'} V to load`}
 if(n==12)return S.w[12]=='dgnd'?'0 V (source / PNP)':S.w[12]=='p24'?'24 V (sink / NPN)':S.w[12]=='vs'?X(12).toFixed(1)+' V':'floating: DIs read 0';
 let s=V!=null?V.toFixed(1)+' V':C!=null?C.toFixed(1)+' mA':'floating';
 if(n>=8&&n<=11)s+=' → '+(o.dv[n-6]?'logic 1':'logic 0');if(n==14&&g('11.21')==0)s+=' → DI5 '+(o.dv[6]?'1':'0');
 if(n==14&&g('11.21')==1||n==15){const a=n==14?o.a1:o.a2;s+=` → raw ${(a.raw||0).toFixed(2)} ${a.u}, scaled ${(a.sc||0).toFixed(1)}${a.bad?' (type ≠ unit par)':''}`}
 if(n==3||n==4)s+=(V??0)>=13?' → STO ok':' → STO open';if((n==18||n==19||n==20||n==24)&&(k=='vs'||k=='cs'))s+=' (miswire)';return s}
function live(){T.forEach(([n])=>{const e=$('#m'+n);if(e)e.textContent='Measured: '+meas(n)})}
// ---------- params tab ----------
function plist(q=''){q=q.toLowerCase();let h='',last='';P.forEach(p=>{if(q&&!(p[0]+' '+p[1]+' '+(q.length>3?p[7]:'')).toLowerCase().includes(q))return;const gr=p[0].slice(0,2);if(gr!=last&&!q){h+=`<h3>${gr} ${GN[gr]||''}</h3>`;last=gr}
 h+=`<div class="pr ${p[0] in S.p?'mod':''}" data-p=${p[0]}><span><b>${p[0]}</b> ${p[1]}</span><em>${p[2]=='r'?'live':fmt(p[0],g(p[0]))}</em></div>`});H('#plist',h||'<p class=n>No match.</p>')}
function sheet(id){const p=PM[id],v=g(id);let body;
 if(p[2]=='r')body=`<b>${fmt(id,v)}${unitOf(p)}</b><small>Live read-only value from the simulated drive (values are only computed for the main signals; others show 0).</small>`;
 else body=(p[2]=='e'?`<select id=sv>${Object.entries(p[3]).map(([k,l])=>`<option value=${k} ${k==v?'selected':''}>[${k}] ${l}</option>`).join('')}</select>`:p[2]=='x'?`<input id=sv type=text value="${(+v).toString(16).toUpperCase().padStart(4,'0')}"><small>hex word</small>`:`<input id=sv type=number step=any value="${v}"><small>range ${p[8]||p[3][0]+'…'+p[3][1]}</small>`)+`<small>default: ${fmt(id,dflt(id))} (manual: ${p[11]})</small>`;
 const bits=p[10]?'<details><summary>Bits</summary>'+p[10].map(b=>`<small><b>b${b[0]}</b> ${b[1]}: ${b[2]}</small>`).join('')+'</details>':'';
 const sd=p[2]=='e'&&p[9]?'<details><summary>Selections</summary>'+Object.entries(p[3]).map(([k,l])=>`<small><b>${k}</b> ${l}${p[9][k]?': '+p[9][k]:''}</small>`).join('')+'</details>':'';
 H('#sheet',`<div class=card><h3>${id} ${p[1]}</h3><small class=dsc>${p[7]||''}</small>${body}${sd}${bits}<div class=row>${p[2]=='r'?'':'<button id=sok>Save</button><button id=sdef class=g>Default</button>'}<button id=scn class=g>Close</button></div></div>`);$('#sheet').hidden=0;
 if(p[2]!='r'){$('#sok').onclick=()=>{setP(id,$('#sv').value);$('#sheet').hidden=1;plist($('#q').value);paint()};$('#sdef').onclick=()=>{delete S.p[id];save();$('#sheet').hidden=1;plist($('#q').value);paint()}}$('#scn').onclick=()=>$('#sheet').hidden=1}
// ---------- faults / study ----------
let fq='';
function flist(){const q=fq.toLowerCase();let h='';Object.keys(F).sort().forEach(c=>{const f=F[c];if(q&&!(c+f[0]+f[3]).toLowerCase().includes(q))return;
 h+=`<details class=tr><summary><label class=sw2><input type=checkbox data-z=${c} ${S.cz[c]?'checked':''} ${f[3]=='event'?'disabled':''}> <b>${c} ${f[0]}</b> <small>${f[3]}${HP.includes(c)?' (Override: high priority)':''}</small></label></summary><div class=det><b>Cause</b><br>${f[1]}<br><b>What to do</b><br>${f[2]}${f[4]?'<br><small>Aux codes: '+f[4]+'</small>':''}</div></details>`});
 H('#flist',h||'<p class=n>No match.</p>')}
function faults(){H('#faults',`<div class=card><b>${S.faults.length?'Active: '+S.faults.map(c=>c+' '+F[c][0]).join(', '):'No active faults'}</b><button id=frst>Reset (OK in message view)</button><small id=fmsg></small></div><h2>Warnings, faults and events (${Object.keys(F).length})</h2><p class=n>All entries come from the firmware manual table. Switch a fault on to trip the drive, a warning on to raise it, then switch off and reset. STO, phase-loss and wiring faults also come from the Wiring tab and parameters 31.19 to 31.23. In Override mode only high-priority faults act. Tap an entry for cause and fix.</p><input id=fq type=search placeholder="Search code or name" value="${fq}"><div id=flist></div>`);flist()}
let sci=0;function study(res){const s=SC[sci];let h=`<h2>Practice scenarios</h2><select id=scs>${SC.map((x,i)=>`<option value=${i} ${i==sci?'selected':''}>${x.n}</option>`).join('')}</select><div class=card><p>${s.d}</p><small>Wire: ${Object.entries(s.w).map(([t,d])=>'T'+t+' '+({c24:'contact to 24 V',v:'0-10 V',a:'4-20 mA'}[d]||d)).join(', ')} (DCOM to DGND)<br>Set: ${Object.entries(s.p).map(([i,v])=>i+' = '+fmt(i,v)).join(', ')}</small>${s.hint?'<small>'+s.hint+'</small>':''}<div class=row><button id=chk>Check my setup</button><button id=ans class=g>Load answer</button></div>${res?'<div class=res>'+res+'</div>':''}</div>
 <h2>Drive and load</h2><label class=f>Drive model (460 V)<select id=mod>${MODELS.map((m,i)=>`<option value=${i} ${i==S.mod?'selected':''}>ACH180-04x-${m[0]}</option>`).join('')}</select></label><label class=f>Motor load ${S.ld}%<input type=range id=ld min=0 max=100 value=${S.ld}></label>
 <div class=row><button id=rst class=g>Restore factory defaults</button><button id=wipe class=g>Reset everything</button></div>
 <h2>ABB English documents</h2>${DOCS.map(([n,c])=>`<a class=doc target=_blank rel=noopener href="https://search.abb.com/library/Download.aspx?DocumentID=${c}&LanguageCode=en&DocumentPartId=1&Action=Launch">${n}<small>${c}</small></a>`).join('')}<p class=n>All 945 parameters and 170 warnings/faults/events come from firmware manual 3AXD50000955893 Rev B. Tap a parameter for its description, selections and bits. The simulation runs in the frequency domain, so many parameters are listed but have no effect.</p>`;H('#study',h)}
function check(){const s=SC[sci];let r='';const ok=b=>b?'✓ ':'✗ ';
 [8,9,10,11,14,15].forEach(t=>{const want=s.w[t]||'',have=S.w[t]||'';r+=ok(want==have)+'T'+t+': '+(have||'unwired')+(want==have?'':' (expected '+(want||'unwired')+')')+'<br>'});
 r+=ok(S.w[12]=='dgnd')+'DCOM to DGND (source)<br>';Object.entries(s.p).forEach(([i,v])=>r+=ok(g(i)==v)+i+' = '+fmt(i,g(i))+(g(i)==v?'':' (expected '+fmt(i,v)+')')+'<br>');study(r)}
// ---------- events ----------
document.addEventListener('click',e=>{const t=e.target.closest('[data-k],[data-p],[data-tab],#frst,#chk,#ans,#rst,#wipe,#wdef,#wclr');if(!t)return;
 if(t.dataset.k)key(t.dataset.k);else if(t.dataset.tab)tab(t.dataset.tab);else if(t.dataset.p)sheet(t.dataset.p);else if(t.id=='frst'){resetF();$('#fmsg').textContent=S.faults.length?'Cause still active: switch it off first.':'';faults()}
 else if(t.id=='chk')check();else if(t.id=='ans'){const s=SC[sci];S.p={...s.p};S.w={3:'s',4:'s',12:'dgnd',...s.w};Object.keys(s.w).forEach(n=>{if(['c24','c0'].includes(s.w[n]))S.f['t'+n]=0});save();study('Answer loaded.');plist();paint()}
 else if(t.id=='rst'){S.p={};save();plist();paint()}else if(t.id=='wipe'){if(confirm('Erase all simulator settings?')){S=fresh();save();location.reload()}}
 else if(t.id=='wdef'){S.w={3:'s',4:'s',12:'dgnd',8:'c24',10:'c24',11:'c24',14:'v'};S.f={...S.f,t3:1,t4:1,t11:1};save();wiring()}else if(t.id=='wclr'){S.w={};save();wiring()}});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset.t!==undefined){const n=+t.dataset.t;t.value?S.w[n]=t.value:delete S.w[n];if(t.value=='s'&&S.f['t'+n]===undefined)S.f['t'+n]=1;delete LP[n];save();wiring()}
 else if(t.dataset.c){S.f[t.dataset.c]=t.checked?1:0;save()}else if(t.dataset.z){S.cz[t.dataset.z]=t.checked;save()}
 else if(t.id=='pwin'){S.pw.in=t.value;save()}else if(t.id=='pwmo'){S.pw.mot=t.value;save()}else if(t.id=='scs'){sci=+t.value;study()}else if(t.id=='mod'){S.mod=+t.value;save();plist();paint()}});
document.addEventListener('input',e=>{const t=e.target;if(t.dataset.a){S.f[t.dataset.a]=+t.value;const n=t.dataset.a.slice(1);$('#vv'+n).textContent=t.value+'%'}else if(t.dataset.x){S.f[t.dataset.x]=+t.value;const n=t.dataset.x.slice(1);$('#vv'+n).textContent=(+t.value).toFixed(1)+(S.w[n]=='cs'?' mA':' V')}else if(t.id=='ld'){S.ld=+t.value;save()}else if(t.id=='q')plist(t.value);else if(t.id=='fq'){fq=t.value;flist()}});
function tab(n){document.querySelectorAll('main>section').forEach(s=>s.hidden=s.id!=n);document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.tab==n));if(n=='wiring')wiring();if(n=='faults')faults();if(n=='study')study()}
let last=performance.now();setInterval(()=>{const n=performance.now(),dt=Math.min(.5,(n-last)/1000);last=n;tick(dt);paint();if(!$('#wiring').hidden)live()},100);
setInterval(save,5000);
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
tick(.1);plist();tab('panel');
