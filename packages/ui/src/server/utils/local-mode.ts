export function isLocalModeByEnvironment() {
    return process.env.APP_ENV === 'local';
}
