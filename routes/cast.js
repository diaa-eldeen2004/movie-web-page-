import express from 'express';
import {
  createCast,
  updateCast,
  deleteCast,
  addCastToSlider, 
  removeCastFromSlider, 
  updateCastSliderPosition,
  getCastDetail,
} from '../controllers/cast.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Slider management routes - admin only (must come before /:id route)
router.post("/slider/add", auth(["admin"]), addCastToSlider);
router.delete("/slider/:castId", auth(["admin"]), removeCastFromSlider);
router.put("/slider/position", auth(["admin"]), updateCastSliderPosition);

// Protected routes - admin only
router.post('/', auth(["admin"]), createCast);
router.put('/:id', auth(["admin"]), updateCast);
router.delete('/:id', auth(["admin"]), deleteCast);

// Public routes (must come last)
router.get('/:id', getCastDetail);

export default router;