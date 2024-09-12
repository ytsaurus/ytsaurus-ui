import React, {useMemo, useState} from 'react';
import {YTDFDialog, makeErrorFields} from '../../../../components/Dialog';
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

export default function EditQueryNameModal({query, className}: Props) {
    const [error, setError] = useState(undefined);
    const [visible, setVisible] = useState(false);
    const {state} = query;

    const dispatch = useThunkDispatch();

    const initialValues = useMemo(() => {
        return {
            name: query.annotations?.title || '',
        };
    }, [query.annotations?.title]);

    const handleSubmit = (name: string) => {
        return dispatch(setQueryName(query.id, {...query.annotations, title: name}));
    };

    return state === 'completed' || state === 'failed' || state === 'draft' ? (
        <div
            className={className}
            onClick={(event) => {
                event.stopPropagation();
            }}
            onKeyDown={(event) => {
                event.stopPropagation();
            }}
        >
            <Button
                onClick={() => {
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
                    onAdd={(form) => {
                        const {name} = form.getState().values;
                        return handleSubmit(name).catch((err) => {
                            setError(err);
                            throw err;
                        });
                    }}
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
