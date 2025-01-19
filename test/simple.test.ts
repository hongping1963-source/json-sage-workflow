describe('Simple Test', () => {
    it('should pass', () => {
        expect(true).toBe(true);
    });

    it('should handle async operations', async () => {
        const result = await Promise.resolve(42);
        expect(result).toBe(42);
    });
});
