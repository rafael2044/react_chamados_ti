import {useEffect, useState, useRef} from "react";
import { getUnidades, getModulos, insertChamado, insertAnexoChamado } from "../services/api";
import ToastMessage from "../components/ToastMessage";
import ModalConfimation from "../components/ModalConfimation";

const ChamadoForm = () => {
  const [titulo, setTitulo] = useState("");
  const [unidade, setUnidade] = useState(null);
  const [setor, setSetor] = useState("");
  const [modulo, setModulo] = useState(null);
  const [urgencia, setUrgencia] = useState("Média");
  const [descricao, setDescricao] = useState("");
  const [anexo, setAnexo] = useState(null);
  const [unidades, setUnidades] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
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

  const fetchUnidades = async () => {
    setLoading(true);
    try {
        const dataResp = await getUnidades();
        setUnidades(dataResp.unidades);
        if (dataResp.unidades.length > 0){
          setUnidade(dataResp.unidades[0]?.id)
        }
      } catch (err) {
        console.error(err);
        showToast("Erro ao carregar unidades", "error")
      } finally {
        setLoading(false);
      }
  };

  const fetchModulos = async () => {
    setLoading(true);
    try {
      const dataResp = await getModulos();
      setModulos(dataResp.modulos);
      if (dataResp.modulos.length > 0){
        setModulo(dataResp.modulos[0]?.id)
      }
    } catch (err) {
      console.error(err);
      showToast("Erro ao carregar modulos", "error")
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnidades();
    fetchModulos();
  }, []);


  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
  };

  async function enviarAnexo(chamadoId, arquivo) {
      try {
          const dataResp = await insertAnexoChamado(chamadoId, arquivo)
          showToast(dataResp.message);
      } catch (err) {
          console.error(err);
          showToast(`Erro ao enviar anexo do chamado #${chamadoId}`, "error");
      }
  }


  const cadastrarChamado = async () => {
    setIsLoading(true)
    try {
        const respData = await insertChamado(
          {titulo, unidade, setor, modulo, urgencia, descricao});
        
        const chamado_id = await respData.chamado_id
        
        if (anexo){
          await enviarAnexo(chamado_id, anexo);
        }

        showToast(respData.message, 'success')
        setTitulo("")
        setUnidade(unidades[0].id)
        setSetor("")
        setModulo(modulos[0].id)
        setUrgencia("Média")
        setDescricao("")
        setAnexo("")
        inputRef.current.value = null;
        setIsLoading(false);
    } catch (error) {
      console.error(error);
      showToast("Erro ao enviar chamado", "error")
    } finally{
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  const handleCadastrarChamado = (e) => {
    e.preventDefault();
    handleOpenModalConf(
                        "Abrir novo Chamado",
                        `Deseja abrir o chamado?`,
                        () => cadastrarChamado()
    );
  }

  const handleOpenModalConf = (title, message, onConfirm) => {
        setIsModalOpen(true)
        setModalData({title, message, onConfirm});
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
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h3 className="card-title mb-4 text-center">Abrir Chamado</h3>
              <form onSubmit={handleCadastrarChamado}>
                <div className="mb-3">
                  <label className="form-label">Título</label>
                  <input type="text" name="titulo" value={titulo} onChange={(e)=>setTitulo(e.target.value)} className="form-control" required />
                </div>

                <div className="mb-3">
                  <label className="form-label">Unidade</label>
                  <select name="unidade" value={unidade} onChange={(e)=>setUnidade(e.target.value)} className="form-select" required>
                      {unidades.map((u) => (
                          <option value={u.id} key={u.id}>{u.nome}</option>
                      ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Setor</label>
                  <input type="text" name="setor" value={setor} onChange={(e)=>setSetor(e.target.value)} className="form-control" required />
                </div>

                <div className="mb-3">
                  <label className="form-label">Modulo</label>
                  <select name="modulo" value={modulo} onChange={(e)=>setModulo(e.target.value)} className="form-select" required>
                      {modulos.map((m) => (
                          <option value={m.id} key={m.id}>{m.nome}</option>
                      ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Urgência</label>
                  <select name="urgencia" value={urgencia} onChange={(e)=>setUrgencia(e.target.value)} className="form-select" required>
                    <option>Alta</option>
                    <option>Média</option>
                    <option>Baixa</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Descrição</label>
                  <textarea name="descricao" value={descricao} onChange={(e)=>setDescricao(e.target.value)} className="form-control" rows="5" required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Anexo (Opcional)</label>
                  <input className="form-control" name="anexo" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setAnexo(e.target.files[0]) } ref={inputRef}/>
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>Enviar Chamado</button>
              </form>
              {isLoading && (
                <div className="alert alert-info d-flex align-items-center" role="alert">
                  {/* Spinner do Bootstrap */}
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span>Enviando chamado, por favor aguarde...</span>
                </div>
              )}
            </div>
          </div>
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

export default ChamadoForm;
