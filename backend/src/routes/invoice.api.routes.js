const express = require('express');
const router = express.Router();
const { Invoice, Estimate, User } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { jwtAuth } = require('../middlewares/auth.middleware');

// All routes require JWT
router.use(jwtAuth);

// GET /api/invoices - list all invoices
router.get('/', async (req, res) => {
    try {
        const { limit = 100, offset = 0, leadId, estimateId } = req.query;
        const where = {};
        if (leadId) where.leadId = leadId;
        if (estimateId) where.estimateId = estimateId;

        const invoices = await Invoice.findAll({
            where,
            include: [
                { model: Estimate, as: 'estimate', attributes: ['id', 'estimateNumber'] },
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        const data = invoices.map(inv => {
            const d = inv.toJSON();
            d.total = parseFloat(d.total || 0);
            d.subtotal = parseFloat(d.subtotal || 0);
            d.tax = parseFloat(d.tax || 0);
            if (Array.isArray(d.items)) {
                d.items = d.items.map(i => ({ ...i, amount: parseFloat(i.amount || 0) }));
            }
            return d;
        });

        res.json({ success: true, data });
    } catch (err) {
        console.error('GET /api/invoices error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/invoices/:id
router.get('/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id, {
            include: [{ model: Estimate, as: 'estimate', attributes: ['id', 'estimateNumber'] }],
        });
        if (!invoice) return res.status(404).json({ success: false, message: 'Not found' });

        const d = invoice.toJSON();
        d.total = parseFloat(d.total || 0);
        d.subtotal = parseFloat(d.subtotal || 0);
        d.tax = parseFloat(d.tax || 0);
        if (Array.isArray(d.items)) {
            d.items = d.items.map(i => ({ ...i, amount: parseFloat(i.amount || 0) }));
        }
        res.json({ success: true, data: d });
    } catch (err) {
        console.error('GET /api/invoices/:id error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/invoices - create
router.post('/', async (req, res) => {
    try {
        const {
            clientName, clientEmail, clientPhone, clientAddress,
            date, dueDate, notes, status, items = [], estimateId, leadId,
        } = req.body;

        if (!clientName) return res.status(400).json({ success: false, message: 'clientName is required' });

        const parsedItems = Array.isArray(items) ? items : JSON.parse(items || '[]');
        let subtotal = 0;
        parsedItems.forEach(item => {
            item.amount = parseFloat(item.rate || 0) * parseFloat(item.qty || 1);
            subtotal += item.amount;
        });
        const tax = subtotal * 0.05;
        const total = subtotal + tax;
        const invoiceNumber = `INV-${uuidv4().slice(0, 8).toUpperCase()}`;

        const invoice = await Invoice.create({
            invoiceNumber,
            clientName, clientEmail, clientPhone, clientAddress,
            date: date || new Date(),
            dueDate: dueDate || null,
            items: parsedItems,
            subtotal, tax, total,
            notes,
            status: status || 'Pending',
            createdById: req.user?.id || null,
            estimateId: estimateId || null,
            leadId: leadId || null,
        });

        res.status(201).json({ success: true, data: invoice });
    } catch (err) {
        console.error('POST /api/invoices error:', err);
        res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
});

// PUT /api/invoices/:id - update
router.put('/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id);
        if (!invoice) return res.status(404).json({ success: false, message: 'Not found' });

        const {
            clientName, clientEmail, clientPhone, clientAddress,
            date, dueDate, notes, status, items, leadId,
        } = req.body;

        const parsedItems = Array.isArray(items) ? items : JSON.parse(items || '[]');
        let subtotal = 0;
        parsedItems.forEach(item => {
            item.amount = parseFloat(item.rate || 0) * parseFloat(item.qty || 1);
            subtotal += item.amount;
        });
        const tax = subtotal * 0.05;
        const total = subtotal + tax;

        await invoice.update({
            clientName, clientEmail, clientPhone, clientAddress,
            date, dueDate: dueDate || null,
            items: parsedItems, subtotal, tax, total,
            notes, status, leadId: leadId || invoice.leadId,
        });

        res.json({ success: true, data: invoice });
    } catch (err) {
        console.error('PUT /api/invoices/:id error:', err);
        res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
});

// DELETE /api/invoices/:id
router.delete('/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id);
        if (!invoice) return res.status(404).json({ success: false, message: 'Not found' });
        await invoice.destroy();
        res.json({ success: true, message: 'Deleted' });
    } catch (err) {
        console.error('DELETE /api/invoices/:id error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
