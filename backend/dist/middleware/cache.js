"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicCache = exports.privateCache = exports.noCache = exports.shortCache = exports.staticCache = exports.CacheControl = void 0;
exports.cacheControl = cacheControl;
exports.conditionalCache = conditionalCache;
exports.lastModifiedCache = lastModifiedCache;
exports.CacheControl = {
    STATIC: 'public, max-age=3600, immutable',
    SHORT: 'public, max-age=300, must-revalidate',
    MEDIUM: 'public, max-age=86400, must-revalidate',
    NO_CACHE: 'no-cache, no-store, must-revalidate',
    PRIVATE: 'private, max-age=300',
};
function cacheControl(directive) {
    return (_req, res, next) => {
        res.setHeader('Cache-Control', directive);
        next();
    };
}
exports.staticCache = cacheControl(exports.CacheControl.STATIC);
exports.shortCache = cacheControl(exports.CacheControl.SHORT);
exports.noCache = cacheControl(exports.CacheControl.NO_CACHE);
exports.privateCache = cacheControl(exports.CacheControl.PRIVATE);
exports.publicCache = cacheControl(exports.CacheControl.MEDIUM);
function conditionalCache(etag) {
    return (req, res, next) => {
        res.setHeader('ETag', etag);
        const ifNoneMatch = req.headers['if-none-match'];
        if (ifNoneMatch && ifNoneMatch === etag) {
            res.status(304).end();
            return;
        }
        next();
    };
}
function lastModifiedCache(lastModified) {
    return (req, res, next) => {
        res.setHeader('Last-Modified', lastModified.toUTCString());
        const ifModifiedSince = req.headers['if-modified-since'];
        if (ifModifiedSince) {
            const clientDate = new Date(ifModifiedSince);
            if (clientDate >= lastModified) {
                res.status(304).end();
                return;
            }
        }
        next();
    };
}
//# sourceMappingURL=cache.js.map