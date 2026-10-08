/* DharmaShree Logistics — quote intake (Prompt 08).

   Bound to a Google Sheet ("DharmaShree Quotes"); each submission appends one
   row and emails the desk. Deployed as a Web App so the site can POST to it
   without a backend of its own. Setup steps: apps-script/README.md.

   The client deliberately sends `Content-Type: text/plain;charset=utf-8` with a
   JSON string body: that is a CORS-simple request, so the browser never sends
   the preflight OPTIONS that Apps Script cannot answer. Parsing here does not
   care about the declared type — JSON.parse reads the string either way.

   Everything written to the sheet goes through clean_() (length-capped, and
   prefixed when it would otherwise start a formula), and the honeypot field
   returns ok without touching the sheet. */

const SHEET_NAME = 'Quotes';
const NOTIFY_EMAIL = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
const HEADERS = ['Received at','Reference','Name','Company','Phone','Email','Service','From','To','Load type','Approx weight (kg)','Vehicle','Pickup date','Notes','Source page'];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.website) return json_({ ok: true }); // honeypot
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

function doGet() { return json_({ ok: true, service: 'dharmashree-quotes' }); }

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) { sheet = ss.insertSheet(SHEET_NAME); sheet.appendRow(HEADERS); sheet.setFrozenRows(1); }
  return sheet;
}

function clean_(v) { if (v === undefined || v === null) return ''; const s = String(v).trim().slice(0, 1000); return /^[=+\-@]/.test(s) ? "'" + s : s; }

function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
