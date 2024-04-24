import mysql from 'mysql'

const db = mysql.createConnection({
    host: 'localhost',
    user: 'hangar',
    password: 'Resultados@2019',
    database: 'order-control'
})

export default db