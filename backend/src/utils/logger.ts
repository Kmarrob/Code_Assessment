import winston from 'winston';
import { config } from '../config/env.js';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length > 0 ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaString}`;
  })
);

const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const format = config.NODE_ENV === 'production' ? productionFormat : developmentFormat;

export const logger = winston.createLogger({
  levels,
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  format,
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      handleExceptions: true,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
  exitOnError: false,
});

export const httpLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;
    
    logger.http(`${method} ${originalUrl} ${statusCode} - ${duration}ms - ${ip}`);
  });
  
  next();
};
