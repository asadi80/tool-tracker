import mongoose from "mongoose";

const ToolSchema = new mongoose.Schema({
  toolNumber: { type: String, unique: true },
  toolId: { type: String, unique: true },
  client: String,
  bayArea: String,
  modules: {
    type: [String],
     default: ["LP1","LP2","LP3","EFEM","TM","LL1","LL2","PM1","PM2","PM3"]
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.models.Tool || mongoose.model("Tool", ToolSchema);
