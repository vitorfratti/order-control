import db from '../../config/db.js'
import bcrypt from 'bcryptjs'

export const getUsers = (req, res) => {
    const sql = 'SELECT * from users'

    db.query(sql, (err, result) => {
        if(!err) {
            return res.json(result)
        } else {
            return res.json({Message: 'Error inside server'})
        }
    })
}

export const getUserInfo = (req, res) => {
    const userId = req.user.userId

    const sql = 'SELECT id, name, email FROM users WHERE id = ?'
    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Erro interno do servidor' })
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' })
        }

        const user = result[0]
        return res.json({ user })
    })
}

export const editUser = (req, res) => {
    const { id } = req.params
    const { name, email } = req.body

    const sql = 'UPDATE users SET name = ?, email = ? WHERE id = ?'

    db.query(sql, [name, email, id], (err, result) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Erro ao atualizar usuário no banco de dados' })
        }
        return res.json({ message: 'Usuário atualizado com sucesso' })
    })
}

export const editPassword = (req, res) => {
    const { id } = req.params
    const { currentPassword, newPassword } = req.body

    const getUserSql = 'SELECT * FROM users WHERE id = ?'

    db.query(getUserSql, [id], (err, result) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Erro ao buscar usuário no banco de dados' })
        }

        if (result.length === 0) {
            return res.status(401).json({ error: 'Usuário não encontrado' })
        }

        const user = result[0]
        
        bcrypt.compare(currentPassword, user.password, (err, passwordMatch) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Erro ao comparar senhas' })
            }
            
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Senha atual incorreta' })
            }
            
            const updateSql = 'UPDATE users SET password = ? WHERE id = ?'

            bcrypt.hash(newPassword, 10, (hashErr, hashedNewPassword) => {
                if (hashErr) {
                    console.error(hashErr)
                    return res.status(500).json({ error: 'Erro ao criar hash da nova senha' })
                }

                db.query(updateSql, [hashedNewPassword, id], (updateErr, updateResult) => {
                    if (updateErr) {
                        console.error(updateErr)
                        return res.status(500).json({ error: 'Erro ao atualizar usuário no banco de dados' })
                    }
                    return res.json({ message: 'Senha atualizada com sucesso' })
                })
            })
        })
    })
}
