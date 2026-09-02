const mongoose = require("mongoose");

const permitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicantName: {
      type: String,
      required: true,
    },
    propertyAddress: {
      type: String,
      required: true,
      trim: true,
    },
    propertyType: {
      type: String,
      required: true,
      enum: ["residential", "commercial", "mixed"],
    },
    constructionType: {
      type: String,
      required: true,
      enum: ["new", "renovation", "addition"],
    },
    plotArea: {
      type: Number,
      required: true,
      min: 0,
    },
    buildingArea: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedCost: {
      type: Number,
      required: true,
      min: 0,
    },
    documents: [
      {
        fileName: String,
        filePath: String,
        fileType: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Permit = mongoose.model("Permit", permitSchema);
module.exports = Permit;
