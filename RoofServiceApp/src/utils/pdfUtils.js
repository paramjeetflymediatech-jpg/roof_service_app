import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Share, Alert, Platform } from 'react-native';

const COMPANY_NAME = 'Mainstreet Roofing LTD';
const COMPANY_EMAIL = 'mainstreetroofing604@gmail.com';
const COMPANY_PHONE = '';

const fmtCurrency = value =>
    `CAD $${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const fmtDate = value => {
    if (!value) return 'N/A';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value).slice(0, 10) : d.toLocaleDateString();
};

/** Shared CSS for both PDF types */
const baseCSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a; background: #fff; padding: 32px; font-size: 13px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 3px solid #1e3a5f; padding-bottom: 20px; }
  .brand { font-size: 22px; font-weight: 800; color: #1e3a5f; letter-spacing: -0.5px; }
  .brand-sub { font-size: 11px; color: #666; margin-top: 4px; }
  .doc-type { text-align: right; }
  .doc-type h1 { font-size: 28px; font-weight: 900; color: #1e3a5f; text-transform: uppercase; letter-spacing: 2px; }
  .doc-type .doc-num { font-size: 13px; color: #555; margin-top: 4px; }
  .meta-grid { display: flex; gap: 24px; margin-bottom: 28px; }
  .meta-box { flex: 1; background: #f8faff; border: 1px solid #ccd8ee; border-radius: 8px; padding: 14px 16px; }
  .meta-box h3 { font-size: 10px; font-weight: 700; color: #1e3a5f; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .meta-box p { font-size: 13px; color: #333; line-height: 1.6; }
  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background: #fff3cd; color: #856404; border: 1px solid #ffc107; }
  .status-badge.approved, .status-badge.paid { background: #d4edda; color: #155724; border-color: #28a745; }
  .status-badge.rejected, .status-badge.overdue { background: #f8d7da; color: #721c24; border-color: #dc3545; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  thead th { background: #1e3a5f; color: #fff; padding: 10px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; }
  thead th:last-child { text-align: right; }
  tbody tr:nth-child(even) { background: #f5f8ff; }
  tbody td { padding: 10px 14px; border-bottom: 1px solid #e8edf5; font-size: 13px; vertical-align: top; }
  tbody td:last-child { text-align: right; font-weight: 600; }
  .qty-col { text-align: center !important; color: #555; }
  .rate-col { text-align: right !important; color: #555; }
  .totals-wrapper { display: flex; justify-content: flex-end; margin-bottom: 28px; }
  .totals { width: 280px; }
  .totals-row { display: flex; justify-content: space-between; padding: 7px 14px; font-size: 13px; }
  .totals-row.total-final { background: #1e3a5f; color: #fff; border-radius: 6px; font-weight: 700; font-size: 15px; margin-top: 4px; }
  .notes-box { background: #fffbf0; border: 1px solid #ffe4a0; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px; }
  .notes-box h3 { font-size: 11px; font-weight: 700; color: #856404; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .notes-box p { font-size: 13px; color: #555; line-height: 1.6; font-style: italic; }
  .payment-box { background: #f0f4fb; border: 1px solid #ccd8ee; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px; }
  .payment-box h3 { font-size: 11px; font-weight: 700; color: #1e3a5f; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .payment-box p { font-size: 13px; color: #333; line-height: 1.6; }
  .footer { text-align: center; font-size: 11px; color: #888; border-top: 1px solid #e0e0e0; padding-top: 16px; margin-top: 12px; }
`;

/**
 * Generate an Estimate PDF from estimate data and open the Share sheet.
 * @param {object} estimate
 */
