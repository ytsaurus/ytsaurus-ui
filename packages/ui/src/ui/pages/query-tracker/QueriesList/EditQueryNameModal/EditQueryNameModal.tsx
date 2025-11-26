import React, {useMemo, useState} from 'react';
import {FormApi, YTDFDialog, makeErrorFields} from '../../../../components/Dialog';
import Button from '../../../../components/Button/Button';
import Icon from '../../../../components/Icon/Icon';

import type {QueryItem} from '../../../../types/query-tracker/api';
import {setQueryName} from '../../../../store/actions/query-tracker/api';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {updateQueryInList} from '../../../../store/actions/query-tracker/queriesList';
import {getQueryDraft} from '../../../../store/selectors/query-tracker/query';
import {updateQueryDraft} from '../../../../store/actions/query-tracker/query';

export interface Props {
    query: QueryItem;
    className?: string;
}

interface FormValues {
    name: string;
}

export default function EditQueryNameModal({query: {state, annotations, id}, className}: Props) {
    const dispatch = useDispatch();
    const currentDraft = useSelector(getQueryDraft);
    const [error, setError] = useState<Error | undefined>(undefined);
    const [visible, setVisible] = useState(false);

    const handleSubmit = async (form: FormApi<FormValues>) => {
        const {name} = form.getState().values;
        setError(undefined);
        try {
            const updatedAnnotations = {...annotations, title: name};
            await dispatch(setQueryName(id, updatedAnnotations));
            dispatch(
                updateQueryInList(id, {
                    annotations: updatedAnnotations,
                }),
            );

            if (currentDraft.id === id) {
                dispatch(
                    updateQueryDraft({
                        annotations: {...currentDraft.annotations, title: name},
                    }),
                );
            }
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    };

    const initialValues = useMemo(() => {
        return {
            name: annotations?.title || '',
        };
    }, [annotations?.title]);

    return state === 'completed' ||
        state === 'aborted' ||
        state === 'failed' ||
        state === 'draft' ? (
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
