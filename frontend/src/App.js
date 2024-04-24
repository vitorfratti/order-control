import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import Cookies from 'js-cookie'
import Home from './components/pages/home'
import Pedidos from './components/pages/pedidos'
import Cadastro from './components/pages/cadastro'
import Login from './components/pages/login'
import { useState, useEffect } from 'react'

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(Cookies.get('isAuthenticated'))

    useEffect(() => {
        const checkAuth = () => {
            const isAuthenticatedCookie = Cookies.get('isAuthenticated')
            if (isAuthenticatedCookie) {
                Cookies.set('isAuthenticated', isAuthenticatedCookie, { expires: 1 })
                setIsAuthenticated(true)
            } else {
                setIsAuthenticated(false)
            }
        }
        checkAuth()
    }, [])

    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={isAuthenticated ? <Home/> : <Navigate to="/login"/>}/>
                    <Route path="/pedidos" element={isAuthenticated ? <Pedidos/> : <Navigate to="/login"/>}/>
                    <Route path="/cadastro" element={<Cadastro setIsAuthenticated={setIsAuthenticated}/>}/>
                    <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated}/>}/>
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App
