
import { useEffect, useState } from "react";
import {
  getSquares,
  createSquare,
  updateSquare,
  deleteSquare,
} from "../../services/squareService";

import "./SquareManagement.css";

const EMPTY_FORM = {
  name: "",
  neighborhood: "",
  address: "",
  description: "",
  photoUrl: "",
  latitude: "",
  longitude: "",
};

function SquareManagement() {
  const [squares, setSquares] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [previewFailed, setPreviewFailed] = useState(false);

  async function loadSquares() {
    setLoading(true);
    setError("");

    try {
      setSquares(await getSquares());
    } catch (err) {
      setError(err.message || "Não foi possível carregar as praças.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSquares();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === "photoUrl") setPreviewFailed(false);

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function startEditing(square) {
    setEditingId(square.id);
    setForm({
      name: square.name || "",
      neighborhood: square.neighborhood || "",
      address: square.address || "",
      description: square.description || "",
      photoUrl: square.photoUrl || "",
      latitude: square.latitude ?? "",
      longitude: square.longitude ?? "",
    });
    setError("");
    setMessage("");
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      name: form.name.trim(),
      neighborhood: form.neighborhood.trim(),
      address: form.address.trim(),
      description: form.description.trim(),
      photoUrl: form.photoUrl.trim(),
      latitude:
        form.latitude === "" ? null : Number(form.latitude),
      longitude:
        form.longitude === "" ? null : Number(form.longitude),
    };

    if (
      (payload.latitude !== null &&
        (!Number.isFinite(payload.latitude) ||
          payload.latitude < -90 ||
          payload.latitude > 90)) ||
      (payload.longitude !== null &&
        (!Number.isFinite(payload.longitude) ||
          payload.longitude < -180 ||
          payload.longitude > 180))
    ) {
      setError("Confira os valores de latitude e longitude.");
      setSaving(false);
      return;
    }

    try {
      if (editingId !== null) {
        await updateSquare(editingId, payload);
        setMessage("Praça atualizada com sucesso!");
      } else {
        await createSquare(payload);
        setMessage("Praça cadastrada com sucesso!");
      }

      resetForm();
      await loadSquares();
    } catch (err) {
      setError(err.message || "Não foi possível salvar a praça.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(square) {
    const confirmed = window.confirm(
      `Deseja excluir a praça "${square.name}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await deleteSquare(square.id);

      if (editingId === square.id) {
        resetForm();
      }

      setMessage("Praça excluída com sucesso.");
      await loadSquares();
    } catch (err) {
      setError(
        err.message ||
          "Não foi possível excluir a praça. Verifique se existem ocorrências vinculadas."
      );
    }
  }

  return (
    <section className="square-management">
      <h2>Gestão de praças</h2>
      <p>
        Cadastre e mantenha atualizadas as informações dos espaços públicos.
      </p>

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Nome da praça *
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            maxLength={100}
            required
          />
        </label>

        <label>
          Bairro
          <input
            name="neighborhood"
            value={form.neighborhood}
            onChange={handleChange}
            maxLength={100}
          />
        </label>

        <label>
          Endereço
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            maxLength={255}
          />
        </label>

        <label>
          Descrição
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            maxLength={1000}
          />
        </label>

        <label>
          URL direta da imagem
          <input
            name="photoUrl"
            type="url"
            value={form.photoUrl}
            onChange={handleChange}
            maxLength={1000}
            placeholder="https://.../foto.jpg"
            aria-describedby="square-photo-help"
          />
          <small id="square-photo-help">
            Use o link direto do arquivo de imagem (por exemplo, .jpg, .png ou .webp).
            Links para páginas de resultados do Google Imagens não exibem a foto.
          </small>
          {form.photoUrl && !previewFailed && (
            <img
              className="square-photo-preview"
              src={form.photoUrl}
              alt="Prévia da foto da praça"
              onError={() => setPreviewFailed(true)}
            />
          )}
          {form.photoUrl && previewFailed && (
            <small role="status">Não foi possível carregar a prévia deste link.</small>
          )}
        </label>

        <label>
          Latitude
          <input
            name="latitude"
            type="number"
            min="-90"
            max="90"
            step="any"
            value={form.latitude}
            onChange={handleChange}
          />
        </label>

        <label>
          Longitude
          <input
            name="longitude"
            type="number"
            min="-180"
            max="180"
            step="any"
            value={form.longitude}
            onChange={handleChange}
          />
        </label>

        <button type="submit" disabled={saving}>
          {saving
            ? "Salvando..."
            : editingId !== null
              ? "Salvar alterações"
              : "Cadastrar praça"}
        </button>

        {editingId !== null && (
          <button type="button" onClick={resetForm}>
            Cancelar edição
          </button>
        )}
      </form>

      <h3>Praças cadastradas</h3>

      {loading ? (
        <p>Carregando praças...</p>
      ) : squares.length === 0 ? (
        <p>Nenhuma praça cadastrada.</p>
      ) : (
        <ul>
          {squares.map((square) => (
            <li key={square.id}>
              <strong>{square.name}</strong>
              {" — "}
              {square.neighborhood || "Bairro não informado"}
              {" "}
              <button
                type="button"
                onClick={() => startEditing(square)}
              >
                Editar
              </button>
              {" "}
              <button
                type="button"
                onClick={() => handleDelete(square)}
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default SquareManagement;
