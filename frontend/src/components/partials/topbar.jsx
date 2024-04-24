import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import styled from 'styled-components'
import axios from 'axios'
import { getUserInfo } from '../../api/auth.js'

const TopBar = ({ page }) => {

    const navigate = useNavigate()
    const overlayModalEditProfileRef = useRef(null)
    const overlayModalEditPasswordRef = useRef(null)

    const [user, setUser] = useState(null)

    const [optionsCardOpened, setOptionsCardOpened] = useState(false)
    const [editProfileCardOpened, setEditProfileCardOpened] = useState(false)
    const [editPasswordCardOpened, setEditPasswordCardOpened] = useState(false)
    const [nameValue, setNameValue] = useState('')
    const [emailValue, setEmailValue] = useState('')
    const [currentPasswordValue, setCurrentPasswordValue] = useState('')
    const [newPasswordValue, setNewPasswordValue] = useState('')

    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)

    const [editPasswordError, setEditPasswordError] = useState(null)

    useEffect(() => {
        getUserInfo(setUser)
    }, [])

    useEffect(() => {
        if(user) {
            setNameValue(user.name)
            setEmailValue(user.email)
        }
    }, [user])

    const openOptionsCard = () => {
        setOptionsCardOpened(!optionsCardOpened)
    }

    // Profile
    const openModalEditProfile = () => {
        setEditProfileCardOpened(true)
        setOptionsCardOpened(false)
    }

    const closeModalEditProfile = (e) => {
        if (overlayModalEditProfileRef.current === e.target) {
            setEditProfileCardOpened(false)
        }
    }

    const tryEditProfile = e => {
        e.preventDefault()
        axios.put('http://localhost:3333/edit-user/' + user.id,
        {
            id: user.id,
            name: nameValue,
            email: emailValue
        })
        .then(res => {
            setEditProfileCardOpened(false)
            getUserInfo(setUser)
        })
        .catch(err => console.log(err))
    }

    // Password
    const openModalEditPassword = () => {
        setEditPasswordCardOpened(true)
        setTimeout(() => {
            setEditProfileCardOpened(false)
        }, 100)
    }

    const closeModalEditPassword = (e) => {
        if (overlayModalEditPasswordRef.current === e.target) {
            setEditPasswordCardOpened(false)
        }
    }

    const tryEditPassword = e => {
        e.preventDefault()
        axios.put('http://localhost:3333/edit-password/' + user.id,
        {
            id: user.id,
            currentPassword: currentPasswordValue,
            newPassword: newPasswordValue
        })
        .then(res => {
            setEditPasswordCardOpened(false)
            getUserInfo(setUser)
            setCurrentPasswordValue('')
            setNewPasswordValue('')
            setEditPasswordError(null)
        })
        .catch(err => setEditPasswordError(err.response.data.error))
    }

    const logout = () => {
        Cookies.remove('isAuthenticated')
        navigate('/login')
    }

    const toggleCurrentPassword = () => {
        showCurrentPassword ? setShowCurrentPassword(false) : setShowCurrentPassword(true)
    }

    const toggleNewPassword = () => {
        showNewPassword ? setShowNewPassword(false) : setShowNewPassword(true)
    }

    return (
        <TopBarContainer>
            <div className="container">
                <div className="left">
                    <div className="logo">
                        <Link to={'/'}>
                            <svg width="64px" height="64px" viewBox="0 0 24.00 24.00" xmlns="http://www.w3.org/2000/svg" fill="#fff" stroke="#fff" transform="rotate(0)matrix(1, 0, 0, 1, 0, 0)" stroke-width="0.00024000000000000003"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path fill="none" d="M0 0h24v24H0z"></path> <path d="M14.268 12.146l-.854.854 7.071 7.071-1.414 1.414L12 14.415l-7.071 7.07-1.414-1.414 9.339-9.339c-.588-1.457.02-3.555 1.62-5.157 1.953-1.952 4.644-2.427 6.011-1.06s.892 4.058-1.06 6.01c-1.602 1.602-3.7 2.21-5.157 1.621zM4.222 3.808l6.717 6.717-2.828 2.829-3.89-3.89a4 4 0 0 1 0-5.656zM18.01 9.11c1.258-1.257 1.517-2.726 1.061-3.182-.456-.456-1.925-.197-3.182 1.06-1.257 1.258-1.516 2.727-1.06 3.183.455.455 1.924.196 3.181-1.061z"></path> </g> </g></svg>
                        </Link>
                    </div>
                    <div className="links">
                        <Link to={'/'} className={page == 'home' ? 'selected' : ''}>
                            <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M4.18753 11.3788C4.03002 11.759 4 11.9533 4 12V20.0018C4 20.5529 4.44652 21 5 21H8V15C8 13.8954 8.89543 13 10 13H14C15.1046 13 16 13.8954 16 15V21H19C19.5535 21 20 20.5529 20 20.0018V12C20 11.9533 19.97 11.759 19.8125 11.3788C19.6662 11.0256 19.4443 10.5926 19.1547 10.1025C18.5764 9.1238 17.765 7.97999 16.8568 6.89018C15.9465 5.79788 14.9639 4.78969 14.0502 4.06454C13.5935 3.70204 13.1736 3.42608 12.8055 3.2444C12.429 3.05862 12.1641 3 12 3C11.8359 3 11.571 3.05862 11.1945 3.2444C10.8264 3.42608 10.4065 3.70204 9.94978 4.06454C9.03609 4.78969 8.05348 5.79788 7.14322 6.89018C6.23505 7.97999 5.42361 9.1238 4.8453 10.1025C4.55568 10.5926 4.33385 11.0256 4.18753 11.3788ZM10.3094 1.45091C10.8353 1.19138 11.4141 1 12 1C12.5859 1 13.1647 1.19138 13.6906 1.45091C14.2248 1.71454 14.7659 2.07921 15.2935 2.49796C16.3486 3.33531 17.4285 4.45212 18.3932 5.60982C19.3601 6.77001 20.2361 8.0012 20.8766 9.08502C21.1963 9.62614 21.4667 10.1462 21.6602 10.6134C21.8425 11.0535 22 11.5467 22 12V20.0018C22 21.6599 20.6557 23 19 23H16C14.8954 23 14 22.1046 14 21V15H10V21C10 22.1046 9.10457 23 8 23H5C3.34434 23 2 21.6599 2 20.0018V12C2 11.5467 2.15748 11.0535 2.33982 10.6134C2.53334 10.1462 2.80369 9.62614 3.12345 9.08502C3.76389 8.0012 4.63995 6.77001 5.60678 5.60982C6.57152 4.45212 7.65141 3.33531 8.70647 2.49796C9.2341 2.07921 9.77521 1.71454 10.3094 1.45091Z" fill="#a1a5aa"></path> </g></svg>
                            Início
                        </Link>
                        <Link to={'/pedidos'} className={page == 'pedidos' ? 'selected' : ''}>
                            <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 9V17.8C19 18.9201 19 19.4802 18.782 19.908C18.5903 20.2843 18.2843 20.5903 17.908 20.782C17.4802 21 16.9201 21 15.8 21H8.2C7.07989 21 6.51984 21 6.09202 20.782C5.71569 20.5903 5.40973 20.2843 5.21799 19.908C5 19.4802 5 18.9201 5 17.8V6.2C5 5.07989 5 4.51984 5.21799 4.09202C5.40973 3.71569 5.71569 3.40973 6.09202 3.21799C6.51984 3 7.0799 3 8.2 3H13M19 9L13 3M19 9H14C13.4477 9 13 8.55228 13 8V3" stroke="#a1a5aa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                            Pedidos
                        </Link>
                    </div>
                </div>
                <div className="right">
                    {user ?
                        <button className="profile" onClick={openOptionsCard}>
                            {user.name}
                            <img
                            src="/images/svg/arrow-drop.svg"
                            alt="arrow-drop"
                            className={optionsCardOpened ? 'rotate' : ''}/>
                        </button>
                        :
                        <></>
                    }
                    {optionsCardOpened ?
                        <div className="card-profile">
                            <div className="infos">
                                {user ?
                                    <p>{user.name}</p>
                                    :
                                    <></>
                                }
                                {user ?
                                    <p>{user.email}</p>
                                    :
                                    <></>
                                }
                            </div>
                            <button className="edit-profile" onClick={openModalEditProfile}>
                                <svg fill="#fff" width="64px" height="64px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#fff" stroke-width="0.00024000000000000003"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M2,21H8a1,1,0,0,0,0-2H3.071A7.011,7.011,0,0,1,10,13a5.044,5.044,0,1,0-3.377-1.337A9.01,9.01,0,0,0,1,20,1,1,0,0,0,2,21ZM10,5A3,3,0,1,1,7,8,3,3,0,0,1,10,5ZM20.207,9.293a1,1,0,0,0-1.414,0l-6.25,6.25a1.011,1.011,0,0,0-.241.391l-1.25,3.75A1,1,0,0,0,12,21a1.014,1.014,0,0,0,.316-.051l3.75-1.25a1,1,0,0,0,.391-.242l6.25-6.25a1,1,0,0,0,0-1.414Zm-5,8.583-1.629.543.543-1.629L19.5,11.414,20.586,12.5Z"></path></g></svg>
                                Editar perfil
                            </button>
                            <div className="logout">
                                <button onClick={logout}>
                                    <svg width="64px" height="64px" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect width="48" height="48" fill="white" fill-opacity="0.01"></rect> <path d="M23.9917 6L6 6L6 42H24" stroke="#d34242" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M33 33L42 24L33 15" stroke="#d34242" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M16 23.9917H42" stroke="#d34242" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                                    Sair da conta
                                </button>
                            </div>
                        </div>
                        :
                        <></>
                    }
                </div>
            </div>

            {editProfileCardOpened ?
                <OverlayBackground
                ref={overlayModalEditProfileRef}
                onClick={closeModalEditProfile}
                className="animate__animated animate__fadeIn">
                    <EditProfileCard>
                        <button
                        type="button"
                        className="close"
                        onClick={() => setEditProfileCardOpened(false)}>
                            <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Menu / Close_MD"> <path id="Vector" d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg>
                        </button>
                        <div className="header">
                            <h3>
                                <svg fill="#fff" width="64px" height="64px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#fff" stroke-width="0.00024000000000000003"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M2,21H8a1,1,0,0,0,0-2H3.071A7.011,7.011,0,0,1,10,13a5.044,5.044,0,1,0-3.377-1.337A9.01,9.01,0,0,0,1,20,1,1,0,0,0,2,21ZM10,5A3,3,0,1,1,7,8,3,3,0,0,1,10,5ZM20.207,9.293a1,1,0,0,0-1.414,0l-6.25,6.25a1.011,1.011,0,0,0-.241.391l-1.25,3.75A1,1,0,0,0,12,21a1.014,1.014,0,0,0,.316-.051l3.75-1.25a1,1,0,0,0,.391-.242l6.25-6.25a1,1,0,0,0,0-1.414Zm-5,8.583-1.629.543.543-1.629L19.5,11.414,20.586,12.5Z"></path></g></svg>
                                Editar Perfil
                            </h3>
                            <p>Faça as alterações necessárias no seu perfil</p>
                        </div>
                        {user ?
                            <form onSubmit={tryEditProfile}>
                                <div className="input-content">
                                    <label>Nome</label>
                                    <input
                                    autoComplete="true"
                                    type="text"
                                    placeholder="Insira o nome"
                                    value={nameValue}
                                    onChange={e => setNameValue(e.target.value)}
                                    required/>
                                </div>
                                <div className="input-content">
                                    <label>Email</label>
                                    <input
                                    autoComplete="true"
                                    type="email"
                                    placeholder="Insira o email"
                                    value={emailValue}
                                    onChange={e => setEmailValue(e.target.value)}
                                    required/>
                                </div>
                                <div className="buttons">
                                    <div className="edit-password">
                                        <button type="button" onClick={openModalEditPassword}>
                                            <svg width="64px" height="64px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#ffffff" stroke="#ffffff" stroke-width="0.00024000000000000003"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#fff" fill-rule="evenodd" d="M19.775 2a2.225 2.225 0 0 1 1.566 3.791l-8.577 8.588c-.011.011-.033.022-.044.033a5.427 5.427 0 0 1 .389 2.033 5.555 5.555 0 1 1-5.554-5.555 5.428 5.428 0 0 1 2.033.389c.011-.011.022-.033.033-.044l3.355-3.344-1.766-1.767a1.115 1.115 0 0 1 1.577-1.578l.389.389a1.148 1.148 0 0 1 .644-.644l-.388-.391a1.115 1.115 0 0 1 1.577-1.578l.391.392a1.125 1.125 0 0 1 .255-.389 1.12 1.12 0 0 1 1.577 0l.655.655.322-.322A2.194 2.194 0 0 1 19.775 2M7.555 18.667a2.222 2.222 0 1 0-2.222-2.222 2.228 2.228 0 0 0 2.222 2.222M19.775 0a4.173 4.173 0 0 0-1.8.4 3.142 3.142 0 0 0-2.643-.2 3.115 3.115 0 0 0-4.124 2.12A3.115 3.115 0 0 0 9.8 7.539l.35.35L9 9.029A7.548 7.548 0 1 0 14.971 15l7.785-7.8a4.193 4.193 0 0 0-.01-5.969A4.157 4.157 0 0 0 19.775 0z"></path> </g></svg>
                                            Editar senha
                                        </button>
                                    </div>
                                    <span>
                                        <button type="button" className="cancel" onClick={() => setEditProfileCardOpened(false)}>Cancelar</button>
                                        <button type="submit" className="submit">Confirmar</button>
                                    </span>
                                </div>
                            </form>
                            :
                            <></>
                        }
                    </EditProfileCard>
                </OverlayBackground>
                :
                <></>
            }

            {editPasswordCardOpened ?
                <OverlayBackground
                ref={overlayModalEditPasswordRef}
                onClick={closeModalEditPassword}
                className="animate__animated animate__fadeIn">
                    <EditProfileCard>
                        <button
                        type="button"
                        className="close"
                        onClick={() => setEditPasswordCardOpened(false)}>
                            <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Menu / Close_MD"> <path id="Vector" d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg>
                        </button>
                        <div className="header">
                            <h3>
                                <svg width="64px" height="64px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#ffffff" stroke="#ffffff" stroke-width="0.00024000000000000003"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#fff" fill-rule="evenodd" d="M19.775 2a2.225 2.225 0 0 1 1.566 3.791l-8.577 8.588c-.011.011-.033.022-.044.033a5.427 5.427 0 0 1 .389 2.033 5.555 5.555 0 1 1-5.554-5.555 5.428 5.428 0 0 1 2.033.389c.011-.011.022-.033.033-.044l3.355-3.344-1.766-1.767a1.115 1.115 0 0 1 1.577-1.578l.389.389a1.148 1.148 0 0 1 .644-.644l-.388-.391a1.115 1.115 0 0 1 1.577-1.578l.391.392a1.125 1.125 0 0 1 .255-.389 1.12 1.12 0 0 1 1.577 0l.655.655.322-.322A2.194 2.194 0 0 1 19.775 2M7.555 18.667a2.222 2.222 0 1 0-2.222-2.222 2.228 2.228 0 0 0 2.222 2.222M19.775 0a4.173 4.173 0 0 0-1.8.4 3.142 3.142 0 0 0-2.643-.2 3.115 3.115 0 0 0-4.124 2.12A3.115 3.115 0 0 0 9.8 7.539l.35.35L9 9.029A7.548 7.548 0 1 0 14.971 15l7.785-7.8a4.193 4.193 0 0 0-.01-5.969A4.157 4.157 0 0 0 19.775 0z"></path> </g></svg>
                                Editar Senha
                            </h3>
                            <p>Confirme a senha atual e insira sua nova senha</p>
                        </div>
                        {editPasswordError ?
                            <span className="error">
                                <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM7.29289 16.7071C6.90237 16.3166 6.90237 15.6834 7.29289 15.2929L10.5858 12L7.29289 8.70711C6.90237 8.31658 6.90237 7.68342 7.29289 7.29289C7.68342 6.90237 8.31658 6.90237 8.70711 7.29289L12 10.5858L15.2929 7.29289C15.6834 6.90237 16.3166 6.90237 16.7071 7.29289C17.0976 7.68342 17.0976 8.31658 16.7071 8.70711L13.4142 12L16.7071 15.2929C17.0976 15.6834 17.0976 16.3166 16.7071 16.7071C16.3166 17.0976 15.6834 17.0976 15.2929 16.7071L12 13.4142L8.70711 16.7071C8.31658 17.0976 7.68342 17.0976 7.29289 16.7071Z" fill="#d34242"></path> </g></svg>
                                <p>{editPasswordError}</p>
                            </span>
                            :
                            <></>
                        }
                        <form onSubmit={tryEditPassword}>
                            <div className="input-content">
                                <label>Senha atual</label>
                                <div className="password">
                                    <input
                                    autoComplete="true"
                                    type={showCurrentPassword ? 'text' : 'password' }
                                    placeholder="Insira a senha atual"
                                    value={currentPasswordValue}
                                    onChange={e => setCurrentPasswordValue(e.target.value)}    
                                    required/>
                                    <button type="button" onClick={() => toggleCurrentPassword()}>
                                        {showCurrentPassword ?
                                            <img src="/images/svg/eye-open.svg" alt="eye-open"/>
                                            :
                                            <img src="/images/svg/eye-close.svg" alt="eye-close"/>
                                        }
                                    </button>
                                </div>
                            </div>
                            <div className="input-content">
                                <label>Nova senha</label>
                                <div className="password">
                                    <input
                                    autoComplete="true"
                                    type={showNewPassword ? 'text' : 'password' }
                                    placeholder="Insira a nova senha"
                                    value={newPasswordValue}
                                    onChange={e => setNewPasswordValue(e.target.value)}
                                    required/>
                                    <button type="button" onClick={() => toggleNewPassword()}>
                                        {showNewPassword ?
                                            <img src="/images/svg/eye-open.svg" alt="eye-open"/>
                                            :
                                            <img src="/images/svg/eye-close.svg" alt="eye-close"/>
                                        }
                                    </button>
                                </div>
                            </div>
                            <div className="buttons">
                                <span></span>
                                <span>
                                    <button type="button" className="cancel" onClick={() => setEditPasswordCardOpened(false)}>Cancelar</button>
                                    <button type="submit" className="submit">Confirmar</button>
                                </span>
                            </div>
                        </form>
                    </EditProfileCard>
                </OverlayBackground>
                :
                <></>
            }
        </TopBarContainer>
    )
}

