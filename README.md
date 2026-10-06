# ACH180 VFD Simulator (v2)

Phone-first study simulator for the ABB ACH180 HVAC drive. Plain HTML/CSS/JS, no build step, works offline once loaded. Unofficial, not affiliated with ABB.

## Put it on GitHub Pages
1. Create a repository and upload every file in this folder to the repository root (including `icons/` and `.nojekyll`).
2. Settings, Pages, deploy from branch `main`, folder `/ (root)`.
3. Open `https://<user>.github.io/<repo>/` in Safari on the iPhone, tap Share, then Add to Home Screen.

## What is simulated
- **Panel:** Home, Options and Main menu, Auto/Hand/Off, reference editing, fault message view, full parameter browser (groups, modified list, restore).
- **Every control terminal (28) takes a field device**, including a variable DC voltage source (0-30 V) and variable current source (0-25 mA) on any terminal. A live "Measured" line shows what a meter would read at each terminal.
- **Sink and source DI wiring:** DCOM to DGND (source/PNP) or DCOM to +24 V (sink/NPN), contacts to +24 V or DGND, or variable voltage on a DI. Wrong polarity reads 0. DI thresholds: 15 V or more = 1, 5 V or less = 0 (recalled, verify).
- **Analog:** AI1/AI2 as 0-10 V, 4-20 mA, 2-wire loop-powered transmitter (needs T21 loop supply), or variable source. Unit mismatch, min/max scaling, filter time. AO1 scaling. RO1 with an external field supply on COM, measured at NO/NC.
- **STO:** S1/S2 read 1 at 13 V or more (quick guide). 31.22 chooses fault or warning.
- **Behaviors:** interlocks and run permissive, constant frequencies, EXT1/EXT2, process PID with sleep and wake-up, critical frequencies, Override mode (70.xx) with high/low priority faults and autoreset, ramps and stop modes, phase-loss and wiring faults gated by 31.19/31.21/31.23, DI-based fault reset (31.11).
- **Parameters:** all 945 from the manual, searchable by number, name or description, with selection lists, bit lists and full descriptions per parameter.
- **Study:** five scenarios from the firmware manual examples with a checker.

## Data source
`data.js` is generated from the ABB ACH180 HVAC control program firmware manual 3AXD50000955893 Rev B (firmware 2.20.0.0): all 945 parameters (chapter 6: names, ranges, units, defaults, selections with descriptions, bit lists, descriptions) and all 170 warning/fault/event entries (chapter 7: cause and what to do). The 50 Hz / 60 Hz default table (pp.396-397) is applied from the Unit selection. The 60 Hz default for 30.13 is printed as 60.00 in the manual; -60 is used here, matching the 50 Hz value of -50.

## Limits (read this)
- Simulation runs in the frequency domain. Most parameters are browsable and editable but have no effect: speed control, ID run, motor thermal models, timed functions, brake chopper, adaptive programs, fieldbus masters, load analyzer and others are not modeled.
- Live read-only values are computed only for the main signals (01.xx, 06.11, 06.16, 10.01/10.02, 12.11/12.12/12.21/12.22, 13.11, 40.01-40.04 and a few more); other read-only parameters show 0.
- Drive-dependent defaults (99.06 current, 99.10 power, 30.17 current limit) come from the quick installation guide ratings for the model you pick, not from the parameter table.
- The DI logic thresholds (15 V / 5 V) are recalled, not from the manual. The STO threshold (13 V) is from the quick installation guide.
- Not a substitute for the ABB manuals in real commissioning or safety work.

## Regenerating data.js
The `tools/` folder has the scripts that extract the tables from the PDF (`parse_params.py`, `parse_faults.py`, `build.py`, `finalize.py`, `hand_data.js`). Place the manual as `fw.pdf` next to them and run them in that order (needs Python with pdfplumber). Hand-written simulator constants (terminals, models, scenarios) live in `hand_data.js`.

## Sources (English, ABB Library ACH180 link list dated 2026-09-16)
Firmware manual 3AXD50000955893 Rev B, hardware manual 3AXD50000955862, quick installation guide 3AXD50000955886 Rev C, user interface guide 3AXD50000955909, Assistant panel manual 3AUA0000085685. Full list with links is in the app (Study tab).
