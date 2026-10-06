import json,re
raw=json.load(open('raw_params.json'));rows=raw['rows'];fl=json.load(open('raw_faults.json'))
R={r['id']:r for r in rows}
def norm(s):return re.sub(r'[^a-z0-9]','',s.lower())
for _ in range(3):
    for r in rows:
        if not r['vals'] and not r['ranges']:
            m=re.search(r'Same as parameter (\d\d\.\d\d)',r['desc'])
            if m and R[m.group(1)]['vals']:r['vals']=R[m.group(1)]['vals']
RO={'01','03','05','06','07'}
def cap(s,n):
    s=s.strip();return s if len(s)<=n else s[:n].rsplit(' ',1)[0]+' …'
def cleanname(r):
    n=r['name']
    n=re.sub(r'\s*0000h…FFFFh$','',n)
    if r['id']=='04.40':n='Event word 1'
    return n.strip()
P=[];missing=[]
for r in rows:
    g=r['id'][:2];name=cleanname(r)
    vals=r['vals'];rt=' '.join(x['r'] for x in r['ranges']).strip()
    d0=r['def'].split(' / ')[0].strip()
    if vals:
        t='e';spec={str(v['v']):v['n'] for v in vals};sd={str(v['v']):cap(v['d'],200) for v in vals if v['d']}
        dv=None
        for v in vals:
            if norm(v['n'])==norm(d0):dv=v['v'];break
        if dv is None:
            for v in vals:
                if norm(d0) and norm(v['n']).startswith(norm(d0)[:6]):dv=v['v'];break
        if dv is None:
            m=re.match(r'^-?\d+$',d0);dv=int(d0) if m else vals[0]['v'];missing.append((r['id'],name,d0))
        unit='';df=dv
        if g in RO:t='r';spec=None
    else:
        sd=None;spec=None
        nums=re.findall(r'-?\d+(?:\.\d+)?',rt)
        h=re.match(r'^([0-9A-Fa-f]{4})h',d0)
        m=re.search(r'-?\d+(?:\.\d+)?',d0.replace(' ',''))
        unit=''
        if nums and len(nums)>=2:
            lo=float(nums[0]);hi=max(float(x) for x in nums[1:]);spec=[lo,hi]
            unit=re.sub(r'^.*\d\)?\s*','',rt).strip()
            unit=re.sub(r'[()]','',unit).strip()
        if h or 'h…' in r['name']:
            t='x';spec=[0,65535];df=int(h.group(1),16) if h else 0
        else:
            t='n'
            if spec is None:spec=[0,0]
            mm=re.match(r'^(-?\d+(?:\.\d+)?)',d0.replace(' ',''))
            df=float(mm.group(1)) if mm else 0
            if df==int(df):df=int(df)
        if g in RO or r['id'] in('04.40',):t='r'
        if g=='04' and r['id']>='04.41':t='n'
    row=[r['id'],name,t,spec,df,unit,'m',cap(r['desc'],650),cap(rt,120)]
    if sd:row.append(sd)
    else:row.append(None)
    row.append([[b['b'],b['n'],cap(b['d'],160)] for b in r.get('bits',[])] or None)
    row.append(r['def'])
    P.append(row)
print(len(P),'missing default matches',len(missing),missing[:15])
F={}
for e in fl:
    code=e['code'];nm=e['name'];aux=''
    m=re.search(r'\s(?=[0-9A-F]{4}\b|[0-9A-F]{4}…)',nm)
    ty='warning' if code[0]=='A' else 'event' if code[0]=='B' else 'fault'
    mm=re.match(r'^(.*?)\s+((?:[0-9A-F]{4}|[0-9A-F]{4}…[0-9A-F]{4})(?:\s.*)?)$',nm)
    if mm and not re.search(r'[a-z]',mm.group(2)):nm,aux=mm.group(1),mm.group(2)
    F[code]=[nm,cap(e['cause'],420),cap(e['fix'],700),ty,aux]
json.dump({'P':P,'F':F},open('built.json','w'),ensure_ascii=False)
import collections
print(collections.Counter(p[2] for p in P),collections.Counter(v[3] for v in F.values()))
IDS=['10.24','11.21','12.17','12.18','12.19','12.20','12.27','12.28','13.12','13.15','13.17','13.18','13.19','13.20','19.11','20.01','20.03','20.40','20.41','21.03','23.12','23.13','28.11','28.15','28.22','28.72','28.73','30.13','30.14','30.17','31.11','40.16','40.21','40.24','40.43','40.44','40.47','46.02','70.06','70.10','70.21','99.04','99.06','99.07','99.08','99.09','99.10','99.11','99.12']
PM={p[0]:p for p in P}
for i in IDS:
    p=PM.get(i);print(i,'-' if p is None else (p[1],p[2],p[3] if p[2]!='e' else '',p[4],p[5],'|',p[11]))
