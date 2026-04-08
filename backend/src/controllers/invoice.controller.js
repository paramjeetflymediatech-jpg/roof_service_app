const { Invoice, User, Estimate, Lead } = require("../models");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
/**
 * Helper to calculate work hours from a lead
 */
const calculateWorkHours = (lead) => {
  if (!lead) return 0;

  /**
   * Helper to parse time string like "09:00", "09:30 AM", "17:00"
   */
  const parseTimeStr = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string") return null;
    const match = timeStr.match(/(\d+):(\d+)(?:\s*(AM|PM))?/i);
    if (!match) return null;

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3];

    if (ampm) {
      if (ampm.toUpperCase() === "PM" && hours < 12) hours += 12;
      if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;
    }
    return hours + minutes / 60;
  };

  // 1. Try manual employeeStartTime and employeeEndTime first (Override)
  if (lead.employeeStartTime && lead.employeeEndTime) {
    const start = parseTimeStr(lead.employeeStartTime);
    const end = parseTimeStr(lead.employeeEndTime);

    if (start !== null && end !== null) {
      let diff = end - start;
      if (diff < 0) diff += 24; // Handle overnight wrap
      return parseFloat(diff.toFixed(2));
    }
  }

  // 2. Fallback to automatic inTime and outTime
  if (lead.inTime && lead.outTime) {
    const start = new Date(lead.inTime);
    const end = new Date(lead.outTime);
    if (!isNaN(start) && !isNaN(end)) {
      const diffMs = end - start;
      if (diffMs > 0) {
        return parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
      }
    }
  }

  return 0;
};

/**
 * Controller for managing Invoices in the admin section
 */
