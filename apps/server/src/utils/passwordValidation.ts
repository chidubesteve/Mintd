export function isStrongPassword(password: unknown): password is string {
    return (
        typeof password === 'string' &&
        password.length >= 8 &&
        password.length <= 32 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password)
    );
}
