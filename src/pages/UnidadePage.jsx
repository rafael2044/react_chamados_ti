import {useEffect, useState, useCallback} from "react";
import {getUnidades, insertUnidade, deleteUnidade} from "../services/api";
import ToastMessage from "../components/ToastMessage";
import {getPaginationItems, getTotalPages} from '../utils/utils'
import ModalConfimation from "../components/ModalConfimation";

const ITEMS_PER_PAGE = 5;


const UnidadePage = () => {
    const [nome, setNome] = useState("");
    const [data, setData] = useState({
        unidades: [],
        total: 0,
        offset: 0,
        limit: ITEMS_PER_PAGE,
        total_pages: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [loadingUnidades, setLoadingUnidades] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({
        title: "",
        message: "",
        onConfirm: ()=>{}
    });
    const [toast, setToast] = useState({
      show: false,
      message: "",
      type: "info",
    });
    const paginationItems = getPaginationItems(currentPage, data.total_pages);


    const showToast = (message, type = "info") => {
        setToast({ show: true, message, type });
    };


    const fetchUnidades = useCallback(async () => {
        setLoadingUnidades(true);
        try {
                const dataResp = await getUnidades(currentPage, ITEMS_PER_PAGE);
                setData(dataResp);
        } catch (err) {
                console.error(err);
                showToast("Aconteceu um erro ao carregar as unidades", "error");
        } finally {
            setLoadingUnidades(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchUnidades();
    }, [currentPage, fetchUnidades]);


    const cadastrarUnidade = async (e) => {
        setIsLoading(true);
        e.preventDefault();
        try {
            const newUnidade = await insertUnidade({nome});
            showToast("Nova unidade cadastrada", "success")
            setNome('')
            setData(prevData => ({
                ...prevData,
                total: prevData.total + 1,
                total_pages: getTotalPages(prevData.total+1, ITEMS_PER_PAGE)
            }))

            if (data.unidades.length < ITEMS_PER_PAGE){
                setData(prevData => (
                    {
                        ...prevData,
                        unidades: [
                            ...prevData.unidades,
                            newUnidade
                        ]
                    }
                ))
            }
        } catch (error) {
            console.error(error);
            showToast("Aconteceu um erro ao cadastrar nova unidade", "error")
        } finally {
            setIsLoading(false);
        }
    };

    const excluirUnidade = async (id) => {
        setIsLoading(true);
        try {
            await deleteUnidade(id)
            showToast("Unidade deletada com sucesso", "success")
            setData(prevData => (
                {
                    ...prevData,
                    unidades: prevData.unidades.filter(u => u.id !== id),
                    total: prevData.total - 1,
                    total_pages: getTotalPages(prevData.total - 1, ITEMS_PER_PAGE)
                }
            ))
            if (data.unidades.length <= ITEMS_PER_PAGE && data.total_pages > currentPage){
                fetchUnidades();
            }
            if (data.unidades.length <= 1 && data.total_pages > 1){
                handlePageChange(currentPage - 1);
            }
        } catch (error) {
            console.error("Erro ao excluir unidade:", error);
            showToast("Erro ao deletar unidade", "error")
        }finally{
            setIsLoading(false);
            setIsModalOpen(false);
        }
    };

    const handlePageChange = (page) => {
        if(page < 1 || page > data.total_pages || page === currentPage) return;
        setCurrentPage(page);
    };

    const handleOpenModalConf = (title, message, onConfirm) => {
        setIsModalOpen(true)
        setModalData({title, message, onConfirm});
    }

    const handleDeleteUnidade = (unidadeId, nome) =>{
        handleOpenModalConf(
                            "Excluir Unidade",
                            `Você deseja excluir a unidade ${nome}?`,
                            () => excluirUnidade(unidadeId) 
        );
    }

    return (
        <div className="container mt-5">
            <div className="card shadow-sm p-4">
                <h3 className="text-center mb-4">Gerenciar Unidades</h3>

                {/* Formulário */}
                <form className="row g-3 mb-4" onSubmit={cadastrarUnidade}>
                    <div className="col-md-10">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Nome da unidade"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                        />
                    </div>
                    <div className="col-md-2 d-grid">
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            Cadastrar
                        </button>
                    </div>
                </form>

                {/* Lista de unidades */}
                <h5 className="mt-4 mb-3">Unidades cadastradas</h5>
                {!loadingUnidades && data.unidades.length === 0 ? (
                    <p className="text-muted">Nenhuma unidade cadastrada.</p>
                ) : (
                    <ul className="list-group">
                        {data.unidades.map((unidade) => (
                            <li
                                key={unidade.id}
                                className="list-group-item d-flex justify-content-between align-items-center"
                            >
                                <span>{unidade.nome}</span>
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    disabled={isLoading}
                                    onClick={() => handleDeleteUnidade(unidade.id, unidade.nome)}
                                >
                                    Excluir
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {loadingUnidades && (
                    <div className="text-center p-auto">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Carregando...</span>
                        </div>
                    </div>
            )}
            {data.total_pages > 1 && (
                <nav aria-label="Paginação" className="mt-4">
                <ul className="pagination justify-content-center">
                    
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <i className="bi bi-chevron-left"></i>
                    </button>
                    </li>

                    {paginationItems.map((page, index) => (
                    <li
                        key={index}
                        className={`page-item ${currentPage === page ? 'active' : ''} ${page === "..." ? 'disabled' : ''}`}
                    >
                        <button
                        className="page-link"
                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                        >
                        {page}
                        </button>
                    </li>
                    ))}
                    <li className={`page-item ${currentPage === data.total_pages ? 'disabled' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === data.total_pages}
                    >
                        <i className="bi bi-chevron-right"></i>
                    </button>
                    </li>
                </ul>
                </nav>
            )}
            <div className="text-center mt-1 text-muted small">
                Mostrando {data.unidades.length} de {data.total} Unidades
            </div>

            <ToastMessage
            show={toast.show}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast((prev) => ({ ...prev, show: false }))}
            position="bottom-end" // ou top-end, bottom-start, etc.
            />
            <ModalConfimation
            isOpen={isModalOpen}
            title={modalData.title}
            message={modalData.message}
            onConfirm={modalData.onConfirm}
            onCancel={()=> setIsModalOpen(false)}
            />
        </div>
    );
};

export default UnidadePage;
