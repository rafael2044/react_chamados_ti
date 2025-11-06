import { useEffect, useState } from "react";
import api from "../services/api";
import ToastMessage from "../components/ToastMessage";
import ChamadoItem from "../components/ChamadoItem";
import ModalAtendimento from "../components/ModalAtendimento";
import ModalChamado from "../components/ModalChamado";
import ModalConfimation from "../components/ModalConfimation";

const ITEMS_PER_PAGE = 5;

const Chamados = () => {
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
  
  const fetchChamados = async () => {
      try {
        const res = await api.get(`/chamados/?offset=${currentPage}&limit=${ITEMS_PER_PAGE}&search=${search}`);
        setData(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        showToast("Erro ao carregar Chamados", 'error')
        setLoading(false);
      }
    };
    
  useEffect(() => {
    fetchChamados();
  }, [currentPage, search]);
  
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
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Chamados</h2>
      <div className="row mb-4">
        <div className="col-12">
          <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar chamados..."
              value={search}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-0">
          {data.chamados.length === 0 && !loading ? (
            <div className="text-center py-5 text-muted">
              {search ? 'Nenhum chamado encontrado' : 'Nenhum chamado cadastrado'}
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
                Anterior
              </button>
            </li>
            {Array.from({ length: data.total_pages }, (_, i) => i + 1).map((page) => (
              <li
                key={page}
                className={`page-item ${currentPage === page ? 'active' : ''}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(page)}
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
                Próxima
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

export default Chamados;
