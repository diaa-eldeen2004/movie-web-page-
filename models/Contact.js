import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['email', 'facebook', 'instagram']
  },
  value: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
contactSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Check if the model exists before creating it
const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

export default Contact; 