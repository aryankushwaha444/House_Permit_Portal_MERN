const router = require("express").Router();

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const upload = require("../middleware/uploadMiddleware");

const controller = require("../controllers/permitController");

// ==============================
// CREATE PERMIT
// ==============================

router.post("/", auth, upload.array("documents", 10), controller.create);

// ==============================
// NORMAL USER - OWN PERMITS
// ==============================

router.get("/my-permits", auth, controller.mine);

// ==============================
// ADMIN - ALL PERMITS
// ==============================

router.get("/all", auth, admin, controller.all);

// ==============================
// NORMAL USER - EDIT PERMIT
// ==============================

router.get("/:id/edit", auth, controller.mineById);

// ==============================
// NORMAL USER - UPDATE PERMIT
// ==============================

router.put("/:id", auth, upload.array("documents", 10), controller.update);

// ==============================
// ADMIN - PERMIT DETAILS
// ==============================

router.get("/:id", auth, admin, controller.byId);

// ==============================
// ADMIN - STATUS UPDATE
// ==============================

router.put("/:id/status", auth, admin, controller.updateStatus);

module.exports = router;
