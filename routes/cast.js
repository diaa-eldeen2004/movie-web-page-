import express from 'express';
import {
  createCast,
  updateCast,
  deleteCast,
} from '../controllers/cast.js';

const router = express.Router();
router.post('/', createCast);
router.put('/update/:id', updateCast);
router.delete('/:id', deleteCast);

export default router;