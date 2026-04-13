import './App.css';
import { useEffect, useState } from "react";
import AdminDashboard from "./components/AdminDashboard";
import AuthGate from "./components/AuthGate";
import ClientDashboard from "./components/ClientDashboard";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import {
  clearAuthCredentials,
  getCurrentUser,
  initializeAuthFromStorage,
  login,
  registerClient,
} from "./services/api";
import type { AppUser } from "./types";

function resolveAuthModeFromHash(): "login" | "signup" {
  return window.location.hash === "#/signup" ? "signup" : "login";
}

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">(resolveAuthModeFromHash());

  useEffect(() => {
    initializeAuthFromStorage();

    function handleHashChange() {
      setAuthMode(resolveAuthModeFromHash());
      setAuthError("");
    }

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    getCurrentUser()
      .then((loggedInUser) => {
        setUser(loggedInUser);
      })
      .catch(() => {
        clearAuthCredentials();
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  async function handleLogin(username: string, password: string) {
    try {
      setIsBusy(true);
      setAuthError("");
      const loggedInUser = await login(username, password);
      setUser(loggedInUser);
    } catch {
      setAuthError("Login failed. Check username and password.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleRegisterClient(username: string, password: string) {
    try {
      setIsBusy(true);
      setAuthError("");
      await registerClient(username, password);
      window.location.hash = "#/login";
      setAuthError("Client account created. You can now log in.");
    } catch {
      setAuthError("Client registration failed.");
    } finally {
      setIsBusy(false);
    }
  }

  function handleLogout() {
    clearAuthCredentials();
    setUser(null);
    setAuthError("");
    window.location.hash = "#/login";
  }

  function handleShowLogin() {
    window.location.hash = "#/login";
  }

  function handleShowSignup() {
    window.location.hash = "#/signup";
  }

  function renderDashboard() {
    if (!user) {
      return null;
    }

    if (user.role === "SUPERADMIN") {
      return <SuperAdminDashboard />;
    }

    if (user.role === "ADMIN") {
      return <AdminDashboard />;
    }

    return <ClientDashboard />;
  }

  if (isLoading) {
    return <p className="empty-products">Loading...</p>;
  }

  if (!user) {
    return (
      <AuthGate
        mode={authMode}
        isBusy={isBusy}
        errorMessage={authError}
        onLogin={handleLogin}
        onRegisterClient={handleRegisterClient}
        onShowLogin={handleShowLogin}
        onShowSignup={handleShowSignup}
      />
    );
  }

  return (
    <>
      <div className="app-header">
        <h1>{user.role} Dashboard</h1>
        <p>Signed in as {user.username}</p>
        <button type="button" className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {renderDashboard()}
    </>
  );
}