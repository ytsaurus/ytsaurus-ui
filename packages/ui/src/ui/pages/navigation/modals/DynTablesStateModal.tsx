import React from 'react';

import map_ from 'lodash/map';

import cn from 'bem-cn-lite';

import {DialogError, YTDFDialog} from '../../../containers/Dialog';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {
    dynTablesChangeState,
    hideDynTablesStateModal,
} from '../../../store/actions/navigation/modals/dyn-tables-state-modal';
import {
    selectDynTablesStateModalAction,
    selectDynTablesStateModalPaths,
    selectDynTablesStateModalVisible,
} from '../../../store/selectors/navigation/modals/dyn-tables-state-modal';
import {type DynTablesStateModalState} from '../../../store/reducers/navigation/modals/dyn-tables-state-modal';
import {Warning} from '@ytsaurus/components';
import {type YTError} from '../../../types';

import i18n from './i18n';

import './DynTablesStateModal.scss';

const block = cn('dyn-tables-state-modal');

export default function DynTablesStateModal() {
    const dispatch = useDispatch();

    const action = useSelector(selectDynTablesStateModalAction);
    const paths = useSelector(selectDynTablesStateModalPaths);
    const visible = useSelector(selectDynTablesStateModalVisible);

    const [error, setError] = React.useState<YTError>();

    const onClose = React.useCallback(() => {
        dispatch(hideDynTablesStateModal());
        setError(undefined);
    }, [dispatch, setError]);

    const onAdd = React.useCallback(async () => {
        try {
            if (!action) {
                throw new Error('Action should be defined');
            }
            await dispatch(dynTablesChangeState(paths, action));
        } catch (e) {
            setError(e as any);
            throw e;
        }
    }, [dispatch, paths, action, setError]);

    const pathsValues = React.useMemo(
        () =>
            map_(paths, (item) => {
                return {
                    title: item,
                };
            }),
        [paths],
    );

    if (!visible) {
        return null;
    }

    const warning = renderWarning(action);

    return (
        <YTDFDialog
            visible
            onAdd={onAdd}
            onClose={onClose}
            pristineSubmittable={true}
            headerProps={{
                title: action ? i18n(`value_${action}`) : '',
            }}
            initialValues={{
                paths: pathsValues,
            }}
            fields={[
                {
                    name: 'paths',
                    type: 'editable-list',
                    caption: paths.length > 1 ? i18n('field_paths') : i18n('field_path'),
                    extras: {
                        frozen: true,
                        className: block('path-list'),
                    },
                },
                ...(!warning
                    ? []
                    : [
                          {
                              name: 'warning',
                              type: 'block' as const,
                              extras: {
                                  children: warning,
                              },
                          },
                      ]),
                ...(!error
                    ? []
                    : [
                          {
                              name: 'error',
                              type: 'block' as const,
                              extras: {
                                  children: <DialogError error={error} />,
                              },
                          },
                      ]),
            ]}
        />
    );
}

const WARN_KEYS: {[action: string]: Parameters<typeof i18n>[0]} = {
    unmount: 'context_unmount-warning',
    freeze: 'context_freeze-warning',
};

function renderWarning(action: DynTablesStateModalState['action']) {
    const key = WARN_KEYS[action || ''];
    return !key ? null : <Warning>{i18n(key)}</Warning>;
}
