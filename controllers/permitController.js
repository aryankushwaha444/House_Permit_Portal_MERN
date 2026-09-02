const permits = require("../services/permitService");

async function create(req, res, next) {
  try {
    res.status(201).json({
      message: "Permit application submitted successfully",
      permit: await permits.create(req.user, req.body, req.files),
    });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    res.json({
      message: "Permit application updated successfully",
      permit: await permits.update(
        req.params.id,
        req.user,
        req.body,
        req.files
      ),
    });
  } catch (error) {
    next(error);
  }
}

async function mine(req, res, next) {
  try {
    res.json(await permits.mine(req.user._id));
  } catch (error) {
    next(error);
  }
}

async function all(req, res, next) {
  try {
    res.json(await permits.all());
  } catch (error) {
    next(error);
  }
}

async function byId(req, res, next) {
  try {
    const permit = await permits.byId(req.params.id);
    if (!permit) return res.status(404).json({ error: "Permit not found" });
    res.json(permit);
  } catch (error) {
    next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    res.json({
      message: "Permit status updated",
      permit: await permits.updateStatus(
        req.params.id,
        req.body.status,
        req.body.remarks
      ),
    });
  } catch (error) {
    next(error);
  }
}

async function mineById(req, res, next) {
  try {
    const permit = await permits.mineById(req.params.id, req.user._id);

    if (!permit) {
      return res.status(404).json({ error: "Permit not found" });
    }

    res.json(permit);
  } catch (error) {
    next(error);
  }
}

module.exports = { create, update, mine, mineById, all, byId, updateStatus };
