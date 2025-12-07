import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAsync } from "../hooks/useAsync";
import { api } from "../lib/api";
import { SectionCard } from "./SectionCard";
export function AuthSection({ onAuth, onSignOut, currentEmail, currentUserId }) {
    const [mode, setMode] = useState("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const signinMutation = useAsync(api.signin);
    const signupMutation = useAsync(api.signup);
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (mode === "signin") {
            const payload = await signinMutation.execute(email, password);
            onAuth(payload);
        }
        else {
            const payload = await signupMutation.execute(username, email, password);
            onAuth(payload);
        }
    };
    const busy = signinMutation.loading || signupMutation.loading;
    const error = signinMutation.error ?? signupMutation.error;
    return (_jsx(SectionCard, { title: "Authenticate", description: "Sign in to unlock recipe saving and reviews.", footer: currentUserId ? (_jsxs("div", { className: "auth-summary", children: [_jsxs("span", { children: ["Signed in as ", currentEmail ?? "unknown"] }), _jsxs("span", { children: ["User ID: ", currentUserId] }), _jsx("button", { type: "button", className: "link-button", onClick: onSignOut, children: "Sign out" })] })) : (_jsx("button", { type: "button", className: "link-button", onClick: () => setMode(mode === "signin" ? "signup" : "signin"), children: mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in" })), children: _jsxs("form", { className: "form", onSubmit: handleSubmit, children: [mode === "signup" ? (_jsxs("label", { className: "form-field", children: [_jsx("span", { children: "Username" }), _jsx("input", { type: "text", value: username, onChange: (event) => setUsername(event.target.value), placeholder: "chef_jane", required: true, disabled: busy })] })) : null, _jsxs("label", { className: "form-field", children: [_jsx("span", { children: "Email" }), _jsx("input", { type: "email", value: email, onChange: (event) => setEmail(event.target.value), placeholder: "you@example.com", required: true, disabled: busy })] }), _jsxs("label", { className: "form-field", children: [_jsx("span", { children: "Password" }), _jsx("input", { type: "password", value: password, onChange: (event) => setPassword(event.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, disabled: busy })] }), error ? _jsx("p", { className: "error-text", children: error }) : null, _jsx("button", { className: "primary", type: "submit", disabled: busy, children: busy ? "Working..." : mode === "signin" ? "Sign in" : "Sign up" })] }) }));
}
