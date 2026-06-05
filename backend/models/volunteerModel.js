const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['Individual', 'NGO_Affiliated'], required: true },
  ngoName: { type: String },
  skills: [{ type: String }],
  rating: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  badges: [{ type: String }],
  isActive: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
  history: [{
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    status: { type: String, enum: ['Pending Approval', 'Assigned', 'Assigned (Primary Lead)', 'Waitlisted', 'Completed'] },
    proofImages: { before: String, after: String },
    timeOfCompletion: Date
  }]
}, { timestamps: true });

module.exports = mongoose.model('Volunteer', volunteerSchema);