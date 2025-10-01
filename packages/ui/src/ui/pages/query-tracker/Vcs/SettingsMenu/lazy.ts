import {lazy} from 'react';
import withLazyLoading from '../../../../hocs/withLazyLoading';

export const importVcsSettingsMenu = async () => {
    return import(/* webpackChunkName: "vcs-settings-menu" */ './index');
};

export const AddVcsTokenFormLazy = withLazyLoading(
    lazy(async () => {
        return {default: (await importVcsSettingsMenu()).AddVcsTokenForm};
    }),
);

export const VcsListLazy = withLazyLoading(
    lazy(async () => {
        return {default: (await importVcsSettingsMenu()).VcsList};
    }),
);
