import jwt from "jsonwebtoken";

export const checkAuth = (req, res, next) => {
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '')

    if (token) {
        try {
            const decrypted = jwt.verify(token, 'key')

            req.userId = decrypted.id
            next()
        } catch (err) {
            return res.status(403).json('Access denied')
        }

    } else {
        return res.status(403).json('Access denied')
    }
}
