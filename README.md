# Finance Master — Personal Life & Finance System

Premium navy + champagne-gold personal finance application.

## Current application
- Dashboard and transaction tracking for income and expenses.
- Loans given and debts owed, with monthly/yearly interest, payment allocation, payment history, and borrower share links.
- Savings goals, budgets, expense groups, payroll, and monthly/yearly reports.
- Per-record currency support for THB, MMK, USD, and SGD. Amounts are not converted or combined across currencies.
- Full JSON backup/restore and CSV exports.
- Firebase Authentication and private Firestore cloud sync for the designated Owner account.
- Google Sheets append-only backup integration (requires separate Apps Script setup).
- Responsive mobile and desktop UI.

## Data and infrastructure that must remain stable
- Firebase project: `finance-master-8d227`
- Local storage key: `finance-master-personal-v1`
- Owner email: `1987zinwaimin@gmail.com`
- Keep the existing Vercel project and production domains. Do not create a replacement project or change production aliases.
- Existing browser records are not automatically uploaded on first sign-in. The Owner must explicitly choose Upload or Download.

## Cloud security
- Finance documents are stored at `users/{uid}/finance/data`.
- Firestore rules limit this path to the designated Owner email and the matching authenticated UID.
- Borrower share-link and payment-request rules are separately defined in `firestore.rules`.
- Keep the Vercel Firebase Admin service-account credential in the Production environment only. Never commit service-account JSON or API secrets.

## Backup and restore
1. Export a full JSON backup before any manual cloud overwrite, restore, or migration.
2. Cloud Download exports the current device state before replacing it.
3. Cloud Upload exports the device state and, when an existing cloud document is replaced, downloads the prior cloud snapshot as a recovery file.
4. Backups include additional state fields, including Owner share-link data and custom expense-group settings.
5. THB, MMK, USD, and SGD remain in their original record currencies.

## Firebase setup
- Enable the Firebase Authentication provider used by the Owner account.
- Confirm the Owner account email matches the configured Owner email.
- Publish `firestore.rules` to project `finance-master-8d227` only after reviewing the rule changes and confirming the Owner can authenticate.
- Configure `FIREBASE_SERVICE_ACCOUNT` as a Vercel Production environment variable for the API routes that require Firebase Admin.

## Google Sheets backup setup
See `google-sheets-backup/README.md` and `google-sheets-backup/Code.gs`. Google Sheets is an additional append-only backup destination; Firebase remains the primary cloud database.

## Deployment workflow
- Pushes to non-production branches create Vercel Preview deployments.
- The `main` branch is the production deployment branch.
- Firestore rules are automatically published by the GitHub Actions workflow when `firestore.rules` or `firebase.json` changes on `main`.
- Test Preview deployments before merging changes to `main`.
- Keep the existing Vercel project and production domains unchanged.

## Known review items
- Payroll periods without a currency label are excluded from currency-specific report totals until reviewed in Settings.
- Net transaction surplus/deficit is based on recorded income and expense transactions; payroll is shown separately and is not silently deducted from transaction totals.
- Google Sheets automatic backup requires a deployed Apps Script Web App URL and its Script Properties to be configured.
