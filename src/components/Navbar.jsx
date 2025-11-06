import { Link, useNavigate } from "react-router-dom";
import {logout} from "../services/auth";
import useAuth from '../hooks/useAuth'
import logo from '../assets/Logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const {user, isAdmin} = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
            <div className="container">
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <img 
                        src={logo} 
                        alt="Logo da Empresa" 
                        height="50" // Defina uma altura
                        className="d-inline-block me-2" // Classes do Bootstrap
                    />
                    Chamados T.I
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">

                    <ul className="navbar-nav ms-auto">
                        {!user ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">Iniciar Sessão</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="btn btn-outline-primary ms-lg-2" to="/register">Registrar-se</Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/chamados/abrir">Abrir Chamado</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/chamados">Listar Chamados</Link>
                                </li>
                                {(isAdmin) && (
                                    <>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/unidades">Unidades</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/modulos">Modulos</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/usuarios">Usuarios</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/relatorios">Relatorios</Link>
                                        </li>
                                    </>
                                )
                                }
                                <li className="nav-item my-auto">
                                    <span className="navbar-text me-2">
                                        Olá, {user.sub || 'Usuário'}
                                    </span>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-outline-danger" onClick={handleLogout}>Sair</button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
