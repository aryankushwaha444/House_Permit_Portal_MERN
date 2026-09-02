const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const controller = require("../controllers/adminController");
router.use(auth, admin);
router.get("/permits", controller.allPermits);
router.patch("/permits/:id/status", controller.updatePermitStatus);
module.exports = router;
