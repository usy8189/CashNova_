/**
 * Simple in-memory TTL cache.
 * Usage: cache.get(key) / cache.set(key, value, ttlMs)
 */
class MemoryCache {
    constructor() {
        this.store = new Map();
    }

    get(key) {
        const entry = this.store.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }

    set(key, value, ttlMs = 5 * 60 * 1000) {
        this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
    }

    invalidate(prefix) {
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix)) this.store.delete(key);
        }
    }

    clear() {
        this.store.clear();
    }
}

module.exports = new MemoryCache();
