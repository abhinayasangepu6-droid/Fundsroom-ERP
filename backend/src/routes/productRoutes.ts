import { Router } from 'express';
import { createProduct, getProducts, updateProduct } from '../controllers/productController';

const router = Router();

router.post('/', createProduct);
router.get('/', getProducts);
router.put('/:id', updateProduct);

export default router;