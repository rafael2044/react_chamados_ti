import { useState, useEffect} from "react";
import {getUnidades, getModulos} from "../services/api";

function ModalChamado({ show, onClose, onSubmit, chamado, handleShowToast, isLoading=false }) {
  const [titulo, setTitulo] = useState(chamado.titulo);
  const [unidade, setUnidade] = useState();
  const [setor, setSetor] = useState(chamado.setor);
  const [modulo, setModulo] = useState();
  const [urgencia, setUrgencia] = useState(chamado.urgencia);
  const [descricao, setDescricao] = useState(chamado.descricao);
  const [unidades, setUnidades] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUnidades = async () => {
      setLoading(true);
      try {
          const dataResp = await getUnidades();
          setUnidades(dataResp.unidades);
          if (chamado.unidade){
            setUnidade(dataResp.unidades.find(u => u.nome === chamado.unidade)?.id)
          }else if (dataResp.unidades.length > 0){
            setUnidade(dataResp.unidades[0].id)
          }
          setLoading(false);
        } catch (err) {
          console.error(err);
          handleShowToast("Erro ao carregar unidades", "error")
          setLoading(false);
        }
    };
    const fetchModulos = async () => {
      setLoading(true);
      try {
        const dataResp = await getModulos();
        setModulos(dataResp.modulos);
        if (chamado.modulo){
          setModulo(dataResp.modulos.find(m => m.nome === chamado.modulo)?.id)
        }else if (dataResp.modulos.length > 0){
          setModulo(dataResp.modulos[0].id)
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
        handleShowToast("Erro ao carregar modulos", "error")
      }
    };
    fetchUnidades();
    fetchModulos();
  }, []);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(
      chamado.id,
      {
        titulo,
        unidade,
        setor,
        modulo,
        urgencia,
        descricao
      });
  };

  if (!show) return null; // não renderiza o modal se estiver oculto
  
  return (
    <div
      className="modal show fade"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              Editar - Chamado #{chamado.id}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          {loading && (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          )}
          {!loading && (
            <form onSubmit={handleSubmit} className="mx-3 my-3">
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
            <div className="d-flex justify-content-center gap-2">
              <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>Atualizar</button>
              <button type="button" className="btn btn-danger w-100" disabled={isLoading} onClick={onClose} >Cancelar</button>
            </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModalChamado;
