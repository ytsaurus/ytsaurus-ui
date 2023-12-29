import * as React from 'react';
import {useState} from 'react';
import {YTDFDialog, makeErrorFields} from '../../../../components/Dialog/Dialog';
import Button from '../../../../components/Button/Button';
import Icon from '../../../../components/Icon/Icon';
import {useQueryACO} from '../useQueryACO';

export interface Props {
    query_id: string;
    className?: string;
}

interface FormValues {
    aco: string[];
}

export default function EditQueryACOModal({query_id, className}: Props) {
    const {selectACOOptions, changeCurrentQueryACO, isFlight, currentQueryACO} = useQueryACO();
    const [error, setError] = useState(undefined);
    const [visible, setVisible] = useState(false);

    const handleSubmit = (values: FormValues) => {
        return changeCurrentQueryACO({aco: values.aco[0], query_id}).then(() => undefined);
    };

    return (
        <span
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
                disabled={isFlight}
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
                    headerProps={{title: 'Edit query ACO'}}
                    footerProps={{textApply: 'Update'}}
                    onClose={() => {
                        setError(undefined);
                        setVisible(false);
                    }}
                    onAdd={(form) => {
                        return handleSubmit(form.getState().values).catch((err) => {
                            setError(err);
                            throw err;
                        });
                    }}
                    initialValues={{
                        aco: [currentQueryACO],
                    }}
                    fields={[
                        {
                            name: 'aco',
                            type: 'select',
                            required: true,
                            extras: {
                                options: selectACOOptions,
                                placeholder: 'ACO',
                                width: 'max',
                                filterable: true,
                            },
                        },
                        ...makeErrorFields([error]),
                    ]}
                />
            ) : null}
        </span>
    );
}
