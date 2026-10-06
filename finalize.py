import json,re
d=json.load(open('built.json'));P=d['P'];F=d['F']
RO=re.compile(r'(actual|status|delayed status|scaled value|^Override log|counter|^Event word)',re.I)
NOT=re.compile(r'(selection|force|configuration|function|word 1 bit|code|source|type|relay|enable)',re.I)
for p in P:
    n=re.sub(r'(\s+Reserved)+$','',p[1]).strip()
    if p[0]=='34.90':n='Exception day 16 - Timed function 1'
    p[1]=n
    g=p[0][:2]
    if p[2] in('x','n') and g not in('01','03','05','06','07'):
        if RO.search(n) and not NOT.search(n) and g in('04','10','11','12','13','32','34','35','37','40','41','45','58','70','96','06'):p[2]='r'
    if g=='04' and p[0]<'04.41':p[2]='r'
    if p[2]=='r':p[3]=None
    if p[2]=='x' and p[10] and p[0] in('06.19',):p[2]='r'
ro=[p[0]+' '+p[1] for p in P if p[2]=='r' and p[0][:2] not in('01','03','05','06','07','04')];print(len(ro),ro[:80])
GN={'01':'Actual values','03':'Input references','04':'Warnings and faults','05':'Diagnostics','06':'Control and status words','07':'System info','10':'Standard DI, RO','11':'Standard DIO, FI, FO','12':'Standard AI','13':'Standard AO','19':'Operation mode','20':'Start/stop/direction','21':'Start/stop mode','22':'Speed reference selection','23':'Speed reference ramp','24':'Speed reference conditioning','25':'Speed control','28':'Frequency reference chain','30':'Limits','31':'Fault functions','32':'Supervision','34':'Timed functions','35':'Motor thermal protection','36':'Load analyzer','37':'User load curve','40':'Process PID set 1','41':'Process PID set 2','43':'Brake chopper','45':'Energy efficiency','46':'Monitoring/scaling settings','47':'Data storage','49':'Panel port communication','58':'Embedded fieldbus','70':'Override','95':'HW configuration','96':'System','97':'Motor control','98':'User motor parameters','99':'Motor data'}
hand=open('hand_data.js').read()
out='// ACH180 simulator data. GENERATED from ABB ACH180 HVAC control program firmware manual 3AXD50000955893 Rev B (FW 2.20.0.0):\n// parameters (chapter 6, pp.141-395) and warning/fault/event table (chapter 7, pp.408-427). Do not hand-edit P or F; regenerate with the build scripts.\n'
out+='// P row: [id,name,type(e|n|x|r),spec(enum {value:name} or [min,max]),default,unit,source,description,range text,selection descriptions,bit list [[bit,name,desc]],default text]\n'
out+='const P='+json.dumps(P,ensure_ascii=False,separators=(',',':'))+';\n'
out+='// F: code -> [name,cause,what to do,type(fault|warning|event),aux codes]\nconst F='+json.dumps(F,ensure_ascii=False,separators=(',',':'))+';\n'
out+='const GN='+json.dumps(GN)+';\n'+hand
open('../data.js','w').write(out)
import os;print(os.path.getsize('ach180-sim/data.js'),'bytes',len(P),'params',len(F),'events')
