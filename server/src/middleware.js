const jwt = require('jsonwebtoken');

module.exports = {
    authMiddleware: (req, res, next) => {
        const jwtToken = req.cookies['__hhjwt'];
        try {
            const user = jwt.decode(jwtToken, process.env.HOTHOST_WEB_JWT_SECRET);
            req.user = user;
        } catch(e) {
            req.user = null;
        }

        res.locals.authorized = !!req.user;
        next();
    }
}