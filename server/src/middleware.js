import jwt from 'jsonwebtoken';
import env from './env.js';

export const authMiddleware = (req, res, next) => {
    const jwtToken = req.cookies['__hhjwt'];
    try {
        req.user = jwt.decode(jwtToken, env.WEB_JWT_SECRET);
    } catch (e) {
        req.user = null;
    }

    res.locals.authorized = !!req.user;
    next();
};
