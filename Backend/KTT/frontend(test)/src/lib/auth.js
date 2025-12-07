function isRecord(value) {
    return typeof value === "object" && value !== null;
}
export function extractUserId(auth) {
    if (!isRecord(auth))
        return null;
    const user = auth.user;
    if (isRecord(user) && typeof user.id === "string" && user.id) {
        return user.id;
    }
    const session = auth.session;
    if (isRecord(session)) {
        const sessionUser = session.user;
        if (isRecord(sessionUser) && typeof sessionUser.id === "string" && sessionUser.id) {
            return sessionUser.id;
        }
    }
    return null;
}
export function extractEmail(auth) {
    if (!isRecord(auth))
        return null;
    const user = auth.user;
    if (isRecord(user) && typeof user.email === "string") {
        return user.email;
    }
    return null;
}
