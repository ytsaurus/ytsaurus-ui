import React from 'react';
import cn from 'bem-cn-lite';

import {DialogError, type DialogField, type FormApi, YTDFDialog} from '../../../containers/Dialog';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {selectLinkToModalState} from '../../../store/selectors/navigation/modals/link-to-modal';
import {createLink, hideLinkToModal} from '../../../store/actions/navigation/modals/link-to-modal';
import {type LinkToState} from '../../../store/reducers/navigation/modals/link-to-modal';
import {ytApiV3} from '../../../rum/rum-wrap-api';
import i18n from './i18n';

const block = cn('table-sort-modal');

type LinkToModalState = Pick<LinkToState, 'path' | 'target'>;

export default function LinkToModal() {
    const [error, setError] = React.useState<any>();
    const {visible, path, target} = useSelector(selectLinkToModalState);

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
                title: i18n('title_create-link'),
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
                    caption: i18n('field_link-path'),
                    required: true,
                    validator: async (path: string) => {
                        try {
                            const res = await ytApiV3.exists({path});
                            if (res) {
                                return i18n('alert_link-path-exists');
                            }
                            return undefined;
                        } catch (err) {
                            const e = err as Error;
                            return e?.message || i18n('alert_unexpected-error', {type: typeof e});
                        }
                    },
                    extras: {
                        autoFocus: true,
                    },
                },
                {
                    name: 'target',
                    type: 'path',
                    caption: i18n('field_target-path'),
                    required: true,
                    validator: async (path: string) => {
                        try {
                            const res = await ytApiV3.exists({path});
                            if (!res) {
                                return i18n('alert_target-path-not-exists');
                            }
                            return undefined;
                        } catch (err) {
                            const e = err as Error;
                            return e?.message || i18n('alert_unexpected-error', {type: typeof e});
                        }
                    },
                },
                ...errorFields,
            ]}
        />
    );
}
