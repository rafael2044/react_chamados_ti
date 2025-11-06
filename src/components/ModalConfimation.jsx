
function ModalConfimation({ isOpen, title, message, onConfirm, onCancel }) {

  if (!isOpen) {
    return null;
  }

  const modalStyle = {
    display: 'block', // Força a exibição
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // O fundo escuro (backdrop)
  };

  return (

    <div
      className="modal fade show" // 'fade' e 'show' ativam a visibilidade e animação
      style={modalStyle}
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
    >
      {/* 'modal-dialog-centered' para centralizar verticalmente */}
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          
          <div className="modal-header">
            <h5 className="modal-title">{title || 'Confirmar Ação'}</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onCancel} // Fechar no "X"
            ></button>
          </div>
          
          <div className="modal-body">
            <p>{message}</p>
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary" // Botão cinza
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger" // Botão vermelho (para exclusão)
              onClick={onConfirm}
            >
              Confirmar
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default ModalConfimation;