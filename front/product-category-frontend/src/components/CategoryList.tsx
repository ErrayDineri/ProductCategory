import { type FormEvent, useEffect, useState } from "react";
import { createCategory, getCategories } from "../services/api";
import type { Category } from "../types";

interface CategoryListProps {
  refreshKey: number;
  onDataChanged: () => void;
}

export default function CategoryList({ refreshKey, onDataChanged }: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    getCategories().then(setCategories);
  }, [refreshKey]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setErrorMessage("Category name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      await createCategory({ name: trimmed });
      setName("");
      onDataChanged();
    } catch {
      setErrorMessage("Unable to create category.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="section-title">Categories</h2>

      <form className="create-form" onSubmit={handleSubmit}>
        <label htmlFor="category-name">New category</label>
        <div className="create-form-row">
          <input
            id="category-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex: Accessories"
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add"}
          </button>
        </div>
        {errorMessage && <p className="form-error">{errorMessage}</p>}
      </form>

      <div className="category-list">
        {categories.map(c => (
          <div key={c.id} className="category-pill">
            <span className="category-pill-id">{c.id}</span>
            {c.name}
          </div>
        ))}
      </div>
    </div>
  );
}