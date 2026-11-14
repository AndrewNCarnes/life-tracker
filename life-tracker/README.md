# Life Tracker Check-in

A phone-sized web app that walks through the **My Life Tracker** spreadsheet one question at a time at the end of the day: mood, energy, sleep, workout, habits, spending and a few lines of journaling. Sundays add the weekly reflection and next week's plan; month-end adds the life-area ratings and account balances.

It is a plain static site. There is no server, no account and no build step. Everything you log is stored on your own device, and this repository holds only the empty app.

## Put it on your iPhone

1. Create a repository on GitHub (for example `life-tracker`) and upload everything in this folder, keeping the `fonts`, `icons` and `vendor` folders as they are.
2. In the repository, open **Settings → Pages**. Under **Build and deployment**, set **Source** to *Deploy from a branch*, pick the `main` branch and the `/ (root)` folder, and save. After a minute or two the site is live at `https://<your-username>.github.io/<repository-name>/`.
3. On the iPhone, open that address in **Safari**. Tap **Share → Add to Home Screen** and leave *Open as Web App* turned on.
4. Open the app from its new icon and do the setup **there**. The icon keeps its own storage, separate from Safari, so anything set up in the Safari tab does not carry over.
5. On the setup screen choose one:
   - **Restore a backup** – pick a `life-tracker-backup-….json` file.
   - **Import your spreadsheet** – pick `My_Life_Tracker.xlsx`; the app reads your habits, budgets, accounts and past history from it.
   - **Start fresh** – add habits and budgets yourself.

For a nightly nudge, make a repeating reminder in the Reminders app ("Check-in", 9:30 PM, daily) and open the app from its icon. Don't use a Shortcut that opens the web address: that opens Safari, which has separate (empty) storage.

## Your data

- Entries live in the app's storage on the phone (IndexedDB). Nothing is sent anywhere.
- **Deleting the Home Screen icon deletes the entries.** The app asks for a backup once a week: *Data → Back up now* hands you one JSON file through the share sheet. Save it to iCloud Drive (or anywhere off the phone).
- *Data → Restore a backup* reads that file back in. Where a day exists in both the app and the file, the most recently edited version is kept, so restoring an old backup never overwrites newer entries.
- *Data → Get Excel file* builds a workbook with one tab per sheet of My Life Tracker, in the same column order, so the rows paste straight in. *Copy* does the same for a single sheet through the clipboard.
- Anything logged before 4 AM counts for the previous day.

## Changing the app

Everything is in `index.html` (markup, styles and script in one file). Edit it, push to GitHub, and the app picks up the new version the next time it is opened with a connection. It keeps working offline from the last version it saw.

| File | What it is |
|---|---|
| `index.html` | The whole app |
| `sw.js` | Service worker: offline copy and updates |
| `manifest.webmanifest` | Name, colors and icons for the Home Screen |
| `icons/` | App icons |
| `fonts/` | Newsreader, Schibsted Grotesk and JetBrains Mono (latin subsets) |
| `vendor/xlsx.full.min.js` | SheetJS, used to read and write `.xlsx` files |

If you replace a file inside `fonts/`, `icons/` or `vendor/` without renaming it, also change `VERSION` at the top of `sw.js` so phones fetch the new copy.

To try it on a computer, serve the folder over HTTP (for example `python -m http.server` inside it) and open `http://localhost:8000/`.

## Backup file format

```json
{
  "format": "life-tracker-backup",
  "version": 1,
  "savedAt": "2026-11-14T20:10:00.000Z",
  "app": { "config": {}, "history": {}, "meta": {} },
  "days":   { "2026-11-14": { "date": "2026-11-14", "mood": 7, "energy": 6, "sleep": 7.5, "habits": {}, "workouts": [], "spending": [], "highlight": "", "felt": "", "note": "", "done": true } },
  "weeks":  { "2026-11-09": { "weekOf": "2026-11-09", "reflection": {}, "plan": {} } },
  "months": { "2026-11":    { "month": "2026-11", "life": {}, "balances": {} } }
}
```

Weeks are keyed by their Monday. `config` holds habits, budget categories, quick-add purchases, workout types, life areas and account names. `history` holds what was imported from the spreadsheet (read-only reference for charts and "last session").

## Credits

- Fonts: Newsreader, Schibsted Grotesk and JetBrains Mono, each under the SIL Open Font License 1.1 (see `fonts/LICENSE-*.txt`).
- SheetJS Community Edition 0.18.5, Apache License 2.0 (see `vendor/LICENSE-SheetJS.txt`).
