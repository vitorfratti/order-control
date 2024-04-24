import styled from 'styled-components'
import { useState } from 'react'
import { useNavigate, Link } from "react-router-dom"
import axios from 'axios'
import Cookies from 'js-cookie'

const Cadastro = ({ setIsAuthenticated }) => {

    const navigate = useNavigate()

    const [showPassword, setShowPassword] = useState(false)

    const [nameValue, setNameValue] = useState('')
    const [emailValue, setEmailValue] = useState('')
    const [passwordValue, setPasswordValue] = useState('')

    const [nameCorrect, setNameCorrect] = useState(null)
    const [emailCorrect, setEmailCorrect] = useState(null)
    const [passwordCorrect, setPasswordCorrect] = useState(null)
    const [error, setError] = useState('')

    const togglePassword = () => {
        showPassword ? setShowPassword(false) : setShowPassword(true)
    }

    const createUser = e => {
        e.preventDefault()

        const isNameValid = nameValue.length > 0
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)
        const isPasswordValid = passwordValue.length >= 8 && passwordValue.length <= 24

        setNameCorrect(isNameValid)
        setEmailCorrect(isEmailValid)
        setPasswordCorrect(isPasswordValid)
    
        if (isNameValid && isEmailValid && isPasswordValid) {
            axios.post('http://localhost:3333/create-user', { name: nameValue, email: emailValue, password: passwordValue })
            .then(res => {

                axios.post('http://localhost:3333/login', { email: emailValue, password: passwordValue })
                .then(res => {
                    console.log(res)
                    if(res.status === 200) {
                        Cookies.set('isAuthenticated', res.data.token, { expires: 1 })
                        setIsAuthenticated(true)
                        navigate('/')
                    }
                })
                .catch(err => console.log(err))

                setNameValue('')
                setEmailValue('')
                setPasswordValue('')
                })
            .catch(err => setError(err.response.data.error))
        }
    }

    return (
        <CadastroContainer>
            <div className="container">
                <div className="title">
                    <h1>Cadastro</h1>
                    <p>Preencha os campos abaixo para criar sua conta</p>
                </div>
                {error ?
                    <span className="error">
                        <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM7.29289 16.7071C6.90237 16.3166 6.90237 15.6834 7.29289 15.2929L10.5858 12L7.29289 8.70711C6.90237 8.31658 6.90237 7.68342 7.29289 7.29289C7.68342 6.90237 8.31658 6.90237 8.70711 7.29289L12 10.5858L15.2929 7.29289C15.6834 6.90237 16.3166 6.90237 16.7071 7.29289C17.0976 7.68342 17.0976 8.31658 16.7071 8.70711L13.4142 12L16.7071 15.2929C17.0976 15.6834 17.0976 16.3166 16.7071 16.7071C16.3166 17.0976 15.6834 17.0976 15.2929 16.7071L12 13.4142L8.70711 16.7071C8.31658 17.0976 7.68342 17.0976 7.29289 16.7071Z" fill="#d34242"></path> </g></svg>
                        <p>{error}</p>
                    </span>
                    :
                    <></>
                }
                <form onSubmit={createUser}>
                    <div className="input-content">
                        <label>Nome</label>
                        <input
                        type="text"
                        placeholder="Insira seu nome"
                        value={nameValue}
                        onChange={e => setNameValue(e.target.value)}
                        autoComplete="on"
                        className={nameCorrect === false ? 'fields-error-border' : ''}/>
                        {nameCorrect === false
                        ? <p className="fields-error-message">Esse campo deve ser preenchido</p>
                        : <></>
                        }
                    </div>
                    <div className="input-content">
                        <label>Email</label>
                        <input
                        type="email"
                        placeholder="Insira seu email"
                        value={emailValue}
                        onChange={e => setEmailValue(e.target.value)}
                        autoComplete="on"
                        className={emailCorrect === false ? 'fields-error-border' : ''}
                        />
                        {emailCorrect === false
                        ? <p className="fields-error-message">O email deve estar no formato correto</p>
                        : <></>
                        }
                    </div>
                    <div className="input-content">
                        <label>Senha</label>
                        <div className="password">
                            <input
                            type={showPassword ? 'text' : 'password' }
                            placeholder="Insira sua senha"
                            value={passwordValue}
                            onChange={e => setPasswordValue(e.target.value)}
                            autoComplete="on"
                            className={passwordCorrect === false ? 'fields-error-border' : ''}
                            />
                            <button type="button" onClick={() => togglePassword()}>
                                {showPassword ?
                                    <img src="/images/svg/eye-open.svg" alt="eye-open"/>
                                    :
                                    <img src="/images/svg/eye-close.svg" alt="eye-close"/>
                                }
                            </button>
                        </div>
                        {passwordCorrect === false
                        ? <p className="fields-error-message">A senha deve conter de 8 a 24 caracteres</p>
                        : <></>
                        }
                    </div>
                    <button type="submit" className="submit">Criar Conta</button>
                    <div className="change-tab">
                        <p>Já tem uma conta? <Link to={'/login'}>Entre aqui</Link></p>
                    </div>
                </form>
            </div>
        </CadastroContainer>
    )
}

