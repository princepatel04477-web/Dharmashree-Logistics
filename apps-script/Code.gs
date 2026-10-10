/* DharmaShree Logistics — quote, delivery-partner and message intake (Prompts 08
   and 13, and the "Send us a message" box).

   Bound to a Google Sheet ("DharmaShree Quotes"); each submission appends one
   row and emails the desk. Deployed as a Web App so the site can POST to it
   without a backend of its own. Setup steps: apps-script/README.md.

   The client deliberately sends `Content-Type: text/plain;charset=utf-8` with a
   JSON string body: that is a CORS-simple request, so the browser never sends
   the preflight OPTIONS that Apps Script cannot answer. Parsing here does not
   care about the declared type — JSON.parse reads the string either way.

   The same endpoint also takes delivery-partner applications from /partners:
   a body with kind === 'partner' is appended to the 'Partners' tab instead and
   mailed with its own subject. It shares the honeypot and clean_().

   Messages from the contact page and the footer arrive the same way with
   kind === 'message': appended to the 'Messages' tab (created with its header
   row on the first message) and mailed as a "Website message". A body with no
   kind is a quote, exactly as before.

   Everything written to the sheet goes through clean_() (length-capped, and
   prefixed when it would otherwise start a formula), and the honeypot field
   returns ok without touching the sheet. */

const SHEET_NAME = 'Quotes';
const NOTIFY_EMAIL = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
const PARTNER_SHEET_NAME = 'Partners';
const PARTNER_HEADERS = ['Received at','Reference','Name','Phone','City','Vehicle','Availability','Source page'];
const MESSAGE_SHEET_NAME = 'Messages';
const MESSAGE_HEADERS = ['Received at','Reference','Name','Phone','Email','Message','Source page'];
const HEADERS = ['Received at','Reference','Name','Company','Phone','Email','Service','From','To','Load type','Approx weight (kg)','Vehicle','Pickup date','Notes','Source page'];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.website) return json_({ ok: true }); // honeypot
    if (body.kind === 'partner') return savePartner_(body);
    if (body.kind === 'message') return saveMessage_(body);
    const required = ['name','phone','service','from','to'];
    for (const k of required) { if (!body[k] || String(body[k]).trim() === '') return json_({ ok: false, error: 'Missing ' + k }); }
    const sheet = getSheet_();
    const ref = 'DSL-' + Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyMMdd') + '-' + Math.floor(1000 + Math.random() * 9000);
    const row = [
      Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm'), ref,
      clean_(body.name), clean_(body.company), clean_(body.phone), clean_(body.email),
      clean_(body.service), clean_(body.from), clean_(body.to), clean_(body.loadType),
      clean_(body.weightKg), clean_(body.vehicle), clean_(body.pickupDate), clean_(body.notes), clean_(body.sourcePage)
    ];
    sheet.appendRow(row);
    if (NOTIFY_EMAIL) {
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: 'New quote request ' + ref + ' — ' + clean_(body.from) + ' → ' + clean_(body.to),
        body: HEADERS.map(function (h, i) { return h + ': ' + row[i]; }).join('\n'),
        replyTo: body.email ? String(body.email) : undefined
      });
    }
    return json_({ ok: true, reference: ref });
  } catch (err) {
    return json_({ ok: false, error: 'Server error' });
  }
}

function savePartner_(body) {
  const partnerRequired = ['name','phone','city','availability'];
  for (const k of partnerRequired) { if (!body[k] || String(body[k]).trim() === '') return json_({ ok: false, error: 'Missing ' + k }); }
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(PARTNER_SHEET_NAME);
  if (!sheet) { sheet = ss.insertSheet(PARTNER_SHEET_NAME); sheet.appendRow(PARTNER_HEADERS); sheet.setFrozenRows(1); }
  const ref = 'DSP-' + Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyMMdd') + '-' + Math.floor(1000 + Math.random() * 9000);
  const row = [
    Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm'), ref,
    clean_(body.name), clean_(body.phone), clean_(body.city), clean_(body.vehicle),
    clean_(body.availability), clean_(body.sourcePage)
  ];
  sheet.appendRow(row);
  if (NOTIFY_EMAIL) {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: 'New delivery partner application ' + ref + ' — ' + clean_(body.city),
      body: PARTNER_HEADERS.map(function (h, i) { return h + ': ' + row[i]; }).join('\n')
    });
  }
  return json_({ ok: true, reference: ref });
}

function saveMessage_(body) {
  const messageRequired = ['name','phone','message'];
  for (const k of messageRequired) { if (!body[k] || String(body[k]).trim() === '') return json_({ ok: false, error: 'Missing ' + k }); }
  // The client sends E.164: +91 and a ten-digit mobile. Checking the shape here also makes the phone safe to write as it is.
  const phone = String(body.phone).trim();
  if (!/^\+91[6-9]\d{9}$/.test(phone)) return json_({ ok: false, error: 'Invalid phone' });
  const email = body.email ? String(body.email).trim() : '';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ref = 'DSM-' + Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyMMdd') + '-' + Math.floor(1000 + Math.random() * 9000);
  const row = [
    Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm'), ref,
    clean_(body.name), phone, clean_(email), clean_(body.message), clean_(body.sourcePage)
  ];
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    let sheet = ss.getSheetByName(MESSAGE_SHEET_NAME);
    if (!sheet) { sheet = ss.insertSheet(MESSAGE_SHEET_NAME); sheet.appendRow(MESSAGE_HEADERS); sheet.setFrozenRows(1); }
    sheet.appendRow(row);
    // Keep the phone as plain text: Sheets would otherwise read a leading + as a number or a formula.
    sheet.getRange(sheet.getLastRow(), 4).setNumberFormat('@').setValue(phone);
  } finally {
    lock.releaseLock();
  }
  if (NOTIFY_EMAIL) {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: 'Website message ' + ref + ' — ' + clean_(body.name),
      body: MESSAGE_HEADERS.map(function (h, i) { return h + ': ' + row[i]; }).join('\n'),
      replyTo: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : undefined
    });
  }
  return json_({ ok: true, reference: ref });
}

function doGet() { return json_({ ok: true, service: 'dharmashree-quotes' }); }

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) { sheet = ss.insertSheet(SHEET_NAME); sheet.appendRow(HEADERS); sheet.setFrozenRows(1); }
  return sheet;
}

function clean_(v) { if (v === undefined || v === null) return ''; const s = String(v).trim().slice(0, 1000); return /^[=+\-@]/.test(s) ? "'" + s : s; }

function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
