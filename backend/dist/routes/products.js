import express from 'express';
import { PrismaClient } from '@prisma/client';
const router = express.Router();
const prisma = new PrismaClient();
// GET /api/products - List all products
router.get('/', async (req, res) => {
    try {
        const { category, page = '1', limit = '50' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = {};
        if (category && category !== 'ALL') {
            where.category = category;
        }
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.product.count({ where })
        ]);
        res.json({
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id }
        });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/products - Create product (auth disabled for now - add back when login fixed)
router.post('/', async (req, res) => {
    try {
        const { name, price, category, description, images, stock, rating, topLength, pantLength, fabric, washCare, stockBySize, availableSizes } = req.body;
        if (!name || !price || !category || !description) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const product = await prisma.product.create({
            data: {
                name,
                price: parseFloat(price),
                category,
                description,
                images: Array.isArray(images) ? images : [],
                stock: stock ? parseInt(stock) : 0,
                rating: rating ? parseFloat(rating) : 0,
                ...(topLength != null && { topLength: String(topLength) }),
                ...(pantLength != null && { pantLength: String(pantLength) }),
                ...(fabric != null && { fabric: String(fabric) }),
                ...(washCare != null && { washCare: String(washCare) }),
                ...(stockBySize != null && { stockBySize: typeof stockBySize === 'object' ? stockBySize : {} }),
                ...(availableSizes != null && { availableSizes: Array.isArray(availableSizes) ? availableSizes : [] })
            }
        });
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PUT /api/products/:id - Update product
router.put('/:id', async (req, res) => {
    try {
        const { name, price, category, description, images, stock, rating, topLength, pantLength, fabric, washCare, stockBySize, availableSizes } = req.body;
        const product = await prisma.product.update({
            where: { id: req.params.id },
            data: {
                ...(name != null && { name }),
                ...(price != null && { price: parseFloat(price) }),
                ...(category != null && { category }),
                ...(description != null && { description }),
                ...(images != null && { images: Array.isArray(images) ? images : [] }),
                ...(stock !== undefined && { stock: parseInt(stock) }),
                ...(rating !== undefined && { rating: parseFloat(rating) }),
                ...(topLength !== undefined && { topLength: topLength ? String(topLength) : null }),
                ...(pantLength !== undefined && { pantLength: pantLength ? String(pantLength) : null }),
                ...(fabric !== undefined && { fabric: fabric ? String(fabric) : null }),
                ...(washCare !== undefined && { washCare: washCare ? String(washCare) : null }),
                ...(stockBySize !== undefined && { stockBySize: stockBySize && typeof stockBySize === 'object' ? stockBySize : null }),
                ...(availableSizes !== undefined && { availableSizes: Array.isArray(availableSizes) ? availableSizes : [] })
            }
        });
        res.json(product);
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(500).json({ error: error.message });
    }
});
// DELETE /api/products/:id - Delete product
router.delete('/:id', async (req, res) => {
    try {
        await prisma.product.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(500).json({ error: error.message });
    }
});
export default router;
//# sourceMappingURL=products.js.map