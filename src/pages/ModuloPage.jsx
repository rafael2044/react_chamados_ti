import {useEffect, useState} from "react";
import { getModulos, insertModulo, deleteModulo } from "../services/api";
import ToastMessage from "../components/ToastMessage";
import {getPaginationItems, getTotalPages} from '../utils/utils'
import ModalConfimation from "../components/ModalConfimation";

const ITEMS_PER_PAGE = 5;


const ModuloPage = () => {
    const [nome, setNome] = useState("")
    const [data, setData] = useState({
        modulos: [],
        total: 0,
        offset: 0,
        limit: ITEMS_PER_PAGE,
        total_pages: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true)
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

    const fetchModulos = async () => {
        setLoading(true)
        try {
            const dataResp = await getModulos(currentPage, ITEMS_PER_PAGE)
            setData(dataResp);
        } catch (err) {
            console.error(err);
            showToast("Ocorreu um erro ao carregar os modulos", "error")
        } finally {
            setLoading(false)
        }
    };


    useEffect(() => {
        fetchModulos();
    }, [currentPage]);

    
    const cadastrarModulo = async (e) => {

        e.preventDefault();
        setIsLoading(true);
        try {
            const newModulo = await insertModulo({nome});
            setNome('')
            showToast("Novo modulo cadastrado com sucesso.", "success")
            if (data.modulos.length < ITEMS_PER_PAGE) {
                setData((prevData) => ({
                    ...prevData,
                    modulos: [
                        ...prevData.modulos, newModulo
                    ],
                }))
            }
            setData((prevData) => ({
                ...prevData,
                total: prevData.total + 1,
                total_pages: getTotalPages(prevData.total + 1, ITEMS_PER_PAGE)
            }))
        } catch (error) {
            console.error(error);
            showToast("Erro ao cadastrar novo modulo", "error")
        }finally{
            setIsLoading(false);
        }
    };

    const excluirModulo = async (id) => {
        setIsLoading(true);

        try {
            await deleteModulo(id)
            showToast("Modulo deletado com sucesso", "success")
            setData((prevData) => (
                {
                    ...prevData,
                    modulos: prevData.modulos.filter(
                        (m) => m.id !== id
                    ),
                    total: prevData.total - 1,
                    total_pages: getTotalPages(prevData.total - 1, ITEMS_PER_PAGE)
                }
            ))
            if (data.modulos.length <= ITEMS_PER_PAGE && data.total_pages > currentPage){
                fetchModulos();
            }
            if (data.modulos.length <= 1 && data.total_pages > 1){
                handlePageChange(currentPage - 1);
            }
        } catch (error) {
            console.error("Erro ao excluir unidade:", error);
            showToast("Erro ao deletar modulo", "error")
        }finally{
            setIsLoading(false);
            setIsModalOpen(false);
        }
    };


    const showToast = (message, type = "info") => {
        setToast({ show: true, message, type });
    };
    

    const handlePageChange = (page) => {
    if(page < 1 || page > data.total_pages || page === currentPage) return;
    setCurrentPage(page);
    };

    const handleOpenModalConf = (title, message, onConfirm) => {
        setIsModalOpen(true)
        setModalData({title, message, onConfirm});
    }

    const handleDeleteModulo = (moduloId, nome) =>{
        handleOpenModalConf(
                            "Excluir Modulo",
                            `Você deseja excluir o modulo ${nome}?`,
                            () => excluirModulo(moduloId) 
        );
    } 


    return (
        <div className="container mt-5">
            <div className="card shadow-sm p-4">
                <h3 className="text-center mb-4">Gerenciar Modulos</h3>

                {/* Formulário */}
                <form className="row g-3 mb-4" onSubmit={cadastrarModulo}>
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
                <h5 className="mt-4 mb-3">Modulos cadastrados</h5>
                {data.modulos.length === 0 ? (
                    <p className="text-muted">Nenhuma modulo cadastrado.</p>
                ) : (
                    <ul className="list-group">
                        {data.modulos.map((modulo) => (
                            <li
                                key={modulo.id}
                                className="list-group-item d-flex justify-content-between align-items-center"
                            >
                                <span>{modulo.nome}</span>
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    disabled={isLoading}
                                    onClick={() => handleDeleteModulo(modulo.id, modulo.nome)}
                                >
                                    Excluir
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {loading && (
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
                Mostrando {data.modulos.length} de {data.total} Modulos
            </div>
            <ToastMessage
            show={toast.show}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast((prev) => ({ ...prev, show: false }))}
            position="bottom-end"
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

export default ModuloPage;
