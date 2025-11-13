import {useEffect, useState, useCallback} from "react";
import { getUsers, getPrivilegios, insertUser, deleteUser} from "../services/api";
import ToastMessage from "../components/ToastMessage";
import ModalConfimation from "../components/ModalConfimation";
import {getPaginationItems, getTotalPages} from '../utils/utils'

const ITEMS_PER_PAGE = 5;

const UsuarioPage = () => {
    const [nome, setNome] = useState("")
    const [password, setPassword] = useState("");
    const [privilegio, setPrivilegio] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState({
        users: [],
        total: 0,
        offset: 0,
        limit: ITEMS_PER_PAGE,
        total_pages: 0
    })
    const [privilegios, setPrivilegios] = useState(null);
    const paginationItems = getPaginationItems(currentPage, data?.total_pages);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(true)
    const [loadingUsers, setLoadingUsers] = useState(false);
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


    const fetchUsers = useCallback(async ()=>{
        setLoadingUsers(true);
        try {
            const dataResp = await getUsers(currentPage, ITEMS_PER_PAGE, search)
            setData(dataResp)
        }catch(err){
            showToast("Aconteceu um erro ao carregar os usuários", "error")
            console.error(err)
        }finally {
            setLoadingUsers(false);
        }
    }, [currentPage, search]);


    
    
    useEffect(()=> {
        const fetchPrivilegios = async () => {
            setLoading(true);
            try {
                const dataResp = await getPrivilegios();
                setPrivilegios(dataResp);
                if (dataResp?.length > 0) setPrivilegio(dataResp[0]?.id)
            }catch(err){
                showToast("Aconteceu um erro ao carregar os privilégios", "error")
                console.error(err)
            }finally {
                setLoading(false);
            }
        }
        fetchPrivilegios();
    },[])


    useEffect(() => {
        fetchUsers();
    }, [currentPage, search, fetchUsers]);

 
    const cadastrarUsuario = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const newUser = await insertUser({username: nome, password, privilegio});
            setNome('')
            setPassword('')
            setPrivilegio(privilegios[0]?.id)
            setData(prevData => ({
                ...prevData,
                total: prevData.total + 1,
                total_pages: getTotalPages(prevData.total+1, ITEMS_PER_PAGE)
            }))
            if (data.users.length < ITEMS_PER_PAGE) {
                setData(prevData => ({
                    ...prevData,
                    users: [...prevData.users, newUser]
                }))
            }
            showToast("Usuário cadastrado com sucesso", "success")
        } catch (error) {
            console.error(error);
            if (error.status === 409) {
                showToast("Usuário já cadastrado", "warning") 
            } else {
                showToast("Aconteceu um erro ao cadastrar o usuário", "error")
            }
        } finally {
            setIsLoading(false);
        }
    };


    const excluirUsuario = async (id, username) => {
        setIsLoading(true);
        try {
            await deleteUser(id)
            setData(prevData => ({
                ...prevData,
                users: prevData.users.filter(u => u.id !== id),
                total: prevData.total - 1,
                total_pages: getTotalPages(prevData.total-1, ITEMS_PER_PAGE)
            }))
            if (data.users.length <= ITEMS_PER_PAGE && data.total_pages > currentPage){
                fetchUsers();
            }
            if (data.users.length <= 1 && data.total_pages > 1){
                handlePageChange(currentPage - 1);
            }
            showToast(`O usuário ${username} foi excluido.`, "success")
        } catch (error) {
            console.error("Erro ao tentar excluir usuário:", error);
            showToast("Erro ao tentar excluir usuário", "error")
        }finally{
            setIsLoading(false);
            setIsModalOpen(false);
        }
        
    };


    const handleOpenModalConf = (title, message, onConfirm) => {
        setIsModalOpen(true)
        setModalData({title, message, onConfirm});
    }
    

    const showToast = (message, type = "info") => {
        setToast({ show: true, message, type });
    };


    const handleDeleteUser = (userId, userName) =>{
        handleOpenModalConf(
                            "Excluir Usuário",
                            `Você deseja excluir o usuário ${userName}?`,
                            () => excluirUsuario(userId, userName) 
        );
    } 


    const handlePageChange = (page) => {
    setCurrentPage(page);
    };


    const handleSearch = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    if (loading) return (
        <div className="text-center p-auto">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
            </div>
        </div>
    )
    
    return (
        <div className="container mt-5">
            <div className="card shadow-sm p-4">
                <h3 className="text-center mb-4">Gerenciar Usuarios</h3>

                {/* Formulário */}
                <form className="row g-3 mb-4" onSubmit={cadastrarUsuario}>
                    <div className="col-md-4">
                        <input
                            required
                            disabled={isLoading}
                            type="text"
                            className="form-control"
                            placeholder="Nome do usuário"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                        />
                    </div>
                    <div className="col-md-4">
                        <input
                            required
                            disabled={isLoading}
                            type="password"
                            className="form-control"
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="col-md-3">
                        <select
                            className="form-select"
                            value={privilegio}
                            disabled={isLoading}
                            onChange={(e) => setPrivilegio(e.target.value)}
                        >
                            {privilegios?.map((p) => (
                                <option value={p.id} key={p.id}>{p.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-1 d-grid">
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            +
                        </button>
                    </div>
                </form>
                <div className="input-group mb-3">
                <span className="input-group-text">
                <i className="bi bi-search"></i>
                </span>
                <input
                type="text"
                className="form-control"
                placeholder="Buscar usuário..."
                value={search}
                onChange={handleSearch}
                />
                </div>
                {/* Lista de unidades */}
                <h5 className="mt-4 mb-3">Usuários cadastrados</h5>
                {loadingUsers && (
                    <div className="text-center p-auto">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Carregando...</span>
                        </div>
                    </div>
                )}
                {!loadingUsers && data?.users.length === 0 ? (
                    <p className="text-muted">Nenhum usuário cadastrado.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-striped table-hover align-middle">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Privilégio</th>
                                <th className="text-end">Ações</th>
                            </tr>
                            </thead>
                            <tbody>
                            {data?.users.map((usuario) => (
                                <tr key={usuario?.id}>
                                    <td>{usuario?.id}</td>
                                    <td>{usuario?.username}</td>
                                    <td>{usuario?.privilegio.nome}</td>
                                    <td className="text-end">
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            disabled={isLoading}
                                            onClick={()=>handleDeleteUser(usuario.id, usuario.username)}
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            {data?.total_pages > 1 && (
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
                    <li className={`page-item ${currentPage === data?.total_pages ? 'disabled' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === data?.total_pages}
                    >
                        <i className="bi bi-chevron-right"></i>
                    </button>
                    </li>
                </ul>
                </nav>
            )}

            <div className="text-center mt-3 text-muted small">
                Mostrando {data?.users.length} de {data?.total} Usuários
                {search && ` (filtrados por: "${search}")`}
            </div>
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

export default UsuarioPage;
