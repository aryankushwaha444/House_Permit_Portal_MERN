const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const controller = require("../controllers/permitController");
const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (req, file, cb) =>
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    ),
});

const upload = multer({ storage }).array("documents");

router.post("/", auth, upload, controller.create);

router.get("/my-permits", auth, controller.mine);
router.get("/all", auth, admin, controller.all);

// Normal user's own permit
router.get("/:id/edit", auth, controller.mineById);

// Normal user's own permit update
router.put("/:id", auth, upload, controller.update);

// Admin-only permit details
router.get("/:id", auth, admin, controller.byId);

// Admin-only status update
router.put("/:id/status", auth, admin, controller.updateStatus);

module.exports = router;
