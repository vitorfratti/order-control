import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import styled from 'styled-components' 
import { useNavigate, useSearchParams } from "react-router-dom"
import TopBar from '../partials/topbar'

const Pedidos = () => {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    const overlayModalAddOrderRef = useRef(null)
    const overlayModalEditOrderRef = useRef(null)
    const inputClientName = useRef(null)

    const [page, setPage] = useState('pedidos')
    const [user, setUser] = useState(null)

    const [orders, setOrders] = useState([])

    // Modal - Add Order
    const [modalAddOrderOpened, setModalAddOrderOpened] = useState(false)
    const [clientNameValue, setClientNameValue] = useState('')
    const [totalValue, setTotalValue] = useState('')
    const [statusValue, setStatusValue] = useState('Pendente')
    const [dateValue, setDateValue] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`)

    // Modal - Edit Order
    const [modalEditOrderOpened, setModalEditOrderOpened] = useState(false)
    const [idEditValue, setIdEditValue] = useState(null)
    const [clientNameEditValue, setClientNameEditValue] = useState(null)
    const [totalEditValue, setTotalEditValue] = useState(null)
    const [statusEditValue, setStatusEditValue] = useState(null)
    const [dateEditValue, setDateEditValue] = useState(null)

    const [cardOrderOptionsOpened, setCardOrderOptionsOpened] = useState(false)
    const [deletedOrderId, setDeletedOrderId] = useState(null)
    const [focusInput, setFocusInput] = useState(false)

    // Filter - Values
    const [statusFilterValue, setStatusFilterValue] = useState('')
    const [clientFilterValue, setClientFilterValue] = useState('')
    const [startDateFilterValue, setStartDateFilterValue] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10))
    const [endDateFilterValue, setEndDateFilterValue] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10))

    // Pagination
    const [paginationNum, setPaginationNum] = useState(1)
    const [totalOrders, setTotalOrders] = useState(0)
    const [limitPerPage, setLimitPerPage] = useState(10)

    useEffect(() => {
        if(searchParams.get('page')) {
            setPaginationNum(searchParams.get('page'))
        }
        if(searchParams.get('status')) {
            setStatusFilterValue(searchParams.get('status'))
        }
        if(searchParams.get('client')) {
            setClientFilterValue(searchParams.get('client'))
        }
        if(searchParams.get('start')) {
            setStartDateFilterValue(searchParams.get('start'))
        }
        if(searchParams.get('end')) {
            setEndDateFilterValue(searchParams.get('end'))
        }
    }, [])

    // Get Order Request
    const getOrders = () => {
        axios.get('http://localhost:3333/orders', {
            params: {
                limit: limitPerPage,
                offset: (paginationNum - 1) * limitPerPage,
                status: statusFilterValue,
                client: clientFilterValue,
                start: startDateFilterValue,
                end: endDateFilterValue
            }
        })
        .then(res => {
            setOrders(res.data.orders)
            setTotalOrders(res.data.total)
        })
        .catch(err => console.error('Erro ao resgatar os dados:', err))
    }

    // Get Orders by Params
    useEffect(() => {
        getOrders()

        let params = ''
        if (paginationNum) {
            params += (params ? '&' : '?') + 'page=' + parseInt(paginationNum)
        }
        if (statusFilterValue) {
            params += (params ? '&' : '?') + 'status=' + statusFilterValue
        }
        if (clientFilterValue) {
            params += (params ? '&' : '?') + 'client=' + clientFilterValue
        }
        if(startDateFilterValue) {
            params += (params ? '&' : '?') + 'start=' + startDateFilterValue
        }
        if(endDateFilterValue) {
            params += (params ? '&' : '?') + 'end=' + endDateFilterValue
        }
        navigate(params)
    }, [searchParams, paginationNum, statusFilterValue, clientFilterValue, startDateFilterValue, endDateFilterValue])

    // Reset Pagination If Set Status or Client
    useEffect(() => {
        setPaginationNum(1)
    }, [statusFilterValue, clientFilterValue])

    // Clear Filters
    const clearFilters = () => {
        setStatusFilterValue('')
        setClientFilterValue('')
        setStartDateFilterValue(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10))
        setEndDateFilterValue(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10))
    }

    // Create Order
    const createOrder = e => {
        e.preventDefault()
        const orderId = uuidv4()
        axios.post('http://localhost:3333/create-order',
        {
            id: orderId,
            client: clientNameValue,
            total: totalValue,
            status: statusValue,
            date: dateValue
        })
        .then(res => {
            getOrders()
            setModalAddOrderOpened(false)
            setClientNameValue('')
            setTotalValue('')
            setStatusValue('Pendente')
            setDateValue(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`)
        })
        .catch(err => console.error('Erro ao enviar os dados:', err))
    }

    // Delete Order
    const deleteOrder = (e, id) => {
        e.preventDefault()
        setDeletedOrderId(id)
        axios.delete('http://localhost:3333/delete-order/' + id)
        .then(res => {
            getOrders()
            setCardOrderOptionsOpened(false)
        })
        .catch(err => console.error('Erro ao enviar os dados:', err))
    }

    const editOrder = (e) => {
        e.preventDefault()
        axios.put('http://localhost:3333/edit-order/' + idEditValue,
        {
            id: idEditValue,
            client: clientNameEditValue,
            total: totalEditValue,
            status: statusEditValue,
            date: dateEditValue
        })
        .then(res => {
            getOrders()
            setModalEditOrderOpened(false)
            setCardOrderOptionsOpened(false)
        })
        .catch(err => console.error('Erro ao enviar os dados:', err))
    }

    // Open Modal - Add Order
    const openModalAddOrder = () => {
        setModalAddOrderOpened(true)
        setFocusInput(true)
    }

    // Close Modal - Add Order
    const closeModalAddOrder = (e) => {
        if (overlayModalAddOrderRef.current === e.target) {
            setModalAddOrderOpened(false)
        }
    }

    // Focus - Input Client Name
    useEffect(() => {
        if (focusInput) {
            inputClientName.current.focus()
            setFocusInput(false)
        }
    }, [focusInput])

    // Open Modal - Edit Order
    const openModalEditOrder = (id, client, total, date, status) => {
        setModalEditOrderOpened(true)
        setCardOrderOptionsOpened(false)
        setIdEditValue(id)
        setClientNameEditValue(client)
        setTotalEditValue(total)
        setDateEditValue(`${new Date(date).getFullYear()}-${String(new Date(date).getMonth() + 1).padStart(2, '0')}-${String(new Date(date).getDate()).padStart(2, '0')}`)
        setStatusEditValue(status)
    }

    // Close Modal - Edit Order
    const closeModalEditOrder = (e) => {
        if (overlayModalEditOrderRef.current === e.target) {
            setModalEditOrderOpened(false)
        }
    }

    // Toggle Order Options Modal
    const toggleCardOrderOptions = (index) => {
        if (cardOrderOptionsOpened === index) {
            setCardOrderOptionsOpened(-1)
        } else {
            setCardOrderOptionsOpened(index)
        }
    }

    // Format Date - Table
    const formatDate = (data) => {
        const date = new Date(data)
        const dia = String(date.getDate()).padStart(2, '0')
        const mes = String(date.getMonth() + 1).padStart(2, '0')
        const ano = date.getFullYear()
        return `${dia}/${mes}/${ano}`
    }

    return (
        <PedidosContainer>
            <TopBar page={page}/>
            <Content>
                <div className="container">
                    <div className="header">
                        <h3>Pedidos</h3>
                        <button onClick={() => openModalAddOrder()}>Adicionar Pedido</button>
                    </div>
                    <div className="content">
                        <Filters>
                            <p>Filtros:</p>
                            <div className="inputs">
                                <select onChange={e => setStatusFilterValue(e.target.value)} value={statusFilterValue}>
                                    <option value="">Todos os status</option>
                                    <option value="Pendente">Pendente</option>
                                    <option value="Pago">Pago</option>
                                    <option value="Cancelado">Cancelado</option>
                                </select>
                                <input
                                autoComplete="true"
                                type="text"
                                placeholder="Nome do cliente"
                                value={clientFilterValue}
                                onChange={e => setClientFilterValue(e.target.value)}/>
                                <svg className="date" fill="#ffffff" width="64px" height="64px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M6,22H18a3,3,0,0,0,3-3V7a2,2,0,0,0-2-2H17V3a1,1,0,0,0-2,0V5H9V3A1,1,0,0,0,7,3V5H5A2,2,0,0,0,3,7V19A3,3,0,0,0,6,22ZM5,12.5a.5.5,0,0,1,.5-.5h13a.5.5,0,0,1,.5.5V19a1,1,0,0,1-1,1H6a1,1,0,0,1-1-1Z"></path></g></svg>
                                <input
                                type="date"
                                value={startDateFilterValue}
                                onChange={e => setStartDateFilterValue(e.target.value)}/>
                                <p>até</p>
                                <input
                                type="date"
                                value={endDateFilterValue}
                                onChange={e => setEndDateFilterValue(e.target.value)}/>
                                {statusFilterValue ||
                                clientFilterValue ||
                                startDateFilterValue != new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10) ||
                                endDateFilterValue != new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10) ?
                                    <button className="clear-filters" type="button" onClick={clearFilters}>
                                        <svg width="64px" height="64px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#fff" d="M13.9907,1.31133017e-07 C14.8816,1.31133017e-07 15.3277,1.07714 14.6978,1.70711 L13.8556,2.54922 C14.421,3.15654 14.8904,3.85028 15.2448,4.60695 C15.8028,5.79836 16.0583,7.109 15.9888,8.42277 C15.9193,9.73654 15.5268,11.0129 14.8462,12.1388 C14.1656,13.2646 13.2178,14.2053 12.0868,14.8773 C10.9558,15.5494 9.67655,15.9322 8.3623,15.9918 C7.04804,16.0514 5.73937,15.7859 4.55221,15.2189 C3.36505,14.652 2.33604,13.8009 1.55634,12.7413 C0.776635,11.6816 0.270299,10.446 0.0821822,9.14392 C0.00321229,8.59731 0.382309,8.09018 0.928918,8.01121 C1.47553,7.93224 1.98266,8.31133 2.06163,8.85794 C2.20272,9.83451 2.58247,10.7612 3.16725,11.556 C3.75203,12.3507 4.52378,12.989 5.41415,13.4142 C6.30452,13.8394 7.28602,14.0385 8.27172,13.9939 C9.25741,13.9492 10.2169,13.6621 11.0651,13.158 C11.9133,12.6539 12.6242,11.9485 13.1346,11.1041 C13.6451,10.2597 13.9395,9.30241 13.9916,8.31708 C14.0437,7.33175 13.8521,6.34877 13.4336,5.45521 C13.178,4.90949 12.8426,4.40741 12.4402,3.96464 L11.7071,4.69779 C11.0771,5.32776 9.99996,4.88159 9.99996,3.99069 L9.99996,1.31133017e-07 L13.9907,1.31133017e-07 Z M1.499979,4 C2.05226,4 2.499979,4.44772 2.499979,5 C2.499979,5.55229 2.05226,6 1.499979,6 C0.947694,6 0.499979,5.55228 0.499979,5 C0.499979,4.44772 0.947694,4 1.499979,4 Z M3.74998,1.25 C4.30226,1.25 4.74998,1.69772 4.74998,2.25 C4.74998,2.80229 4.30226,3.25 3.74998,3.25 C3.19769,3.25 2.74998,2.80228 2.74998,2.25 C2.74998,1.69772 3.19769,1.25 3.74998,1.25 Z M6.99998,0 C7.55226,0 7.99998,0.447716 7.99998,1 C7.99998,1.55229 7.55226,2 6.99998,2 C6.44769,2 5.99998,1.55229 5.99998,1 C5.99998,0.447716 6.44769,0 6.99998,0 Z"></path> </g></svg>
                                        Limpar filtros
                                    </button>
                                    :
                                    <></>
                                }
                            </div>
                        </Filters>
                        {orders.length > 0 ?
                            <>
                                <Table>
                                    <thead>
                                        <tr>
                                            <th>Identificador</th>
                                            <th>Data</th>
                                            <th>Status</th>
                                            <th>Cliente</th>
                                            <th>Total do pedido</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders ? (
                                            orders.map((order, index) => (
                                                <tr
                                                key={order.id}
                                                className={deletedOrderId == order.id ? 'deleted' : ''}>
                                                    <td>{order.id}</td>
                                                    <td>{formatDate(order.date)}</td>
                                                    <td>
                                                        {order.status === 'Pendente' && (
                                                            <div className="align">
                                                                <span className="dot pendente"></span>
                                                                Pendente
                                                            </div>
                                                        )}
                                                        {order.status === 'Pago' && (
                                                            <div className="align">
                                                                <span className="dot pago"></span>
                                                                Pago
                                                            </div>
                                                        )}
                                                        {order.status === 'Cancelado' && (
                                                            <div className="align">
                                                                <span className="dot cancelado"></span>
                                                                Cancelado
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>{order.client}</td>
                                                    <td>{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                                    <td>
                                                        <button className="order-options" onClick={() => toggleCardOrderOptions(index)}>
                                                            <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M18 12H18.01M12 12H12.01M6 12H6.01M13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12ZM19 12C19 12.5523 18.5523 13 18 13C17.4477 13 17 12.5523 17 12C17 11.4477 17.4477 11 18 11C18.5523 11 19 11.4477 19 12ZM7 12C7 12.5523 6.55228 13 6 13C5.44772 13 5 12.5523 5 12C5 11.4477 5.44772 11 6 11C6.55228 11 7 11.4477 7 12Z" stroke="#a1a5aa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                                                        </button>

                                                        {cardOrderOptionsOpened === index ?
                                                            <div className="card-options animate__animated animate__fadeIn">
                                                                <button
                                                                className="edit"
                                                                onClick={() => openModalEditOrder(
                                                                    order.id, order.client, order.total, order.date, order.status
                                                                )}>
                                                                    <svg width="64px" height="64px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title></title> <g id="Complete"> <g id="edit"> <g> <path d="M20,16v4a2,2,0,0,1-2,2H4a2,2,0,0,1-2-2V6A2,2,0,0,1,4,4H8" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path> <polygon fill="none" points="12.5 15.8 22 6.2 17.8 2 8.3 11.5 8 16 12.5 15.8" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></polygon> </g> </g> </g> </g></svg>
                                                                    Editar
                                                                </button>
                                                                <form onSubmit={e => deleteOrder(e, order.id)}>
                                                                    <button className="delete">
                                                                        <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10 11V17" stroke="#d34242" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M14 11V17" stroke="#d34242" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M4 7H20" stroke="#d34242" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M6 7H12H18V18C18 19.6569 16.6569 21 15 21H9C7.34315 21 6 19.6569 6 18V7Z" stroke="#d34242" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="#d34242" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                                                                        Deletar
                                                                    </button>
                                                                </form>
                                                            </div>
                                                            :
                                                            <></>
                                                        }
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3">Nenhum pedido encontrado</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                                <div className="infos-bottom">
                                    <p className="orders-total">
                                        Total de {totalOrders} pedido(s) - {orders.length} sendo mostrado(s)
                                    </p>
                                    {Math.ceil(totalOrders / limitPerPage) > 1 ?
                                        <Pagination>
                                                {paginationNum > 1 ?
                                                    <>
                                                        <button className="all prev"
                                                        onClick={() => setPaginationNum(1) }>
                                                            <svg fill="#a1a5aa" width="64px" height="64px" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g fill-rule="evenodd"> <path d="M0 176.142 176.13.012l960.12 960.119L176.13 1920 0 1743.87l783.864-783.739L0 176.142Z"></path> <path d="M784 176.142 960.13.012l960.12 960.119L960.13 1920 784 1743.87l783.86-783.739L784 176.142Z"></path> </g> </g></svg>
                                                        </button>
                                                        <button className="prev"
                                                        onClick={() => setPaginationNum(paginationNum - 1)}>
                                                            <svg fill="#a1a5aa" width="64px" height="64px" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M568.13.012 392 176.142l783.864 783.989L392 1743.87 568.13 1920l960.118-959.87z" fill-rule="evenodd"></path> </g></svg>
                                                        </button>
                                                    </>
                                                    :
                                                    <></>
                                                }
                                                <span>
                                                    <p>
                                                        Página {paginationNum} de {Math.ceil(totalOrders / limitPerPage)}
                                                    </p>
                                                </span>
                                                {paginationNum < Math.ceil(totalOrders / limitPerPage) ?
                                                    <>
                                                        <button className="next"
                                                        onClick={() => setPaginationNum(parseInt(paginationNum) + 1)}>
                                                            <svg fill="#a1a5aa" width="64px" height="64px" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M568.13.012 392 176.142l783.864 783.989L392 1743.87 568.13 1920l960.118-959.87z" fill-rule="evenodd"></path> </g></svg>
                                                        </button>
                                                        <button className="all next"
                                                        onClick={() => setPaginationNum(Math.ceil(totalOrders / limitPerPage))}>
                                                            <svg fill="#a1a5aa" width="64px" height="64px" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g fill-rule="evenodd"> <path d="M0 176.142 176.13.012l960.12 960.119L176.13 1920 0 1743.87l783.864-783.739L0 176.142Z"></path> <path d="M784 176.142 960.13.012l960.12 960.119L960.13 1920 784 1743.87l783.86-783.739L784 176.142Z"></path> </g> </g></svg>
                                                        </button>
                                                    </>
                                                    :
                                                    <></>
                                                }
                                        </Pagination>
                                        :
                                        <></>
                                    }
                                </div>
                            </>
                            :
                            <p className="not-found">Nenhum resultado encontrado.</p>
                        }
                    </div>
                </div>
            </Content>

            {modalAddOrderOpened ?
                <OverlayBackground
                ref={overlayModalAddOrderRef}
                onClick={closeModalAddOrder}
                className="animate__animated animate__fadeIn">
                    <ModalOrder>
                        <button type="button" className="close" onClick={() => setModalAddOrderOpened(false)}>
                            <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Menu / Close_MD"> <path id="Vector" d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg>
                        </button>
                        <div className="header">
                            <h3>
                                <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 9V17.8C19 18.9201 19 19.4802 18.782 19.908C18.5903 20.2843 18.2843 20.5903 17.908 20.782C17.4802 21 16.9201 21 15.8 21H8.2C7.07989 21 6.51984 21 6.09202 20.782C5.71569 20.5903 5.40973 20.2843 5.21799 19.908C5 19.4802 5 18.9201 5 17.8V6.2C5 5.07989 5 4.51984 5.21799 4.09202C5.40973 3.71569 5.71569 3.40973 6.09202 3.21799C6.51984 3 7.0799 3 8.2 3H13M19 9L13 3M19 9H14C13.4477 9 13 8.55228 13 8V3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                                Adicionar Pedido
                            </h3>
                            <p>Preencha os campos para adicionar um novo pedido</p>
                        </div>
                        <form onSubmit={e => createOrder(e)}>
                            <div className="input-content">
                                <label>Nome do cliente</label>
                                <input
                                ref={inputClientName}
                                autoComplete="true"
                                type="text"
                                placeholder="Insira o nome do cliente"
                                value={clientNameValue}
                                onChange={e => setClientNameValue(e.target.value)}
                                required/>
                            </div>
                            <div className="input-content">
                                <label>Valor total do pedido</label>
                                <span>
                                    <p>R$</p>
                                    <input
                                    autoComplete="true"
                                    type="number"
                                    placeholder="Insira o valor total do pedido"
                                    value={totalValue}
                                    onChange={e => setTotalValue(e.target.value)}
                                    required/>
                                </span>
                            </div>
                            <div className="input-content">
                                <label>Data do pedido</label>
                                <input
                                autoComplete="true"
                                type="date"
                                placeholder="Insira a data do pedido"
                                value={dateValue}
                                onChange={e => setDateValue(e.target.value)}
                                required/>
                            </div>
                            <div className="input-content">
                                <label>Status</label>
                                <div className="status-options">
                                    <button
                                    type="button"
                                    className={statusValue === 'Pendente' ? 'selected' : ''}
                                    onClick={() => setStatusValue('Pendente')}>
                                        <span className="dot pendente"></span>
                                        Pendente
                                    </button>
                                    <button
                                    type="button"
                                    className={statusValue === 'Pago' ? 'selected' : ''}
                                    onClick={() => setStatusValue('Pago')}>
                                        <span className="dot pago"></span>
                                        Pago
                                    </button>
                                    <button
                                    type="button"
                                    className={statusValue === 'Cancelado' ? 'selected' : ''}
                                    onClick={() => setStatusValue('Cancelado')}>
                                        <span className="dot cancelado"></span>
                                        Cancelado
                                    </button>
                                </div>
                            </div>
                            <div className="buttons">
                                <button type="button" className="cancel" onClick={() => setModalAddOrderOpened(false)}>Cancelar</button>
                                <button type="submit" className="submit">Adicionar</button>
                            </div>
                        </form>
                    </ModalOrder>
                </OverlayBackground>
                :
                <></>
            }
            {modalEditOrderOpened ?
                <OverlayBackground
                ref={overlayModalEditOrderRef}
                onClick={closeModalEditOrder}
                className="animate__animated animate__fadeIn">
                    <ModalOrder>
                        <button type="button" className="close" onClick={() => setModalEditOrderOpened(false)}>
                            <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Menu / Close_MD"> <path id="Vector" d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg>
                        </button>
                        <div className="header">
                            <h3>
                                <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 9V17.8C19 18.9201 19 19.4802 18.782 19.908C18.5903 20.2843 18.2843 20.5903 17.908 20.782C17.4802 21 16.9201 21 15.8 21H8.2C7.07989 21 6.51984 21 6.09202 20.782C5.71569 20.5903 5.40973 20.2843 5.21799 19.908C5 19.4802 5 18.9201 5 17.8V6.2C5 5.07989 5 4.51984 5.21799 4.09202C5.40973 3.71569 5.71569 3.40973 6.09202 3.21799C6.51984 3 7.0799 3 8.2 3H13M19 9L13 3M19 9H14C13.4477 9 13 8.55228 13 8V3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                                Editar Pedido
                            </h3>
                            <p>Faça as alterações necessárias no pedido abaixo</p>
                        </div>
                        <form onSubmit={e => editOrder(e)}>
                            <div className="input-content">
                                <label>Nome do cliente</label>
                                <input
                                ref={inputClientName}
                                autoComplete="true"
                                type="text"
                                placeholder="Insira o nome do cliente"
                                value={clientNameEditValue}
                                onChange={e => setClientNameEditValue(e.target.value)}
                                required/>
                            </div>
                            <div className="input-content">
                                <label>Valor total do pedido</label>
                                <span>
                                    <p>R$</p>
                                    <input
                                    autoComplete="true"
                                    type="number"
                                    placeholder="Insira o valor total do pedido"
                                    value={totalEditValue}
                                    onChange={e => setTotalEditValue(e.target.value)}
                                    required/>
                                </span>
                            </div>
                            <div className="input-content">
                                <label>Data do pedido</label>
                                <input
                                autoComplete="true"
                                type="date"
                                placeholder="Insira a data do pedido"
                                value={dateEditValue}
                                onChange={e => setDateEditValue(e.target.value)}
                                required/>
                            </div>
                            <div className="input-content">
                                <label>Status</label>
                                <div className="status-options">
                                    <button
                                    type="button"
                                    className={statusEditValue === 'Pendente' ? 'selected' : ''}
                                    onClick={() => setStatusEditValue('Pendente')}>
                                        <span className="dot pendente"></span>
                                        Pendente
                                    </button>
                                    <button
                                    type="button"
                                    className={statusEditValue === 'Pago' ? 'selected' : ''}
                                    onClick={() => setStatusEditValue('Pago')}>
                                        <span className="dot pago"></span>
                                        Pago
                                    </button>
                                    <button
                                    type="button"
                                    className={statusEditValue === 'Cancelado' ? 'selected' : ''}
                                    onClick={() => setStatusEditValue('Cancelado')}>
                                        <span className="dot cancelado"></span>
                                        Cancelado
                                    </button>
                                </div>
                            </div>
                            <div className="buttons">
                                <button type="button" className="cancel" onClick={() => setModalEditOrderOpened(false)}>Cancelar</button>
                                <button type="submit" className="submit">Confirmar</button>
                            </div>
                        </form>
                    </ModalOrder>
                </OverlayBackground>
                :
                <></>
            }
        </PedidosContainer>
    )
}

export default Pedidos

const PedidosContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 100vh;
    background: #121418;
`

const Content = styled.section`
    position: relative;
    display: flex;
    width: 100%;
    background: #121418;
    padding-bottom: 2rem;

    .container {
        width: 100%;

        .header {
            position: relative;
            padding: 2rem 0 1.25rem 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 2rem;

            h3 {
                font-size: 1.75rem;
                font-weight: 600;
                color: #fff;
                user-select: none;
            }

            button {
                width: fit-content;
                background: #1f6aff;
                padding: 0.5rem 1rem;
                color: #fff;
                border: none;
                font-size: 1rem;
                font-weight: 500;
                border-radius: 4px;
                user-select: none;
                cursor: pointer;
                transition: all .1s ease;

                &:hover {
                    filter: brightness(80%);
                }
            }
        }

        .orders-total {
            font-size: 1rem;
            font-weight: 400;
            color: #a1a5aa;
        }

        .infos-bottom {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 2rem;
            margin-top: 1.5rem;
        }
    }
`

const Filters = styled.div`
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.25rem;

    p {
        font-size: 1rem;
        font-weight: 400;
        color: #fff;
    }

    .inputs {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        svg.date {
            width: 1rem;
            height: 1rem;
        }

        select {
            width: auto;
            background: #222222;
            padding: 0.2rem;
            color: #fff;
            border: 1px solid #a1a5aa25;
            font-size: 1rem;
            font-weight: 400;
            border-radius: 4px;
            user-select: none;

            &:focus {
                outline: none;
                border: 1px solid #fff;
            }

            &::placeholder {
                color: #a1a5aa;
            }
        }

        input {
            width: 9rem;
            background: #222222;
            padding: 0.25rem;
            color: #fff;
            border: 1px solid #a1a5aa25;
            font-size: 1rem;
            font-weight: 400;
            border-radius: 4px;
            user-select: none;

            &.year {
                width: 3.1rem !important;
            }
        }

        button {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            width: fit-content;
            background: #222222;
            padding: 0.25rem;
            color: #fff;
            border: 1px solid #a1a5aa25;
            font-size: 1rem;
            font-weight: 400;
            border-radius: 4px;
            user-select: none;
            cursor: pointer;

            svg {
                width: 0.85rem;
                height: 0.85rem;
            }
        }
    }
`

const Table = styled.table`
    position: relative;
    border-collapse: collapse;
    border: 1px solid #a1a5aa50;
    width: 100%;
    z-index: 1;

    .align {
        display: flex;
        align-items: center;
    }

    thead {
        position: relative;
        z-index: 1;

        tr {
            th {
                max-width: 10rem;
                padding: 1rem;
                background: #33373b50;
                color: #fff;
                font-size: 1rem;
                font-weight: 500;
                text-align: left;
                border-top: 1px solid #a1a5aa50;
                border-bottom: 1px solid #a1a5aa50;
            }
        }
    }

    tbody {
        position: relative;
        z-index: 1;
        
        tr {
            position: relative;
            background: #121418;

            &.deleted {
                background: #d80101;
            }

            td {
                z-index: 1;
                max-width: 10rem;
                padding: 1rem;
                color: #fff;
                font-size: 1rem;
                font-weight: 500;
                text-align: left;
                border-top: 1px solid #a1a5aa50;
                border-bottom: 1px solid #a1a5aa50;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;

                span.dot {
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    margin-right: 0.5rem;

                    &.pago {
                        background: #13d60c;
                    }

                    &.pendente {
                        background: #dbbe00;
                    }

                    &.cancelado {
                        background: #d80101;
                    }
                }

                button.order-options {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    padding: 0.25rem;
                    background: none;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all .1s ease;

                    &:hover {
                        svg {
                            path {
                                stroke: #fff;
                            }
                        }
                    }
                }
                
                .card-options {
                    position: absolute;
                    display: block;
                    z-index: 999;
                    top: 2.25rem;
                    right: 2.5rem;
                    position: absolute;
                    width: fit-content;
                    background: #121418;
                    border: 1px solid #dadada25;
                    box-shadow: 0 0 40px #00000050;
                    border-radius: 4px 0 4px 4px;
                    animation-duration: .1s;

                    button {
                        position: relative;
                        width: 100%;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.75rem 1rem;
                        background: #121418;
                        border: none;
                        font-size: 1rem;
                        font-weight: 500;
                        text-align: left;
                        cursor: pointer;
                        transition: all .1s ease;

                        svg {
                            width: 1rem;
                            height: 1rem;
                        }

                        &.edit {
                            color: #fff;
                        }

                        &.delete {
                            color: #d34242;
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

const Pagination = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    p {
        font-size: 1rem;
        font-weight: 400;
        color: #fff;
        margin: 0 0.5rem;
    }

    button {
        background: transparent;
        border: 1px solid #a1a5aa;
        padding: 0.5rem;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 6px;
        cursor: pointer;
        transition: all .1s ease;

        &:hover {
            filter: brightness(200%);
        }

        &.prev {
            transform: rotate(180deg);
        }

        svg {
            width: 0.75rem;
            height: 0.75rem;
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
    justify-content: flex-end;
    align-items: flex-start;
    background: #30303050;
    backdrop-filter: blur(4px);
    z-index: 999999;
    animation-duration: .1s;
`

const ModalOrder = styled.section`
    position: relative;
    width: 40rem;
    height: 100%;
    max-height: 100%;
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
            gap: 0.4rem;

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

    form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin-top: 1.5rem;

        input {
            width: auto;
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

            span {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: auto;
                background: #222222;
                color: #fff;
                border: 1px solid #a1a5aa25;
                font-size: 1rem;
                font-weight: 400;
                border-radius: 4px;
                user-select: none;

                input {
                    width: 100%;
                    border: none !important;
                }

                p {
                    font-size: 1rem;
                    font-weight: 400;
                    color: #fff;
                    width: fit-content;
                    padding: 0 0.75rem;
                }
            }

            .status-options {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 0.5rem;

                button {
                    display: flex;
                    align-items: center;
                    width: 33%;
                    background: #222222;
                    border: 1px solid #ffffff00;
                    padding: 0.5rem 0.75rem;
                    color: #fff;
                    border: 1px solid #a1a5aa25;
                    font-size: 1rem;
                    font-weight: 400;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all .1s ease;

                    span.dot {
                        width: 4px;
                        height: 4px;
                        border-radius: 50%;
                        margin-right: 0.5rem;

                        &.pago {
                            background: #13d60c;
                        }

                        &.pendente {
                            background: #dbbe00;
                        }

                        &.cancelado {
                            background: #d80101;
                        }
                    }

                    &:hover,
                    &.selected {
                        border: 1px solid #fff;
                    }
                }
            }
        }

        .buttons {
            width: 100%;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 1rem;
            margin-top: 0.5rem;

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
`