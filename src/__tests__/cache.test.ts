import { SmartCache } from '../core/cache';

describe('SmartCache', () => {
    let cache: SmartCache<any>;

    beforeEach(() => {
        cache = new SmartCache({
            maxSize: 1000,
            ttl: 1000, // 1 second for testing
            smartPruning: true
        });
    });

    describe('Basic Operations', () => {
        it('should store and retrieve values', () => {
            const testData = { test: 'value' };
            cache.set('key1', testData);
            expect(cache.get('key1')).toEqual(testData);
        });

        it('should handle non-existent keys', () => {
            expect(cache.get('nonexistent')).toBeUndefined();
        });

        it('should handle undefined and null values', () => {
            cache.set('undefined', undefined);
            cache.set('null', null);
            
            expect(cache.get('undefined')).toBeUndefined();
            expect(cache.get('null')).toBeNull();
        });
    });

    describe('TTL Functionality', () => {
        it('should expire items after TTL', async () => {
            const testData = { test: 'value' };
            cache.set('expiring', testData);
            
            // Wait for TTL to expire
            await new Promise(resolve => setTimeout(resolve, 1100));
            
            expect(cache.get('expiring')).toBeUndefined();
        });

        it('should reset TTL on access', async () => {
            const testData = { test: 'value' };
            cache.set('accessed', testData);
            
            // Access the item just before expiration
            await new Promise(resolve => setTimeout(resolve, 900));
            expect(cache.get('accessed')).toEqual(testData);
            
            // Wait another 900ms (total 1800ms, more than original TTL)
            await new Promise(resolve => setTimeout(resolve, 900));
            expect(cache.get('accessed')).toEqual(testData);
        });
    });

    describe('Size Management', () => {
        it('should handle large items', () => {
            const largeData = { data: 'x'.repeat(2000) }; // Exceeds maxSize
            cache.set('large', largeData);
            expect(cache.get('large')).toBeUndefined();
        });

        it('should evict items when full', () => {
            // Fill cache to capacity
            for (let i = 0; i < 10; i++) {
                cache.set(`key${i}`, { data: 'x'.repeat(90) });
            }

            // Add one more item
            cache.set('newKey', { data: 'test' });

            // Some old items should be evicted
            let existingItems = 0;
            for (let i = 0; i < 10; i++) {
                if (cache.get(`key${i}`)) existingItems++;
            }

            expect(existingItems).toBeLessThan(10);
            expect(cache.get('newKey')).toBeDefined();
        });
    });

    describe('Smart Pruning', () => {
        it('should prefer keeping frequently accessed items', () => {
            // Add items
            for (let i = 0; i < 5; i++) {
                cache.set(`key${i}`, { data: 'x'.repeat(100) });
            }

            // Access some items frequently
            for (let i = 0; i < 10; i++) {
                cache.get('key0');
                cache.get('key1');
            }

            // Fill cache to force eviction
            for (let i = 5; i < 10; i++) {
                cache.set(`key${i}`, { data: 'x'.repeat(100) });
            }

            // Frequently accessed items should still be there
            expect(cache.get('key0')).toBeDefined();
            expect(cache.get('key1')).toBeDefined();
        });
    });

    describe('Statistics', () => {
        it('should track cache statistics', () => {
            cache.set('key1', 'value1');
            cache.get('key1');
            cache.get('key1');

            const stats = cache.getStats();
            expect(stats).toHaveProperty('totalSize');
            expect(stats).toHaveProperty('itemCount');
            expect(stats).toHaveProperty('utilization');
            expect(stats).toHaveProperty('averageAccessCount');
            expect(stats.itemCount).toBe(1);
            expect(stats.averageAccessCount).toBe(2);
        });
    });

    describe('Edge Cases', () => {
        it('should handle circular references', () => {
            const circular: any = { name: 'test' };
            circular.self = circular;

            expect(() => cache.set('circular', circular)).not.toThrow();
        });

        it('should handle various data types', () => {
            const testCases = [
                ['string', 'test string'],
                ['number', 123],
                ['boolean', true],
                ['array', [1, 2, 3]],
                ['date', new Date()],
                ['regexp', /test/],
                ['function', function() { return 'test'; }]
            ];

            testCases.forEach(([key, value]) => {
                cache.set(key as string, value);
                expect(cache.get(key as string)).toEqual(value);
            });
        });
    });
});
