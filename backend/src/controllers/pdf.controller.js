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
    const L = 50, R = 545, logoW = 65;
    let y = 30;

    // Company name
    doc.font("Helvetica-Bold").fontSize(15).fillColor(TEXT).text(CO_NAME, L, y);
    y += 16;

    // Tagline
    doc.font("Helvetica-Bold").fontSize(7).fillColor(BLUE).text(CO_TAGLINE, L, y);
    y += 12;

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
        doc.font("Helvetica").fontSize(7.5).fillColor(color).text(val, tx, y);
        y += 9.5;
    });

    // Logo – top right
    const logoTop = 30;
    try {
        doc.image(LOGO_PATH, R - logoW, logoTop, { width: logoW });
    } catch (_) {
        doc.font("Helvetica-Bold").fontSize(8).fillColor(TEXT).text(CO_NAME, R - logoW, logoTop + 20, { width: logoW, align: "center" });
    }

    // "INVOICE / ESTIMATE" label + number – right-aligned below logo
    const labelY = logoTop + 75;
    doc.font("Helvetica-Bold").fontSize(8).fillColor(GREY)
        .text(docType.toUpperCase(), L, labelY, { align: "right", width: R - L });
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor(BLUE)
        .text(docNumber, L, labelY + 10, { align: "right", width: R - L });

    const bottomY = Math.max(y, labelY + 20);
    hr(doc, bottomY + 2);
    return bottomY + 8;
};

// ─── 2. Invoice-To + Dates & Totals ──────────────────────────────────────────
const drawBillTo = (doc, client, meta, amountDue, startY) => {
    const L = 50, MID = 310;
    let leftY = startY;
    let rightY = startY;
    let type = meta.find((m) => m.label === "Status");
    // Left: INVOICE TO
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(GREY).text(type ? "INVOICE TO" : "ESTIMATE TO", L, leftY);
    leftY += 12;
    if (client.name) {
        doc.font("Helvetica-Bold").fontSize(11).fillColor(TEXT).text(client.name, L, leftY);
        leftY += 15;
    }
    const clientLines = [
        client.address && { val: client.address, color: BLUE },
        client.phone && { val: client.phone, color: TEXT },
        client.email && { val: client.email, color: BLUE },
    ].filter(Boolean);
    clientLines.forEach(({ val, color }) => {
        const tx = dot(doc, L, leftY, BLUE);
        doc.font("Helvetica").fontSize(7.5).fillColor(color).text(val, tx, leftY);
        leftY += 9;
    });

    // Right: DATES & TOTALS
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(GREY).text("DATES & TOTALS", L, rightY, { align: "right", width: 495 });
    rightY += 12;

    meta.forEach(({ label, value, valueColor, badge }) => {
        const rowY = rightY;
        doc.font("Helvetica").fontSize(7.5).fillColor(GREY).text(`${label}:`, MID, rowY, { width: 100 });
        if (badge) {
            // Status badge
            const badgeColor = (value || "").toLowerCase() === "paid" ? GREEN : "#e65100";
            doc.rect(MID + 105, rowY - 1, 28, 9).fill(badgeColor);
            doc.font("Helvetica-Bold").fontSize(6.5).fillColor("#fff")
                .text(value.toUpperCase(), MID + 106, rowY + 1, { width: 26, align: "center" });
        } else {
            doc.font("Helvetica-Bold").fontSize(7.5).fillColor(valueColor || TEXT)
                .text(value, MID + 105, rowY, { width: 130, align: "right" });
        }
        rightY += 11;
    });

    // AMOUNT DUE block
    rightY += 2;
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(GREY)
        .text("AMOUNT DUE", MID, rightY, { width: 235, align: "right" });
    rightY += 12;
    doc.font("Helvetica-Bold").fontSize(16).fillColor(BLUE)
        .text(`CAD ${fmtBig(amountDue)}`, MID, rightY, { width: 235, align: "right" });
    rightY += 24;

    const sectionBottom = Math.max(leftY, rightY) + 4;
    hr(doc, sectionBottom);
    return sectionBottom + 8;
};

// ─── 3. Items Table ───────────────────────────────────────────────────────────
const drawItems = (doc, items, startY) => {
    const L = 50;
    let y = startY;

    // Column headers (small grey)
    doc.font("Helvetica-Bold").fontSize(7).fillColor(GREY)
        .text("DESCRIPTION OF SERVICES", L, y)
        .text("RATE", 330, y, { width: 60, align: "right" })
        .text("QTY", 395, y, { width: 40, align: "center" })
        .text("NET AMOUNT", 440, y, { width: 105, align: "right" });
    y += 10;
    hr(doc, y);
    y += 8;

    (items || []).forEach((item) => {
        const descH = doc.heightOfString(item.description || "", { width: 275, font: "Helvetica", size: 7.5 });
        const rowH = Math.max(descH + 4, 11);
        doc.font("Helvetica").fontSize(7.5).fillColor(TEXT)
            .text(item.description || "", L, y, { width: 275 });
        doc.font("Helvetica").fontSize(7.5).fillColor(TEXT)
            .text(item.rate != null ? fmt(item.rate) : "", 330, y, { width: 60, align: "right" })
            .text(String(item.qty ?? 1), 395, y, { width: 40, align: "center" });
        doc.font("Helvetica-Bold").fontSize(7.5).fillColor(TEXT)
            .text(fmt(item.amount), 440, y, { width: 105, align: "right" });
        y += rowH;
    });

    return y + 8;
};

