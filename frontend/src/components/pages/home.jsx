import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from "react-router-dom"
import axios from 'axios'
import styled from 'styled-components'
import TopBar from '../partials/topbar'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'
import { subDays, format } from 'date-fns'

const Home = () => {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    const [page, setPage] = useState('home')
    const [user, setUser] = useState(null)

    // Dashboard Data
    const [orders, setOrders] = useState([])
    const [ordersTotal, setOrdersTotal] = useState(null)
    const [revenueTotal, setRevenueTotal] = useState(null)
    const [canceledTotal, setCanceledTotal] = useState(null)
    const [pendingTotal, setPendingTotal] = useState(null)

    const [ordersTotalLastMonth, setOrdersTotalLastMonth] = useState(null)
    const [ordersDifferenceLastMonth, setOrdersDifferenceLastMonth] = useState(null)
    const [revenueTotalLastMonth, setRevenueTotalLastMonth] = useState(null)
    const [revenueDifferenceLastMonth, setRevenueDifferenceLastMonth] = useState(null)
    const [pendingTotalLastMonth, setPendingTotalLastMonth] = useState(null)
    const [pendingDifferenceLastMonth, setPendingDifferenceLastMonth] = useState(null)
    const [canceledTotalLastMonth, setCanceledTotalLastMonth] = useState(null)
    const [canceledDifferenceLastMonth, setCanceledDifferenceLastMonth] = useState(null)

    // Filter - Values
    const [startDateFilterValue, setStartDateFilterValue] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10))
    const [endDateFilterValue, setEndDateFilterValue] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10))
    const [revenueData, setRevenueData] = useState([])

    const [startDateLastMonth, setStartDateLastMonth] = useState(null)
    const [endDateLastMonth, setEndDateLastMonth] = useState(null)

    useEffect(() => {
        if(searchParams.get('start')) {
            setStartDateFilterValue(searchParams.get('start'))
        }
        if(searchParams.get('end')) {
            setEndDateFilterValue(searchParams.get('end'))
        }
    }, [])

    const getData = () => {
        axios.get('http://localhost:3333/orders/dashboard' , {
            params: {
                start: startDateFilterValue,
                end: endDateFilterValue
            }
        })
        .then(res => {
            setOrdersTotal(res.data.infos.orders_total)
            setRevenueTotal(res.data.infos.revenue_total)
            setCanceledTotal(res.data.infos.canceled)
            setPendingTotal(res.data.infos.pending)
            setOrders(res.data.orders)
        })
        .catch(err => console.error('Erro ao resgatar os dados:', err))
    }

    // Get Data
    useEffect(() => {
        getData()

        let params = ''
        if(startDateFilterValue) {
            params += (params ? '&' : '?') + 'start=' + startDateFilterValue
        }
        if(endDateFilterValue) {
            params += (params ? '&' : '?') + 'end=' + endDateFilterValue
        }
        navigate(params)

        setStartDateLastMonth(format(subDays(new Date(startDateFilterValue), 30), 'yyyy-MM-dd'))
        setEndDateLastMonth(format(subDays(new Date(endDateFilterValue), 30), 'yyyy-MM-dd'))
    }, [searchParams, startDateFilterValue, endDateFilterValue])

    const getDataLastMonth = () => {
        axios.get('http://localhost:3333/orders/dashboard', {
            params: {
                start: startDateLastMonth,
                end: endDateLastMonth
            }
        })
        .then(res => {
            setOrdersTotalLastMonth(res.data.infos.orders_total ?? 0)
            setRevenueTotalLastMonth(res.data.infos.revenue_total ?? 0)
            setPendingTotalLastMonth(res.data.infos.pending ?? 0)
            setCanceledTotalLastMonth(res.data.infos.canceled ?? 0)
        })
        .catch(err => console.error('Erro ao resgatar os dados do mês anterior:', err))
    }    

    // Get Data Last Month
    useEffect(() => {
        if(startDateLastMonth !== null && endDateLastMonth !== null) {
            getDataLastMonth()
        }
    }, [startDateLastMonth, endDateLastMonth])
    
    useEffect(() => {
        if (ordersTotalLastMonth !== null && revenueTotalLastMonth !== null &&
            pendingTotalLastMonth !== null && canceledTotalLastMonth !== null) {

            const ordersDifference = (((ordersTotal - ordersTotalLastMonth) / ordersTotalLastMonth) * 100).toFixed(0)

            const revenueDifference = (((revenueTotal - revenueTotalLastMonth) / revenueTotalLastMonth) * 100).toFixed(0)

            const pendingDifference = (((pendingTotal - pendingTotalLastMonth) / pendingTotalLastMonth) * 100).toFixed(0)
            
            const canceledDifference = (((canceledTotal - canceledTotalLastMonth) / canceledTotalLastMonth) * 100).toFixed(0)
    
            setOrdersDifferenceLastMonth(ordersDifference)
            setRevenueDifferenceLastMonth(revenueDifference)
            setPendingDifferenceLastMonth(pendingDifference)
            setCanceledDifferenceLastMonth(canceledDifference)
        }
    }, [ordersTotal, revenueTotal, pendingTotal, canceledTotal, ordersTotalLastMonth, revenueTotalLastMonth, pendingTotalLastMonth, canceledTotalLastMonth])

    // Functions to Chart
    useEffect(() => {
        const revenueByDate = orders.reduce((acc, order) => {
            const date = new Date(order.date)
            const formattedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
            if (!acc[formattedDate]) {
                acc[formattedDate] = 0
            }
            acc[formattedDate] += order.total
            return acc
        }, {})
    
        const revenueChartData = Object.keys(revenueByDate).map(date => ({
            date: new Date(date),
            total: revenueByDate[date],
        })).sort((a, b) => a.date - b.date).map(item => ({
            date: item.date.toLocaleDateString('pt-BR'),
            total: item.total,
        }))
    
        setRevenueData(revenueChartData)
    }, [orders])

    // Clear Filters
    const clearFilters = () => {
        setStartDateFilterValue(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10))
        setEndDateFilterValue(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10))
    }

    const formatCurrency = (value) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }

    return (
        <HomeContainer>
            <TopBar page={page}/>
            <Content>
                <div className="container">
                    <div className="title">
                        <h3>Dashboard</h3>
                        <Filters>
                        <div className="inputs">
                        {startDateFilterValue != new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10) ||
                            endDateFilterValue != new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10) ?
                                <button className="clear-filters" type="button" onClick={clearFilters}>
                                    <svg width="64px" height="64px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#fff" d="M13.9907,1.31133017e-07 C14.8816,1.31133017e-07 15.3277,1.07714 14.6978,1.70711 L13.8556,2.54922 C14.421,3.15654 14.8904,3.85028 15.2448,4.60695 C15.8028,5.79836 16.0583,7.109 15.9888,8.42277 C15.9193,9.73654 15.5268,11.0129 14.8462,12.1388 C14.1656,13.2646 13.2178,14.2053 12.0868,14.8773 C10.9558,15.5494 9.67655,15.9322 8.3623,15.9918 C7.04804,16.0514 5.73937,15.7859 4.55221,15.2189 C3.36505,14.652 2.33604,13.8009 1.55634,12.7413 C0.776635,11.6816 0.270299,10.446 0.0821822,9.14392 C0.00321229,8.59731 0.382309,8.09018 0.928918,8.01121 C1.47553,7.93224 1.98266,8.31133 2.06163,8.85794 C2.20272,9.83451 2.58247,10.7612 3.16725,11.556 C3.75203,12.3507 4.52378,12.989 5.41415,13.4142 C6.30452,13.8394 7.28602,14.0385 8.27172,13.9939 C9.25741,13.9492 10.2169,13.6621 11.0651,13.158 C11.9133,12.6539 12.6242,11.9485 13.1346,11.1041 C13.6451,10.2597 13.9395,9.30241 13.9916,8.31708 C14.0437,7.33175 13.8521,6.34877 13.4336,5.45521 C13.178,4.90949 12.8426,4.40741 12.4402,3.96464 L11.7071,4.69779 C11.0771,5.32776 9.99996,4.88159 9.99996,3.99069 L9.99996,1.31133017e-07 L13.9907,1.31133017e-07 Z M1.499979,4 C2.05226,4 2.499979,4.44772 2.499979,5 C2.499979,5.55229 2.05226,6 1.499979,6 C0.947694,6 0.499979,5.55228 0.499979,5 C0.499979,4.44772 0.947694,4 1.499979,4 Z M3.74998,1.25 C4.30226,1.25 4.74998,1.69772 4.74998,2.25 C4.74998,2.80229 4.30226,3.25 3.74998,3.25 C3.19769,3.25 2.74998,2.80228 2.74998,2.25 C2.74998,1.69772 3.19769,1.25 3.74998,1.25 Z M6.99998,0 C7.55226,0 7.99998,0.447716 7.99998,1 C7.99998,1.55229 7.55226,2 6.99998,2 C6.44769,2 5.99998,1.55229 5.99998,1 C5.99998,0.447716 6.44769,0 6.99998,0 Z"></path> </g></svg>
                                    Redefinir datas
                                </button>
                                :
                                <></>
                            }
                            <input
                            type="date"
                            value={startDateFilterValue}
                            onChange={e => setStartDateFilterValue(e.target.value)}
                            />
                            <p>até</p>
                            <input
                            type="date"
                            value={endDateFilterValue}
                            onChange={e => setEndDateFilterValue(e.target.value)}
                            />
                        </div>
                    </Filters>
                    </div>
                    <div className="infos">
                        <Card>
                            <div className="top">
                                <h5>Receita total <small>(pagos)</small></h5>
                                <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M13 3.5C13 2.94772 12.5523 2.5 12 2.5C11.4477 2.5 11 2.94772 11 3.5V4.0592C9.82995 4.19942 8.75336 4.58509 7.89614 5.1772C6.79552 5.93745 6 7.09027 6 8.5C6 9.77399 6.49167 10.9571 7.5778 11.7926C8.43438 12.4515 9.58764 12.8385 11 12.959V17.9219C10.2161 17.7963 9.54046 17.5279 9.03281 17.1772C8.32378 16.6874 8 16.0903 8 15.5C8 14.9477 7.55228 14.5 7 14.5C6.44772 14.5 6 14.9477 6 15.5C6 16.9097 6.79552 18.0626 7.89614 18.8228C8.75336 19.4149 9.82995 19.8006 11 19.9408V20.5C11 21.0523 11.4477 21.5 12 21.5C12.5523 21.5 13 21.0523 13 20.5V19.9435C14.1622 19.8101 15.2376 19.4425 16.0974 18.8585C17.2122 18.1013 18 16.9436 18 15.5C18 14.1934 17.5144 13.0022 16.4158 12.1712C15.557 11.5216 14.4039 11.1534 13 11.039V6.07813C13.7839 6.20366 14.4596 6.47214 14.9672 6.82279C15.6762 7.31255 16 7.90973 16 8.5C16 9.05228 16.4477 9.5 17 9.5C17.5523 9.5 18 9.05228 18 8.5C18 7.09027 17.2045 5.93745 16.1039 5.17721C15.2467 4.58508 14.1701 4.19941 13 4.0592V3.5ZM11 6.07814C10.2161 6.20367 9.54046 6.47215 9.03281 6.8228C8.32378 7.31255 8 7.90973 8 8.5C8 9.22601 8.25834 9.79286 8.79722 10.2074C9.24297 10.5503 9.94692 10.8384 11 10.9502V6.07814ZM13 13.047V17.9263C13.7911 17.8064 14.4682 17.5474 14.9737 17.204C15.6685 16.7321 16 16.1398 16 15.5C16 14.7232 15.7356 14.1644 15.2093 13.7663C14.7658 13.4309 14.0616 13.1537 13 13.047Z" fill="#a1a5aa"></path> </g></svg>
                            </div>
                            {revenueTotal ?
                                <h4>{revenueTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h4>
                                :
                                <h4>R$ 0</h4>
                            }
                            {!isNaN(revenueDifferenceLastMonth) ?
                                <p>
                                    <small>
                                        <strong className={revenueDifferenceLastMonth >= 0 ? 'up' : 'down'}>
                                        {revenueDifferenceLastMonth > 0 ? '+' : ''}
                                        {revenueDifferenceLastMonth}%
                                        </strong> em relação ao mês passado
                                    </small>
                                </p>
                                :
                                <p>
                                    <small>
                                        Sem valores para comparar
                                    </small>
                                </p>
                            }
                        </Card>
                        <Card>
                            <div className="top">
                                <h5>Pedidos <small>(pagos/pendentes)</small></h5>
                                <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect x="5" y="4" width="14" height="17" rx="2" stroke="#a1a5aa" stroke-width="2"></rect> <path d="M9 9H15" stroke="#a1a5aa" stroke-width="2" stroke-linecap="round"></path> <path d="M9 13H15" stroke="#a1a5aa" stroke-width="2" stroke-linecap="round"></path> <path d="M9 17H13" stroke="#a1a5aa" stroke-width="2" stroke-linecap="round"></path> </g></svg>
                            </div>
                            {ordersTotal ?
                                <h4>{ordersTotal}</h4>
                                :
                                <h4>0</h4>
                            }
                            {!isNaN(ordersDifferenceLastMonth) ?
                                <p>
                                    <small>
                                        <strong className={ordersDifferenceLastMonth >= 0 ? 'up' : 'down'}>
                                            {ordersDifferenceLastMonth > 0 ? '+' : ''}
                                            {ordersDifferenceLastMonth}%
                                        </strong> em relação ao mês passado
                                    </small>
                                </p>
                                :
                                <p>
                                    <small>
                                        Sem valores para comparar
                                    </small>
                                </p>
                            }
                        </Card>
                        <Card>
                            <div className="top">
                                <h5>Pagamentos Pendentes</h5>
                                <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 7V12L13.5 14.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#a1a5aa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                            </div>
                            {pendingTotal ?
                                <h4>{pendingTotal}</h4>
                                :
                                <h4>0</h4>
                            }
                            {!isNaN(pendingDifferenceLastMonth) ?
                                <p>
                                    <small>
                                        <strong className={pendingDifferenceLastMonth >= 0 ? 'up' : 'down'}>
                                            {pendingDifferenceLastMonth > 0 ? '+' : ''}
                                            {pendingDifferenceLastMonth}%
                                        </strong> em relação ao mês passado
                                    </small>
                                </p>
                                :
                                <p>
                                    <small>
                                        Sem valores para comparar
                                    </small>
                                </p>
                            }
                        </Card>
                        <Card>
                            <div className="top">
                                <h5>Cancelamentos</h5>
                                <svg width="64px" height="64px" viewBox="0 0 48 48" version="1" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 48 48" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#a1a5aa" d="M24,6C14.1,6,6,14.1,6,24s8.1,18,18,18s18-8.1,18-18S33.9,6,24,6z M24,10c3.1,0,6,1.1,8.4,2.8L12.8,32.4 C11.1,30,10,27.1,10,24C10,16.3,16.3,10,24,10z M24,38c-3.1,0-6-1.1-8.4-2.8l19.6-19.6C36.9,18,38,20.9,38,24C38,31.7,31.7,38,24,38 z"></path> </g></svg>
                            </div>
                            {canceledTotal ?
                                <h4>{canceledTotal}</h4>
                                :
                                <h4>0</h4>
                            }
                            {!isNaN(canceledDifferenceLastMonth) ?
                                <p>
                                    <small>
                                        <strong className={canceledDifferenceLastMonth >= 0 ? 'up' : 'down'}>
                                            {canceledDifferenceLastMonth > 0 ? '+' : ''}
                                            {canceledDifferenceLastMonth}%
                                        </strong> em relação ao mês passado
                                    </small>
                                </p>
                                :
                                <p>
                                    <small>
                                        Sem valores para comparar
                                    </small>
                                </p>
                            }
                        </Card>
                    </div>
                    <div className="charts">
                        {orders.length > 0 ?
                        <RevenueChart>
                            <div className="header">
                                <span>
                                    <h5>Receita no período <small>(pagos)</small></h5>
                                    <p>Receita com base no período selecionado</p>
                                </span>
                            </div>
                            <ResponsiveContainer width="100%" height={270}>
                                <LineChart
                                data={revenueData}
                                margin={{
                                    top: 0,
                                    right: 0,
                                    left: 50,
                                    bottom: 0,
                                }}>
                                    <CartesianGrid strokeDasharray="0 0"/>
                                    <XAxis dataKey="date"/>
                                    <YAxis tickFormatter={formatCurrency}/>
                                    <Tooltip formatter={formatCurrency}/>
                                    <Line type="monotone" dataKey="total" stroke="#1f6aff" strokeDasharray="0 0"/>
                                </LineChart>
                            </ResponsiveContainer>
                        </RevenueChart>
                        :
                        <p className="not-found">Nenhum resultado encontrado.</p>
                        }
                    </div>
                </div>
            </Content>
        </HomeContainer>
    )
}

