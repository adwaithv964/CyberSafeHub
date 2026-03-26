const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter — applies to most endpoints.
 * 100 requests per 15 minutes per IP.
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again later.' },
});

/**
 * File scan limiter — prevents ClamAV abuse / server overload.
 * 10 scans per hour per IP.
 */
const scanLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Scan limit reached. Maximum 10 file scans per hour.' },
});

/**
 * OSINT check limiter — prevents username scraping abuse.
 * 20 requests per 10 minutes per IP.
 */
const osintLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'OSINT check limit reached. Please wait before scanning again.' },
});

/**
 * Auth-sensitive limiter — for vault and other user-data endpoints.
 * 60 requests per 15 minutes per IP.
 */
const vaultLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Request limit reached. Please slow down.' },
});

/**
 * Admin limiter — strict limit for admin API calls.
 * 50 requests per 10 minutes per IP.
 */
const adminLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Admin API rate limit reached.' },
});

module.exports = {
    generalLimiter,
    scanLimiter,
    osintLimiter,
    vaultLimiter,
    adminLimiter,
};
