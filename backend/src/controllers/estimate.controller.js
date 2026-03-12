const { Estimate, User, Lead, Invoice } = require("../models");
const { Op, fn, col, where: sequelizeWhere } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

/**
 * Controller for managing Estimates in the admin section
 */
const EstimateController = {
  /**
   * List all estimates
   */
  async getAllEstimates(req, res) {
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
        where[Op.or] = [
          { estimateNumber: { [Op.like]: `%${search}%` } },
          { clientName: { [Op.like]: `%${search}%` } },
          { clientEmail: { [Op.like]: `%${search}%` } },
          { total: { [Op.like]: `%${search}%` } },
          sequelizeWhere(
            fn("DATE_FORMAT", col("Estimate.created_at"), "%d/%m/%Y"),
            {
              [Op.like]: `%${search}%`
            }
          )
        ];
      }

      const { count, rows: estimates } = await Estimate.findAndCountAll({
        where,
        include: [
          { model: User, as: "createdBy", attributes: ["name"] },
          { model: Invoice, as: "invoices", attributes: ["id", "status"] },
        ],
        offset,
        limit,
        order: [["createdAt", "DESC"]],
      });

      // Ensure decimal fields are numbers
      const formattedEstimates = estimates.map((est) => {
        const data = est.toJSON();
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
        return res.render("admin/estimates/_table_rows", { estimates: formattedEstimates }, (err, tableHtml) => {
          res.render("admin/estimates/_cards", { estimates: formattedEstimates }, (err, cardHtml) => {
            res.render("admin/estimates/_pagination", {
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

      res.render("admin/estimates/index", {
        estimates: formattedEstimates,
        title: "Estimates",
        user: req.user,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        limit,
        query: req.query,
      });
    } catch (error) {
      console.error("Error fetching estimates:", error);
      if (req.xhr || req.query.ajax) {
        return res.status(500).json({ success: false, message: "Error loading estimates" });
      }
      res.status(500).send("Internal Server Error");
    }
  },

  /**
   * Render the create estimate form
   */
  async getCreateEstimate(req, res) {
    try {
      const { leadId } = req.query;
      let lead = null;
      if (leadId) {
        lead = await Lead.findByPk(leadId);
      }
      res.render("admin/estimates/create", {
        title: "Create Estimate",
        user: req.user,
        lead,
      });
    } catch (error) {
      console.error("Error rendering create estimate form:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  /**
   * Create a new estimate
   */
  async createEstimate(req, res) {
    try {
      const {
        clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        date,
        expiryDate,
        timeEstimate,
        notes,
        items, // Expecting an array of objects
        leadId,
      } = req.body;

      // Calculate totals
      let subtotal = 0;
      const parsedItems = Array.isArray(items)
        ? items
        : JSON.parse(items || "[]");

      parsedItems.forEach((item) => {
        item.amount = parseFloat(item.rate) * parseFloat(item.qty);
        subtotal += item.amount;
      });

      const tax = subtotal * 0.05; // 5% GST
      const total = subtotal + tax;

      // Generate estimate number (simple version)
      const estimateNumber = `EST-${uuidv4()}`;

      await Estimate.create({
        estimateNumber,
        clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        date,
        expiryDate,
        items: parsedItems,
        subtotal,
        tax,
        total,
        timeEstimate,
        notes,
        status: "Draft",
        createdById: req.user.id,
        leadId: leadId || null,
      });

      res.redirect("/admin/estimates");
    } catch (error) {
      console.error("Error creating estimate:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  /**
   * Render the edit estimate form
   */
  async getEditEstimate(req, res) {
    try {
      const estimate = await Estimate.findByPk(req.params.id);
      if (!estimate) {
        return res.status(404).send("Estimate not found");
      }

      const formattedEstimate = estimate.toJSON();
      formattedEstimate.total = parseFloat(formattedEstimate.total || 0);
      formattedEstimate.subtotal = parseFloat(formattedEstimate.subtotal || 0);
      formattedEstimate.tax = parseFloat(formattedEstimate.tax || 0);
      if (formattedEstimate.items && Array.isArray(formattedEstimate.items)) {
        formattedEstimate.items = formattedEstimate.items.map((item) => ({
          ...item,
          amount: parseFloat(item.amount || 0),
        }));
      }

      res.render("admin/estimates/edit", {
        estimate: formattedEstimate,
        title: "Edit Estimate",
        user: req.user,
      });
    } catch (error) {
      console.error("Error rendering edit estimate form:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  /**
   * Update an existing estimate
   */
  async updateEstimate(req, res) {
    try {
      const {
        clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        date,
        expiryDate,
        timeEstimate,
        notes,
        items,
        status,
      } = req.body;

      const estimate = await Estimate.findByPk(req.params.id);
      if (!estimate) {
        return res.status(404).send("Estimate not found");
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

      const tax = subtotal * 0.05;
      const total = subtotal + tax;

      await estimate.update({
        clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        date,
        expiryDate,
        items: parsedItems,
        subtotal,
        tax,
        total,
        timeEstimate,
        notes,
        status,
      });

      res.redirect("/admin/estimates");
    } catch (error) {
      console.error("Error updating estimate:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  /**
   * Preview/Print estimate
   */
  async previewEstimate(req, res) {
    try {
      const estimate = await Estimate.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: "createdBy",
            attributes: ["name", "email", "phone"],
          },
          {
            model: Invoice,
            as: "invoices",
            attributes: ["id", "invoiceNumber"],
          },
        ],
      });
      if (!estimate) {
        return res.status(404).send("Estimate not found");
      }

      const formattedEstimate = estimate.toJSON();
      formattedEstimate.total = parseFloat(formattedEstimate.total || 0);
      formattedEstimate.subtotal = parseFloat(formattedEstimate.subtotal || 0);
      formattedEstimate.tax = parseFloat(formattedEstimate.tax || 0);
      if (formattedEstimate.items && Array.isArray(formattedEstimate.items)) {
        formattedEstimate.items = formattedEstimate.items.map((item) => ({
          ...item,
          amount: parseFloat(item.amount || 0),
        }));
      }

      res.render("admin/estimates/preview", {
        estimate: formattedEstimate,
        title: `Estimate ${estimate.estimateNumber}`,
        user: req.user,
        layout: false, // Don't use standard admin layout for preview
      });
    } catch (error) {
      console.error("Error rendering estimate preview:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  /**
   * Delete an estimate
   */
  async deleteEstimate(req, res) {
    try {
      const estimate = await Estimate.findByPk(req.params.id);
      if (!estimate) {
        return res.status(404).send("Estimate not found");
      }

      await estimate.destroy();
      res.redirect("/admin/estimates");
    } catch (error) {
      console.error("Error deleting estimate:", error);
      res.status(500).send("Internal Server Error");
    }
  },
};

module.exports = EstimateController;
