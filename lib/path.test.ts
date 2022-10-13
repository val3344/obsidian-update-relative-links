import { dirname, relative } from './path';

describe('dirname', () => {
    it('should return dirname', () => {
        expect(dirname('dirname/filename.md')).toBe('dirname');
    });

    it('should return empty when no dirname', () => {
        expect(dirname('filename.md')).toBe('');
    });

    it('should return dirname when no filename', () => {
        expect(dirname('dirname/')).toBe('dirname');
    });
});

describe('relative', () => {
    it('should return relative path', () => {
        expect(relative('a/b/c.md', 'a/d/e.md')).toBe('../d/e.md');
    });

    it('should return relative path when in same directory', () => {
        expect(relative('a/b.md', 'a/c.md')).toBe('c.md');
    });

    it('should return relative path when from no directory', () => {
        expect(relative('a.md', 'b/c.md')).toBe('b/c.md');
    });

    it('should return relative path when to no directory', () => {
        expect(relative('a/b.md', 'c.md')).toBe('../c.md');
    });

    it('should return relative path when from no directory to no directory', () => {
        expect(relative('a.md', 'b.md')).toBe('b.md');
    });

    it('should return relative path when from directory', () => {
        expect(relative('a/', 'b/c.md')).toBe('../b/c.md');
    });

    it('should return relative path when to directory', () => {
        expect(relative('a/b.md', 'c/')).toBe('../c/');
    });

    it('should return relative path when from directory to directory', () => {
        expect(relative('a/b/', 'c/')).toBe('../../c/');
    });

    it('should return relative path when from empty', () => {
        expect(relative('', 'a/b.md')).toBe('a/b.md');
    });

    it('should return relative path when to empty', () => {
        expect(relative('a/b.md', '')).toBe('../');
    });

    it('should return relative path when from empty to empty', () => {
        expect(relative('', '')).toBe('');
    });
});
