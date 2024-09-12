import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';
import {withDelayedMount} from '../../hocs/withDelayedMount';

import type {
    registerDialogControl as RegisterDialogControlFn,
    registerDialogTabControl as RegisterDialogTabControlFn,
    YTDialogType,
} from './Dialog';

export type * from './Dialog';
export * from './DialogError';
export * from './controls/RoleListControl/utils';

export function importYTDFDialog() {
    return import(/* webpackChunkName: "yt-df-dialog" */ './Dialog');
}

export const YTDFDialog = withDelayedMount(
    withLazyLoading(
        React.lazy(async () => {
            return {default: (await importYTDFDialog()).YTDialog};
        }),
        '',
    ),
) as YTDialogType;

export function useControlRegistration(
    fn: (params: {
        registerDialogControl: typeof RegisterDialogControlFn;
        registerDialogTabControl: typeof RegisterDialogTabControlFn;
    }) => void,
) {
    importYTDFDialog().then(({registerDialogControl, registerDialogTabControl}) => {
        fn({registerDialogControl, registerDialogTabControl});
    });
}

export type {RoleListControlProps} from './controls/RoleListControl/RoleListControl';
export const RoleListControl = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importYTDFDialog()).RoleListControl};
    }),
    '',
);

export const EditableList = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importYTDFDialog()).EditableList};
    }),
    '',
);

export const TabFieldVertical = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importYTDFDialog()).TabFieldVertical};
    }),
    '',
);
