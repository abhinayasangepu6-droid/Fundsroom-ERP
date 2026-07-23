import { Router } from 'express';
import { createCustomer, getCustomers, getCustomerById, updateCustomer } from '../controllers/customerController';

const router = Router();

router.post('/', createCustomer);
router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);

export default router;