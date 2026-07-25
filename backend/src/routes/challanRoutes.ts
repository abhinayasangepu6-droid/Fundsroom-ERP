import express from 'express';
import { createChallan, getChallans, getChallanById, confirmChallan } from '../controllers/challanController';

const router = express.Router();

router.post('/', createChallan);
router.get('/', getChallans);
router.get('/:id', getChallanById);
router.post('/:id/confirm', confirmChallan);

export default router;