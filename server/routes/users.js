const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const prisma = require('../utils/prisma');

// GET /api/users/profile
router.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, name: true, email: true, createdAt: true },
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/users/profile
router.patch('/profile', authenticate, async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await prisma.user.update({
            where: { id: req.userId },
            data: { ...(name && { name }), ...(email && { email }) },
            select: { id: true, name: true, email: true, createdAt: true },
        });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/users/account
router.delete('/account', authenticate, async (req, res) => {
    try {
        await prisma.user.delete({ where: { id: req.userId } });
        res.json({ message: 'Account deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