export default Home

const HomeContainer = styled.div`
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

        .title {
            position: relative;
            width: 100%;
            padding: 2rem 0 1.25rem 0;
            display: flex;
            justify-content: space-between;
            align-items: center;

            h3 {
                font-size: 1.75rem;
                font-weight: 600;
                color: #fff;
                user-select: none;
            }
        }

        .infos {
            display: flex;
            justify-content: space-between;
            gap: 1rem;
        }

        .charts {
            margin-top: 1.25rem;
        }
    }
`

const Filters = styled.div`
    position: relative;
    width: fit-content;
    display: flex;
    align-items: center;
    gap: 1rem;

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

const Card = styled.div`
    position: relative;
    width: 25%;
    padding: 1rem;
    border: 1px solid #dadada25;
    background: #121418;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .top {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h5 {
            font-size: 1.15rem;
            font-weight: 500;
            color: #fff;
            user-select: none;
        }

        svg {
            width: 1.15rem;
            height: 1.15rem;
        }
    }

    h4 {
        font-size: 1.65rem;
        font-weight: 600;
        color: #fff;
    }

    p {
        color: #a1a5aa;

        strong {
            &.up {
                color: #13d60c;
            }

            &.down {
                color: #d80101;
            }
        }
    }
`

const RevenueChart = styled.div`
    position: relative;
    width: 100%;
    height: auto;
    padding: 1.25rem;
    border: 1px solid #dadada25;
    border-radius: 6px;

    .recharts-cartesian-axis-tick-value[text-anchor="middle"] {
        transform: translateY(10px);
    }

    .header {
        margin-bottom: 2rem;

        span {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;

            h5 {
                font-size: 1.15rem;
                font-weight: 500;
                color: #fff;
                user-select: none;
            }

            p {
                font-size: 1rem;
                font-weight: 400;
                color: #a1a5aa;
                user-select: none;
            }
        }
    }

    .recharts-cartesian-grid-horizontal {
        line {
            stroke: #dadada25 !important;
        }
    }

    .recharts-cartesian-grid-vertical {
        line {
            stroke: #dadada00 !important;
        }
    }

    .recharts-tooltip-cursor {
        stroke: #dadada00 !important;
    }
`