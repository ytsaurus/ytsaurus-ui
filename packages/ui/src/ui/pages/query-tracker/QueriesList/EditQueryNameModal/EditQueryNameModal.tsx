import React, {useMemo, useState} from 'react';
import {FormApi, YTDFDialog, makeErrorFields} from '../../../../components/Dialog';
import Button from '../../../../components/Button/Button';
import Icon from '../../../../components/Icon/Icon';

import {QueryItem, setQueryName} from '../../module/api';
import {useThunkDispatch} from '../../../../store/thunkDispatch';

export interface Props {
    query: QueryItem;
    className?: string;
}

interface FormValues {
    name: string;
}

export default function EditQueryNameModal({query: {state, annotations, id}, className}: Props) {
    const dispatch = useThunkDispatch();
    const [error, setError] = useState<Error | undefined>(undefined);
    const [visible, setVisible] = useState(false);

    const handleSubmit = (form: FormApi<FormValues>) => {
        const {name} = form.getState().values;
        setError(undefined);
        return dispatch(setQueryName(id, {...annotations, title: name})).catch((err) => {
            setError(err);
            throw err;
        });
    };

    const initialValues = useMemo(() => {
        return {
            name: annotations?.title || '',
        };
    }, [annotations?.title]);

    return state === 'completed' || state === 'failed' || state === 'draft' ? (
        <div className={className}>
            <Button
                onClick={(event) => {
                    event.stopPropagation();
                    setVisible(true);
                }}
                view={'flat-secondary'}
                size={'m'}
                width={'auto'}
            >
                <Icon awesome="pencil"></Icon>
            </Button>
            {visible ? (
                <YTDFDialog<FormValues>
                    pristineSubmittable
                    visible={visible}
                    modal={true}
                    headerProps={{title: 'Edit query name'}}
                    footerProps={{textApply: 'Save'}}
                    onClose={() => {
                        setError(undefined);
                        setVisible(false);
                    }}
                    onAdd={handleSubmit}
                    initialValues={initialValues}
                    fields={[
                        {
                            name: 'name',
                            type: 'text',
                            required: true,
                            caption: 'Name',
                            extras: {
                                placeholder: 'Enter query name',
                            },
                        },
                        ...makeErrorFields([error]),
                    ]}
                />
            ) : null}
        </div>
    ) : null;
}
