import jwt from 'jsonwebtoken'

const JWT_SECRET = 'Ajk231ne78ANBD1678BD'

const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1d' })
};

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']

    if (!token) {
        return res.sendStatus(401)
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403)
        }
        req.user = user
        next()
    })
}

export { generateToken, authenticateToken }
