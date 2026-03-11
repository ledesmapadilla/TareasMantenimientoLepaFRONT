import { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { NavLink, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { listarUsuarios } from "../../helpers/queriesUsuarios.js";

const Menu = () => {
  const [autenticado, setAutenticado] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") {
      setAutenticado(false);
    }
  }, [location.pathname]);

  const handleIngresar = async () => {
    let superadmin = null;
    const respuesta = await listarUsuarios();
    if (respuesta?.ok) {
      const usuarios = await respuesta.json();
      superadmin = usuarios.find((u) => u.rol === "Superadmin");
    }

    const { value: password, isDismissed } = await Swal.fire({
      title: "Acceso restringido",
      text: "Ingrese la contraseña de superadministrador",
      input: "password",
      inputPlaceholder: "Contraseña",
      confirmButtonText: "Ingresar",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: {
        popup: "swal-dark",
        confirmButton: "swal-btn-success",
        cancelButton: "swal-btn-outline-secondary",
      },
      buttonsStyling: false,
    });

    const contraseñaCorrecta = superadmin
      ? password === superadmin.contraseña
      : password === "lep1";

    if (isDismissed || !contraseñaCorrecta) {
      if (!isDismissed) {
        Swal.fire({
          icon: "error",
          title: "Acceso denegado",
          text: "Contraseña incorrecta",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal-dark" },
        });
      }
      return;
    }

    setAutenticado(true);
  };

  return (
    <Navbar bg="dark" variant="dark" expand="sm" sticky="top">
      <Container>
        <Navbar.Brand as={NavLink} to="/">
          <img
            src="/img/Imagen8tr.png"
            alt="Logo LEPA"
            height="40"
            className="d-inline-block align-top"
          />
        </Navbar.Brand>
        {!autenticado ? (
          <Button variant="outline-light" size="sm" onClick={handleIngresar}>
            <i className="bi bi-box-arrow-in-right me-1"></i>
            Ingresar
          </Button>
        ) : (
          <>
            <Navbar.Toggle aria-controls="navbar-nav" />
            <Navbar.Collapse id="navbar-nav">
              <Nav className="mx-auto">
                <NavLink className="nav-link nav-separador" to="/zamorano">
                  Zamorano
                </NavLink>
                <NavLink className="nav-link nav-separador" to="/nelson">
                  Nelson
                </NavLink>
                <NavLink className="nav-link" to="/mauricio">
                  Mauricio
                </NavLink>
              </Nav>
              <Nav className="ms-auto">
                <NavLink className="nav-link" to="/">
                  Inicio
                </NavLink>
                <NavLink className="nav-link" to="/distribucion">
                  Distribución de tareas
                </NavLink>
                <NavLink className="nav-link" to="/informe">
                  Informes
                </NavLink>
                <NavLink className="nav-link" to="/usuarios">
                  Usuarios
                </NavLink>
              </Nav>
            </Navbar.Collapse>
          </>
        )}
      </Container>
    </Navbar>
  );
};

export default Menu;
