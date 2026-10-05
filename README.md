# ACH180 VFD Simulator

Phone-first study simulator for the ABB ACH180 HVAC drive. Plain HTML/CSS/JS, no build step, works offline once loaded.

## Put it on GitHub Pages
1. Create a repository and upload every file in this folder to the repository root (including the `icons` folder and `.nojekyll`).
2. Settings, Pages, deploy from branch `main`, folder `/ (root)`.
3. Open `https://<user>.github.io/<repo>/` in Safari on the iPhone, tap Share, then Add to Home Screen.

## What is simulated
- Integrated panel: Home, Options and Main menu (Motor data, Motor control, Diagnostics, Energy efficiency, Parameters), Auto/Hand/Off, reference editing, fault message view.
- Control terminals of the HVAC default macro: DI1 to DI5, AI1/AI2 (V or mA), AO1, RO1, STO S1/S2. Wire field devices, flip contacts, move analog signals.
- Power wiring: missing input phase, swapped supply/motor, swapped or missing motor leads.
- Parameters (about 60 from groups 10-99): enumerations, ranges, defaults, search, modified list, restore.
- Faults and warnings: inject causes, latch, trip, coast, reset (panel OK or a DI via 31.11).
- Four practice scenarios from the firmware manual application examples, with a checker.

## Limits (read this)
- The simulator runs in the frequency domain. Speed-reference groups, ID run, motor thermal models and fieldbus masters are not modeled.
- Default values marked with a circle in the Params tab were inferred from the manual's default I/O tables and need checking.
- The full parameter listing (firmware manual chapter 6) and fault table (chapter 7) were beyond what this build could read. Only parameters named in the quick guide and chapters 1-5 are included. Add more in `data.js` (`P` array) and `F` object.
- Not an ABB product. Do not use it in place of the manuals for real commissioning or safety work.

## Sources (English, ABB Library ACH180 link list dated 2026-09-16)
Firmware manual 3AXD50000955893 Rev B, hardware manual 3AXD50000955862, quick installation guide 3AXD50000955886 Rev C, user interface guide 3AXD50000955909, Assistant panel manual 3AUA0000085685. Full list with links is in the app (Study tab).
