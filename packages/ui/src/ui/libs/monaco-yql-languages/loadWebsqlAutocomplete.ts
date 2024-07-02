import {Toaster} from '@gravity-ui/uikit';
import {rumLogError} from '../../rum/rum-counter';

const toaster = new Toaster();
export const loadWebsqlAutocomplete = async () => {
    try {
        return await import(
            /* webpackChunkName: "websql-autocomplete" */ '@gravity-ui/websql-autocomplete'
        );
    } catch (e) {
        toaster.add({
            theme: 'danger',
            name: `load_websql_autocomplete`,
            title: 'Autocomplete error',
            content:
                'Your browser does not support all required features, it will work in restricted mode.',
        });
        rumLogError({message: `Failed to load "websql-autocomplete"`}, e as Error);
        return undefined;
    }
};
