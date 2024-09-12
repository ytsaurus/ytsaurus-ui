import React from 'react';

import {DialogError, FormApi, YTDFDialog} from '../../../components/Dialog';
import {makeLink} from '../../../navigation/Navigation/PathEditorModal/CreateTableModal/CreateTableModal';
import {useDispatch, useSelector} from 'react-redux';
import {
    hideTableEraseModal,
    runTableErase,
} from '../../../store/actions/navigation/modals/table-erase-modal';
import {
    getNavigationTableEraseModalPath,
    getNavigationTableEraseModalVisible,
} from '../../../store/selectors/navigation/modals/table-erase-modal';
import {docsUrl} from '../../../config';
import UIFactory from '../../../UIFactory';

interface FormValues {
    path: string;
    range: string;
    combine_chunks: boolean;
}

export default function TableEraseModal() {
    const visible = useSelector(getNavigationTableEraseModalVisible);
    const path = useSelector(getNavigationTableEraseModalPath);

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
                title: 'Erase table rows',
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
                    caption: 'Path',
                },
                {
                    name: 'range',
                    type: 'text',
                    caption: 'Range',
                    tooltip: (
                        <span>
                            {docsUrl(makeLink(UIFactory.docsUrls['operations:erase']))}
                            Leave empty to erase all rows. Or use two numbers separated by colon.
                            Each number might be skipped.
                            <br />
                            Examples: &quot;10:20&quot;, &quot;10:&quot;, &quot;:20&quot;
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
                    caption: 'Combine chunks',
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

    return 'Enter two numbers separated by colon, like "10:20" or ":20" or "10:"';
}
