# Finance Master — Personal Life & Finance System

Premium navy + champagne-gold responsive starter app.

## Included in this starter
- Responsive dashboard for phone and desktop
- Income and expense transactions with categories and search
- Loans given and debts owed
- Interest accrual estimate and separate principal/interest payment records
- Savings goals, budgets, reports
- JSON full backup/restore and CSV transaction export
- Local browser persistence

## Important current limitations
- This is a front-end starter, not a finished cloud-synced production finance system.
- Data is saved in this browser using localStorage. It does NOT yet sync between devices.
- Firebase Authentication and Firestore are not connected. Do not use it as the sole store for important financial records.
- Compound interest is saved as a setting but not calculated by this starter. Interest figures are estimates and should be verified against the agreed loan terms.
- No Firebase secret/service-account credentials are included.

## Preview locally
Open `index.html` in a modern browser.

## Deployment
Create a new GitHub repository named `finance-master`, upload `index.html` and this README to the `main` branch, then import that repository into Vercel. Keep one Vercel project and its production domain; every later push to `main` will update the same production URL. Vercel may create preview URLs for preview deployments, but the production URL stays assigned to the same project.

## Next required production steps
1. Create a Firebase project and register a Web App.
2. Configure Firebase Authentication (Google or email/password) and Firestore.
3. Implement per-user Firestore paths and strict security rules.
4. Migrate local data with an explicit, tested import and duplicate prevention.
5. Configure GitHub → Vercel auto-deploy and verify production alias.
6. Test backup/restore and interest/payment calculations with known test cases.
