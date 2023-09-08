import React from 'react';
import _ from 'lodash';
import cn from 'bem-cn-lite';

import {DialogError, YTDFDialog} from '../../../components/Dialog/Dialog';
import {useDispatch, useSelector} from 'react-redux';
import {
    dynTablesChangeState,
    hideDynTablesStateModal,
} from '../../../store/actions/navigation/modals/dyn-tables-state-modal';
import {
    getDynTablesStateModalAction,
    getDynTablesStateModalPaths,
    getDynTablesStateModalVisible,
} from '../../../store/selectors/navigation/modals/dyn-tables-state-modal';
import {DynTablesStateModalState} from '../../../store/reducers/navigation/modals/dyn-tables-state-modal';
import {Warning} from '../../../components/Text/Text';
import {YTError} from '../../../types';

import './DynTablesStateModal.scss';

const block = cn('dyn-tables-state-modal');

export default function DynTablesStateModal() {
    const dispatch = useDispatch();

    const action = useSelector(getDynTablesStateModalAction);
    const paths = useSelector(getDynTablesStateModalPaths);
    const visible = useSelector(getDynTablesStateModalVisible);

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
            _.map(paths, (item) => {
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
                title: _.capitalize(action),
            }}
            initialValues={{
                paths: pathsValues,
            }}
            fields={[
                {
                    name: 'paths',
                    type: 'editable-list',
                    caption: paths.length > 1 ? 'Paths' : 'Path',
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

const WARN_TEXT: {[action: string]: string} = {
    unmount:
        'Unmounted table will become inaccessible for reads and writes. Operation may take a while (usually up to 30 seconds). Do you want to proceed?',
    freeze: 'Frozen table will become read-only. Operation may take a while (usually up to 30 seconds). Do you want to proceed?',
};

function renderWarning(action: DynTablesStateModalState['action']) {
    const text = WARN_TEXT[action || ''];
    return !text ? null : <Warning>{text}</Warning>;
}
