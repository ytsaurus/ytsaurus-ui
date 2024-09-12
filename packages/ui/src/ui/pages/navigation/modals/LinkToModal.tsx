import React from 'react';
import cn from 'bem-cn-lite';

import {DialogError, DialogField, FormApi, YTDFDialog} from '../../../components/Dialog';
import {useDispatch, useSelector} from 'react-redux';
import {getLinkToModalState} from '../../../store/selectors/navigation/modals/link-to-modal';
import {createLink, hideLinkToModal} from '../../../store/actions/navigation/modals/link-to-modal';
import {LinkToState} from '../../../store/reducers/navigation/modals/link-to-modal';
import {ytApiV3} from '../../../rum/rum-wrap-api';

const block = cn('table-sort-modal');

type LinkToModalState = Pick<LinkToState, 'path' | 'target'>;

export default function LinkToModal() {
    const [error, setError] = React.useState<any>();
    const {visible, path, target} = useSelector(getLinkToModalState);

    const dispatch = useDispatch();

    const handleAdd = React.useCallback(
        async (form: FormApi<LinkToModalState>) => {
            try {
                await dispatch(createLink(form.getState().values));
            } catch (e) {
                setError(e);
                throw e;
            }
        },
        [setError, dispatch],
    );

    const handleClose = React.useCallback(() => {
        dispatch(hideLinkToModal());
    }, [dispatch]);

    const errorFields: Array<DialogField<LinkToModalState>> = [];
    if (error) {
        errorFields.push({
            name: 'error',
            type: 'block',
            extras: {
                children: <DialogError error={error} />,
            },
        });
    }

    return !visible ? null : (
        <YTDFDialog<LinkToModalState>
            className={block()}
            visible={true}
            headerProps={{
                title: 'Create link',
            }}
            onAdd={handleAdd}
            onClose={handleClose}
            initialValues={{
                path,
                target,
            }}
            fields={[
                {
                    name: 'path',
                    type: 'path',
                    caption: 'Link path',
                    required: true,
                    validator: async (path: string) => {
                        try {
                            const res = await ytApiV3.exists({path});
                            if (res) {
                                return 'Link path already exists';
                            }
                            return undefined;
                        } catch (err) {
                            const e = err as Error;
                            return e?.message || 'Unexpected type of error: ' + typeof e;
                        }
                    },
                },
                {
                    name: 'target',
                    type: 'path',
                    caption: 'Target path',
                    required: true,
                    validator: async (path: string) => {
                        try {
                            const res = await ytApiV3.exists({path});
                            if (!res) {
                                return 'Target path should exist';
                            }
                            return undefined;
                        } catch (err) {
                            const e = err as Error;
                            return e?.message || 'Unexpected type of error: ' + typeof e;
                        }
                    },
                },
                ...errorFields,
            ]}
        />
    );
}
