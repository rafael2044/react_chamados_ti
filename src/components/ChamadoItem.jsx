import { useState } from "react";
import useAuth from '../hooks/useAuth'

function ChamadoItem({ chamado,
  handleAtenderChamado = () => {} ,
  handleFinalizarChamado = () => {},
  handleEditarChamado = () => {},
  handleExcluirChamado = () => {},
  isLoading = false}) {
  const [aberto, setAberto] = useState(false);
  const {isAdmin, isSuporte} = useAuth();

  const getStatusClass = (status) => {
    switch (status) {
      case "Pendente":
        return "bg-warning text-dark";
      case "Em andamento":
        return "bg-info text-dark";
      case "Concluído":
        return "bg-success";
      default:
        return "bg-secondary";
    }
  };


  return (
    <div className="card mb-2 shadow-sm border-0">
      {/* Cabeçalho do Chamado */}
      <div
        className="card-header d-flex justify-content-between align-items-center bg-light"
        style={{ cursor: "pointer" }}
        onClick={() => setAberto(!aberto)}
      >
        <div>
          <h5 className="mb-1">{chamado.titulo}</h5>
          <div className="small">
            <strong>ID:</strong> {chamado.id} | {" "}
            <strong>UNIDADE:</strong> {chamado.unidade ? chamado.unidade : "---"} |{" "}
            <strong>SETOR:</strong> {chamado.setor} |{" "}
            <strong>MODULO:</strong> {chamado.modulo ? chamado.modulo : "---"} |{" "}
            <strong>SOLICITANTE:</strong> {chamado.solicitante ? chamado.solicitante : "Desconhecido"}
          </div>
        </div>
        <span className={`badge ${getStatusClass(chamado.status)} p-2`}>
          {chamado.status}
        </span>
      </div>

      {/* Corpo Expansível */}
      {aberto && (
        <div className="card-body">
          <p className="mb-2">
            <strong>DESCRIÇÃO:</strong>
            {<br />}
            {chamado.descricao}
          </p>

          <p className="mb-1">
            <strong>DATA DE ABERTURA:</strong>{" "}
            {new Date(chamado.data_abertura).toLocaleString()}
          </p>

          {chamado.data_fechamento && (
            <p className="mb-1 mt-3">
              <strong>DATA DE FECHAMENTO:</strong>{" "}
              {new Date(chamado.data_fechamento).toLocaleString()}
            </p>
          )}

          {chamado.url_anexo &&(
            <div>
              <a
                className="fs-6"
                href={chamado.url_anexo} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Ver anexo do Chamado
              </a>
            </div>
          )}

          {/* Botão "Realizar Atendimento" abaixo da data de abertura, no canto direito,
              exibido apenas se NÃO for 'Concluído' */}
          {(isAdmin || isSuporte) &&  (
            <>
              <div className="d-flex justify-content-end mt-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm mr-2"
                  disabled={isLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditarChamado(chamado.id);
                  }}
                >Editar</button>
                {chamado.status !== "Concluído" && (
                  <>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm mx-2"
                      disabled={isLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAtenderChamado(chamado.id);
                      }}
                    >
                      Realizar Atendimento
                    </button>
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      disabled={isLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFinalizarChamado(chamado.id);
                      }}
                    >
                      Finalizar Chamado
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="btn btn-danger btn-sm mx-2"
                  disabled={isLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExcluirChamado(chamado.id);
                  }}
                >Excluir</button>
              </div>
            </>
          )}

          {/* Histórico de Atendimentos */}
          {chamado.atendimentos && chamado.atendimentos.length > 0 && (
            <>
              <hr />
              <h6>HISTÓRICO DE ATENDIMENTOS:</h6>
              <ul className="list-group list-group-flush">
                {chamado.atendimentos.map((a, i) => (
                  <li key={i} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>DESCRIÇÃO:</strong> {a.descricao || "—"}
                        <br />
                        <small>
                          <strong>DATA DO ATENDIMENTO:</strong>{" "}
                          {new Date(a.data_atendimento).toLocaleString()}
                        </small>
                      </div>
                      <span className="badge bg-secondary">
                        {a.suporte || "Sem suporte"}
                      </span>
                    </div>
                    {a.url_anexo && (
                      <div>
                        <a
                          className="fs-6"
                          href={a.url_anexo} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          Ver anexo do atendimento
                        </a>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ChamadoItem;
