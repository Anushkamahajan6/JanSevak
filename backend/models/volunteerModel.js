import mongoose from 'mongoose';

const volunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Individual', 'NGO_Affiliated'], required: true },
  ngoName: { type: String }, // Only if attached to an NGO
  skills: [{ type: String }],
  rating: { type: Number, default: 0 }, // Used for auto-assignment logic
  points: { type: Number, default: 0 }, // Gamification points
  badges: [{ type: String }],
  history: [{
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    status: { type: String, enum: ['Pending Approval', 'Assigned', 'Completed'] },
    proofImages: {
      before: String,
      after: String
    },
    timeOfCompletion: Date
  }]
}, { timestamps: true });

export default mongoose.model('Volunteer', volunteerSchema);