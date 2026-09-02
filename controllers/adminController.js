const { all, updateStatus } = require("../services/permitService");
async function allPermits(req, res, next) {
  try {
    res.json(await all());
  } catch (error) {
    next(error);
  }
}
async function updatePermitStatus(req, res, next) {
  try {
    res.json(
      await updateStatus(req.params.id, req.body.status, req.body.remarks)
    );
  } catch (error) {
    next(error);
  }
}
module.exports = { allPermits, updatePermitStatus };