export default TopBar

const TopBarContainer = styled.nav`
    position: relative;
    z-index: 999;
    width: 100%;
    height: fit-content;
    background: #121418;
    border-bottom: 1px solid #dadada25;
    height: 3.75rem;

    .container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 100%;

        .left {
            display: flex;
            align-items: center;
            gap: 3rem;
            height: 100%;

            .logo {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100%;

                a {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                    transition: all .1s ease;

                    svg {
                        width: 1.5rem;
                        height: 1.5rem;
                    }
                }
            }

            .links {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                height: 100%;
                user-select: none;

                a {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 1rem;
                    font-weight: 500;
                    color: #a1a5aa;
                    background: #121418;
                    height: 100%;
                    padding: 0 1rem;
                    text-decoration: none;
                    transition: all .1s ease;

                    svg {
                        width: 1rem;
                        height: 1rem;
                    }

                    &:first-child.selected {
                        color: #fff;
                        font-weight: 500;
                        border-bottom: 1px solid #fff;

                        path {
                            fill: #fff;
                        }
                    }

                    &:nth-child(2).selected {
                        color: #fff;
                        font-weight: 500;
                        border-bottom: 1px solid #fff;

                        path {
                            stroke: #fff;
                        }
                    }

                    &:last-child.selected {
                        color: #fff;
                        font-weight: 500;
                        border-bottom: 1px solid #fff;

                        path {
                            stroke: #fff;
                        }
                    }
                }
            }
        }

        .right {
            position: relative;
            display: flex;
            align-items: center;
            gap: 2rem;

            button.profile {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 0.5rem;
                background: #121418;
                border: 1px solid #dadada25;
                font-size: 1rem;
                font-weight: 500;
                color: #fff;
                padding: 0.5rem 0.75rem;
                border-radius: 4px;
                user-select: none;
                cursor: pointer;
                transition: all .1s ease;

                img {
                    width: 1.25rem;
                }

                &:hover {
                    background: #33373b50;
                }
            }

            .card-profile {
                position: absolute;
                top: 3rem;
                right: 0;
                width: fit-content;
                min-width: 10rem;
                background: #121418;
                border: 1px solid #dadada25;
                box-shadow: 0 0 20px #00000050;
                border-radius: 0 0 4px 4px;

                .infos {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                    padding: 0.75rem;

                    p {
                        &:first-child {
                            font-size: 1rem;
                            font-weight: 500;
                            color: #fff;
                        }

                        &:last-child {
                            font-size: 1rem;
                            font-weight: 500;
                            color: #a1a5aa;
                        }
                    }
                }

                .edit-profile {
                    position: relative;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                    padding: 0.75rem;
                    background: #121418;
                    border: none;
                    font-size: 1rem;
                    font-weight: 500;
                    color: #fff;
                    text-align: left;
                    cursor: pointer;
                    transition: all .1s ease;

                    svg {
                        width: 1rem;
                        height: 1rem;
                    }

                    &:hover {
                        background: #33373b50;
                    }
                }

                .logout {
                    display: flex;
                    align-items: center;

                    button {
                        position: relative;
                        width: 100%;
                        display: flex;
                        align-items: center;
                        gap: 0.3rem;
                        padding: 0.75rem;
                        background: #121418;
                        border: none;
                        font-size: 1rem;
                        font-weight: 500;
                        color: #d34242;
                        text-align: left;
                        cursor: pointer;
                        transition: all .1s ease;

                        svg {
                            width: 1rem;
                            height: 1rem;
                        }

                        &:hover {
                            background: #33373b50;
                        }
                    }
                }
            }
        }
    }
`
const OverlayBackground = styled.section`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #30303050;
    backdrop-filter: blur(4px);
    z-index: 999999;
    animation-duration: .1s;
`

