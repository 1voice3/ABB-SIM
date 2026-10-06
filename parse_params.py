import pdfplumber,re,json,collections
pdf=pdfplumber.open('fw.pdf')
rows=[]  # per param
cur=None
grp={}
def clean(s):return re.sub(r'\s+',' ',s).strip()
def join(parts):
    out=''
    for p in parts:
        p=p.strip()
        if not p:continue
        if out.endswith('-') and not out.endswith(' -'): out=out[:-1]+p if out[-2:-1].isalpha() else out+p
        else: out=(out+' '+p).strip()
    return out
for pn in range(140,400):  # 0-based => pages 141..400
    pg=pdf.pages[pn]
    words=pg.extract_words(keep_blank_chars=False,use_text_flow=False,x_tolerance=1.0)
    hdr=[w for w in words if w['text']=='Name' and w['top']<140]
    dsc=[w for w in words if w['text']=='Description' and w['top']<140]
    dfn=[w for w in words if w['text']=='Def' and w['top']<140]
    if not(hdr and dsc and dfn):continue
    nx,dx,fx=hdr[0]['x0']-2,dsc[0]['x0']-2,dfn[0]['x0']-2
    ytop=max(w['bottom'] for w in words if w['top']<140 and w['text'] in('Selection','FbEq','16b','32b','Name','Type'))+1
    body=[w for w in words if w['top']>ytop and w['bottom']<pg.height-30]
    lines=collections.defaultdict(list)
    for w in body:lines[round(w['top']/3)].append(w)
    for k in sorted(lines):
        ws=sorted(lines[k],key=lambda w:w['x0'])
        idc=' '.join(w['text'] for w in ws if w['x1']<=nx+4 or w['x0']<nx-1)
        nm=join([w['text'] for w in ws if nx<=w['x0']<dx-1 and not(w['x0']<nx)])
        # words straddling columns: use x0
        ds=join([w['text'] for w in ws if dx-1<=w['x0']<fx])
        df=join([w['text'] for w in ws if w['x0']>=fx])
        # name col words that start before dx but are long: handled by x0
        mid=re.match(r'^(\d\d\.\d\d)$',idc.strip())
        grp_=re.match(r'^(\d\d)$',idc.strip())
        if mid:
            cur={'id':mid.group(1),'name':[nm],'desc':[ds],'def':[df],'vals':[],'ranges':[],'state':'head'};rows.append(cur);continue
        if grp_ and not mid:
            cur=None;grp[grp_.group(1)]={'name':nm,'desc':[ds]};cur2=grp[grp_.group(1)];grp['_cur']=grp_.group(1);continue
        if cur is None:
            g=grp.get('_cur')
            if g and ds:grp[g]['desc'].append(ds)
            continue
        isval=bool(re.fullmatch(r'-?\d+',df.strip())) and nm
        isrange=('=' in df and re.search(r'\d',df)) and ('...' in nm or re.search(r'\.\.\.|\d',nm))
        if isval:
            cur['state']='sel';cur['vals'].append({'v':int(df.strip()),'n':[nm],'d':[ds]});continue
        if isrange and cur['state']!='sel':
            cur['state']='rng';cur['ranges'].append({'r':[nm],'d':[ds],'f':df});continue
        mb=re.fullmatch(r'b(\d+)',idc.strip())
        if cur['state']=='head' and mb:
            cur.setdefault('bits',[]).append({'b':int(mb.group(1)),'n':[nm],'d':[ds]});continue
        if cur['state']=='head' and cur.get('bits') and not idc.strip() and not re.search(r'h…|h\.\.\.',nm) and not df.strip():
            bt=cur['bits'][-1]
            if nm:bt['n'].append(nm)
            bt['d'].append(ds);continue
        if cur['state']=='head':
            cur['name'].append(nm);cur['desc'].append(ds);cur['def'].append(df)
        elif cur['state']=='sel' and cur['vals']:
            v=cur['vals'][-1];v['n'].append(nm);v['d'].append(ds)
        elif cur['state']=='rng' and cur['ranges']:
            r=cur['ranges'][-1];r['r'].append(nm);r['d'].append(ds)
out=[]
for r in rows:
    r['name']=join(r['name']);r['desc']=join(r['desc']);r['def']=join(r['def'])
    for b in r.get('bits',[]):b['n']=join(b['n']);b['d']=join(b['d'])
    for v in r['vals']:v['n']=join(v['n']);v['d']=join(v['d'])
    for v in r['ranges']:v['r']=join(v['r']);v['d']=join(v['d'])
grp.pop('_cur',None)
for k in grp:grp[k]['desc']=join(grp[k]['desc'])
json.dump({'rows':rows,'grp':grp},open('raw_params.json','w'))
print(len(rows))
