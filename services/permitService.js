const Permit = require("../models/Permit");
const { validPermit } = require("../utils/validation");
async function create(user, body, files = []) {
  const { missing, invalid } = validPermit(body);
  if (missing.length || invalid.length)
    throw Object.assign(
      new Error(
        missing.length
          ? `Missing required fields: ${missing.join(", ")}`
          : `Invalid values for fields: ${invalid.join(", ")}`
      ),
      { statusCode: 400 }
    );
  return Permit.create({
    ...body,
    userId: user._id,
    applicantName: user.fullName,
    plotArea: Number(body.plotArea),
    buildingArea: Number(body.buildingArea),
    estimatedCost: Number(body.estimatedCost),
    documents: files.map((file) => ({
      fileName: file.originalname,
      filePath: `/uploads/${file.filename}`,
      fileType: file.mimetype,
    })),
  });
}
const mine = (userId) => Permit.find({ userId }).sort({ createdAt: -1 });
const all = () =>
  Permit.find()
    .sort({ createdAt: -1 })
    .populate("userId", "fullName email phone");
async function updateStatus(id, status, remarks) {
  if (!["Pending", "Approved", "Rejected"].includes(status))
    throw Object.assign(new Error("Invalid status"), { statusCode: 400 });
  const permit = await Permit.findById(id);
  if (!permit)
    throw Object.assign(new Error("Permit not found"), { statusCode: 404 });
  permit.status = status;
  if (remarks !== undefined) permit.remarks = remarks;
  return permit.save();
}
module.exports = {
  create,
  mine,
  all,
  updateStatus,
  byId: (id) => Permit.findById(id),
};
