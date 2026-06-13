import i18n from './i18n';

export const VisibleHostType = {
    host: 'host',
    physicalHost: 'physicalHost',
};

export const mastersRadioButtonItems = [
    {
        value: VisibleHostType.host,
        get text() {
            return i18n('value_container');
        },
    },
    {
        value: VisibleHostType.physicalHost,
        get text() {
            return i18n('value_host');
        },
    },
];
