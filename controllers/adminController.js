const User = require("../models/user");
const { all, updateStatus, byId } = require("../services/permitService");

async function allPermits(req, res, next) {
  try {
    res.json(await all());
  } catch (error) {
    next(error);
  }
}

async function getPermit(req, res, next) {
  try {
    const permit = await byId(req.params.id);

    if (!permit) {
      return res.status(404).json({
        error: "Permit not found",
      });
    }

    res.json(permit);
  } catch (error) {
    next(error);
  }
}

async function updatePermitStatus(req, res, next) {
  try {
    const permit = await updateStatus(
      req.params.id,
      req.body.status,
      req.body.remarks
    );

    res.json({
      message: "Permit status updated successfully",
      permit,
    });
  } catch (error) {
    next(error);
  }
}

async function allUsers(req, res, next) {
  try {
    const users = await User.find().select("-password").sort({ _id: -1 });

    res.json(users);
  } catch (error) {
    next(error);
  }
}

// Update user password and role
async function updateUser(req, res, next) {
  try {
    const { password, role } = req.body;

    if (!password && !role) {
      return res.status(400).json({
        error: "Password or role is required",
      });
    }

    if (role && !["user", "admin"].includes(role)) {
      return res.status(400).json({
        error: "Invalid role",
      });
    }

    // Prevent an admin from removing their own admin access
    if (req.params.id === req.user._id.toString() && role === "user") {
      return res.status(400).json({
        error: "You cannot remove your own admin role",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          error: "Password must be at least 6 characters",
        });
      }

      user.password = password;
    }

    if (role) {
      user.role = role;
    }

    await user.save();

    res.json({
      message: "User updated successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  allPermits,
  getPermit,
  updatePermitStatus,
  allUsers,
  updateUser,
};
