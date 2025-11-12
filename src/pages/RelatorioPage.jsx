import { useState, useEffect } from 'react';
import { 
    BarChart, Bar, 
    PieChart, Pie, Cell, 
    XAxis, YAxis, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { api } from "../services/api";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FA8072'];

export default function RelatorioPage() {
    // --- Estados para os Filtros ---
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [isFiltering, setIsFiltering] = useState(false); // Spinner do botão

    // --- Estados para o Gráfico 1 (Chamados por Módulo) ---
    const [moduloData, setModuloData] = useState([]);
    const [isModuloLoading, setIsModuloLoading] = useState(true);
    
    // --- Estados para o Gráfico 2 (TMR por Módulo) ---
    const [tmrData, setTmrData] = useState([]);
    const [isTmrLoading, setIsTmrLoading] = useState(true);

    // --- Estados para o Gráfico 3 (Chamados por Status) ---
    const [statusData, setStatusData] = useState([]);
    const [isStatusLoading, setIsStatusLoading] = useState(true);

    // --- Estados para o Gráfico 3 (Chamados por Status) ---
    const [unidadeData, setUnidadeData] = useState([]);
    const [isUnidadeLoading, setIsUnidadeLoading] = useState(true);

    // ==============================================================
    // Funções de Fetch de Dados
    // ==============================================================

    const buildUrlParams = () => {
        const params = new URLSearchParams();
        if (dataInicio) params.append('data_inicio', dataInicio);
        if (dataFim) params.append('data_fim', dataFim);
        return params.toString();
    };

    // Fetch Gráfico 1
    const fetchModuloData = async (isFilterRequest = false) => {
        if (!isFilterRequest) setIsModuloLoading(true);
        try {
            const params = buildUrlParams();
            const response = await api.get(`/relatorio/chamados-por-modulo?${params}`);
            setModuloData(response.data);
        } catch (error) {
            console.error("Erro ao buscar dados de Módulo:", error);
            // Aqui você trataria um erro 401 (ex: deslogar o usuário)
        } finally {
            if (!isFilterRequest) setIsModuloLoading(false);
        }
    };

    // Fetch Gráfico 2
    const fetchTmrData = async (isFilterRequest = false) => {
        if (!isFilterRequest) setIsTmrLoading(true);
        try {
            const params = buildUrlParams();
            const response = await api.get(`/relatorio/tmr-por-modulo?${params}`);
            setTmrData(response.data);
        } catch (error) {
            console.error("Erro ao buscar dados de TMR:", error);
        } finally {
            if (!isFilterRequest) setIsTmrLoading(false);
        }
    };

    // Fetch Gráfico 3
    const fetchStatusData = async (isFilterRequest = false) => {
        if (!isFilterRequest) setIsStatusLoading(true);
        try {
            const params = buildUrlParams();
            const response = await api.get(`/relatorio/chamados-por-status?${params}`);
            setStatusData(response.data);
        } catch (error) {
            console.error("Erro ao buscar dados de Status:", error);
        } finally {
            if (!isFilterRequest) setIsStatusLoading(false);
        }
    };

    // Fetch Gráfico 4
    const fetchUnidadeData = async (isFilterRequest = false) => {
        if (!isFilterRequest) setIsUnidadeLoading(true);
        try {
            const params = buildUrlParams();
            const response = await api.get(`/relatorio/chamados-por-unidade?${params}`);
            setUnidadeData(response.data);
        } catch (error) {
            console.error("Erro ao buscar dados de Status:", error);
        } finally {
            if (!isFilterRequest) setIsUnidadeLoading(false);
        }
    };

    // ==============================================================
    // Handlers e Effects
    // ==============================================================

    // Carga inicial (busca dados de todos os gráficos)
    useEffect(() => {
        fetchModuloData(false);
        fetchTmrData(false);
        fetchStatusData(false);
        fetchUnidadeData(false);
    }, []); // O array vazio [] garante que isso rode apenas UMA vez no mount

    // Handler do botão "Filtrar"
    const handleFilterSubmit = async (e) => {
        e.preventDefault(); 
        setIsFiltering(true);
        
        // Dispara todas as requisições em paralelo e espera terminarem
        await Promise.all([
            fetchModuloData(true),
            fetchTmrData(true),
            fetchStatusData(true),
            fetchUnidadeData(true)
        ]);
        
        setIsFiltering(false);
    };

    // ==============================================================
    // Componentes Helper de UI
    // ==============================================================

    // Spinner reutilizável do Bootstrap
    const LoadingSpinner = () => (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
            </div>
        </div>
    );
    
    // Label customizado para o gráfico de pizza (para mostrar %)
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

        // Não mostra o label se a fatia for muito pequena
        if (percent < 0.05) return null; 

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };


    // ==============================================================
    // Renderização do JSX
    // ==============================================================
    return (
        <div className="container mt-4">
            <h2 className="mb-4">Dashboard de Chamados</h2>
            
            {/* --- Card de Filtros --- */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <form className="row g-3 align-items-end" onSubmit={handleFilterSubmit}>
                        
                        <div className="col-md-5">
                            <label htmlFor="dataInicio" className="form-label">Data Início:</label>
                            <input 
                                type="date"
                                id="dataInicio"
                                className="form-control" 
                                value={dataInicio} 
                                onChange={e => setDataInicio(e.target.value)} 
                            />
                        </div>
                        
                        <div className="col-md-5">
                            <label htmlFor="dataFim" className="form-label">Data Fim:</label>
                            <input 
                                type="date"
                                id="dataFim"
                                className="form-control" 
                                value={dataFim} 
                                onChange={e => setDataFim(e.target.value)} 
                            />
                        </div>
                        
                        <div className="col-md-2 d-grid">
                            <button type="submit" className="btn btn-primary" disabled={isFiltering}>
                                {isFiltering ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        <span className="ms-1">Filtrando...</span>
                                    </>
                                ) : (
                                    'Filtrar'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* --- Gráfico 1 (Chamados por Módulo) --- */}
            <div className="card shadow-sm mb-4">
                <div className="card-header">
                    <h5 className="mb-0">Chamados por Módulo (Top 10)</h5>
                </div>
                <div className="card-body">
                    {isModuloLoading ? (
                        <LoadingSpinner />
                    ) : (
                        <div style={{ width: '100%', height: 400 }}> 
                            <ResponsiveContainer>
                                <BarChart data={moduloData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <XAxis dataKey="nome" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="total" fill="#0d6efd" name="Total de Chamados" /> 
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Gráfico 1 (Chamados por Unidade) --- */}
            <div className="card shadow-sm mb-4">
                <div className="card-header">
                    <h5 className="mb-0">Chamados por Unidade (Top 10)</h5>
                </div>
                <div className="card-body">
                    {isUnidadeLoading ? (
                        <LoadingSpinner />
                    ) : (
                        <div style={{ width: '100%', height: 400 }}> 
                            <ResponsiveContainer>
                                <BarChart data={unidadeData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <XAxis dataKey="nome" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="total" fill="#0d6efd" name="Total de Chamados" /> 
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Gráfico 2 (TMR por Módulo) --- */}
            <div className="card shadow-sm mb-4">
                <div className="card-header">
                    <h5 className="mb-0">TMR por Módulo (em Horas)</h5>
                </div>
                <div className="card-body">
                    {isTmrLoading ? (
                        <LoadingSpinner />
                    ) : (
                        <div style={{ width: '100%', height: 400 }}> 
                            <ResponsiveContainer>
                                <BarChart data={tmrData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <XAxis dataKey="nome" />
                                    <YAxis unit="h" />
                                    <Tooltip formatter={(value) => `${parseFloat(value).toFixed(2)} horas`} />
                                    <Legend />
                                    <Bar dataKey="tempo_medio" fill="#198754" name="Tempo Médio (Horas)" /> 
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
            
            {/* --- Gráfico 3 (Chamados por Status) --- */}
            <div className="card shadow-sm mb-4">
                <div className="card-header">
                    <h5 className="mb-0">Distribuição de Chamados por Status</h5>
                </div>
                <div className="card-body">
                    {isStatusLoading ? (
                        <LoadingSpinner />
                    ) : (
                        <div style={{ width: '100%', height: 400 }}> 
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        dataKey="total"
                                        nameKey="nome"
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                        outerRadius={150}
                                        fill="#8884d8"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value, name) => [value, name]} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

        </div> 
    );
}