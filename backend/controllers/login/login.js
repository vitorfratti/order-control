import db from '../../config/db.js'
import bcrypt from 'bcryptjs'
import { generateToken } from '../../utils/jwt.js'

export const login = (req, res) => {
    const { email, password } = req.body
    const sql = 'SELECT id, name, email, password FROM users WHERE email = ?'
    
    db.query(sql, [email], (err, result) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Erro ao buscar usuário no banco de dados' })
        }

        if (result.length === 0) {
            return res.status(401).json({ error: 'Dados inválidos. Tente novamente.' })
        }

        const user = result[0]
        
        bcrypt.compare(password, user.password, (err, passwordMatch) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Dados inválidos. Tente novamente.' })
            }
            
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Dados inválidos. Tente novamente.' })
            }
            
            const token = generateToken(user.id)
            return res.json({ user, token })
        })
    })
}