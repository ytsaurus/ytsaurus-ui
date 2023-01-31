export const tableItems = {
    icon: {
        sort: false,
        caption: '',
        align: 'center',
    },
    id: {
        align: 'left',
        sort(transaction) {
            return transaction.id;
        },
    },
    owner: {
        align: 'left',
        sort(transaction) {
            return transaction.owner;
        },
    },
    title: {
        align: 'left',
        sort(transaction) {
            return transaction.title;
        },
    },
    start_time: {
        align: 'right',
        sort(transaction) {
            return transaction.started;
        },
    },
    actions: {
        caption: '',
        align: 'center',
        sort: false,
    },
};
