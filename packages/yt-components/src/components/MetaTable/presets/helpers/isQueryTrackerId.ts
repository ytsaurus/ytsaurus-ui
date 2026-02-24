export const isQueryTrackerId = (id?: string) => {
    if (!id) return false;

    const idRegex = /^[0-9a-f]{8}-[0-9a-f]{8}-[0-9a-f]{8}-[0-9a-f]{8}$/;
    return idRegex.test(id.toLocaleLowerCase());
};
