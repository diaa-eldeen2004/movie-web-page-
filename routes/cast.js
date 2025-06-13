import express from 'express';
import {
  createCast,
  updateCast,
  deleteCast,
  addCastToSlider, 
  removeCastFromSlider, 
  updateCastSliderPosition ,
  getCastDetail,
} from '../controllers/cast.js';

const router = express.Router();
router.post('/', createCast);
router.post('/getcast/:id', getCastDetail);
router.put('/update/:id', updateCast);
router.delete('/:id', deleteCast);
router.post("/castslider/add", addCastToSlider);
router.delete("/castslider/:castId", removeCastFromSlider);
router.put("/castslider/position", updateCastSliderPosition);

export default router;