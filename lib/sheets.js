// Push generated insights to a Google Sheet using a service account.
// Requires env vars: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID
const { google } = require('googleapis');

async function getSheetsClient() {
  const auth = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  await auth.authorize();
  return google.sheets({ version: 'v4', auth });
}

async function syncInsightsToSheet(insights) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    console.log('GOOGLE_SHEET_ID not set, skipping sheet sync.');
    return;
  }
  const sheets = await getSheetsClient();
  const header = [
    'Date','Region','Company','Segment','Buying Signal','Score','Outreach Angle',
    'Suggested Role','Prospect Name','Prospect Title','LinkedIn URL','Business Email',
    'Email Status','Headline','Source Link'
  ];
  const rows = insights.map(i => [
    new Date().toISOString().split('T')[0],
    i.region, i.company, i.segment, i.buyingSignal, i.signalScore, i.outreachAngle,
    i.prospectRoleSuggestion,
    i.prospectName || '', i.prospectTitle || '', i.linkedinUrl || i.linkedinSearchUrl || '',
    i.businessEmail || '', i.emailStatus || '',
    i.headline, i.link
  ]);

  // Ensure header exists (only writes once; safe to call repeatedly)
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: 'Sheet1!A1',
    valueInputOption: 'RAW',
    requestBody: { values: [header] }
  });

  // Append new rows below existing data (keeps historical daily log)
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Sheet1!A2',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: rows }
  });

  console.log(`Synced ${rows.length} rows to Google Sheet.`);
}

module.exports = { syncInsightsToSheet };