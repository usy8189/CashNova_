const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { generateInsights } = require('../services/insightEngine');
const { generatePredictions } = require('../services/predictionEngine');
const { detectAnomalies } = require('../services/anomalyDetector');
const cache = require('../utils/cache');

// GET /api/insights — AI-generated insights
router.get('/', authenticate, async (req, res) => {
    try {
        const cacheKey = `insights:${req.userId}`;
        const cached = cache.get(cacheKey);
        if (cached) return res.json(cached);

        const insights = await generateInsights(req.userId);
        cache.set(cacheKey, insights, 3 * 60 * 1000); // 3 min TTL
        res.json(insights);
    } catch (err) {
        console.error('Insights error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/insights/predictions — spending forecasts
router.get('/predictions', authenticate, async (req, res) => {
    try {
        const cacheKey = `predictions:${req.userId}`;
        const cached = cache.get(cacheKey);
        if (cached) return res.json(cached);

        const predictions = await generatePredictions(req.userId);
        cache.set(cacheKey, predictions, 3 * 60 * 1000);
        res.json(predictions);
    } catch (err) {
        console.error('Predictions error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/insights/alerts — anomaly + budget risk alerts
router.get('/alerts', authenticate, async (req, res) => {
    try {
        const cacheKey = `alerts:${req.userId}`;
        const cached = cache.get(cacheKey);
        if (cached) return res.json(cached);

        const anomalies = await detectAnomalies(req.userId);
        cache.set(cacheKey, anomalies, 2 * 60 * 1000); // 2 min TTL (more time-sensitive)
        res.json(anomalies);
    } catch (err) {
        console.error('Alerts error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
