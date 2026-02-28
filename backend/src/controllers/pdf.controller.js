const PDFDocument = require("pdfkit");
const path = require("path");
const { Estimate, Invoice } = require("../models");

// ─── Company Constants ────────────────────────────────────────────────────────
const CO_NAME = "Mainstreet Roofing LTD";
const CO_TAGLINE = "PROFESSIONAL ROOFING SOLUTIONS";
const CO_OWNER = "Gurmukh Singh";
const CO_GST = "GST # 706833506RT0001";
const CO_ADDR = "9380 124st, Surrey, BC, V3V4S3, BC, Canada";
const CO_PHONE = "604-720-4313";
const CO_EMAIL = "mainstreetroofing604@gmail.com";
const CO_PAY = `Please make checks payable to ${CO_NAME}. Electronic transfers can be sent to ${CO_EMAIL}. Thank you for your business!`;

const LOGO_PATH = path.join(__dirname, "../../public/assets/roofing-logo.png");

// ─── Colors ───────────────────────────────────────────────────────────────────
const BLUE = "#3b5bdb";
const DARK_NAVY = "#1e2a4a";
const GREY = "#888888";
const LIGHT_GREY = "#f5f5f5";
const TEXT = "#1a1a1a";
const GREEN = "#2e7d32";
const DIVIDER = "#e0e0e0";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (val) =>
    `$${Number(val || 0).toLocaleString("en-CA", { minimumFractionDigits: 2 })}`;

const fmtBig = (val) =>
    `$${Number(val || 0).toLocaleString("en-CA", { minimumFractionDigits: 2 })}`;

const fmtDate = (val) => {
    if (!val) return "N/A";
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val).slice(0, 10);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const hr = (doc, y, color = DIVIDER, x1 = 50, x2 = 545) => {
    doc.moveTo(x1, y).lineTo(x2, y).strokeColor(color).lineWidth(0.5).stroke();
};

// Draw a small filled circle bullet then return the x offset used
const dot = (doc, x, y, color = BLUE) => {
    doc.circle(x + 3, y + 5, 2.5).fill(color);
    return x + 10; // text starts here
};

// ─── 1. Company Header ────────────────────────────────────────────────────────
// Returns the Y position after the header block
const drawHeader = (doc, docType, docNumber) => {
    const L = 50, R = 545, logoW = 100;
    let y = 45;

    // Company name
    doc.font("Helvetica-Bold").fontSize(18).fillColor(TEXT).text(CO_NAME, L, y);
    y += 22;

    // Tagline
    doc.font("Helvetica-Bold").fontSize(8).fillColor(BLUE).text(CO_TAGLINE, L, y);
    y += 16;

    // Contact lines with small bullet dots
    const contacts = [
        { val: CO_OWNER, color: TEXT },
        { val: CO_GST, color: TEXT },
        { val: CO_ADDR, color: BLUE },
        { val: CO_PHONE, color: TEXT },
        { val: CO_EMAIL, color: BLUE },
    ];
    contacts.forEach(({ val, color }) => {
        const tx = dot(doc, L, y, BLUE);
        doc.font("Helvetica").fontSize(9).fillColor(color).text(val, tx, y);
        y += 13;
    });

    // Logo – top right
    const logoTop = 45;
    try {
        doc.image(LOGO_PATH, R - logoW, logoTop, { width: logoW });
    } catch (_) {
        doc.font("Helvetica-Bold").fontSize(9).fillColor(TEXT).text(CO_NAME, R - logoW, logoTop + 30, { width: logoW, align: "center" });
    }

    // "INVOICE / ESTIMATE" label + number – right-aligned below logo
    const labelY = logoTop + 100;
    doc.font("Helvetica-Bold").fontSize(8).fillColor(GREY)
        .text(docType.toUpperCase(), L, labelY, { align: "right", width: R - L });
    doc.font("Helvetica-Bold").fontSize(9).fillColor(BLUE)
        .text(docNumber, L, labelY + 12, { align: "right", width: R - L });

    const bottomY = Math.max(y, labelY + 28);
    hr(doc, bottomY + 8);
    return bottomY + 18;
};

