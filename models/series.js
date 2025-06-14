import mongoose from 'mongoose';


const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    genre: {
        type: [String],
        required: true,
    },
    releasedate: {
        type: Date,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
        min: 1, // Duration in minutes
    },
    cast: [{
        name: {
            type: String,
            required: true,
        },
    }],
    rating: {
        type: Number,
        min: 0,
        max: 10,
        default: 0,
    },
    posterUrl: {
        type: String,
    },
    trailerUrl: {
        type: String,
    },
});

module.exports = mongoose.model('Movie', movieSchema);
