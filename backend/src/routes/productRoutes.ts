import { Router } from 'express';
import { createProduct, getProducts, updateProduct } from '../controllers/productController';
import { getProductMovements } from '../controllers/challanController';


const router = Router();

router.post('/', createProduct);
router.get('/', getProducts);
router.put('/:id', updateProduct);

router.get('/:id/movements', getProductMovements);
export default router;