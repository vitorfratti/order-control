import db from '../../config/db.js'
import bcrypt from 'bcryptjs'

export const createUser = (req, res) => {
    const { name, email, password } = req.body
    const checkUserSql = 'SELECT * FROM users WHERE email = ?'
    const insertUserSql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'

    db.query(checkUserSql, [email], (err, results) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Erro ao verificar usuário no banco de dados' })
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'O email fornecido já está em uso. Por favor, escolha um email diferente.' })
        }

        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                console.error(err)
                return res.status(500).json({ error: 'Erro ao criar hash de senha' })
            }

            db.query(insertUserSql, [name, email, hash], (err, result) => {
                if (err) {
                    console.error(err)
                    return res.status(500).json({ error: 'Erro ao criar usuário no banco de dados' })
                }
                return res.status(200).json({ message: 'Usuário criado com sucesso' })
            })
        })
    })
}