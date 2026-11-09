/**
 * Finance Master — append-only Google Sheets backup endpoint.
 *
 * This is a separate backup destination. It does not write to Firebase or
 * alter the Finance Master app's localStorage records.
 *
 * Setup:
 * - Create a standalone Apps Script project and paste this file as Code.gs.
 * - Set Script Properties:
 *     FIREBASE_API_KEY       = the Firebase project's Web API key
 *     OWNER_EMAIL            = the Finance Master owner email
 *     AUTHORIZED_EMAILS      = optional comma-separated additional Firebase emails
 * - Run initializeBackupSheet() once while signed into the owner Google account.
 * - Deploy as a Web App. Execute as the deploying owner. Restrict access to
 *   authorized Google accounts and share the resulting spreadsheet accordingly.
 *
 * POST body (Content-Type text/plain):
 * { "idToken": "<Firebase ID token>", "snapshotId": "<unique id>",
 *   "state": { ...Finance Master state... } }
 */

const FM_HISTORY_SHEET = 'Backup History';
const FM_DATA_SHEET = 'Snapshot Data';
const FM_CHUNK_SIZE = 40000;

function initializeBackupSheet() {
  const props = PropertiesService.getScriptProperties();
  const ownerEmail = String(props.getProperty('OWNER_EMAIL') || '').trim().toLowerCase();
  if (!ownerEmail) throw new Error('Set OWNER_EMAIL in Script Properties first.');

  let spreadsheetId = props.getProperty('SPREADSHEET_ID');
  let spreadsheet;
  if (spreadsheetId) {
    spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  } else {
    spreadsheet = SpreadsheetApp.create('Finance Master — Backup Archive');
    spreadsheetId = spreadsheet.getId();
    props.setProperty('SPREADSHEET_ID', spreadsheetId);
  }

  let history = spreadsheet.getSheetByName(FM_HISTORY_SHEET);
  if (!history) history = spreadsheet.insertSheet(FM_HISTORY_SHEET);
  if (history.getLastRow() === 0) {
    history.appendRow(['Backup Time', 'Snapshot ID', 'Firebase Email', 'Firebase UID', 'Status', 'Chunk Count']);
    history.setFrozenRows(1);
  }

  let snapshots = spreadsheet.getSheetByName(FM_DATA_SHEET);
  if (!snapshots) snapshots = spreadsheet.insertSheet(FM_DATA_SHEET);
  if (snapshots.getLastRow() === 0) {
    snapshots.appendRow(['Snapshot ID', 'Chunk Number', 'Total Chunks', 'JSON Data']);
    snapshots.setFrozenRows(1);
  }

  const defaultSheet = spreadsheet.getSheetByName('Sheet1');
  if (defaultSheet && spreadsheet.getSheets().length > 2) spreadsheet.deleteSheet(defaultSheet);

  return spreadsheet.getUrl();
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const body = e && e.postData && e.postData.contents;
    if (!body) throw new Error('Request body is empty.');

    const payload = JSON.parse(body);
    if (!payload.idToken || !payload.snapshotId || !payload.state ||
        typeof payload.state !== 'object') {
      throw new Error('Missing or invalid idToken, snapshotId, or state.');
    }

    const firebaseUser = fmVerifyFirebaseIdToken_(String(payload.idToken));
    const email = String(firebaseUser.email || '').trim().toLowerCase();
    const props = PropertiesService.getScriptProperties();
    const ownerEmail = String(props.getProperty('OWNER_EMAIL') || '').trim().toLowerCase();
    const allowedEmails = String(props.getProperty('AUTHORIZED_EMAILS') || '')
      .split(',').map(function (value) { return value.trim().toLowerCase(); })
      .filter(function (value) { return value.length > 0; });

    if (!ownerEmail || (email !== ownerEmail && allowedEmails.indexOf(email) === -1)) {
      throw new Error('This Firebase account is not authorized to create backups.');
    }

    const spreadsheetId = props.getProperty('SPREADSHEET_ID');
    if (!spreadsheetId) throw new Error('Backup spreadsheet is not initialized.');
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const history = spreadsheet.getSheetByName(FM_HISTORY_SHEET);
    const snapshots = spreadsheet.getSheetByName(FM_DATA_SHEET);
    if (!history || !snapshots) throw new Error('Backup sheets are not initialized.');

    const snapshotId = String(payload.snapshotId).slice(0, 128);
    const existing = history.getRange(2, 2, Math.max(history.getLastRow() - 1, 1), 1)
      .createTextFinder(snapshotId).matchEntireCell(true).findNext();
    if (existing) return fmJson_({ ok: true, duplicate: true, snapshotId: snapshotId });

    const serialized = JSON.stringify(payload.state);
    const chunks = [];
    for (let i = 0; i < serialized.length; i += FM_CHUNK_SIZE) {
      chunks.push(serialized.substring(i, i + FM_CHUNK_SIZE));
    }
    if (chunks.length === 0) chunks.push('{}');

    const rows = chunks.map(function (chunk, index) {
      return [snapshotId, index + 1, chunks.length, chunk];
    });
    snapshots.getRange(snapshots.getLastRow() + 1, 1, rows.length, 4).setValues(rows);
    history.appendRow([new Date(), snapshotId, email, String(firebaseUser.localId || ''),
      'SUCCESS', chunks.length]);

    return fmJson_({ ok: true, snapshotId: snapshotId, chunks: chunks.length });
  } catch (error) {
    return fmJson_({ ok: false, error: String(error && error.message || error) });
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}

function fmVerifyFirebaseIdToken_(idToken) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('FIREBASE_API_KEY');
  if (!apiKey) throw new Error('FIREBASE_API_KEY is not configured in Script Properties.');

  const endpoint = 'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' +
    encodeURIComponent(apiKey);
  const response = UrlFetchApp.fetch(endpoint, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ idToken: idToken }),
    muteHttpExceptions: true
  });
  const status = response.getResponseCode();
  const result = JSON.parse(response.getContentText() || '{}');
  if (status !== 200 || !result.users || result.users.length !== 1) {
    throw new Error('Firebase ID token is invalid or expired.');
  }
  return result.users[0];
}

function fmJson_(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
