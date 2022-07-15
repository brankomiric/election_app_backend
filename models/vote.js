const mongoose = require("mongoose");
const uuid = require("node-uuid");

const VoteSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => uuid.v1() },
    candidate: { type: String, required: true },
    amount: { type: Number, required: true },
    userPK: { type: String, required: true, index: true },
    status: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vote", VoteSchema);
