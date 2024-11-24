import winston from 'winston';
import path from 'path';

const logDirectory = path.join(process.cwd(), 'logs');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message }) => `[${timestamp}] [${level.toUpperCase()}]: ${message}`
    )
  ),
  transports: [
    // Info logs
    new winston.transports.File({ filename: path.join(logDirectory, 'info.log'), level: 'info' }),
    // Error logs
    new winston.transports.File({ filename: path.join(logDirectory, 'error.log'), level: 'error' }),
  ],
});

// If not in production, log to the console or terminal as well. 
// Easier to debug.
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export default logger;
