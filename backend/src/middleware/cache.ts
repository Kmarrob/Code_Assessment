// backend/src/middleware/cache.ts
import { Request, Response, NextFunction } from 'express';

export const CacheControl = {
  STATIC: 'public, max-age=3600, immutable',
  SHORT: 'public, max-age=300, must-revalidate',
  MEDIUM: 'public, max-age=86400, must-revalidate',
  NO_CACHE: 'no-cache, no-store, must-revalidate',
  PRIVATE: 'private, max-age=300',
};

export function cacheControl(directive: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('Cache-Control', directive);
    next();
  };
}

export const staticCache = cacheControl(CacheControl.STATIC);
export const shortCache = cacheControl(CacheControl.SHORT);
export const noCache = cacheControl(CacheControl.NO_CACHE);
export const privateCache = cacheControl(CacheControl.PRIVATE);
export const publicCache = cacheControl(CacheControl.MEDIUM);

export function conditionalCache(etag: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('ETag', etag);
    
    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch && ifNoneMatch === etag) {
      res.status(304).end();
      return;
    }
    
    next();
  };
}

export function lastModifiedCache(lastModified: Date) {
  return (req: Request, res: Response, next: NextFunction): void => {
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