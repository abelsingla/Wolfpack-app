# Wolfpack Campaign Log

A small local web app for logging a GMT Wolfpack campaign. It tracks the campaign sheet, patrol outcomes, U-boat crew experience, enhancements, losses, refit, and post-patrol casualty effects.

## Main Functionality

- Create, switch, import, export, and delete saved campaigns using browser local storage.
- Configure campaign type: full campaign, early war campaign, single war period, or single patrol.
- Track the official campaign months, War Period VP targets, and cumulative U-boat loss limits.
- Initialize available U-boats with the rulebook starting XP and tonnage by flotilla slot.
- Maintain the campaign log status codes: `C`, `R`, `S`, `Sc`, `Cp`, `P`, `N`, and patrol designations `W/X/Y/Z`.
- Log end-of-patrol results per U-boat: VP, tonnage, escorts, TP purchases, XP-to-FP conversion, damage, flooding, engine damage, refit reduction, and notes.
- Calculate XP from tonnage, return-to-base, scuttled crew return, and damaged/sunk escorts.
- Calculate refit months from flooding, heavy diesel/electric damage, Chief Engineer repair enhancement, and optional FP reduction.
- Track Officer and Crew Section enhancements, prerequisites, XP costs, and automatic 100k-ton upgrades.
- Handle Crew Section wound totals and post-patrol enhancement loss or free Crew Section enhancement.
- Handle Officer KIA/captured/lost and Heavy Wounds replacement results by erasing the correct Officer enhancement track.
- Handle Captain loss and 1st WO promotion by moving 1st WO enhancements to the Captain track.
- Handle sunk/captured U-boats by clearing XP and all enhancements.
- Handle scuttled U-boats with surviving crew by preserving a survivor record for later reassignment.
- Track replacement U-boat notes and VP penalty.
- Show a Rules Helper with the Approach and Attack patrol sequence.

## Running Locally

Install dependencies:

```bash
pnpm install
```

Start the app:

```bash
pnpm run dev
```

Build a static version:

```bash
pnpm run build
```

The app stores data in the browser. Use the export/import buttons to share or back up campaign JSON.
