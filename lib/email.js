import { BrevoClient } from '@getbrevo/brevo';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// ─── Brevo client (lazy singleton) ───────────────────────────────────────────
let _brevoClient = null;
function getBrevoClient() {
  if (!_brevoClient) {
    _brevoClient = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
  }
  return _brevoClient;
}

const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'pecdatascienceclub@gmail.com';
const SENDER_NAME  = process.env.BREVO_SENDER_NAME  || 'PEC Data Science Club';
const SITE_URL     = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dsc-panimalar-ads.in';

// Hosted logo URLs — load fine in every email client
const LOGO_PEC = 'https://www.dsc-panimalar-ads.in/pec-logo.png';
const LOGO_DS  = 'https://www.dsc-panimalar-ads.in/ds%20logo.jpg';

// ─── Fetch image buffer for PDF ───────────────────────────────────────────────
const _imgCache = new Map();
async function fetchImageBuffer(url) {
  if (_imgCache.has(url)) return _imgCache.get(url);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    _imgCache.set(url, buf);
    return buf;
  } catch (e) {
    console.warn(`[PDF] Could not fetch ${url}:`, e.message);
    return null;
  }
}

// ─── PDF ID Card ──────────────────────────────────────────────────────────────
async function generateIdCardPdf(member) {
  const { name, memberId, department, year, roleInterest, score = 0 } = member;
  const initials = name.split(' ').map(n => n[0] || '').join('').toUpperCase().slice(0, 2);
  const authKey  = member._id ? String(member._id).slice(-8).toUpperCase() : memberId.slice(-6).toUpperCase();

  const [pecBuf, dsBuf] = await Promise.all([
    fetchImageBuffer(LOGO_PEC),
    fetchImageBuffer(LOGO_DS),
  ]);

  return new Promise((resolve, reject) => {
    const W = 620, H = 330;
    const doc = new PDFDocument({ size: [W, H], margin: 0,
      info: { Title: `DS Club ID Card — ${memberId}`, Author: 'PEC Data Science Club' },
    });
    const chunks = [];
    doc.on('data',  c => chunks.push(c));
    doc.on('end',   () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Background
    doc.rect(0, 0, W, H).fill('#0f172a');
    doc.rect(0, H * 0.3, W, H * 0.4).fill('#0d1a35');
    // Border
    doc.rect(6, 6, W - 12, H - 12).lineWidth(2).stroke('#00f0ff');
    doc.rect(9, 9, W - 18, H - 18).lineWidth(0.5).stroke('rgba(0,240,255,0.2)');

    // Header bar
    doc.rect(6, 6, W - 12, 65).fill('#1e293b');

    // PEC Logo (Banner logo containing Panimalar crest and college name)
    if (pecBuf) doc.image(pecBuf, 16, 12, { height: 48 });
    // DS Logo (circle clip on right)
    if (dsBuf) {
      const cx = W - 38, cy = 37, r = 25;
      doc.save().circle(cx, cy, r).clip();
      doc.image(dsBuf, cx - r, cy - r, { width: r * 2, height: r * 2 });
      doc.restore();
      doc.circle(cx, cy, r).lineWidth(1.5).stroke('#00f0ff');
    }

    // Department & Club Subtitle (cleanly positioned to the right of the PEC banner logo)
    const tx = pecBuf ? 185 : 20;
    doc.font('Helvetica-Bold').fontSize(12.5).fillColor('#ffffff')
       .text('DEPARTMENT OF AI & DATA SCIENCE', tx, 22, { lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#00f0ff')
       .text('Official Data Science Club Portal  |  DRKIST Educational Trust', tx, 40, { lineBreak: false });

    // Cyan banner
    doc.rect(6, 71, W - 12, 26).fill('#062030');
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#00f0ff')
       .text('*   OFFICIAL DATA SCIENCE CLUB MEMBER   *', 0, 80, { align: 'center', width: W, lineBreak: false });

    // Body
    const BY = 107;

    // Avatar box
    doc.roundedRect(16, BY, 82, 82, 8).fill('#0a1628').stroke('#00f0ff').lineWidth(1.5);
    doc.font('Helvetica-Bold').fontSize(28).fillColor('#00f0ff')
       .text(initials, 16, BY + 20, { width: 82, align: 'center', lineBreak: false });
    // VERIFIED badge
    doc.roundedRect(16, BY + 88, 82, 16, 3).fill('#052e16').stroke('#22c55e').lineWidth(1);
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#4ade80')
       .text('VERIFIED', 16, BY + 92, { width: 82, align: 'center', lineBreak: false });

    // Info
    const IX = 112;
    doc.font('Helvetica').fontSize(7).fillColor('#64748b')
       .text('MEMBER NAME', IX, BY + 2, { lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(19).fillColor('#ffffff')
       .text(name.toUpperCase(), IX, BY + 13, { lineBreak: false, width: W - IX - 20 });

    // ID badge
    const idY = BY + 44;
    doc.roundedRect(IX, idY, 230, 24, 4).fill('#000d1f').stroke('#38bdf8').lineWidth(1);
    doc.font('Helvetica').fontSize(8).fillColor('#38bdf8')
       .text('MEMBER ID', IX + 10, idY + 8, { lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(13.5).fillColor('#00f0ff')
       .text(memberId, IX + 85, idY + 6, { lineBreak: false });

    // Chips
    const chipY = idY + 34;
    [
      { label: 'DEPARTMENT',    value: department || 'AI & Data Science', x: IX, width: 235, valWidth: 220 },
      { label: 'ACADEMIC YEAR', value: year || '1st Year',                x: IX + 245, width: 145, valWidth: 130 },
    ].forEach(({ label, value, x, width, valWidth }) => {
      doc.roundedRect(x, chipY, width, 34, 4).fill('#0a1628').stroke('#1e3a5f').lineWidth(0.5);
      doc.font('Helvetica').fontSize(7).fillColor('#64748b').text(label, x + 8, chipY + 6, { lineBreak: false });
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#e2e8f0').text(value, x + 8, chipY + 18, { lineBreak: false, width: valWidth });
    });

    // Divider
    const divY = 228;
    doc.moveTo(16, divY).lineTo(W - 16, divY).lineWidth(0.5).dash(4, { space: 4 }).stroke('rgba(255,255,255,0.15)').undash();

    // Footer row
    const FY = divY + 10;
    // Score
    doc.roundedRect(16, FY, 140, 42, 6).fill('#0f0a00').stroke('#facc15').lineWidth(1);
    doc.font('Helvetica').fontSize(7.5).fillColor('#facc15').text('COMPETITION SCORE', 26, FY + 8, { lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(21).fillColor('#ffffff').text(`${score} XP`, 26, FY + 18, { lineBreak: false });
    // Role
    doc.roundedRect(165, FY, 215, 42, 6).fill('#0a1628').stroke('#1e3a5f').lineWidth(0.5);
    doc.font('Helvetica').fontSize(7.5).fillColor('#64748b').text('ROLE', 175, FY + 8, { lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#e2e8f0').text(roleInterest || 'General Member / Participant', 175, FY + 20, { lineBreak: false, width: 195 });
    // Barcode
    doc.font('Helvetica-Bold').fontSize(13.5).fillColor('rgba(255,255,255,0.45)').text('||| | |||| || | ||| |||| | ||', W - 200, FY + 6, { lineBreak: false });
    doc.font('Helvetica').fontSize(7.5).fillColor('#475569').text(`AUTH_KEY: ${authKey}`, W - 175, FY + 24, { lineBreak: false });

    // Bottom band
    doc.rect(6, H - 28, W - 12, 22).fill('#091120');
    doc.font('Helvetica').fontSize(7.5).fillColor('#334155')
       .text(
         `Issued by PEC Data Science Club  |  ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}  |  ${SITE_URL}`,
         0, H - 21, { align: 'center', width: W, lineBreak: false }
       );

    doc.end();
  });
}

// ─── HTML Email (lean — avoids Gmail 102 KB clip) ────────────────────────────
function buildWelcomeEmailHtml(member) {
  const { name, memberId, department, year, roleInterest, email, score = 0 } = member;
  const rows = [
    ['Full Name',     name],
    ['Email',         email],
    ['Department',    department  || 'AI & Data Science'],
    ['Academic Year', year        || '1st Year'],
    ['Role',          roleInterest || 'General Member / Participant'],
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Welcome to PEC Data Science Club</title>
</head>
<body style="margin:0;padding:0;background:#05080f;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#05080f;padding:24px 12px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;">

  <!-- ═══ HEADER ═══ -->
  <tr><td style="background:linear-gradient(160deg,#0f172a 0%,#162035 100%);border:1px solid #1e3a5f;border-radius:14px 14px 0 0;padding:30px 28px 24px;text-align:center;">

    <!-- Logos row -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;">
      <tr>
        <td align="center">
          <table cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="padding-right:14px;vertical-align:middle;">
              <img src="${LOGO_PEC}" alt="PEC" height="42"
                style="height:42px;width:auto;display:block;border-radius:6px;" />
            </td>
            <td style="vertical-align:middle;">
              <img src="${LOGO_DS}" alt="DS Club" width="52" height="52"
                style="width:52px;height:52px;display:block;border-radius:50%;border:2px solid #00f0ff;" />
            </td>
          </tr></table>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 4px 0;font-size:10px;letter-spacing:3px;color:#00f0ff;font-weight:700;text-transform:uppercase;">Panimalar Engineering College</p>
    <h1 style="margin:8px 0;font-size:26px;font-weight:800;color:#ffffff;line-height:1.2;">Welcome to the Club! 🎉</h1>
    <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.6;">
      Hi <strong style="color:#ffffff;">${name}</strong>, you are officially a member of the
      <strong style="color:#00f0ff;">PEC Data Science Club</strong>.
    </p>
  </td></tr>

  <!-- ═══ MEMBER DETAILS ═══ -->
  <tr><td style="background:#0b1322;border-left:1px solid #1e3a5f;border-right:1px solid #1e3a5f;padding:24px 28px;">
    <p style="margin:0 0 12px 0;font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:2px;">Your Member Details</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${rows.map(([label, val], i) => `
      <tr>
        <td style="padding:8px 0;${i > 0 ? 'border-top:1px solid rgba(255,255,255,0.05);' : ''}font-size:12px;color:#64748b;width:36%;vertical-align:top;">${label}</td>
        <td style="padding:8px 0;${i > 0 ? 'border-top:1px solid rgba(255,255,255,0.05);' : ''}font-size:13px;color:#f1f5f9;font-weight:600;">${val}</td>
      </tr>`).join('')}
    </table>
  </td></tr>

  <!-- ═══ MEMBER ID ═══ -->
  <tr><td style="background:#0b1322;border-left:1px solid #1e3a5f;border-right:1px solid #1e3a5f;padding:0 28px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="background:#00060f;border:2px dashed #00b4cc;border-radius:12px;padding:20px;text-align:center;">
        <p style="margin:0 0 6px 0;font-size:10px;letter-spacing:2px;color:#00f0ff;font-weight:700;text-transform:uppercase;">🆔 Your Official Member ID</p>
        <p style="margin:0;font-family:'Courier New',monospace;font-size:36px;font-weight:900;letter-spacing:6px;color:#ffffff;">${memberId}</p>
        <p style="margin:8px 0 0 0;font-size:11px;color:#475569;">Keep this ID safe — use it for all club activities</p>
      </td></tr>
    </table>
  </td></tr>

  <!-- ═══ ID CARD NOTICE ═══ -->
  <tr><td style="background:#0b1322;border-left:1px solid #1e3a5f;border-right:1px solid #1e3a5f;padding:0 28px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#060d1c;border:1px solid #1e3a5f;border-radius:10px;">
      <tr>
        <td style="padding:16px 20px;vertical-align:middle;width:48px;">
          <span style="font-size:32px;line-height:1;">🪪</span>
        </td>
        <td style="padding:16px 0 16px 0;vertical-align:middle;">
          <p style="margin:0 0 4px 0;font-size:13px;font-weight:700;color:#ffffff;">Your ID Card is Attached!</p>
          <p style="margin:0;font-size:12px;color:#64748b;line-height:1.5;">
            Open the <strong style="color:#00f0ff;">DS-Club-ID-Card-${memberId}.pdf</strong> attachment below to view and save your official holographic membership card.
          </p>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- ═══ SCORE + TIPS ═══ -->
  <tr><td style="background:#0b1322;border-left:1px solid #1e3a5f;border-right:1px solid #1e3a5f;padding:0 28px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <!-- Score -->
        <td style="width:48%;padding-right:8px;vertical-align:top;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0f0800;border:1px solid #854d0e;border-radius:10px;">
            <tr><td style="padding:14px 16px;">
              <p style="margin:0 0 2px 0;font-size:10px;color:#f59e0b;font-weight:700;text-transform:uppercase;letter-spacing:1px;">🏆 Competition Score</p>
              <p style="margin:0;font-size:24px;font-weight:900;color:#ffffff;">${score} XP</p>
            </td></tr>
          </table>
        </td>
        <!-- Tips -->
        <td style="width:52%;padding-left:8px;vertical-align:top;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#060d1c;border:1px solid #1e3a5f;border-radius:10px;">
            <tr><td style="padding:14px 16px;">
              <p style="margin:0 0 6px 0;font-size:12px;font-weight:700;color:#60a5fa;">🛡️ Keep Your ID Safe!</p>
              <p style="margin:0;font-size:11px;color:#64748b;line-height:1.6;">Use <strong style="color:#fff;font-family:monospace;">${memberId}</strong> for hackathons, challenges &amp; quizzes.</p>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- ═══ FOOTER ═══ -->
  <tr><td style="background:linear-gradient(160deg,#0f172a,#162035);border:1px solid #1e3a5f;border-top:none;border-radius:0 0 14px 14px;padding:22px 28px;text-align:center;">
    <a href="${SITE_URL}" style="display:inline-block;background:linear-gradient(90deg,#0891b2,#3b82f6);color:#ffffff;font-weight:700;font-size:13px;padding:11px 28px;border-radius:8px;text-decoration:none;margin-bottom:14px;">
      Visit Our Website →
    </a>
    <p style="margin:0 0 4px 0;font-size:11px;color:#475569;">
      Questions? <a href="mailto:${SENDER_EMAIL}" style="color:#00f0ff;text-decoration:none;">${SENDER_EMAIL}</a>
    </p>
    <p style="margin:0;font-size:10px;color:#334155;">
      © ${new Date().getFullYear()} PEC Data Science Club · Panimalar Engineering College
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── Send welcome email ───────────────────────────────────────────────────────
export async function sendWelcomeEmail(member) {
  try {
    const client = getBrevoClient();

    // Generate PDF and HTML in parallel
    const [pdfBuffer, htmlContent] = await Promise.all([
      generateIdCardPdf(member),
      Promise.resolve(buildWelcomeEmailHtml(member)),
    ]);

    const plainText = `Welcome to PEC Data Science Club, ${member.name}!

Your details:
  Name       : ${member.name}
  Email      : ${member.email}
  Member ID  : ${member.memberId}
  Department : ${member.department || 'AI & Data Science'}
  Year       : ${member.year || '1st Year'}
  Role       : ${member.roleInterest || 'General Member / Participant'}
  Score      : ${member.score || 0} XP

Your ID Card PDF is attached. Keep your Member ID safe!

Visit us: ${SITE_URL}`.trim();

    const response = await client.transactionalEmails.sendTransacEmail({
      sender:      { name: SENDER_NAME, email: SENDER_EMAIL },
      to:          [{ email: member.email, name: member.name }],
      subject:     `🎉 Welcome to PEC DS Club — Your Member ID: ${member.memberId}`,
      htmlContent,
      textContent: plainText,
      attachment:  [{
        content: pdfBuffer.toString('base64'),
        name:    `DS-Club-ID-Card-${member.memberId}.pdf`,
      }],
    });

    console.log(`[Email] ✅ Sent to ${member.email} | MessageId: ${response?.messageId}`);
    return { success: true, messageId: response?.messageId };
  } catch (error) {
    console.error(`[Email] ❌ Failed for ${member.email}:`, error?.body || error.message);
    return { success: false, error: error.message };
  }
}

// ─── Generate Contest Certificate PDF (A4 Landscape) ─────────────────────────
export async function generateContestCertificatePdf(member, contest, score = 0, rank = 1) {
  const template = contest.certificateTemplate || {};
  let bgBuf = null;
  if (template.backgroundImageUrl) {
    try {
      if (template.backgroundImageUrl.startsWith('data:image')) {
        const base64Data = template.backgroundImageUrl.split(',')[1];
        bgBuf = Buffer.from(base64Data, 'base64');
      } else if (template.backgroundImageUrl.startsWith('http://') || template.backgroundImageUrl.startsWith('https://')) {
        const res = await fetch(template.backgroundImageUrl);
        const arrayBuffer = await res.arrayBuffer();
        bgBuf = Buffer.from(arrayBuffer);
      } else {
        const cleanPath = template.backgroundImageUrl.startsWith('/') ? template.backgroundImageUrl.slice(1) : template.backgroundImageUrl;
        const p = path.join(process.cwd(), 'public', cleanPath);
        if (fs.existsSync(p)) bgBuf = fs.readFileSync(p);
      }
    } catch (err) {
      console.error('Error loading custom certificate background image:', err);
    }
  }

  return new Promise((resolve) => {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 0,
      info: {
        Title: `Certificate of Participation - ${contest.title}`,
        Author: 'PEC Data Science Club',
        Subject: `Awarded to ${member.name}`,
      },
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    const W = 842; // A4 landscape width
    const H = 595; // A4 landscape height

    const titleText = template.title || 'CERTIFICATE OF PARTICIPATION';
    const subtitleText = template.subtitle || 'This is proudly presented to';
    let bodyText = template.bodyText || 'for actively participating in the coding contest [CONTEST_TITLE] organized by the Department of AI & Data Science, Panimalar Engineering College.';
    const sigName = template.signatoryName || 'Dr. S. Malathi';
    const sigTitle = template.signatoryTitle || 'HOD - Dept of AI & DS';
    const accentColor = template.accentColor || '#00f0ff';

    // Replace placeholders in bodyText
    const dateStr = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    bodyText = bodyText
      .replace(/\[MEMBER_NAME\]/g, member.name)
      .replace(/\[CONTEST_TITLE\]/g, contest.title)
      .replace(/\[DATE\]/g, dateStr)
      .replace(/\[MEMBER_ID\]/g, member.memberId || 'N/A');

    // Background & Ornamental Borders
    let customBgLoaded = false;
    if (bgBuf) {
      try {
        doc.image(bgBuf, 0, 0, { width: W, height: H });
        customBgLoaded = true;
      } catch (err) {
        console.error('Error drawing custom background image to PDF:', err);
      }
    }

    if (!customBgLoaded) {
      doc.rect(0, 0, W, H).fill('#070b14');
      doc.rect(18, 18, W - 36, H - 36).lineWidth(2.5).stroke(accentColor);
      doc.rect(26, 26, W - 52, H - 52).lineWidth(0.75).stroke('#38bdf8');
      doc.rect(30, 30, W - 60, H - 60).lineWidth(0.5).stroke('rgba(255, 255, 255, 0.15)');

      // Corner accents
      const cs = 15;
      doc.moveTo(18, 18 + cs).lineTo(18, 18).lineTo(18 + cs, 18).lineWidth(4).stroke('#ffffff');
      doc.moveTo(W - 18 - cs, 18).lineTo(W - 18, 18).lineTo(W - 18, 18 + cs).lineWidth(4).stroke('#ffffff');
      doc.moveTo(18, H - 18 - cs).lineTo(18, H - 18).lineTo(18 + cs, H - 18).lineWidth(4).stroke('#ffffff');
      doc.moveTo(W - 18 - cs, H - 18).lineTo(W - 18, H - 18).lineTo(W - 18, H - 18 - cs).lineWidth(4).stroke('#ffffff');
    }

    // Load logos
    let pecBuf = null, dsBuf = null;
    try {
      const p = path.join(process.cwd(), 'public', 'pec-logo.png');
      if (fs.existsSync(p)) pecBuf = fs.readFileSync(p);
    } catch (_) {}
    try {
      const p = path.join(process.cwd(), 'public', 'ds logo.jpg');
      if (fs.existsSync(p)) dsBuf = fs.readFileSync(p);
    } catch (_) {}

    // Top Header Row
    if (pecBuf) {
      doc.image(pecBuf, 50, 48, { height: 50 });
    }
    if (dsBuf) {
      const cx = W - 75, cy = 73, r = 26;
      doc.save().circle(cx, cy, r).clip();
      doc.image(dsBuf, cx - r, cy - r, { width: r * 2, height: r * 2 });
      doc.restore();
      doc.circle(cx, cy, r).lineWidth(1.5).stroke(accentColor);
    }

    // College Header Text (Centered)
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#ffffff')
       .text('PANIMALAR ENGINEERING COLLEGE', 0, 46, { align: 'center', width: W, lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#38bdf8')
       .text('An Autonomous Institution  |  Department of AI & Data Science', 0, 68, { align: 'center', width: W, lineBreak: false });
    doc.font('Helvetica').fontSize(8.5).fillColor('#64748b')
       .text('Affiliated to Anna University, Chennai  |  DRKIST Educational Trust', 0, 84, { align: 'center', width: W, lineBreak: false });

    // Divider line below header
    doc.moveTo(100, 110).lineTo(W - 100, 110).lineWidth(0.5).stroke('rgba(255, 255, 255, 0.15)');

    // Certificate Title & Subtitle
    doc.font('Helvetica-Bold').fontSize(26).fillColor('#facc15')
       .text(titleText.toUpperCase(), 0, 140, { align: 'center', width: W, characterSpacing: 2, lineBreak: false });
    doc.font('Helvetica-Oblique').fontSize(14).fillColor('#cbd5e1')
       .text(subtitleText, 0, 185, { align: 'center', width: W, lineBreak: false });

    // Student Name
    doc.font('Helvetica-Bold').fontSize(34).fillColor('#ffffff')
       .text((member.name || 'Participant').toUpperCase(), 0, 220, { align: 'center', width: W, lineBreak: false });
    
    // Underline below name
    doc.moveTo(250, 265).lineTo(W - 250, 265).lineWidth(1.5).stroke(accentColor);

    // Body Text
    doc.font('Helvetica').fontSize(14).fillColor('#e2e8f0')
       .text(bodyText, 100, 305, { align: 'center', width: W - 200, lineGap: 8 });

    // Signatory Section
    const sigY = 475;
    // Left Signatory
    doc.moveTo(90, sigY).lineTo(290, sigY).lineWidth(1).stroke('#475569');
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#ffffff')
       .text(sigName, 90, sigY + 8, { width: 200, align: 'center', lineBreak: false });
    doc.font('Helvetica').fontSize(9.5).fillColor('#94a3b8')
       .text(sigTitle, 90, sigY + 24, { width: 200, align: 'center', lineBreak: false });

    // Right Signatory (Club Coordinator)
    doc.moveTo(W - 290, sigY).lineTo(W - 90, sigY).lineWidth(1).stroke('#475569');
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#ffffff')
       .text('PEC Data Science Club', W - 290, sigY + 8, { width: 200, align: 'center', lineBreak: false });
    doc.font('Helvetica').fontSize(9.5).fillColor('#94a3b8')
       .text('Official Club Organization', W - 290, sigY + 24, { width: 200, align: 'center', lineBreak: false });

    // Bottom Verification Footer
    const certId = `CERT-${String(contest._id || '0000').slice(-6).toUpperCase()}-${member.memberId || '0000'}`;
    doc.font('Helvetica').fontSize(8).fillColor('#475569')
       .text(`MEMBER ID: ${member.memberId || 'N/A'}  |  CERTIFICATE ID: ${certId}  |  ISSUED ON: ${dateStr}`, 0, H - 48, { align: 'center', width: W, lineBreak: false });
    doc.font('Helvetica').fontSize(7.5).fillColor('#334155')
       .text(`Official Document of Panimalar Engineering College Data Science Club  |  ${SITE_URL}`, 0, H - 34, { align: 'center', width: W, lineBreak: false });

    doc.end();
  });
}

// ─── Build Certificate Email HTML ────────────────────────────────────────────
function buildContestCertificateEmailHtml(member, contest) {
  const { name, memberId } = member;
  const certId = `CERT-${String(contest._id || '0000').slice(-6).toUpperCase()}-${memberId || '0000'}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Certificate of Participation - ${contest.title}</title>
</head>
<body style="margin:0;padding:0;background:#05080f;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#05080f;padding:24px 12px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;">

  <!-- HEADER -->
  <tr><td style="background:linear-gradient(160deg,#0f172a 0%,#162035 100%);border:1px solid #1e3a5f;border-radius:14px 14px 0 0;padding:30px 28px 24px;text-align:center;">
    <!-- Logos row -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;">
      <tr>
        <td align="center">
          <table cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="padding-right:14px;vertical-align:middle;">
              <img src="${LOGO_PEC}" alt="PEC" height="42" style="height:42px;width:auto;display:block;border-radius:6px;" />
            </td>
            <td style="vertical-align:middle;">
              <img src="${LOGO_DS}" alt="DS Club" width="52" height="52" style="width:52px;height:52px;display:block;border-radius:50%;border:2px solid #00f0ff;" />
            </td>
          </tr></table>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 4px 0;font-size:10px;letter-spacing:3px;color:#00f0ff;font-weight:700;text-transform:uppercase;">Panimalar Engineering College</p>
    <h1 style="margin:8px 0;font-size:24px;font-weight:800;color:#ffffff;line-height:1.2;">🏆 Certificate Awarded!</h1>
    <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.6;">
      Congratulations <strong style="color:#ffffff;">${name}</strong>! Your official certificate for <strong style="color:#facc15;">${contest.title}</strong> is ready.
    </p>
  </td></tr>

  <!-- DETAILS -->
  <tr><td style="background:#0b1322;border-left:1px solid #1e3a5f;border-right:1px solid #1e3a5f;padding:24px 28px;">
    <p style="margin:0 0 12px 0;font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:2px;">Contest Information</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding:8px 0;font-size:12px;color:#64748b;width:36%;">Contest Title</td>
        <td style="padding:8px 0;font-size:13px;color:#f1f5f9;font-weight:600;">${contest.title}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-top:1px solid rgba(255,255,255,0.05);font-size:12px;color:#64748b;">Participant Name</td>
        <td style="padding:8px 0;border-top:1px solid rgba(255,255,255,0.05);font-size:14px;color:#ffffff;font-weight:700;">${name}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-top:1px solid rgba(255,255,255,0.05);font-size:12px;color:#64748b;">Member ID</td>
        <td style="padding:8px 0;border-top:1px solid rgba(255,255,255,0.05);font-size:13px;color:#00f0ff;font-weight:700;">${memberId || 'N/A'}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-top:1px solid rgba(255,255,255,0.05);font-size:12px;color:#64748b;">Certificate ID</td>
        <td style="padding:8px 0;border-top:1px solid rgba(255,255,255,0.05);font-family:monospace;font-size:12px;color:#94a3b8;">${certId}</td>
      </tr>
    </table>
  </td></tr>

  <!-- ATTACHMENT NOTICE -->
  <tr><td style="background:#0b1322;border-left:1px solid #1e3a5f;border-right:1px solid #1e3a5f;padding:0 28px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="background:#000d1f;border:1px solid #00f0ff;border-radius:12px;padding:18px;text-align:center;">
        <p style="margin:0 0 4px 0;font-size:11px;color:#00f0ff;font-weight:700;text-transform:uppercase;">📄 PDF Certificate Attached</p>
        <p style="margin:0;font-size:13px;color:#cbd5e1;">Please find your high-resolution Certificate of Participation attached to this email. You can download and share it on LinkedIn!</p>
      </td></tr>
    </table>
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#091120;border:1px solid #1e3a5f;border-top:0;border-radius:0 0 14px 14px;padding:20px 28px;text-align:center;">
    <p style="margin:0 0 6px 0;font-size:13px;font-weight:700;color:#e2e8f0;">Panimalar Engineering College</p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#64748b;">An Autonomous Institution  •  Department of AI &amp; Data Science</p>
    <p style="margin:0;font-size:11px;color:#475569;">
      <a href="${SITE_URL}" style="color:#38bdf8;text-decoration:none;">${SITE_URL}</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── Send Contest Certificate Email ──────────────────────────────────────────
export async function sendContestCertificateEmail(member, contest, pdfBuffer) {
  try {
    const client = getBrevoClient();
    const htmlContent = buildContestCertificateEmailHtml(member, contest);

    const plainText = `Congratulations ${member.name}!
Your official Certificate of Participation for ${contest.title} is ready.

Contest: ${contest.title}
Member : ${member.name} (${member.memberId || 'N/A'})

Your high-resolution PDF certificate is attached to this email.
Visit us at ${SITE_URL}`.trim();

    const cleanTitle = (contest.title || 'Contest').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Certificate_${cleanTitle}_${member.memberId || 'Member'}.pdf`;

    const response = await client.transactionalEmails.sendTransacEmail({
      sender:      { name: SENDER_NAME, email: SENDER_EMAIL },
      to:          [{ email: member.email, name: member.name }],
      subject:     `🏆 Certificate of Participation — ${contest.title}`,
      htmlContent,
      textContent: plainText,
      attachment:  [{
        content: pdfBuffer.toString('base64'),
        name:    fileName,
      }],
    });

    console.log(`[Certificate Email] ✅ Sent to ${member.email} (${member.name}) | MessageId: ${response?.messageId}`);
    return { success: true, messageId: response?.messageId };
  } catch (error) {
    console.error(`[Certificate Email] ❌ Failed for ${member.email}:`, error?.body || error.message);
    return { success: false, error: error.message };
  }
}
