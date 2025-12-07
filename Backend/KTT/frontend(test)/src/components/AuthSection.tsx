import { FormEvent, useState } from "react";
import { useAsync } from "../hooks/useAsync";
import { api } from "../lib/api";
import type { AuthPayload } from "../lib/types";
import { SectionCard } from "./SectionCard";

interface AuthSectionProps {
  onAuth: (payload: AuthPayload) => void;
  onSignOut: () => void;
  currentUserId?: string | null;
  currentEmail?: string | null;
}

type AuthMode = "signin" | "signup";

export function AuthSection({ onAuth, onSignOut, currentEmail, currentUserId }: AuthSectionProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const signinMutation = useAsync(api.signin);
  const signupMutation = useAsync(api.signup);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === "signin") {
      const payload = await signinMutation.execute(email, password);
      onAuth(payload);
    } else {
      const payload = await signupMutation.execute(username, email, password);
      onAuth(payload);
    }
  };

  const busy = signinMutation.loading || signupMutation.loading;
  const error = signinMutation.error ?? signupMutation.error;

  return (
    <SectionCard
      title="Authenticate"
      description="Sign in to unlock recipe saving and reviews."
      footer={
        currentUserId ? (
          <div className="auth-summary">
            <span>Signed in as {currentEmail ?? "unknown"}</span>
            <span>User ID: {currentUserId}</span>
            <button type="button" className="link-button" onClick={onSignOut}>
              Sign out
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="link-button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
        )
      }
    >
      <form className="form" onSubmit={handleSubmit}>
        {mode === "signup" ? (
          <label className="form-field">
            <span>Username</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="chef_jane"
              required
              disabled={busy}
            />
          </label>
        ) : null}
        <label className="form-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            disabled={busy}
          />
        </label>
        <label className="form-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            required
            disabled={busy}
          />
        </label>
        {error ? <p className="error-text">{error}</p> : null}
        <button className="primary" type="submit" disabled={busy}>
          {busy ? "Working..." : mode === "signin" ? "Sign in" : "Sign up"}
        </button>
      </form>
    </SectionCard>
  );
}
