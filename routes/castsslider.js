import express from "express";
const router = express.Router();
import { 
    addCastToSlider, 
    removeCastFromSlider, 
    updateCastSliderPosition 
} from "../controllers/castsslider.js";

router.post("/castslider/add", addCastToSlider);
router.delete("/castslider/:castId", removeCastFromSlider);
router.put("/castslider/position", updateCastSliderPosition);

export default router;