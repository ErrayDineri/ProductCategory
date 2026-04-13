import { type FormEvent, useEffect, useState } from "react";
import { createSupplier, deleteSupplier, getSuppliers } from "../services/api";
import type { Supplier } from "../types";

interface SupplierListProps {
  refreshKey: number;
  onDataChanged: () => void;
}

export default function SupplierList({ refreshKey, onDataChanged }: SupplierListProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    getSuppliers()
      .then((supplierList) => setSuppliers(Array.isArray(supplierList) ? supplierList : []))
      .catch(() => {
        setSuppliers([]);
        setErrorMessage("Unable to load suppliers.");
      });
  }, [refreshKey]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setErrorMessage("Supplier name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      await createSupplier({ name: trimmed });
      setName("");
      onDataChanged();
    } catch {
      setErrorMessage("Unable to create supplier.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(supplierId: number) {
    try {
      setErrorMessage("");
      await deleteSupplier(supplierId);
      onDataChanged();
    } catch {
      setErrorMessage("Unable to delete supplier.");
    }
  }

  return (
    <div>
      <h2 className="section-title">Suppliers</h2>

      <form className="create-form" onSubmit={handleSubmit}>
        <label htmlFor="supplier-name">New supplier</label>
        <div className="create-form-row">
          <input
            id="supplier-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex: Global Traders"
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add"}
          </button>
        </div>
        {errorMessage && <p className="form-error">{errorMessage}</p>}
      </form>

      <div className="category-list">
        {suppliers.map((s) => (
          <div key={s.id} className="category-pill">
            <span className="category-pill-id">{s.id}</span>
            {s.name}
            <button
              type="button"
              className="inline-delete-btn"
              onClick={() => handleDelete(s.id)}
            >
              x
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
