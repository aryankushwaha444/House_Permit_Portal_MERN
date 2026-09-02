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

async function update(id, user, body, files = []) {
  const { missing, invalid } = validPermit(body);

  if (missing.length || invalid.length) {
    throw Object.assign(
      new Error(
        missing.length
          ? `Missing required fields: ${missing.join(", ")}`
          : `Invalid values for fields: ${invalid.join(", ")}`
      ),
      { statusCode: 400 }
    );
  }

  const permit = await Permit.findOne({
    _id: id,
    userId: user._id,
  });

  if (!permit) {
    throw Object.assign(new Error("Permit not found"), { statusCode: 404 });
  }

  permit.propertyAddress = body.propertyAddress;
  permit.propertyType = body.propertyType;
  permit.constructionType = body.constructionType;
  permit.plotArea = Number(body.plotArea);
  permit.buildingArea = Number(body.buildingArea);
  permit.estimatedCost = Number(body.estimatedCost);

  if (files.length) {
    permit.documents = files.map((file) => ({
      fileName: file.originalname,
      filePath: `/uploads/${file.filename}`,
      fileType: file.mimetype,
    }));
  }

  // Re-submit edited permit for review
  permit.status = "Pending";
  permit.remarks = undefined;

  return permit.save();
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

async function mineById(id, userId) {
  return Permit.findOne({
    _id: id,
    userId,
  });
}


module.exports = {
  create,
  update,
  mine,
  mineById,
  all,
  updateStatus,
  byId: (id) => Permit.findById(id),
};
