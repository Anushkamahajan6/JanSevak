const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Individual', 'NGO_Affiliated'], required: true },
  ngoName: { type: String }, // Only if attached to an NGO
  skills: [{ type: String }],
  rating: { type: Number, default: 0 }, // Used for auto-assignment logic
  points: { type: Number, default: 0 }, // Gamification points
  badges: [{ type: String }],
  isActive: { type: Boolean, default: false }, // Volunteer active status
  score: { type: Number, default: 0 }, // Used for auto-assignment scoring
  history: [{
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
   status: { type: String, enum: ['Pending Approval', 'Assigned', 'Assigned (Primary Lead)', 'Waitlisted', 'Completed'] },
    proofImages: {
      before: String,
      after: String
    },
    timeOfCompletion: Date
  }]
}, { timestamps: true });

module.exports = mongoose.model('Volunteer', volunteerSchema);