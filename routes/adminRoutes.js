const router = require("express").Router();

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const controller = require("../controllers/adminController");

router.use(auth, admin);

// Permits
router.get("/permits", controller.allPermits);
router.get("/permits/:id", controller.getPermit);
router.patch("/permits/:id/status", controller.updatePermitStatus);

// Users
router.get("/users", controller.allUsers);
router.patch("/users/:id", controller.updateUser);

module.exports = router;
