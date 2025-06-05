import express from 'express';
import {
  createCast,
  updateCast,
  deleteCast,
  getCastById,
} from '../controllers/cast.js';

const router = express.Router();


router.post('/', createCast);


router.put('/:id', updateCast);


router.delete('/:id', deleteCast);


router.get('/:id', getCastById);

export default router;