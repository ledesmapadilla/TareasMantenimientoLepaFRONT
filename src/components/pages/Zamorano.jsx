import { useState, useEffect } from "react";
import { Container, Table, Button } from "react-bootstrap";
import { listarTareas, editarTarea } from "../../helpers/queriesTareas.js";
import DetalleModal from "./tareas/DetalleModal.jsx";
import "../../styles/tareas.css";

const formatearFecha = (fecha) => {
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
};

const calcularDiasAtraso = (fecha) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaTarea = new Date(fecha + "T00:00:00");
  const diferencia = Math.floor((hoy - fechaTarea) / (1000 * 60 * 60 * 24));
  return diferencia > 0 ? diferencia : 0;
};

const Zamorano = () => {
  const [tareas, setTareas] = useState([]);
  const [showDetalle, setShowDetalle] = useState(false);
  const [tareaDetalle, setTareaDetalle] = useState(null);

  const cargarTareas = async () => {
    const respuesta = await listarTareas();
    if (respuesta?.ok) {
      const data = await respuesta.json();
      const filtradas = data.filter(
        (t) =>
          t.responsable === "Zamorano" &&
          (t.estado || "Pendiente") !== "Terminada"
      );
      setTareas(filtradas);
    }
  };

  useEffect(() => {
    cargarTareas();
  }, []);

  const marcarEstado = async (id, estado) => {
    const respuesta = await editarTarea(id, { estado });
    if (respuesta?.ok) {
      cargarTareas();
    }
  };

  const abrirDetalle = (tarea) => {
    setTareaDetalle(tarea);
    setShowDetalle(true);
  };


  return (
    <Container className="tareas-page mt-3">
      <div className="tareas-header">
        <div className="tareas-pendientes-box">
          <span className="tareas-pendientes-label">Tareas pendientes</span>
          <span className="tareas-pendientes-num">{tareas.filter((t) => (t.estado || "Pendiente") === "Pendiente").length}</span>
        </div>
        <div className="text-center">
          <h2 className="mb-0 mt-5">Tareas Zamorano</h2>
          <p className="mb-0">{new Date().toLocaleDateString("es-AR")}</p>
        </div>
        <span></span>
      </div>

      {tareas.length === 0 ? (
        <div className="tareas-vacio">
          <p>No hay tareas pendientes o en proceso.</p>
        </div>
      ) : (
        <div className="tareas-scroll">
        <Table striped bordered hover className="tareas-tabla">
          <thead className="table-dark">
            <tr>
              <th>Fecha</th>
              <th>Tarea</th>
              <th>Máquina</th>
              <th>Urgencia</th>
              <th>Estado</th>
              <th>Días atraso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tareas.map((tarea) => {
              const dias = calcularDiasAtraso(tarea.fecha);
              return (
                <tr key={tarea._id}>
                  <td>{formatearFecha(tarea.fecha)}</td>
                  <td className="col-tarea">
                    <div className="col-tarea-content">
                      <span>{tarea.tarea}</span>
                      {tarea.detalle && (
                        <Button
                          variant="outline-warning"
                          size="sm"
                          className="btn-plus"
                          onClick={() => abrirDetalle(tarea)}
                          title="Ver detalle"
                        >
                          <i className="bi bi-eye"></i>
                        </Button>
                      )}
                    </div>
                  </td>
                  <td>{tarea.maquina}</td>
                  <td>
                    <span
                      className={`badge ${
                        tarea.urgencia === "Alta"
                          ? "bg-danger"
                          : tarea.urgencia === "Media"
                          ? "bg-warning text-dark"
                          : "bg-success"
                      }`}
                    >
                      {tarea.urgencia}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        (tarea.estado || "Pendiente") === "En proceso"
                          ? "bg-info text-dark"
                          : "bg-secondary"
                      }`}
                    >
                      {(tarea.estado || "Pendiente") === "En proceso" ? "Revisar" : (tarea.estado || "Pendiente")}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        dias > 7
                          ? "bg-danger"
                          : dias > 0
                          ? "bg-warning text-dark"
                          : "bg-success"
                      }`}
                    >
                      {dias}
                    </span>
                  </td>
                  <td>
                    <Button
                      variant="outline-info"
                      size="sm"
                      className="me-1"
                      onClick={() => marcarEstado(tarea._id, "En proceso")}
                    >
                      Revisar
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => marcarEstado(tarea._id, "Pendiente")}
                    >
                      Pendiente
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        </div>
      )}
      {tareaDetalle && (
        <DetalleModal
          show={showDetalle}
          onHide={() => setShowDetalle(false)}
          tarea={tareaDetalle}
          soloLectura
        />
      )}
    </Container>
  );
};

export default Zamorano;
