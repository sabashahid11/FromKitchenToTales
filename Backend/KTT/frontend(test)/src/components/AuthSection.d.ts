import type { AuthPayload } from "../lib/types";
interface AuthSectionProps {
    onAuth: (payload: AuthPayload) => void;
    onSignOut: () => void;
    currentUserId?: string | null;
    currentEmail?: string | null;
}
export declare function AuthSection({ onAuth, onSignOut, currentEmail, currentUserId }: AuthSectionProps): import("react/jsx-runtime").JSX.Element;
export {};
