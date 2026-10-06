import pdfplumber,re,json,collections
pdf=pdfplumber.open('fw.pdf')
def join(parts):
    out=''
    for p in parts:
        p=p.strip()
        if not p:continue
        out=(out[:-1]+p) if out.endswith('-') and len(out)>1 and out[-2].isalpha() else (out+' '+p).strip()
    return out
ev=[];cur=None
for pn in range(407,429):
    pg=pdf.pages[pn];ws=pg.extract_words(x_tolerance=1.0)
    hc=[w for w in ws if w['text']=='Code' and w['top']<140];hn=[w for w in ws if w['text']=='Cause' and w['top']<140];hw=[w for w in ws if w['text']=='What' and w['top']<140]
    if not(hc and hn and hw):continue
    cx,nx,wx=hc[0]['x0']-2,hn[0]['x0']-2,hw[0]['x0']-2
    ys=[w for w in ws if w['top']<140];ytop=max(w['bottom'] for w in ys if w['text'] in('Aux.','code','(hex)','Cause','What','do','to','Event','name','/'))+1
    # name col starts after code col: find x of 'Event'
    he=[w for w in ws if w['text']=='Event' and w['top']<140];ex=he[0]['x0']-2
    body=[w for w in ws if w['top']>ytop and w['bottom']<pg.height-35]
    lines=collections.defaultdict(list)
    for w in body:lines[round(w['top']/3)].append(w)
    for k in sorted(lines):
        l=sorted(lines[k],key=lambda w:w['x0'])
        code=' '.join(w['text'] for w in l if w['x0']<ex)
        nm=join([w['text'] for w in l if ex<=w['x0']<nx]);ca=join([w['text'] for w in l if nx<=w['x0']<wx]);wd=join([w['text'] for w in l if w['x0']>=wx])
        if re.fullmatch(r'[0-9A-F]{4}',code.strip()):
            cur={'code':code.strip(),'name':[nm],'cause':[ca],'fix':[wd]};ev.append(cur)
        elif cur:
            cur['name'].append(nm);cur['cause'].append(ca);cur['fix'].append(wd)
for e in ev:
    for k in('name','cause','fix'):e[k]=join(e[k])
json.dump(ev,open('raw_faults.json','w'))
print(len(ev));
for e in ev[:3]+ev[-3:]:print(json.dumps(e)[:400])
print([e['code']+' '+e['name'][:25] for e in ev if e['code'] in('2310','5091','A5A0','B5A0','FA81','AFF6','7081','64A6','FF61','A2B1','AF85')])
