import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'synapse-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Add Axiom transport if configured
if (process.env.AXIOM_TOKEN && process.env.AXIOM_ORG_ID) {
  // TODO: Add Axiom transport when needed
  logger.info('Axiom logging not yet configured');
}
