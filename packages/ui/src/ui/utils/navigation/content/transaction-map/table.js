import i18n from './i18n';

export const tableItems = {
    icon: {
        sort: false,
        caption: '',
        align: 'center',
    },
    id: {
        get caption() {
            return i18n('field_id');
        },
        align: 'left',
        sort(transaction) {
            return transaction.id;
        },
    },
    owner: {
        get caption() {
            return i18n('field_owner');
        },
        align: 'left',
        sort(transaction) {
            return transaction.owner;
        },
    },
    title: {
        get caption() {
            return i18n('field_title');
        },
        align: 'left',
        sort(transaction) {
            return transaction.title;
        },
    },
    start_time: {
        get caption() {
            return i18n('field_start-time');
        },
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
