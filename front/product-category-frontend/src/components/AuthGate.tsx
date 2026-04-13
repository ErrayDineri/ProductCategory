import { type FormEvent, useState } from "react";

interface AuthGateProps {
  mode: "login" | "signup";
  isBusy: boolean;
  errorMessage: string;
  onLogin: (username: string, password: string) => Promise<void>;
  onRegisterClient: (username: string, password: string) => Promise<void>;
  onShowLogin: () => void;
  onShowSignup: () => void;
}

export default function AuthGate({
  mode,
  isBusy,
  errorMessage,
  onLogin,
  onRegisterClient,
  onShowLogin,
  onShowSignup,
}: AuthGateProps) {
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onLogin(loginUsername, loginPassword);
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onRegisterClient(registerUsername, registerPassword);
    setRegisterUsername("");
    setRegisterPassword("");
  }

  return (
    <div className="auth-layout">
      <div className="app-header">
        <h1>Product Catalog</h1>
        <p>{mode === "login" ? "Login page" : "Client signup page"}</p>

        <div className="auth-switch">
          <button
            type="button"
            className={`auth-switch-btn ${mode === "login" ? "active" : ""}`}
            onClick={onShowLogin}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-switch-btn ${mode === "signup" ? "active" : ""}`}
            onClick={onShowSignup}
          >
            Sign Up
          </button>
        </div>
      </div>

      {mode === "login" ? (
        <form className="create-form" onSubmit={handleLogin}>
          <h2 className="section-title">Login</h2>
          <label htmlFor="login-username">Username</label>
          <input
            id="login-username"
            type="text"
            value={loginUsername}
            onChange={(event) => setLoginUsername(event.target.value)}
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={loginPassword}
            onChange={(event) => setLoginPassword(event.target.value)}
          />

          <button type="submit" disabled={isBusy}>Login</button>
          <p className="auth-hint">Default superadmin: superadmin / superadmin123</p>
          <p className="auth-hint">
            Need an account?{" "}
            <button type="button" className="link-btn" onClick={onShowSignup}>Go to sign up</button>
          </p>
        </form>
      ) : (
        <form className="create-form" onSubmit={handleRegister}>
          <h2 className="section-title">Create Client Account</h2>
          <label htmlFor="register-username">Username</label>
          <input
            id="register-username"
            type="text"
            value={registerUsername}
            onChange={(event) => setRegisterUsername(event.target.value)}
          />

          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            value={registerPassword}
            onChange={(event) => setRegisterPassword(event.target.value)}
          />

          <button type="submit" disabled={isBusy}>Register as Client</button>
          <p className="auth-hint">
            Already have an account?{" "}
            <button type="button" className="link-btn" onClick={onShowLogin}>Go to login</button>
          </p>
        </form>
      )}

      {errorMessage && <p className="form-error">{errorMessage}</p>}
    </div>
  );
}
