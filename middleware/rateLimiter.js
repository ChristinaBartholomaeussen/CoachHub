
import rateLimit from "express-rate-limit";

const authRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3,
    headers: true,
    message: "Buhuuuu - you have used your 3 chances.. "
});

export { authRateLimiter }