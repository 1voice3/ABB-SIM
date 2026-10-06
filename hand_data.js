// ---- hand-written simulator data ----
const MODELS=[['01A8-4',1.6,2.2,.75],['02A6-4',2.1,3.3,1],['03A3-4',3,4.3,1.5],['04A0-4',3.5,5.9,2],['05A6-4',4.8,7.2,3],['07A2-4',6,10,3],['09A4-4',7.6,13,5],['12A6-4',11,16.9,7.5],['17A0-4',14,22.7,10],['25A0-4',21,30.6,15],['033A-4',27,45,20],['038A-4',34,57.6,25],['045A-4',40,68.4,30],['050A-4',42,81,30]];
// Defaults that depend on supply frequency (fw manual p.396-397): [50 Hz, 60 Hz]. 30.13 at 60 Hz is printed as 60.00 in the manual; -60 used here.
const D60={'11.45':[1500,1800],'12.20':[50,60],'13.18':[50,60],'22.26':[300,360],'22.27':[600,720],'22.28':[900,1080],'22.29':[1200,1440],'22.30':[1500,1800],'22.31':[2400,2880],'22.32':[3000,3600],'28.26':[5,6],'28.27':[10,12],'28.28':[15,18],'28.29':[20,24],'28.30':[25,30],'28.31':[40,48],'28.32':[50,60],'30.11':[-1500,-1800],'30.12':[1500,1800],'30.13':[-50,-60],'30.14':[50,60],'31.26':[150,180],'31.27':[15,18],'31.30':[500,500],'46.01':[1500,1800],'46.02':[50,60]};
const T=[
[21,'24V','+24 V DC aux out, max 200 mA','x'],[22,'DGND','Aux voltage common','x'],
[8,'DI1','Stop (0) / Start (1)','d'],[9,'DI2','Not configured','d'],[10,'DI3','Constant frequency selection','d'],[11,'DI4','Start interlock 1 (1 = allow start)','d'],
[12,'DCOM','Digital input common (sink/source)','c'],[18,'DO','Digital output (not energized)','x'],[19,'DO COM','Digital output common','x'],[20,'DO SRC','Digital output aux voltage','x'],
[5,'NC','Relay output 1: normally closed','x'],[6,'COM','Relay output 1: common','x'],[7,'NO','Relay output 1: normally open (damper)','x'],
[14,'AI1/DI5','Speed/frequency reference (0…10 V)','a'],[13,'AGND','Analog input common','x'],[15,'AI2','Not used','a'],[16,'AGND','Analog output common','x'],
[17,'AO','Output frequency (0…20 mA)','x'],[23,'10V','+10 V DC reference out','x'],[24,'SCREEN','Signal cable shield','x'],
[1,'S+','STO supply','x'],[2,'SGND','STO ground','x'],[3,'S1','STO channel 1','s'],[4,'S2','STO channel 2','s'],
[25,'B+','EIA-485 Modbus RTU','x'],[26,'A-','EIA-485 Modbus RTU','x'],[27,'DGND','EIA-485 ground','x'],[28,'SHIELD','EIA-485 shield','x']];
// High-priority faults in Override mode (fw manual p.86)
const HP=['2310','2330','2340','3210','4981','5090','5091','7122','FA81','FA82'];
const DOCS=[['ACH180 drives firmware manual','3AXD50000955893'],['ACH180 drives hardware manual','3AXD50000955862'],['ACH180 drives user interface guide','3AXD50000955909'],['ACH180 drives quick installation and start-up guide','3AXD50000955886'],['ACS-AP / ACH-AP Assistant control panels user\'s manual','3AUA0000085685'],['Drive Composer 3 PC tool user\'s manual','3AXD50001210588'],['Drive Composer PC tool user\'s manual','3AUA0000094606'],['UL Type 1 kit, frames R0-R2','3AXD50001302955'],['UL Type 1 kit, frames R3-R4','3AXD50000242375'],['DPMP-01 mounting platform installation guide','3AUA0000100140'],['DPMP-02/03 mounting platform installation guide','3AUA0000136205'],['Recycling instructions','3AXD50000613342'],['Capacitor reforming instructions','3BFE64059629']];
const SC=[
{n:'Supply fan, basic speed follower',d:'BAS start contact on DI1, 0-10 V speed on AI1. No safeties, no feedback.',w:{8:'c24',14:'v'},p:{'10.24':0,'13.12':0,'20.41':0,'22.22':0,'28.22':0}},
{n:'Supply fan with interlock and status',d:'Adds a duct high-static safety on DI4 and run status on RO1.',w:{8:'c24',11:'c24',14:'v'},p:{'10.24':7,'13.12':0,'22.22':0,'28.22':0}},
{n:'Supply fan, complete integration',d:'Damper end switch on DI2 (run permissive), smoke alarm DI3 (interlock 2), overpressure DI4, damper relay, AO frequency.',w:{8:'c24',9:'c24',10:'c24',11:'c24',14:'v'},p:{'20.40':3,'20.42':4,'22.22':0,'28.22':0}},
{n:'Cooling tower fan, speed follower',d:'4-20 mA speed on AI1, vibration switch on DI4, run status RO1, 30 Hz minimum.',w:{8:'c24',11:'c24',14:'a'},p:{'10.24':7,'12.15':10,'13.12':0,'22.22':0,'28.22':0,'30.13':30},hint:'The manual list does not set AI1 min (12.17). Try 4 mA and watch the reference change.'},
{n:'Override: single frequency (smoke control)',d:'DI5 = Override input, DI4/DI3/DI2 safeties, AI2 0-10 V normal speed, Override runs 48 Hz.',w:{8:'c24',9:'c24',10:'c24',11:'c24',14:'c24',15:'v'},p:{'10.24':7,'11.21':0,'12.25':2,'13.12':0,'20.42':4,'20.43':3,'22.22':0,'28.11':2,'28.22':0,'70.02':2,'70.03':5,'70.04':3,'70.06':48,'70.10':6,'70.20':1}}];
