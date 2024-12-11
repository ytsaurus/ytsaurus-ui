export const pathToFileName = (path: string) => {
    return path.replace(/\/+/g, '_');
};
