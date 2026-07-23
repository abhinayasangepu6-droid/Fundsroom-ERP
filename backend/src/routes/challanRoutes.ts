import { Router } from 'express';
import { createChallan, getChallans, getChallanById } from '../controllers/challanController';

const router = Router();

router.post('/', createChallan);
router.get('/', getChallans);
router.get('/:id', getChallanById);

export default router;