export default Cadastro

const CadastroContainer = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 100vh;
    background: #121418;
    overflow-y: auto;
    padding: 2rem 0;

    .container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 1.5rem;
        width: 100%;

        .title {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 0.25rem;
            user-select: none;

            h1 {
                font-size: 2.5rem;
                font-weight: 600;
                color: #fff;
                text-align: center;
            }

            p {
                font-size: 1rem;
                font-weight: 400;
                color: #a1a5aa;
                text-align: center;
            }
        }

        .error {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem;
            background: #d3424225;
            border-radius: 4px;

            p {
                font-size: 1rem;
                font-weight: 500;
                color: #d34242;
                text-align: center;
            }

            svg {
                width: 1rem;
                height: 1rem;
            }
        }

        form {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 0.9rem;
            width: 30rem;
            max-width: 100%;

            input {
                width: 100%;
                background: #222222;
                padding: 0.75rem;
                color: #fff;
                border: 1px solid #a1a5aa25;
                font-size: 1rem;
                font-weight: 400;
                border-radius: 4px;
                user-select: none;

                &:focus {
                    outline: none;
                }

                &::placeholder {
                    color: #a1a5aa;
                }
            }

            .input-content {
                display: flex;
                align-items: flex-start;
                flex-direction: column;
                gap: 0.5rem;
                width: 100%;

                label {
                    font-size: 1rem;
                    font-weight: 400;
                    color: #fff;
                    user-select: none;
                }

                .password {
                    position: relative;
                    width: 100%;

                    input {
                        padding-right: 3rem;
                    }

                    button {
                        position: absolute;
                        top: 50%;
                        transform: translateY(-50%);
                        right: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        background: none;
                        border: none;
                        padding: 0.75rem;
                        cursor: pointer;
                        transition: all .1s ease;

                        img {
                            width: 1rem;
                        }

                        &:hover {
                            opacity: 0.6;
                        }
                    }
                }
            }

            button.submit {
                width: 100%;
                background: #1f6aff;
                padding: 0.8rem;
                color: #fff;
                border: none;
                font-size: 1rem;
                font-weight: 500;
                border-radius: 4px;
                cursor: pointer;
            }

            .change-tab {
                display: flex;
                align-items: center;
                width: 100%;

                p {
                    font-size: 1rem;
                    font-weight: 400;
                    color: #fff;

                    a {
                        font-size: 1rem;
                        font-weight: 400;
                        color: #1f6aff;
                        text-decoration: none;
                        transition: all .1s ease;

                        &:hover {
                            opacity: 0.6;
                        }
                    }
                }
            }
        }
    }
`