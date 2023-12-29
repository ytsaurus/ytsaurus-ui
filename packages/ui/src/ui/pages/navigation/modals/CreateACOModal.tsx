import React from 'react';
import cn from 'bem-cn-lite';

import {DialogError, DialogField, FormApi, YTDFDialog} from '../../../components/Dialog/Dialog';
import {useDispatch, useSelector} from 'react-redux';
import {getCreateACOModalState} from '../../../store/selectors/navigation/modals/create-aco-modal';
import {closeCreateACOModal, createACO} from '../../../store/actions/navigation/modals/create-aco';

const block = cn('table-sort-modal');

type CreateACOFormState = {
    namespace: string;
    name: string;
    path: string;
};

export default function CreateACOModal() {
    const [error, setError] = React.useState<any>();
    const {visible, path, namespace} = useSelector(getCreateACOModalState);

    const dispatch = useDispatch();

    const handleAdd = React.useCallback(
        async (form: FormApi<CreateACOFormState>) => {
            try {
                await dispatch(createACO(form.getState().values));
            } catch (e) {
                setError(e);
                throw e;
            }
        },
        [setError, dispatch],
    );

    const handleClose = React.useCallback(() => {
        dispatch(closeCreateACOModal());
    }, [dispatch]);

    const errorFields: Array<DialogField<CreateACOFormState>> = [];
    if (error) {
        errorFields.push({
            name: 'error',
            type: 'block',
            extras: {
                children: <DialogError error={error} />,
            },
        });
    }

    if (visible) {
        return (
            <YTDFDialog<CreateACOFormState>
                className={block()}
                visible={true}
                headerProps={{
                    title: 'Create ACO',
                }}
                onAdd={handleAdd}
                onClose={handleClose}
                initialValues={{
                    path,
                    namespace,
                }}
                fields={[
                    {
                        name: 'name',
                        type: 'text',
                        caption: 'ACO name',
                        required: true,
                    },
                    ...errorFields,
                ]}
            />
        );
    }

    return null;
}