// ─── 4. Totals ─────────────────────────────────────────────────────────────────
const drawTotals = (doc, subtotal, tax, total, applyGst, applyPst, provincialTaxType, provincialTaxRate, startY) => {
    const MID = 310;
    let y = startY + 2;

    hr(doc, y, DIVIDER, MID, 545);
    y += 6;

    // Subtotal
    doc.font("Helvetica").fontSize(7.5).fillColor(GREY)
        .text("SUBTOTAL", MID, y, { width: 100 })
        .text(fmt(subtotal), MID + 105, y, { width: 130, align: "right" });
    y += 10;

    // Optional Taxes
    if (applyGst) {
        const partialGst = subtotal * 0.05;
        doc.font("Helvetica").fontSize(7.5).fillColor(GREY)
            .text("TAXES (GST 5%)", MID, y, { width: 100 })
            .text(fmt(partialGst), MID + 105, y, { width: 130, align: "right" });
        y += 10;
    }

    if (applyPst) {
        const pRate = parseFloat(provincialTaxRate) || 7.0;
        const pType = provincialTaxType || 'PST';
        const partialPst = subtotal * (pRate / 100);
        doc.font("Helvetica").fontSize(7.5).fillColor(GREY)
            .text(`TAXES (${pType} ${pRate}%)`, MID, y, { width: 100 })
            .text(fmt(partialPst), MID + 105, y, { width: 130, align: "right" });
        y += 10;
    }

    y += 1;

    // Total CAD – big navy bar
    const barH = 30;
    doc.rect(MID, y, 235, barH).fill(DARK_NAVY);
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#fff")
        .text("TOTAL CAD", MID + 10, y + 9, { width: 60 });
    doc.font("Helvetica-Bold").fontSize(14).fillColor("#fff")
        .text(fmtBig(total), MID + 10, y + 6, { width: 215, align: "right" });

    return y + barH + 8;
};

// ─── 5. Notes & Footer ────────────────────────────────────────────────────────
const drawNotesFooter = (doc, notes, startY) => {
    let y = startY + 4;
    hr(doc, y);
    y += 8;

    doc.font("Helvetica-Bold").fontSize(7).fillColor(GREY).text("Terms & Conditions", 50, y);
    y += 10;

    if (notes) {
        doc.font("Helvetica").fontSize(7.5).fillColor(TEXT).text(notes, 50, y, { width: 495 });
        y += doc.heightOfString(notes, { width: 495 }) + 6;
    }

    // Payment box (left)
    const boxH = 36;
    const boxY = y;
    doc.rect(50, boxY, 260, boxH).fillAndStroke("#fff8f0", "#e0c4a0");
    doc.font("Helvetica-Oblique").fontSize(7).fillColor(BLUE)
        .text(CO_PAY, 58, boxY + 5, { width: 244 });

    // Signature box (right)
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(GREY)
        .text("AUTHORIZED SIGNATURE", 340, boxY + boxH - 10, { width: 205, align: "right" });
    doc.moveTo(340, boxY + boxH - 2).lineTo(545, boxY + boxH - 2).strokeColor(GREY).lineWidth(0.5).stroke();

    // ======= Bottom Additions (Optimized Layout) =======
    let bottomY = boxY + boxH + 8;

    // --- Bottom Left: Review QR + Credentials ---
    try {
        // Reviews QR (Business)
        doc.image(path.join(__dirname, "../../public/qr_reviews.png"), 50, bottomY, { width: 45 });
        doc.font("Helvetica-Bold").fontSize(6).fillColor(GREY)
            .text("Scan to visit our business", 50, bottomY + 48, { width: 55, align: "center" });

        // Insurance Credentials
        const credsX = 110;
        doc.font("Helvetica-Bold").fontSize(8).fillColor(TEXT).text("Fully Insured Working", credsX, bottomY + 12);
        doc.font("Helvetica-Bold").fontSize(8).fillColor(TEXT).text("WCB Covered", credsX, bottomY + 24);
        
        // Helper line for visuals
        doc.rect(credsX - 10, bottomY + 8, 2, 28).fill(BLUE);
    } catch (e) {
        console.error("Missing bottom left assets", e);
    }

    // --- Bottom Right: Flag Stack -> QR Stack -> BBB Logo ---
    try {
        const rowY = bottomY + 2;

        // 1. Canadian Flag Stack
        const flagX = 290;
        doc.image(path.join(__dirname, "../../public/flag.png"), flagX + 5, rowY, { width: 50 });
        doc.font("Helvetica-Bold").fontSize(7).fillColor(TEXT)
            .text("Proudly Canadian", flagX, rowY + 35, { width: 60, align: "center" });

        // 2. Website QR Stack
        const qrX = 380;
        doc.image(path.join(__dirname, "../../public/qr_website.png"), qrX + 8, rowY, { width: 40 });
        doc.font("Helvetica-Bold").fontSize(6).fillColor(GREY)
            .text("Scan to visit our website", qrX, rowY + 45, { width: 56, align: "center" });

        // 3. BBB Logo
        doc.image(path.join(__dirname, "../../public/BBB.png"), 485, rowY + 5, { width: 55 });

    } catch(e) {
        console.error("Missing bottom right assets", e);
    }
};

// ─── Route Handlers ───────────────────────────────────────────────────────────
const buildDoc = (res, filename) => {
    const doc = new PDFDocument({ size: "A4", margin: 25, bufferPages: true });
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
        y = drawTotals(doc, d.subtotal, d.tax, d.total, d.applyGst, d.applyPst, d.provincialTaxType, d.provincialTaxRate, y);
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
        y = drawTotals(doc, d.subtotal, d.tax, d.total, d.applyGst, d.applyPst, d.provincialTaxType, d.provincialTaxRate, y);
        drawNotesFooter(doc, d.notes, y);

        doc.end();
    } catch (err) {
        console.error("Estimate PDF error:", err);
        res.status(500).json({ message: "Could not generate PDF" });
    }
};
