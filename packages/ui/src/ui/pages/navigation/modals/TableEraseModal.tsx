import React from 'react';

import {DialogError, type FormApi, YTDFDialog} from '../../../containers/Dialog';
import {makeLink} from './CreateTableModal/CreateTableModal';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {
    hideTableEraseModal,
    runTableErase,
} from '../../../store/actions/navigation/modals/table-erase-modal';
import {
    selectNavigationTableEraseModalPath,
    selectNavigationTableEraseModalVisible,
} from '../../../store/selectors/navigation/modals/table-erase-modal';
import {docsUrl} from '../../../config';
import UIFactory from '../../../UIFactory';
import i18n from './i18n';

interface FormValues {
    path: string;
    range: string;
    combine_chunks: boolean;
}

export default function TableEraseModal() {
    const visible = useSelector(selectNavigationTableEraseModalVisible);
    const path = useSelector(selectNavigationTableEraseModalPath);

    const [error, setError] = React.useState<any>();

    const dispatch = useDispatch();

    const handleAdd = React.useCallback(
        async (form: FormApi<FormValues>) => {
            try {
                const {range, combine_chunks} = form.getState().values;

                const [from, to] = range?.split(':') || [];
                await dispatch(
                    runTableErase({
                        path: path ?? '',
                        from: from ? Number(from) : undefined,
                        to: to ? Number(to) : undefined,
                        combine_chunks,
                    }),
                );
            } catch (e) {
                setError(e);
                throw e;
            }
        },
        [path, setError, dispatch],
    );

    const handleClose = React.useCallback(() => {
        dispatch(hideTableEraseModal());
    }, [dispatch]);

    return (
        <YTDFDialog<FormValues>
            visible={visible}
            headerProps={{
                title: i18n('title_erase-table-rows'),
            }}
            onAdd={handleAdd}
            onClose={handleClose}
            pristineSubmittable={true}
            initialValues={{
                path,
            }}
            fields={[
                {
                    name: 'path',
                    type: 'plain',
                    caption: i18n('field_path'),
                },
                {
                    name: 'range',
                    type: 'text',
                    caption: i18n('field_range'),
                    tooltip: (
                        <span>
                            {docsUrl(makeLink(UIFactory.docsUrls['operations:erase']))}
                            {i18n('context_range-tooltip')}
                            <br />
                            {i18n('context_range-examples')}
                        </span>
                    ),
                    validator: validateRange,
                    extras: {
                        placeholder: '10:20',
                    },
                },
                {
                    name: 'combine_chunks',
                    type: 'tumbler',
                    caption: i18n('field_combine-chunks'),
                },
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

const RANGE = /^(\d+:)|(\d+:\d+)|(:\d+)$/;

function validateRange(value: string) {
    if (!value || RANGE.test(value)) {
        return undefined;
    }

    return i18n('alert_range-invalid');
}
