const express = require("express");
const router = express.Router();

const serviceController = require("../controllers/service.controller");

const upload = require("../middlewares/upload.middleware");

// /api/services
router.post("/", upload.single("image"), serviceController.createService);
router.get("/", serviceController.getServices);
router.get("/location-services", serviceController.getlocation_services);
router.get("/all-location-services", serviceController.getalllocation_services);
router.get("/slug/:slug", serviceController.getServiceBySlug);
router.get("/:id", serviceController.getServiceById);
router.put("/:id", upload.single("image"), serviceController.updateService);
router.delete("/:id", serviceController.deleteService);

module.exports = router;
