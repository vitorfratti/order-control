import db from '../../config/db.js'

export const createOrder = (req, res) => {
    const { id, client, total, status, date } = req.body
    const sql = 'INSERT INTO orders (id, client, total, status, date) VALUES (?, ?, ?, ?, ?)'
        
    db.query(sql, [id, client, total, status, date], (err, result) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Erro ao criar produto no banco de dados' })
        }
        return res.status(200).json({ message: 'Produto criado com sucesso' })
    })
}

export const deleteOrder = (req, res) => {
    const { id } = req.params
    const sql = 'DELETE FROM orders WHERE id = ?';
        
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erro ao deletar produto no banco de dados' });
        }
        return res.status(200).json({ message: 'Produto deletado com sucesso' });
    })
}

export const editOrder = (req, res) => {
    const { id } = req.params
    const { client, total, date, status } = req.body

    const sql = 'UPDATE orders SET client = ?, total = ?, date = ?, status = ? WHERE id = ?'

    db.query(sql, [client, total, date, status, id], (err, result) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Erro ao atualizar registro no banco de dados' })
        }
        return res.status(200).json({ message: 'Registro atualizado com sucesso' })
    })
}

export const getOrders = (req, res) => {
    const { status, client, start, end, limit, offset } = req.query

    let sql = 'SELECT * FROM orders'
    let params = []
    let sqlTotal = 'SELECT COUNT(*) AS total FROM orders'

    if (status || client || start || end) {
        sql += ' WHERE'
        sqlTotal += ' WHERE'
    }

    if (status) {
        sql += ' status = ?'
        params.push(status)
        sqlTotal += ' status = ?'
    }

    if (client) {
        if (params.length > 0) {
            sql += ' AND'
            sqlTotal += ' AND'
        }
        sql += ' client LIKE ?';
        params.push(`%${client}%`)
        sqlTotal += ' client LIKE ?'
    }

    if (start && end) {
        if (params.length > 0) {
            sql += ' AND'
            sqlTotal += ' AND'
        }
        sql += ' date BETWEEN ? AND ?'
        params.push(start, end)
        sqlTotal += ' date BETWEEN ? AND ?'
    }

    sql += ' ORDER BY date DESC'

    db.query(sqlTotal, params, (err, totalResult) => {
        if (err) {
            return res.status(500).json({ message: 'Erro interno do servidor' })
        }
        const total = totalResult[0].total

        if (limit && offset) {
            sql += ' LIMIT ? OFFSET ?'
            params.push(parseInt(limit), parseInt(offset))
        }

        db.query(sql, params, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Erro interno do servidor' })
            }
            return res.json({ total, orders: result })
        })
    })
}

export const getInfosToDashboard = (req, res) => {
    const { start, end } = req.query

    let params = []

    let sqlInfos = `
        SELECT
            SUM(CASE WHEN status IN ('Pago', 'Pendente') THEN 1 ELSE 0 END) AS orders_total,
            SUM(CASE WHEN status = 'Pago' THEN total ELSE 0 END) AS revenue_total,
            SUM(CASE WHEN status = 'Pendente' THEN 1 ELSE 0 END) AS pending,
            SUM(CASE WHEN status = 'Cancelado' THEN 1 ELSE 0 END) AS canceled
        FROM orders
    `;

    if (start && end) {
        sqlInfos += ' WHERE date BETWEEN ? AND ?';
        params.push(start, end);
    }

    db.query(sqlInfos, params, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Erro interno do servidor' })
        }

        let sqlOrders = `
            SELECT * FROM orders 
            WHERE status = 'Pago'
        `;

        if (start && end) {
            sqlOrders += ' AND date BETWEEN ? AND ?'
            params.push(start, end)
        }

        sqlOrders += ' ORDER BY date ASC'

        db.query(sqlOrders, params, (errOrders, ordersResult) => {
            if (errOrders) {
                return res.status(500).json({ message: 'Erro interno do servidor' })
            }

            return res.json({ infos: result[0], orders: ordersResult })
        })
    })
}