// ─── 2. Invoice-To + Dates & Totals ──────────────────────────────────────────
const drawBillTo = (doc, client, meta, amountDue, startY) => {
    const L = 50, MID = 310;
    let leftY = startY;
    let rightY = startY;
    let type = meta.find((m) => m.label === "Status");
    // Left: INVOICE TO
    doc.font("Helvetica-Bold").fontSize(8).fillColor(GREY).text(type ? "INVOICE TO" : "ESTIMATE TO", L, leftY);
    leftY += 14;
    if (client.name) {
        doc.font("Helvetica-Bold").fontSize(13).fillColor(TEXT).text(client.name, L, leftY);
        leftY += 18;
    }
    const clientLines = [
        client.address && { val: client.address, color: BLUE },
        client.phone && { val: client.phone, color: TEXT },
        client.email && { val: client.email, color: BLUE },
    ].filter(Boolean);
    clientLines.forEach(({ val, color }) => {
        const tx = dot(doc, L, leftY, BLUE);
        doc.font("Helvetica").fontSize(9).fillColor(color).text(val, tx, leftY);
        leftY += 13;
    });

    // Right: DATES & TOTALS
    doc.font("Helvetica-Bold").fontSize(8).fillColor(GREY).text("DATES & TOTALS", L, rightY, { align: "right", width: 495 });
    rightY += 14;

    meta.forEach(({ label, value, valueColor, badge }) => {
        const rowY = rightY;
        doc.font("Helvetica").fontSize(9).fillColor(GREY).text(`${label}:`, MID, rowY, { width: 100 });
        if (badge) {
            // Status badge
            const badgeColor = (value || "").toLowerCase() === "paid" ? GREEN : "#e65100";
            doc.rect(MID + 105, rowY - 1, 36, 13).fill(badgeColor);
            doc.font("Helvetica-Bold").fontSize(8).fillColor("#fff")
                .text(value.toUpperCase(), MID + 106, rowY + 1, { width: 34, align: "center" });
        } else {
            doc.font("Helvetica-Bold").fontSize(9).fillColor(valueColor || TEXT)
                .text(value, MID + 105, rowY, { width: 130, align: "right" });
        }
        rightY += 15;
    });

    // AMOUNT DUE big block
    rightY += 4;
    doc.font("Helvetica-Bold").fontSize(8).fillColor(GREY)
        .text("AMOUNT DUE", MID, rightY, { width: 235, align: "right" });
    rightY += 14;
    doc.font("Helvetica-Bold").fontSize(22).fillColor(BLUE)
        .text(`CAD ${fmtBig(amountDue)}`, MID, rightY, { width: 235, align: "right" });
    rightY += 28;

    const sectionBottom = Math.max(leftY, rightY) + 10;
    hr(doc, sectionBottom);
    return sectionBottom + 14;
};

// ─── 3. Items Table ───────────────────────────────────────────────────────────
const drawItems = (doc, items, startY) => {
    const L = 50;
    let y = startY;

    // Column headers (small grey)
    doc.font("Helvetica-Bold").fontSize(8).fillColor(GREY)
        .text("DESCRIPTION OF SERVICES", L, y)
        .text("RATE", 330, y, { width: 60, align: "right" })
        .text("QTY", 395, y, { width: 40, align: "center" })
        .text("NET AMOUNT", 440, y, { width: 105, align: "right" });
    y += 12;
    hr(doc, y);
    y += 10;

    (items || []).forEach((item) => {
        const descH = doc.heightOfString(item.description || "", { width: 275, font: "Helvetica", size: 10 });
        const rowH = Math.max(descH + 14, 24);
        doc.font("Helvetica").fontSize(10).fillColor(TEXT)
            .text(item.description || "", L, y, { width: 275 });
        doc.font("Helvetica").fontSize(10).fillColor(TEXT)
            .text(item.rate != null ? fmt(item.rate) : "", 330, y, { width: 60, align: "right" })
            .text(String(item.qty ?? 1), 395, y, { width: 40, align: "center" });
        doc.font("Helvetica-Bold").fontSize(10).fillColor(TEXT)
            .text(fmt(item.amount), 440, y, { width: 105, align: "right" });
        y += rowH;
    });

    return y + 10;
};

// ─── 4. Totals ─────────────────────────────────────────────────────────────────
const drawTotals = (doc, subtotal, tax, total, startY) => {
    const MID = 310;
    let y = startY + 8;

    hr(doc, y, DIVIDER, MID, 545);
    y += 10;

    // Subtotal
    doc.font("Helvetica").fontSize(9).fillColor(GREY)
        .text("SUBTOTAL", MID, y, { width: 100 })
        .text(fmt(subtotal), MID + 105, y, { width: 130, align: "right" });
    y += 16;

    // Tax
    doc.font("Helvetica").fontSize(9).fillColor(GREY)
        .text("TAXES (GST 5%)", MID, y, { width: 100 })
        .text(fmt(tax), MID + 105, y, { width: 130, align: "right" });
    y += 18;

    // Total CAD – big navy bar
    const barH = 36;
    doc.rect(MID, y, 235, barH).fill(DARK_NAVY);
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#fff")
        .text("TOTAL CAD", MID + 10, y + 10, { width: 60 });
    doc.font("Helvetica-Bold").fontSize(18).fillColor("#fff")
        .text(fmtBig(total), MID + 10, y + 6, { width: 215, align: "right" });

    return y + barH + 20;
};

