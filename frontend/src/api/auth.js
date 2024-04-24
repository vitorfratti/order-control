import axios from 'axios';
import Cookies from 'js-cookie'

export const getUserInfo = async (setUser) => {
    try {
        const token = Cookies.get('isAuthenticated')
        if (!token) {
            throw new Error('Token não encontrado')
        }
        
        const response = await axios.get('http://localhost:3333/get-user-infos', {
            headers: {
                Authorization: token
            }
        })
        setUser(response.data.user)
    } catch (error) {
        console.error('Erro ao obter informações do usuário:', error.message)
    }
}
