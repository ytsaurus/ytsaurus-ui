import React, {useCallback, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';
import Dialog, {makeErrorFields} from '../../../../components/Dialog/Dialog';
import Button from '../../../../components/Button/Button';
import Icon from '../../../../components/Icon/Icon';
import _ from 'lodash';
import {QueryItem, setQueryName} from '../../module/api';
import {UPDATE_QUERIES_LIST} from '../../module/queries_list/actions';

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

    const dispatch = useDispatch();

    const initialValues = useMemo(() => {
        return {
            name: query.annotations?.title || '',
        };
    }, [query.annotations?.title]);

    const handleSubmit = useCallback(
        (name: string) => {
            return setQueryName(query.id, {...query.annotations, title: name}).then((res) => {
                dispatch({
                    type: UPDATE_QUERIES_LIST,
                    data: [res],
                });
            });
        },
        [dispatch, query.annotations, query.id],
    );

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
                <Dialog<FormValues>
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