const InvoiceController = {
  /**
   * List all invoices
   */
  async getAllInvoices(req, res) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = 12;
      const offset = (page - 1) * limit;
      const { search, status } = req.query;

      const where = {};
      if (status) {
        where.status = status;
      }
      if (search) {
        const parsedDate = moment(search, ["DD/MM/YYYY", "D/M/YYYY"], true);

        if (parsedDate.isValid()) {
          where.created_at = {
            [Op.between]: [
              parsedDate.startOf("day").toDate(),
              parsedDate.endOf("day").toDate(),
            ],
          };
        } else {
          where[Op.or] = [
            { invoiceNumber: { [Op.like]: `%${search}%` } },
            { clientName: { [Op.like]: `%${search}%` } },
            { clientEmail: { [Op.like]: `%${search}%` } },
            { total: { [Op.like]: `%${search}%` } }
          ];
        }
      }

      const { count, rows: invoices } = await Invoice.findAndCountAll({
        where,
        include: [
          { model: User, as: "createdBy", attributes: ["name"] },
          { model: Lead, as: "lead", attributes: ["id", "name"] },
          {
            model: Estimate,
            as: "estimate",
            attributes: ["id", "estimateNumber"],
          },
        ],
        offset,
        limit,
        order: [["createdAt", "DESC"]],
      });

      // Ensure decimal fields are numbers
      const formattedInvoices = invoices.map((inv) => {
        const data = inv.toJSON();
        data.total = parseFloat(data.total || 0);
        data.subtotal = parseFloat(data.subtotal || 0);
        data.tax = parseFloat(data.tax || 0);
        if (data.items && Array.isArray(data.items)) {
          data.items = data.items.map((item) => ({
            ...item,
            amount: parseFloat(item.amount || 0),
          }));
        }
        return data;
      });

      if (req.xhr || req.query.ajax) {
        return res.render("admin/invoices/_table_rows", { invoices: formattedInvoices }, (err, tableHtml) => {
          res.render("admin/invoices/_cards", { invoices: formattedInvoices }, (err, cardHtml) => {
            res.render("admin/invoices/_pagination", {
              currentPage: page,
              totalPages: Math.ceil(count / limit),
              totalItems: count,
              limit,
            }, (err, paginationHtml) => {
              return res.json({
                success: true,
                tableHtml,
                cardHtml: cardHtml || "",
                paginationHtml,
                totalItems: count,
              });
            });
          });
        });
      }

      res.render("admin/invoices/index", {
        invoices: formattedInvoices,
        title: "Invoices",
        user: req.user,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        limit,
        query: req.query,
      });
    } catch (error) {
      console.error("Error fetching invoices:", error);
      if (req.xhr || req.query.ajax) {
        return res.status(500).json({ success: false, message: "Error loading invoices" });
      }
      res.status(500).send("Internal Server Error");
    }
  },

  /**
   * Render the create invoice form
   */
  async getCreateInvoice(req, res) {
    try {
      const { estimateId, leadId } = req.query;
      let estimate = null;
      let lead = null;
      let workHours = 0;

      if (estimateId) {
        estimate = await Estimate.findByPk(estimateId, { include: ["lead"] });
        if (estimate && estimate.lead) {
          lead = estimate.lead;
        }
      }

      if (leadId && !lead) {
        lead = await Lead.findByPk(leadId);
      }

      if (lead) {
        workHours = calculateWorkHours(lead);
      }

      res.render("admin/invoices/create", {
        title: "Create Invoice",
        user: req.user,
        estimate,
        lead,
        workHours,
      });
    } catch (error) {
      console.error("Error rendering create invoice form:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  /**
   * Create a new invoice
   */
  async createInvoice(req, res) {
    try {
      const {
        clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        date,
        dueDate,
        notes,
        items, // Expecting an array of objects
        estimateId,
        applyGst,
        applyPst,
        provincialTaxType,
        provincialTaxRate,
      } = req.body;
      
      const isGst = applyGst === 'on' || applyGst === true || applyGst === 'true';
      const isPst = applyPst === 'on' || applyPst === true || applyPst === 'true';
      const pTaxRate = parseFloat(provincialTaxRate) || 7.0;
      const pTaxType = provincialTaxType || 'PST';

      // Calculate totals
      let subtotal = 0;
      const parsedItems = Array.isArray(items)
        ? items
        : JSON.parse(items || "[]");

      parsedItems.forEach((item) => {
        item.amount = parseFloat(item.rate) * parseFloat(item.qty);
        subtotal += item.amount;
      });

      const gstAmount = isGst ? subtotal * 0.05 : 0;
      const pstAmount = isPst ? subtotal * (pTaxRate / 100) : 0;
      const tax = gstAmount + pstAmount;
      const total = subtotal + tax;

      // Generate invoice number
      const invoiceNumber = `INV-${uuidv4()}`;

      await Invoice.create({
        invoiceNumber,
        clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        date,
        dueDate: dueDate || null,
        items: parsedItems,
        subtotal,
        applyGst: isGst,
        applyPst: isPst,
        provincialTaxType: pTaxType,
        provincialTaxRate: pTaxRate,
        tax,
        total,
        notes,
        status: "Unpaid",
        createdById: req.user.id,
        estimateId: estimateId || null,
        leadId: req.body.leadId || null,
      });

      res.redirect("/admin/invoices");
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  /**
   * Render the edit invoice form
   */
  async getEditInvoice(req, res) {
    try {
      const invoice = await Invoice.findByPk(req.params.id, {
        include: [
          { model: Estimate, as: "estimate", include: ["lead"] },
          { model: Lead, as: "lead" },
        ],
      });
      if (!invoice) {
        return res.status(404).send("Invoice not found");
      }

      const formattedInvoice = invoice.toJSON();
      formattedInvoice.total = parseFloat(formattedInvoice.total || 0);
      formattedInvoice.subtotal = parseFloat(formattedInvoice.subtotal || 0);
      formattedInvoice.tax = parseFloat(formattedInvoice.tax || 0);
      if (formattedInvoice.items && Array.isArray(formattedInvoice.items)) {
        formattedInvoice.items = formattedInvoice.items.map((item) => ({
          ...item,
          amount: parseFloat(item.amount || 0),
        }));
      }

      let lead =
        invoice.lead || (invoice.estimate ? invoice.estimate.lead : null);
      let workHours = calculateWorkHours(lead);

      res.render("admin/invoices/edit", {
        invoice: formattedInvoice,
        title: "Edit Invoice",
        user: req.user,
        workHours,
        lead,
      });
    } catch (error) {
      console.error("Error rendering edit invoice form:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  /**
   * Update an existing invoice
   */
  async updateInvoice(req, res) {
    try {
      const {
        clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        date,
        dueDate,
        notes,
        items,
        status,
        leadId,
        applyGst,
        applyPst,
        provincialTaxType,
        provincialTaxRate,
      } = req.body;
      
      const isGst = applyGst === 'on' || applyGst === true || applyGst === 'true';
      const isPst = applyPst === 'on' || applyPst === true || applyPst === 'true';
      const pTaxRate = parseFloat(provincialTaxRate) || 7.0;
      const pTaxType = provincialTaxType || 'PST';

      const invoice = await Invoice.findByPk(req.params.id);
      if (!invoice) {
        return res.status(404).send("Invoice not found");
      }

      // Recalculate totals
      let subtotal = 0;
      const parsedItems = Array.isArray(items)
        ? items
        : JSON.parse(items || "[]");

      parsedItems.forEach((item) => {
        item.amount = parseFloat(item.rate) * parseFloat(item.qty);
        subtotal += item.amount;
      });

      const gstAmount = isGst ? subtotal * 0.05 : 0;
      const pstAmount = isPst ? subtotal * (pTaxRate / 100) : 0;
      const tax = gstAmount + pstAmount;
      const total = subtotal + tax;

      await invoice.update({
        clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        date,
        dueDate,
        items: parsedItems,
        subtotal,
        applyGst: isGst,
        applyPst: isPst,
        provincialTaxType: pTaxType,
        provincialTaxRate: pTaxRate,
        tax,
        total,
        notes,
        status,
        leadId: leadId || null,
      });

      res.redirect("/admin/invoices");
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  /**
   * Preview/Print invoice
   */
  async previewInvoice(req, res) {
    try {
      const invoice = await Invoice.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: "createdBy",
            attributes: ["name", "email", "phone"],
          },
          {
            model: Lead,
            as: "lead",
            attributes: ["id", "name"],
          },
          {
            model: Estimate,
            as: "estimate",
            attributes: ["id", "estimateNumber"],
          },
        ],
      });
      if (!invoice) {
        return res.status(404).send("Invoice not found");
      }

      const formattedInvoice = invoice.toJSON();
      formattedInvoice.total = parseFloat(formattedInvoice.total || 0);
      formattedInvoice.subtotal = parseFloat(formattedInvoice.subtotal || 0);
      formattedInvoice.tax = parseFloat(formattedInvoice.tax || 0);
      if (formattedInvoice.items && Array.isArray(formattedInvoice.items)) {
        formattedInvoice.items = formattedInvoice.items.map((item) => ({
          ...item,
          amount: parseFloat(item.amount || 0),
        }));
      }

      res.render("admin/invoices/preview", {
        invoice: formattedInvoice,
        title: `Invoice ${invoice.invoiceNumber}`,
        user: req.user,
        layout: false,
      });
    } catch (error) {
      console.error("Error rendering invoice preview:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  /**
   * Delete an invoice
   */
  async deleteInvoice(req, res) {
    try {
      const invoice = await Invoice.findByPk(req.params.id);
      if (!invoice) {
        return res.status(404).send("Invoice not found");
      }

      await invoice.destroy();
      res.redirect("/admin/invoices");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  /**
   * Generate invoice from an estimate
   */
  async generateInvoice(req, res) {
    try {
      const { estimateId } = req.params;
      const estimate = await Estimate.findByPk(estimateId, {
        include: ["lead"],
      });
      if (!estimate) {
        return res.status(404).send("Estimate not found");
      }

      let workHours = estimate.lead ? calculateWorkHours(estimate.lead) : 0;

      res.render("admin/invoices/create", {
        title: "Generate Invoice",
        user: req.user,
        estimate,
        lead: estimate.lead,
        workHours,
      });
    } catch (error) {
      console.error("Error generating invoice from estimate:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  /**
   * Generate invoice from a lead
   */
  async generateInvoiceFromLead(req, res) {
    try {
      const { leadId } = req.params;
      const lead = await Lead.findByPk(leadId);
      if (!lead) {
        return res.status(404).send("Lead not found");
      }

      // Check if there's an associated estimate
      const estimate = await Estimate.findOne({ where: { leadId } });
      const workHours = calculateWorkHours(lead);

      res.render("admin/invoices/create", {
        title: "Generate Invoice",
        user: req.user,
        estimate,
        lead,
        workHours,
      });
    } catch (error) {
      console.error("Error generating invoice from lead:", error);
      res.status(500).send("Internal Server Error");
    }
  },
};

module.exports = InvoiceController;
