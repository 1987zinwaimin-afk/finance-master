# Finance Master Borrower Portal

## What is included
- \`borrower.html\`: read-only, borrower-specific share page.
- \`Borrower Portal\` page in \`index.html\`: create/copy/update/revoke share links and review payment requests.
- \`firestore.rules\`: Firestore rules preserving the existing \`users/{userId}/finance/{documentId}\` sync rule while adding restricted share-link and payment-request access.

## Required Firebase step before using the portal
The code and rules file are committed to GitHub, but Firestore rules are not deployed automatically by a GitHub commit. In Firebase Console:
1. Open project \`finance-master-8d227\`.
2. Go to **Build → Firestore Database → Rules**.
3. Back up/copy the currently published rules.
4. Replace the rules with the complete contents of \`firestore.rules\` in this repository and click **Publish**.
5. Test with an owner account and a borrower link before sending a real link.

Do not add a blanket \`allow read, write: if true\` rule. The rules allow a borrower to GET only a specific active, high-entropy share document; borrowers cannot list links, update loans, or read/write payment requests. A borrower can create a payment request tied to the account in that token. Only the authenticated owner can read/review requests.

## How to use
1. Sign in to Finance Master as the owner and wait for cloud sync to connect.
2. Open **Borrower Portal** in the left navigation (or mobile More menu).
3. Select one account under **Loans Given** and create a private share link.
4. Send the copied URL only to that borrower.
5. The borrower can view the shared snapshot and filter the interest ledger/payment history by month.
6. A payment request appears in the owner's **Payment requests & notifications** section. Approving it adds a payment to the existing Payment History and updates the share snapshot. Rejecting it leaves the ledger unchanged.
7. Use **Update snapshot** after other manual changes to a loan, and **Revoke link** to disable access.

## Safety notes
- Existing Finance Master records, localStorage key \`finance-master-personal-v1\`, Firebase project ID, and production URL are not changed by these features.
- Borrower access is a bearer link: anyone who receives the URL can view that borrower's shared account. Treat it as private and revoke it if forwarded incorrectly.
- The portal displays the account snapshot created/last updated by the owner. Changes to the loan outside an approved borrower payment need **Update snapshot** to appear in the shared view.
- Owner approval is required before a borrower request changes the official Payment History.
