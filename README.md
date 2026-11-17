# Finance Master

Finance Master is the Owner's personal finance workspace with a borrower Share Link portal and monthly payroll tools. The application uses a navy and champagne-gold interface and supports THB, MMK, USD and SGD as separate currencies. It never converts one currency into another automatically.

## Application structure

- `index.html` — Owner dashboard, income, expenses, savings, loans, debts, payments, budgets, reports, settings, borrower link management and Firebase cloud sync.
- `borrower.html` — Public token-based borrower portal.
- `payroll.js` — Monthly payroll, attendance and employee sharing.
- `payroll-employee.html` — Employee attendance page.
- `api/` — Server-side Firebase Admin endpoints for borrower-open notifications and push registration.
- `firestore.rules` — Firestore access rules for Owner finance data, borrower shares/messages/payment requests and payroll shares.
- `google-sheets-backup/Code.gs` — Optional append-only Google Sheets backup endpoint.

## Data and cloud architecture

- Local device storage key: `finance-master-personal-v1`. Do not rename or remove this key without a tested migration.
- Firebase project: `finance-master-8d227`.
- Owner sign-in: Firebase Email/Password Authentication, restricted in the application to the configured Owner Gmail.
- Main cloud document: `users/{uid}/finance/data`. Firestore rules restrict this document to the authenticated UID that owns it.
- Borrower Share Links use random tokens in `borrowerShares/{token}`; borrower access is limited by the Firestore rules.
- Firebase Admin API routes require the Vercel Production environment variable `FIREBASE_SERVICE_ACCOUNT`. Never commit service-account JSON or other credentials to GitHub.
- The current cloud-sync model stores the finance state in one Firestore document. The app now pauses before a conservative 850 KB payload threshold. Larger data volumes require a separately planned collection-based migration; do not split or migrate production records without a full backup and reconciliation plan.

## Backup and recovery

1. Export a full JSON backup before first cloud upload, manual cloud download, restore, or any planned migration.
2. Keep a second copy outside the device (for example, an owner-controlled Google Drive folder).
3. Cloud Download replaces current device state after confirmation; the app downloads a local JSON safety backup first.
4. Cloud Upload can replace the existing cloud document after confirmation; keep a separate backup of the existing cloud copy before replacing it.
5. Google Sheets backup is optional and one-way. Set up the Apps Script project using `google-sheets-backup/Code.gs`, configure Script Properties, initialize the spreadsheet, deploy the Web App, and save its `/exec` URL in Owner Settings. Verify each run in the spreadsheet's Backup History.

## Currency and financial calculations

- Each transaction, loan, debt, payment, savings record and budget keeps its own currency.
- THB, MMK, USD and SGD totals are reported separately. No exchange-rate conversion is applied.
- Legacy monthly payment targets were labelled THB in the earlier version. Existing targets without an explicit `monthlyTargetCurrency` are therefore treated as THB until the Owner reviews and corrects them.
- Payroll periods without an explicit currency are excluded from currency-specific reports and are shown as unclassified.
- Dashboard and Reports distinguish interest receivable (loans given) from interest payable (debts owed).
- Cash-flow metrics are transaction-only (income minus expenses); payroll and loan interest are shown separately and are not automatically subtracted to avoid double-counting payroll expenses.

## Production deployment

- Git repository: `1987zinwaimin-afk/finance-master`
- Keep the existing Vercel project and production domain: `finance-master-pied.vercel.app`.
- Do not change the Firebase project, Firestore document path, localStorage key or production domain as part of ordinary UI work.
- Preview deployments should be built and checked before changes are merged into the production branch.
- Add the production domain to Firebase Authentication → Settings → Authorized domains. The Owner Settings page references `finance-master-pied.vercel.app`.

## Safe change checklist

- Export a JSON backup before data-shape changes.
- Preserve unknown state fields when normalizing or restoring data.
- Never automatically replace a larger local dataset with a smaller cloud snapshot.
- Test simple interest, compound interest, same-day payments, interest-only payments, principal-only payments and historical dates with known expected values.
- Check THB and MMK separately, and confirm legacy currency labels before trusting combined reports.
- Verify Firestore rules in Firebase Console; a GitHub rules file does not prove that the rules have been published.
- Test Owner login, cloud sync, borrower Share Links, payroll and backup on a preview deployment before production release.
