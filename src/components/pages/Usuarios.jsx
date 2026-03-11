import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { Container, Button } from "react-bootstrap";
import Swal from "sweetalert2";

import {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  editarUsuario as editarUsuarioAPI,
  borrarUsuario as borrarUsuarioAPI,
} from "../../helpers/queriesUsuarios.js";
import UsuarioModal from "./usuarios/UsuarioModal";
import UsuariosTabla from "./usuarios/UsuariosTabla";
import "../../styles/tareas.css";

const SUPERADMIN_PASS = "lep1";

const valoresIniciales = {
  nombre: "",
  rol: "",
  contraseña: "",
};

const Usuarios = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: valoresIniciales,
    mode: "onChange",
  });

  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    let cancelado = false;

    const pedirContraseña = async () => {
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
          confirmButton: "swal-btn-outline-danger",
          cancelButton: "swal-btn-outline-secondary",
        },
        buttonsStyling: false,
      });

      if (cancelado) return;

      if (isDismissed || password !== SUPERADMIN_PASS) {
        Swal.fire({
          icon: "error",
          title: "Acceso denegado",
          text: "Contraseña incorrecta",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal-dark" },
        }).then(() => {
          navigate("/");
        });
        return;
      }

      setAutenticado(true);
      cargarUsuarios();
    };

    pedirContraseña();

    return () => {
      cancelado = true;
      Swal.close();
    };
  }, []);

  const cargarUsuarios = async () => {
    const respuesta = await listarUsuarios();
    if (respuesta?.ok) {
      const data = await respuesta.json();
      setUsuarios(data);
    }
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditando(false);
    setUsuarioId(null);
    reset(valoresIniciales);
  };

  const onSubmit = async (data) => {
    try {
      let respuesta;

      if (editando) {
        respuesta = await editarUsuarioAPI(usuarioId, data);
      } else {
        respuesta = await crearUsuario(data);
      }

      if (!respuesta.ok) {
        const errorData = await respuesta.json();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorData.mensaje || "No se pudo guardar el usuario",
          customClass: { popup: "swal-dark" },
        });
        return;
      }

      const resData = await respuesta.json();

      if (editando) {
        setUsuarios(
          usuarios.map((u) => (u._id === usuarioId ? resData.usuario : u))
        );
        Swal.fire({
          icon: "success",
          title: "Usuario editado",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal-dark" },
        });
      } else {
        setUsuarios([...usuarios, resData.usuario]);
        Swal.fire({
          icon: "success",
          title: "Usuario creado",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal-dark" },
        });
      }

      cerrarModal();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error inesperado",
        text: "No se pudo procesar la solicitud",
        customClass: { popup: "swal-dark" },
      });
    }
  };

  const borrarUsuario = async (id) => {
    const result = await Swal.fire({
      title: "¿Borrar usuario?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal-dark",
        confirmButton: "swal-btn-outline-danger",
        cancelButton: "swal-btn-outline-secondary",
      },
      buttonsStyling: false,
    });

    if (result.isConfirmed) {
      const respuesta = await borrarUsuarioAPI(id);

      if (respuesta?.ok) {
        setUsuarios(usuarios.filter((u) => u._id !== id));

        Swal.fire({
          icon: "success",
          title: "Usuario borrado",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal-dark" },
        });
      }
    }
  };

  const abrirCrear = () => {
    setEditando(false);
    setUsuarioId(null);
    reset(valoresIniciales);
    setShowModal(true);
  };

  const abrirEditar = async (usuarioLocal) => {
    const respuesta = await obtenerUsuario(usuarioLocal._id);
    const usuario = respuesta?.ok ? await respuesta.json() : usuarioLocal;

    setEditando(true);
    setUsuarioId(usuario._id);

    reset({
      nombre: usuario.nombre,
      rol: usuario.rol,
      contraseña: usuario.contraseña,
    });

    setShowModal(true);
  };

  if (!autenticado) return null;

  return (
    <Container className="tareas-page mt-3">
      <h2 className="text-center mb-2">Usuarios</h2>
      <div className="tareas-header">
        <span></span>
        <Button variant="outline-primary" onClick={abrirCrear}>
          <i className="bi bi-plus-circle me-2"></i>
          Nuevo Usuario
        </Button>
      </div>

      <UsuariosTabla
        usuarios={usuarios}
        borrarUsuario={borrarUsuario}
        abrirEditar={abrirEditar}
      />

      <UsuarioModal
        show={showModal}
        onHide={cerrarModal}
        editando={editando}
        onSubmit={onSubmit}
        register={register}
        handleSubmit={handleSubmit}
        errors={errors}
        cerrarModal={cerrarModal}
      />
    </Container>
  );
};

export default Usuarios;
