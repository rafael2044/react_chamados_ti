import { useEffect, useState } from "react";
import api from "../services/api";
import ToastMessage from "../components/ToastMessage";
import ChamadoItem from "../components/ChamadoItem";
import ModalAtendimento from "../components/ModalAtendimento";
import ModalChamado from "../components/ModalChamado";
import ModalConfimation from "../components/ModalConfimation";

const ITEMS_PER_PAGE = 5;
const URGENCIAS_OPTIONS = ["", "Baixa", "Média", "Alta"];

const getPaginationItems = (currentPage, totalPages, pageNeighbors = 5) => {
  const totalNumbers = (pageNeighbors * 2) + 3;
  const totalBlocks = totalNumbers + 2;

  if (totalPages <= totalBlocks) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const startPage = Math.max(2, currentPage - pageNeighbors);
  const endPage = Math.min(totalPages - 1, currentPage + pageNeighbors);
  
  let pages = [currentPage];

  // Adiciona páginas vizinhas
  for (let i = startPage; i <= endPage; i++) {
    if (i !== currentPage) {
      pages.push(i);
    }
  }
  pages.sort((a, b) => a - b);

  const hasLeftSpill = startPage > 2;
  const hasRightSpill = (totalPages - endPage) > 1;

  // Adiciona o início (1 e "...")
  if (hasLeftSpill) {
    pages.unshift("...");
  }
  if (!pages.includes(1)) {
    pages.unshift(1);
  }

  // Adiciona o fim (totalPages e "...")
  if (hasRightSpill) {
    pages.push("...");
  }
  if (!pages.includes(totalPages)) {
    pages.push(totalPages);
  }

  return pages;
};

