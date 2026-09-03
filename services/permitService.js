const Permit = require("../models/permit");

const { validPermit } = require("../utils/validation");

const { uploadToCloudinary } = require("./cloudinaryService");

// ==============================
// UPLOAD DOCUMENTS
// ==============================

async function uploadDocuments(files = []) {
  if (!files.length) {
    return [];
  }

  const documents = [];

  for (const file of files) {
    const result = await uploadToCloudinary(file);

    documents.push({
      fileName: file.originalname,

      fileUrl: result.secure_url,

      publicId: result.public_id,

      fileType: file.mimetype,

      resourceType: result.resource_type,

      fileSize: file.size,
    });
  }

  return documents;
}

// ==============================
// CREATE PERMIT
// ==============================

async function create(user, body, files = []) {
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

  // Upload files to Cloudinary
  const documents = await uploadDocuments(files);

  return Permit.create({
    ...body,

    userId: user._id,

    applicantName: user.fullName,

    plotArea: Number(body.plotArea),

    buildingArea: Number(body.buildingArea),

    estimatedCost: Number(body.estimatedCost),

    documents,
  });
}

// ==============================
// UPDATE PERMIT
// ==============================

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

  // ==============================
  // NEW DOCUMENTS
  // ==============================

  if (files.length) {
    const documents = await uploadDocuments(files);

    permit.documents = documents;
  }

  // Re-submit edited permit for review
  permit.status = "Pending";

  permit.remarks = undefined;

  return permit.save();
}

// ==============================
// USER PERMITS
// ==============================

const mine = (userId) =>
  Permit.find({
    userId,
  }).sort({
    createdAt: -1,
  });

// ==============================
// ALL PERMITS
// ==============================

const all = () =>
  Permit.find()
    .sort({
      createdAt: -1,
    })
    .populate("userId", "fullName email phone");

// ==============================
// UPDATE STATUS
// ==============================

async function updateStatus(id, status, remarks) {
  if (!["Pending", "Approved", "Rejected"].includes(status)) {
    throw Object.assign(new Error("Invalid status"), { statusCode: 400 });
  }

  const permit = await Permit.findById(id);

  if (!permit) {
    throw Object.assign(new Error("Permit not found"), { statusCode: 404 });
  }

  permit.status = status;

  if (remarks !== undefined) {
    permit.remarks = remarks;
  }

  return permit.save();
}

// ==============================
// USER PERMIT BY ID
// ==============================

async function mineById(id, userId) {
  return Permit.findOne({
    _id: id,
    userId,
  });
}

// ==============================
// ADMIN PERMIT BY ID
// ==============================

const byId = (id) => Permit.findById(id);

// ==============================
// EXPORT
// ==============================

module.exports = {
  create,
  update,
  mine,
  mineById,
  all,
  updateStatus,
  byId,
};
