import React, {useMemo, useState} from 'react';
import {type FormApi, YTDFDialog} from '../../../../containers/Dialog';
import Button from '../../../../components/Button/Button';
import Icon from '../../../../components/Icon/Icon';

import {type QueryItem} from '../../../../types/query-tracker/api';
import {setQueryName} from '../../../../store/actions/query-tracker/queryAnnotations';
import {useDispatch} from '../../../../store/redux-hooks';
import i18n from './i18n';

export interface Props {
    query: QueryItem;
    className?: string;
}

interface FormValues {
    name: string;
}

export default function EditQueryNameModal({query: {state, annotations, id}, className}: Props) {
    const dispatch = useDispatch();
    const [visible, setVisible] = useState(false);

    const handleSubmit = async (form: FormApi<FormValues>) => {
        const {name} = form.getState().values;
        await dispatch(setQueryName(id, name));
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
                    headerProps={{title: i18n('title_edit-query-name')}}
                    footerProps={{textApply: i18n('action_save')}}
                    onClose={() => {
                        setVisible(false);
                    }}
                    onAdd={handleSubmit}
                    initialValues={initialValues}
                    fields={[
                        {
                            name: 'name',
                            type: 'text',
                            required: true,
                            caption: i18n('field_name'),
                            extras: {
                                placeholder: i18n('field_enter-query-name'),
                            },
                        },
                    ]}
                />
            ) : null}
        </div>
    ) : null;
}