const ChamadosPage = () => {
  const [data, setData] = useState({
    chamados: [],
    total: 0,
    offset: 0,
    limit: ITEMS_PER_PAGE,
    total_pages: 0
  });
  const [modalAtendimentoAberto, setModalAtendimentoAberto] = useState(false);
  const [modalChamadoAberto, setModalChamadoAberto] = useState(false);
  const [ModalConfAberto, setModalConfAberto] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalConfData, setModalConfData] = useState({
    title: "",
    message: "",
    onConfirm: ()=>{}
  })
  const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "info",
      });
  

  // --- NOVOS ESTADOS PARA FILTROS ---
  const [filtroUnidade, setFiltroUnidade] = useState('');
  const [filtroModulo, setFiltroModulo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroUrgencia, setFiltroUrgencia] = useState('');

  // --- NOVOS ESTADOS PARA ARMAZENAR OPÇÕES DOS FILTROS ---
  const [unidades, setUnidades] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [statusList, setStatusList] = useState([]);
  
  const fetchChamados = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          offset: currentPage,
          limit: ITEMS_PER_PAGE,
          search: search
        });

        if (filtroUnidade) params.append('unidade_id', filtroUnidade)
        if (filtroModulo) params.append('modulo_id', filtroModulo);
        if (filtroStatus) params.append('status_id', filtroStatus)
        if (filtroUrgencia) params.append('urgencia', filtroUrgencia)

        const res = await api.get(`/chamados/?${params.toString()}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        showToast("Aconteceu um erro ao carregar os chamados", 'error')
      } finally {
        setLoading(false)
      }
    };

  const fetchFilterData = async () => {
    try {
      setLoading(true);
      const [resUnidades, resModulos, resStatus] = await Promise.all([
        api.get('/unidade/'), // Presumindo que esta é a sua rota de unidades
        api.get('/modulo/'),  // Presumindo que esta é a sua rota de módulos
        api.get('/status/')    // Presumindo que esta é a sua rota de status
      ]);
      setUnidades(resUnidades.data || []); // Garante que é um array
      setModulos(resModulos.data || []);
      setStatusList(resStatus.data || []);
    } catch (err) {
      console.error("Erro ao carregar dados dos filtros", err);
      showToast("Erro ao carregar opções de filtro", 'error');
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    fetchFilterData();
  }, []);

  useEffect(() => {
    fetchChamados();
  }, [currentPage, search, filtroModulo, filtroUnidade, filtroStatus, filtroUrgencia]);
  

  const handleOpenModalAtender = (chamadoId) => {
    const chamado = data.chamados.find((c) => c.id === chamadoId);
    setChamadoSelecionado(chamado);
    setModalAtendimentoAberto(true);
  };

  const handleOpenConfModal = (title, message, onConfirm) => {
    setModalConfAberto(true)
    setModalConfData({
      title,
      message,
      onConfirm 
    })
  }

  const handlerOpenModalEditar = (chamadoId) => {
    const chamado = data.chamados.find((c)=>c.id === chamadoId);
    setChamadoSelecionado(chamado);
    setModalChamadoAberto(true);
  }

  const handleCloseAllModal = () => {
    setModalConfAberto(false);
    setModalChamadoAberto(false);
    setModalAtendimentoAberto(false);
    setChamadoSelecionado(null);
  };
  
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
  };

  const handlePageChange = (page) => {
    if(page < 1 || page > data.total_pages || page === currentPage) return;
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1); // Reseta a página ao mudar qualquer filtro
  };

  const onInsertAtendimento = async (idChamado, data)=>{
    setIsLoading(true);
    try {
      const response = await api.post(
        `/atendimento/${idChamado}`,
        data,
        {
            headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const new_atendimento = await response.data
      setData(prevData => ({
        ...prevData,
        chamados: prevData.chamados.map(
          chamado => chamado.id === idChamado
          ? 
          { 
            ...chamado, 
            status: 'Em andamento', 
            atendimentos: [...chamado.atendimentos, new_atendimento] 
          }
          : chamado
        )
        })
      )
      handleCloseAllModal()
      showToast("Atendimento registrado com sucesso", "success");
    } catch (error) {
      console.error(error);
      showToast("Erro ao registrar atendimento", "error")
    }finally{
      setIsLoading(false);
    }
  }

  const onFinalizarChamado = async (chamadoId) => {
    setIsLoading(true);
    try {
      const response = await api.patch(
          `/chamados/${chamadoId}/finalizar`);
      showToast(`Chamado #${chamadoId} finalizado.`, "success")
      setData(prevData => ({
        ...prevData,
        chamados: prevData.chamados.map(
        chamado => chamado.id === chamadoId
        ? {
          ...chamado,
          status: 'Concluído',
          data_fechamento: response.data.data_fechamento
        }
        : chamado
        )
        })
      )
      handleCloseAllModal()
    } catch (error) {
      console.error(error);
      showToast("Aconteceu um erro ao tentar finalizar o chamado.", 'error');
    }finally{
      setIsLoading(false);
    }
  }

  const onUpdateChamado = async (chamadoId, chamadoUpdate) => {
    setIsLoading(true);
    try {
      const response = await api.patch(
          `/chamados/${chamadoId}`,
        chamadoUpdate);
      showToast(`Chamado #${chamadoId} atualizado.`, "success")
      setData(prevData => ({
        ...prevData,
        chamados: prevData.chamados.map(
        chamado => chamado.id === chamadoId
        ? {
          ...chamado,
          ...response.data
        }
        : chamado
        )
        })
      )
      handleCloseAllModal()
      showToast(`Chamado #${chamadoId} atualizado`, 'success');
    } catch (error) {
      console.error(error);
      showToast("Aconteceu um erro ao tentar atualizador o chamado.", 'error');
    }finally{
      setIsLoading(false);
    }
  }

  const onExcluirChamado = async (chamadoId) => {
    setIsLoading(true);
    try {
      const response = await api.delete(
          `/chamados/${chamadoId}`);
      showToast(`Chamado #${chamadoId} excluido.`, "success")
      setData(prevData => ({
        ...prevData,
        chamados: prevData.chamados.filter(
        chamado => chamado.id !== chamadoId
        )
        })
      )
      handleCloseAllModal()
      await fetchChamados()
    } catch (error) {
      console.error(error);
      showToast("Aconteceu um erro ao tentar excluir o chamado.", 'error');
    }finally{
      setIsLoading(false);
    }
  }

  const paginationItems = getPaginationItems(currentPage, data.total_pages);

  if (loading && data.chamados.length === 0) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  const isFiltered = search || filtroUnidade || filtroModulo || filtroStatus || filtroUrgencia;

  return (
    <div className="container mt-5">
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light py-3">
              <h5 className="mb-0">
                <i className="bi bi-filter me-2"></i>Filtros
              </h5>
        </div>
        <div className="row mb-4 p-2">
          <div className="col-12">
            <div className="input-group mb-3">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Título do chamado..."
                value={search}
                onChange={handleSearch}
              />
            </div>
          </div>
          <div className="col-md-3">
            <label htmlFor="filtroUnidade" className="form-label small">Unidade</label>
            <select
              id="filtroUnidade"
              className="form-select form-select-sm"
              value={filtroUnidade}
              onChange={handleFilterChange(setFiltroUnidade)}
            >
              <option value="">Todas as Unidades</option>
              {unidades.map(u => (
                <option key={u.id} value={u.id}>{u.nome}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label htmlFor="filtroModulo" className="form-label small">Módulo</label>
            <select
              id="filtroModulo"
              className="form-select form-select-sm"
              value={filtroModulo}
              onChange={handleFilterChange(setFiltroModulo)}
            >
              <option value="">Todos os Módulos</option>
              {modulos.map(m => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label htmlFor="filtroStatus" className="form-label small">Status</label>
            <select
              id="filtroStatus"
              className="form-select form-select-sm"
              value={filtroStatus}
              onChange={handleFilterChange(setFiltroStatus)}
            >
              <option value="">Todos os Status</option>
              {statusList.map(s => (
                <option key={s.id} value={s.id}>{s.nome}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label htmlFor="filtroUrgencia" className="form-label small">Urgência</label>
            <select
              id="filtroUrgencia"
              className="form-select form-select-sm"
              value={filtroUrgencia}
              onChange={handleFilterChange(setFiltroUrgencia)}
            >
              {URGENCIAS_OPTIONS.map(u => (
                <option key={u} value={u}>{u || 'Todas as Urgências'}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <h2 className="h4 mb-4 text-dark">Lista de Chamados</h2>
      <div className="card">
        <div className="card-body p-0">
          {loading && (
             <div className="text-center py-5">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
              </div>
          )}
          {!loading && data.chamados.length === 0 ? (
            <div className="text-center py-5 text-muted">
              {isFiltered ? 'Nenhum chamado encontrado com os filtros aplicados' : 'Nenhum chamado cadastrado'}
            </div>
          ) : (
            <ul className="list-group list-group-flush">
              {data.chamados.map((chamado) => (
                <ChamadoItem
                  key={chamado.id}
                  chamado={chamado}
                  handleEditarChamado={handlerOpenModalEditar}
                  handleAtenderChamado={handleOpenModalAtender}
                  handleFinalizarChamado={(chamadoId)=>{
                    handleOpenConfModal(
                      "Finalizar Chamado",
                      `Deseja finalizar o chamado #${chamadoId}?`,
                      ()=> onFinalizarChamado(chamadoId)
                    )
                  }}
                  handleExcluirChamado={(chamadoId) => {
                    handleOpenConfModal(
                      "Excluir Chamado",
                      `Deseja excluir o chamado #${chamadoId}?`,
                      ()=> onExcluirChamado(chamadoId)
                    )
                  }}
                  isLoading = {isLoading}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

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

      <div className="text-center mt-3 text-muted small">
        Mostrando {data.chamados.length} de {data.total} chamados
        {search && ` (filtrados por: "${search}")`}
      </div>

      {chamadoSelecionado && (
        <ModalAtendimento
          show={modalAtendimentoAberto}
          onClose={handleCloseAllModal}
          onSubmit={(chamadoId, data) => {
            handleOpenConfModal(
              "Inserir atendimento",
              "Deseja inserir o atendimento?",
              ()=> {onInsertAtendimento(chamadoId, data)}
            )
          }}
          chamado={chamadoSelecionado}
        />
      )}
      
      {chamadoSelecionado && (
        <ModalChamado
          show={modalChamadoAberto}
          onClose={handleCloseAllModal}
          onSubmit={(chamadoId, chamadoUpdate) => {
            handleOpenConfModal(
              "Atualizar Chamado", 
              "Deseja salvar as alterações feitas no chamado?", 
              () => {onUpdateChamado(chamadoId, chamadoUpdate)})
            }}
          chamado={chamadoSelecionado}
          handleShowToast = {showToast}
          isLoading={isLoading}
        />
      )}

      <ToastMessage
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        position="bottom-end"
      />

      <ModalConfimation
        isOpen={ModalConfAberto}
        title={modalConfData.title}
        message={modalConfData.message}
        onConfirm={modalConfData.onConfirm}
        onCancel={()=>setModalConfAberto(false)}
      />

    </div>
  );
};

export default ChamadosPage;