export const generateEstimatePDF = async estimate => {
    const statusClass = (estimate.status || '').toLowerCase();
    const itemRows = (estimate.items || [])
        .map(
            item => `
      <tr>
        <td>${item.description || ''}</td>
        <td class="qty-col">${item.qty ?? 1}</td>
        <td class="rate-col">${fmtCurrency(item.rate ?? item.amount)}</td>
        <td>${fmtCurrency(item.amount)}</td>
      </tr>`,
        )
        .join('');

    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><style>${baseCSS}</style></head>
    <body>
      <div class="header">
        <div>
          <div class="brand">${COMPANY_NAME}</div>
          <div class="brand-sub">${COMPANY_EMAIL}${COMPANY_PHONE ? ` · ${COMPANY_PHONE}` : ''}</div>
        </div>
        <div class="doc-type">
          <h1>Estimate</h1>
          <div class="doc-num">#${estimate.estimateNumber || ''}</div>
          <div style="margin-top:8px"><span class="status-badge ${statusClass}">${estimate.status || 'Draft'}</span></div>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-box">
          <h3>Billed To</h3>
          <p><strong>${estimate.clientName || 'Client'}</strong></p>
          ${estimate.clientEmail ? `<p>${estimate.clientEmail}</p>` : ''}
          ${estimate.clientPhone ? `<p>${estimate.clientPhone}</p>` : ''}
          ${estimate.clientAddress ? `<p>${estimate.clientAddress}</p>` : ''}
        </div>
        <div class="meta-box">
          <h3>Estimate Info</h3>
          <p><strong>Date:</strong> ${fmtDate(estimate.date)}</p>
          ${estimate.expiryDate ? `<p><strong>Expires:</strong> ${fmtDate(estimate.expiryDate)}</p>` : ''}
          ${estimate.timeEstimate ? `<p><strong>Time Est.:</strong> ${estimate.timeEstimate}</p>` : ''}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:45%">Description</th>
            <th style="width:10%;text-align:center">Qty</th>
            <th style="width:20%;text-align:right">Rate</th>
            <th style="width:25%;text-align:right">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div class="totals-wrapper">
        <div class="totals">
          <div class="totals-row"><span>Subtotal</span><span>${fmtCurrency(estimate.subtotal)}</span></div>
          <div class="totals-row"><span>Tax (5% GST)</span><span>${fmtCurrency(estimate.tax)}</span></div>
          <div class="totals-row total-final"><span>Grand Total</span><span>${fmtCurrency(estimate.total)}</span></div>
        </div>
      </div>

      ${estimate.notes ? `<div class="notes-box"><h3>Notes</h3><p>${estimate.notes}</p></div>` : ''}

      <div class="footer">
        This estimate is valid until ${fmtDate(estimate.expiryDate) || 'the specified expiry date'}.
        Thank you for choosing ${COMPANY_NAME}!
      </div>
    </body>
    </html>
  `;

    const fileName = `Estimate-${estimate.estimateNumber || Date.now()}`;
    const result = await RNHTMLtoPDF.convert({
        html,
        fileName,
        base64: false,
    });
    return result.filePath;
};

/**
 * Generate an Invoice PDF from invoice data and open the Share sheet.
 * @param {object} invoice
 */
export const generateInvoicePDF = async invoice => {
    const statusClass = (invoice.status || '').toLowerCase();
    const itemRows = (invoice.items || [])
        .map(
            item => `
      <tr>
        <td>${item.description || ''}</td>
        <td class="qty-col">${item.qty ?? 1}</td>
        <td class="rate-col">${fmtCurrency(item.rate ?? item.amount)}</td>
        <td>${fmtCurrency(item.amount)}</td>
      </tr>`,
        )
        .join('');

    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><style>${baseCSS}</style></head>
    <body>
      <div class="header">
        <div>
          <div class="brand">${COMPANY_NAME}</div>
          <div class="brand-sub">${COMPANY_EMAIL}${COMPANY_PHONE ? ` · ${COMPANY_PHONE}` : ''}</div>
        </div>
        <div class="doc-type">
          <h1>Invoice</h1>
          <div class="doc-num">#${invoice.invoiceNumber || ''}</div>
          <div style="margin-top:8px"><span class="status-badge ${statusClass}">${invoice.status || 'Pending'}</span></div>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-box">
          <h3>Billed To</h3>
          <p><strong>${invoice.clientName || 'Client'}</strong></p>
          ${invoice.clientEmail ? `<p>${invoice.clientEmail}</p>` : ''}
          ${invoice.clientPhone ? `<p>${invoice.clientPhone}</p>` : ''}
          ${invoice.clientAddress ? `<p>${invoice.clientAddress}</p>` : ''}
        </div>
        <div class="meta-box">
          <h3>Invoice Info</h3>
          <p><strong>Date Issued:</strong> ${fmtDate(invoice.date)}</p>
          ${invoice.dueDate ? `<p><strong>Due Date:</strong> ${fmtDate(invoice.dueDate)}</p>` : ''}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:45%">Description</th>
            <th style="width:10%;text-align:center">Qty</th>
            <th style="width:20%;text-align:right">Rate</th>
            <th style="width:25%;text-align:right">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div class="totals-wrapper">
        <div class="totals">
          <div class="totals-row"><span>Subtotal</span><span>${fmtCurrency(invoice.subtotal)}</span></div>
          <div class="totals-row"><span>Tax (5% GST)</span><span>${fmtCurrency(invoice.tax)}</span></div>
          <div class="totals-row total-final"><span>Total Amount</span><span>${fmtCurrency(invoice.total)}</span></div>
        </div>
      </div>

      <div class="payment-box">
        <h3>Payment Instructions</h3>
        <p>Please make checks payable to <strong>${COMPANY_NAME}</strong>.
        Electronic transfers can be sent to <strong>${COMPANY_EMAIL}</strong>.</p>
      </div>

      ${invoice.notes ? `<div class="notes-box"><h3>Notes</h3><p>${invoice.notes}</p></div>` : ''}

      <div class="footer">Thank you for your business! — ${COMPANY_NAME}</div>
    </body>
    </html>
  `;

    const fileName = `Invoice-${invoice.invoiceNumber || Date.now()}`;
    const result = await RNHTMLtoPDF.convert({
        html,
        fileName,
        base64: false,
    });
    return result.filePath;
};

/**
 * Share a PDF file using the native Share sheet.
 * @param {string} filePath
 * @param {string} title
 */
export const sharePDF = async (filePath, title = 'Document') => {
    const url = Platform.OS === 'android' ? `file://${filePath}` : filePath;
    await Share.share({
        title,
        url,   // iOS
        message: Platform.OS === 'android' ? url : undefined, // Android fallback
    });
};