// ─── 5. Notes & Footer ────────────────────────────────────────────────────────
const drawNotesFooter = (doc, notes, startY) => {
    let y = startY + 10;
    hr(doc, y);
    y += 12;

    doc.font("Helvetica-Bold").fontSize(8).fillColor(GREY).text("NOTES & PAYMENT INSTRUCTIONS", 50, y);
    y += 14;

    if (notes) {
        doc.font("Helvetica").fontSize(9).fillColor(TEXT).text(notes, 50, y, { width: 495 });
        y += doc.heightOfString(notes, { width: 495 }) + 10;
    }

    // Payment box (left) + Signature (right)
    const boxH = 54;
    doc.rect(50, y, 280, boxH).fillAndStroke("#fff8f0", "#e0c4a0");
    doc.font("Helvetica-Oblique").fontSize(8.5).fillColor(BLUE)
        .text(CO_PAY, 58, y + 8, { width: 264 });

    doc.font("Helvetica-Bold").fontSize(8).fillColor(GREY)
        .text("AUTHORIZED SIGNATURE", 340, y + boxH - 16, { width: 205, align: "right" });
    doc.moveTo(340, y + boxH - 4).lineTo(545, y + boxH - 4).strokeColor(GREY).lineWidth(0.5).stroke();
};

// ─── Route Handlers ───────────────────────────────────────────────────────────
const buildDoc = (res, filename) => {
    const doc = new PDFDocument({ size: "A4", margin: 40, bufferPages: true });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    doc.pipe(res);
    return doc;
};

exports.getInvoicePDF = async (req, res) => {
    try {
        const inv = await Invoice.findByPk(req.params.id);
        if (!inv) return res.status(404).json({ message: "Invoice not found" });

        const d = inv.toJSON();
        d.total = parseFloat(d.total || 0);
        d.subtotal = parseFloat(d.subtotal || 0);
        d.tax = parseFloat(d.tax || 0);
        if (Array.isArray(d.items)) {
            d.items = d.items.map((it) => ({ ...it, amount: parseFloat(it.amount || 0) }));
        }

        const doc = buildDoc(res, `Invoice-${d.invoiceNumber || d.id}.pdf`);

        let y = drawHeader(doc, "Invoice", d.invoiceNumber || d.id);

        const meta = [
            { label: "Date Issued", value: fmtDate(d.date), valueColor: BLUE },
            { label: "Due Date", value: fmtDate(d.dueDate), valueColor: BLUE },
            { label: "Status", value: d.status || "Pending", badge: true },
        ];
        const client = { name: d.clientName, address: d.clientAddress, phone: d.clientPhone, email: d.clientEmail };

        y = drawBillTo(doc, client, meta, d.total, y);
        y = drawItems(doc, d.items || [], y);
        y = drawTotals(doc, d.subtotal, d.tax, d.total, y);
        drawNotesFooter(doc, d.notes, y);

        doc.end();
    } catch (err) {
        console.error("Invoice PDF error:", err);
        res.status(500).json({ message: "Could not generate PDF" });
    }
};

exports.getEstimatePDF = async (req, res) => {
    try {
        const est = await Estimate.findByPk(req.params.id);
        if (!est) return res.status(404).json({ message: "Estimate not found" });

        const d = est.toJSON();
        d.total = parseFloat(d.total || 0);
        d.subtotal = parseFloat(d.subtotal || 0);
        d.tax = parseFloat(d.tax || 0);
        if (Array.isArray(d.items)) {
            d.items = d.items.map((it) => ({ ...it, amount: parseFloat(it.amount || 0) }));
        }

        const doc = buildDoc(res, `Estimate-${d.estimateNumber || d.id}.pdf`);

        let y = drawHeader(doc, "Estimate", d.estimateNumber || d.id);

        const meta = [
            { label: "Date Issued", value: fmtDate(d.date), valueColor: BLUE },
            // ...(d.expiryDate ? [{ label: "Expiry Date", value: fmtDate(d.expiryDate), valueColor: BLUE }] : []),
            // { label: "Status", value: d.status || "Pending", badge: true },
        ];
        const client = { name: d.clientName, address: d.clientAddress, phone: d.clientPhone, email: d.clientEmail };

        y = drawBillTo(doc, client, meta, d.total, y);
        y = drawItems(doc, d.items || [], y);
        y = drawTotals(doc, d.subtotal, d.tax, d.total, y);
        drawNotesFooter(doc, d.notes, y);

        doc.end();
    } catch (err) {
        console.error("Estimate PDF error:", err);
        res.status(500).json({ message: "Could not generate PDF" });
    }
};
