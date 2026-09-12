import rateLimit from "express-rate-limit";

// The global limiter in app.ts (200 req/15min) is shared across every /api route -- far too loose
// to stop credential guessing on its own (200 password attempts per IP per window is nothing for
// automated brute-forcing). These two limiters apply specifically to the routes an attacker would
// actually target: signing in, and guessing a password-reset code.

// POST /api/login -- a handful of typo-tolerant retries for a real user, effectively useless for
// automated password guessing.
const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        statusCode: 429,
        message: "Too many login attempts. Please try again later."
    }
});

// POST /api/forgot-password/verify-code -- guessing a short numeric/alphanumeric reset code is a
// classic brute-force target, so this stays tight.
const verifyResetCodeRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        statusCode: 429,
        message: "Too many attempts. Please request a new code and try again later."
    }
});

// POST /api/forgot-password/request -- looser (a legitimate user may retry a few times, e.g. a
// mistyped email), but still capped to prevent using this as an email-spam or enumeration vector.
const requestResetRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        statusCode: 429,
        message: "Too many requests. Please try again later."
    }
});

export { loginRateLimit, verifyResetCodeRateLimit, requestResetRateLimit };
