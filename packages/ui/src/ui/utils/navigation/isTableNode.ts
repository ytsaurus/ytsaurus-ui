export const isTableNode = (type?: string) => {
    if (!type) return false;

    return ['table', 'tablet_cell', 'replicated_table'].includes(type);
};
