import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function SectionCard({ title, description, footer, children }) {
    return (_jsxs("section", { className: "card", children: [_jsx("header", { className: "card__header", children: _jsxs("div", { children: [_jsx("h2", { children: title }), description ? _jsx("p", { className: "card__description", children: description }) : null] }) }), _jsx("div", { className: "card__body", children: children }), footer ? _jsx("footer", { className: "card__footer", children: footer }) : null] }));
}
