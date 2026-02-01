import mongoose from "mongoose";

const InformSchema = new mongoose.Schema({
  tool: { type: mongoose.Schema.Types.ObjectId, ref: "Tool" },
  module: {
    type: String,
    enum: ["LP1","LP2","LP3","EFEM","TM","LL1","LL2","PM1","PM2","PM3"]
  },
  title: String,
  content: String,
  images: [String],
  status: { type: String, enum: ["OPEN", "COMPLETED"], default: "OPEN" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.models.Inform || mongoose.model("Inform", InformSchema);