const EditProfileCard = styled.div`
    position: relative;
    width: 35rem;
    padding: 1rem;
    overflow-y: auto;
    padding: 1.25rem;
    background: #121418;
    border: 1px solid #a1a5aa50;
    border-radius: 6px;
    animation-duration: .1s;

    button.close {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #121418;
        border: none;
        padding: 0.5rem;
        border-radius: 4px;
        cursor: pointer;

        svg {
            width: 1.5rem;
            height: 1.5rem;
        }

        &:hover {
            background: #33373b50
        }
    }

    .header {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        h3 {
            font-size: 1.75rem;
            font-weight: 600;
            color: #fff;
            user-select: none;
            display: flex;
            align-items: center;
            gap: 0.5rem;

            svg {
                width: 1.75rem;
                height: 1.75rem;
            }
        }

        p {
            font-size: 1rem;
            font-weight: 400;
            color: #a1a5aa;
            user-select: none;
        }
    }

    .error {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        background: #d3424225;
        border-radius: 4px;
        margin-top: 1rem;

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
        gap: 1rem;
        margin-top: 1rem;

        input {
            width: 100%;
            background: #222222;
            padding: 0.5rem;
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

        .edit-password {
            display: flex;

            button {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem;
                font-size: 1rem;
                font-weight: 500;
                border-radius: 4px;
                user-select: none;
                width: fit-content;
                background: transparent;
                color: #fff;
                border: 1px solid #1f6aff00;
                transition: all .1s ease;
                cursor: pointer;
                transition: all .1s ease;

                &:hover {
                    background: #33373b50;
                }

                svg {
                    width: 1rem;
                    height: 1rem;
                }
            }
        }

        .input-content {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            width: 100%;

            label {
                font-size: 1rem;
                font-weight: 400;
                color: #fff;
                width: fit-content;
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

        .buttons {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            margin-top: 0.5rem;

            span {
                display: flex;
                align-items: center;
                gap: 1rem;

                button {
                    padding: 0.5rem 1.5rem;
                    font-size: 1rem;
                    font-weight: 500;
                    border-radius: 4px;
                    user-select: none;
                    cursor: pointer;
                    transition: all .1s ease;

                    &.submit {
                        width: fit-content;
                        background: #1f6aff;
                        color: #fff;
                        border: 1px solid #1f6aff00;
                        transition: all .1s ease;

                        &:hover {
                            filter: brightness(80%);
                        }
                    }

                    &.cancel {
                        width: fit-content;
                        background: transparent;
                        color: #fff;
                        border: 1px solid #1f6aff00;
                        transition: all .1s ease;

                        &:hover {
                            background: #33373b50;
                        }
                    }
                }
            }
        }
    }
`