import mongoose from 'mongoose';

const castSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  birthdate: {
    type: Date,
    required: true,
  },
  nationality: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  profileImageURL: {
    type: String,
    required: true,
    trim: true,
  },
  movies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
  }],
  isInSlider: { 
    type: Boolean, 
    default: false 
  },
  sliderPosition: { 
    type: Number, 
    default: null 
  },
});

const Cast = mongoose.models.Cast || mongoose.model('Cast', castSchema);
export default Cast;