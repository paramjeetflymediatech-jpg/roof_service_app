const express = require('express');
const router = express.Router();
const { Estimate, Invoice, User } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { jwtAuth } = require('../middlewares/auth.middleware');

// All routes require JWT
router.use(jwtAuth);

// GET /api/estimates - list all estimates
router.get('/', async (req, res) => {
    try {
        const { limit = 100, offset = 0, leadId } = req.query;
        const where = {};
        if (leadId) where.leadId = leadId;

        const estimates = await Estimate.findAll({
            where,
            include: [
                { model: Invoice, as: 'invoices', attributes: ['id', 'status'] },
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        const data = estimates.map(e => {
            const d = e.toJSON();
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
        console.error('GET /api/estimates error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/estimates/:id
router.get('/:id', async (req, res) => {
    try {
        const estimate = await Estimate.findByPk(req.params.id, {
            include: [{ model: Invoice, as: 'invoices', attributes: ['id', 'status', 'total'] }],
        });
        if (!estimate) return res.status(404).json({ success: false, message: 'Not found' });

        const d = estimate.toJSON();
        d.total = parseFloat(d.total || 0);
        d.subtotal = parseFloat(d.subtotal || 0);
        d.tax = parseFloat(d.tax || 0);
        if (Array.isArray(d.items)) {
            d.items = d.items.map(i => ({ ...i, amount: parseFloat(i.amount || 0) }));
        }
        res.json({ success: true, data: d });
    } catch (err) {
        console.error('GET /api/estimates/:id error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/estimates - create
router.post('/', async (req, res) => {
    try {
        const {
            clientName, clientEmail, clientPhone, clientAddress,
            date, expiryDate, notes, status, items = [], leadId,
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
        const estimateNumber = `EST-${uuidv4().slice(0, 8).toUpperCase()}`;

        const estimate = await Estimate.create({
            estimateNumber,
            clientName, clientEmail, clientPhone, clientAddress,
            date: date || new Date(),
            expiryDate: expiryDate || null,
            items: parsedItems,
            subtotal, tax, total,
            notes,
            status: status || 'Draft',
            createdById: req.user?.id || null,
            leadId: leadId || null,
        });

        res.status(201).json({ success: true, data: estimate });
    } catch (err) {
        console.error('POST /api/estimates error:', err);
        res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
});

// PUT /api/estimates/:id - update
router.put('/:id', async (req, res) => {
    try {
        const estimate = await Estimate.findByPk(req.params.id);
        if (!estimate) return res.status(404).json({ success: false, message: 'Not found' });

        const {
            clientName, clientEmail, clientPhone, clientAddress,
            date, expiryDate, notes, status, items, leadId,
        } = req.body;

        const parsedItems = Array.isArray(items) ? items : JSON.parse(items || '[]');
        let subtotal = 0;
        parsedItems.forEach(item => {
            item.amount = parseFloat(item.rate || 0) * parseFloat(item.qty || 1);
            subtotal += item.amount;
        });
        const tax = subtotal * 0.05;
        const total = subtotal + tax;

        await estimate.update({
            clientName, clientEmail, clientPhone, clientAddress,
            date, expiryDate: expiryDate || null,
            items: parsedItems, subtotal, tax, total,
            notes, status, leadId: leadId || estimate.leadId,
        });

        res.json({ success: true, data: estimate });
    } catch (err) {
        console.error('PUT /api/estimates/:id error:', err);
        res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
});

// DELETE /api/estimates/:id
router.delete('/:id', async (req, res) => {
    try {
        const estimate = await Estimate.findByPk(req.params.id);
        if (!estimate) return res.status(404).json({ success: false, message: 'Not found' });
        await estimate.destroy();
        res.json({ success: true, message: 'Deleted' });
    } catch (err) {
        console.error('DELETE /api/estimates/:id error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
