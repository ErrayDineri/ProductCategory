import { type FormEvent, useEffect, useState } from "react";
import { clearSystemData, createAdmin, getUsers, updateUserRole } from "../services/api";
import type { AppUser } from "../types";

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadUsers() {
    try {
      const payload = await getUsers();
      setUsers(Array.isArray(payload) ? payload : []);
    } catch {
      setErrorMessage("Unable to load users.");
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreateAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setErrorMessage("");
      setSuccessMessage("");
      await createAdmin(adminUsername, adminPassword);
      setAdminUsername("");
      setAdminPassword("");
      setSuccessMessage("Admin created successfully.");
      await loadUsers();
    } catch {
      setErrorMessage("Unable to create admin user.");
    }
  }

  async function handleSetRole(userId: number, role: "ADMIN" | "CLIENT") {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      await updateUserRole(userId, role);
      setSuccessMessage("Role updated.");
      await loadUsers();
    } catch {
      setErrorMessage("Unable to update role.");
    }
  }

  async function handleClearSystem() {
    const confirmed = window.confirm(
      "This will delete products, categories, suppliers, paniers, and all non-superadmin users. Continue?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage("");
      const result = await clearSystemData();
      setSuccessMessage(
        `System cleared. Users: ${result.deletedUsers}, Paniers: ${result.deletedPaniers}, Products: ${result.deletedProducts}, Categories: ${result.deletedCategories}, Suppliers: ${result.deletedSuppliers}.`
      );
      await loadUsers();
    } catch {
      setErrorMessage("Unable to clear system data.");
    }
  }

  return (
    <>
      <div className="section">
        <form className="create-form" onSubmit={handleCreateAdmin}>
          <h2 className="section-title">Create Admin</h2>
          <div className="create-form-grid superadmin-grid">
            <input
              type="text"
              value={adminUsername}
              onChange={(event) => setAdminUsername(event.target.value)}
              placeholder="Admin username"
            />
            <input
              type="password"
              value={adminPassword}
              onChange={(event) => setAdminPassword(event.target.value)}
              placeholder="Admin password"
            />
            <button type="submit">Create Admin</button>
          </div>
          <div className="danger-zone">
            <button type="button" className="danger-btn" onClick={handleClearSystem}>
              Clear Everything (except superadmin)
            </button>
          </div>
        </form>
      </div>

      <div className="section">
        <h2 className="section-title">Role Management</h2>
        <div className="user-grid">
          {users.map((user) => (
            <div key={user.id} className="create-form">
              <p className="user-line"><strong>{user.username}</strong> ({user.role})</p>
              {user.role !== "SUPERADMIN" && (
                <div className="inline-actions">
                  <button type="button" onClick={() => handleSetRole(user.id, "ADMIN")}>Set Admin</button>
                  <button type="button" onClick={() => handleSetRole(user.id, "CLIENT")}>Set Client</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {errorMessage && <p className="form-error">{errorMessage}</p>}
      {successMessage && <p className="form-success">{successMessage}</p>}
    </>
  );
}
