import express from 'express'
import cors from 'cors'
import { authenticateToken } from './utils/jwt.js'
import { createUser } from './controllers/cadastro/create-user.js'
import { login } from './controllers/login/login.js'
import { getUsers, getUserInfo, editUser, editPassword } from './controllers/user/users.js'
import { createOrder, getOrders, getInfosToDashboard, deleteOrder, editOrder } from './controllers/orders/orders.js'

const app = express()
app.use(cors())
app.use(express.json())

// Cadastro
app.post('/create-user', createUser)

// Login
app.post('/login', login)

// Users
app.get('/users', getUsers)
app.get('/get-user-infos', authenticateToken, getUserInfo)
app.put('/edit-user/:id', editUser)
app.put('/edit-password/:id', editPassword)

// Orders
app.post('/create-order', createOrder)
app.delete('/delete-order/:id', deleteOrder)
app.put('/edit-order/:id', editOrder)
app.get('/orders', getOrders)
app.get('/orders/dashboard', getInfosToDashboard)

app.listen(3333, () => console.log('Server running'))