const tableProps = {
    theme: 'light',
    size: 's',
    striped: false,
    virtual: false,
    templates: {
        key: 'operations/detail/specification/io',
        data: {},
    },
    columns: {
        sets: {
            input: {
                items: ['name', 'filters', 'tags'],
            },
            output: {
                items: ['name', 'live_preview', 'tags'],
            },
            stderr: {
                items: ['name', 'live_preview', 'tags'],
            },
        },
        items: {
            name: {
                sort: false,
                align: 'left',
                name: 'name',
            },
            live_preview: {
                sort: false,
                align: 'left',
                name: 'live_preview',
            },
            filters: {
                sort: false,
                align: 'left',
                name: 'filters',
            },
            tags: {
                sort: false,
                align: 'left',
                name: 'tags',
            },
        },
    },
};

export const inputTableProps = {
    ...tableProps,
    columns: {
        ...tableProps.columns,
        mode: 'input',
    },
};

export const outputTableProps = {
    ...tableProps,
    columns: {
        ...tableProps.columns,
        mode: 'output',
    },
};

export const stderrTableProps = {
    ...tableProps,
    columns: {
        ...tableProps.columns,
        mode: 'stderr',
    },
};
