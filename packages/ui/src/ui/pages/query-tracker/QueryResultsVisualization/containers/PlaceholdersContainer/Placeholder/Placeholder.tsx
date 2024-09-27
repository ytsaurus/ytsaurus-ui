import React from 'react';
import block from 'bem-cn-lite';
import './Placeholder.scss';
import {Field, Placeholder} from '../../../types';
import {Button, Icon, Select} from '@gravity-ui/uikit';
import {Plus as PlusIcon, Xmark as XmarkIcon} from '@gravity-ui/icons';
import {useThunkDispatch} from '../../../../../../store/thunkDispatch';

const b = block('placeholder');

type PlaceholderComponentProps = {
    placeholder: Placeholder;
    availableFields: Field[];
};

export const PlaceholderComponent = ({placeholder, availableFields}: PlaceholderComponentProps) => {
    const {id, fields} = placeholder;
    const dispatch = useThunkDispatch();

    const addField = React.useCallback(
        ({field, placeholder}: {field: Field; placeholder: Placeholder}) => {
            dispatch({
                type: 'set-fields',
                data: {
                    fields: [field],
                    placeholderId: placeholder.id,
                },
            });
        },
        [dispatch],
    );

    const removeField = React.useCallback(
        ({field, placeholder}: {field: Field; placeholder: Placeholder}) => {
            dispatch({
                type: 'remove-field',
                data: {
                    field,
                    placeholderId: placeholder.id,
                },
            });
        },
        [dispatch],
    );

    const onSelectUpdate = React.useCallback(
        (value: string[]) => {
            addField({
                placeholder,
                field: availableFields.find((field) => field.name === value[0])!,
            });
        },
        [addField],
    );

    return (
        <div className={b()}>
            <div className={b('header')}>
                <div className={b('name')}>{id}</div>
                <Select
                    value={[]}
                    filterable={true}
                    options={availableFields.map((field) => ({
                        content: field.name,
                        value: field.name,
                        data: field,
                    }))}
                    onUpdate={onSelectUpdate}
                    renderControl={({onClick, ref}) => {
                        return (
                            <Button onClick={onClick} ref={ref}>
                                <Icon data={PlusIcon} size={16} />
                            </Button>
                        );
                    }}
                />
            </div>

            {fields.map((field) => {
                return (
                    <div key={field.name} className={b('field')}>
                        <div className={b('field-spacer')}></div>
                        <div className={b('field-title')} title={field.name}>
                            {field.name}
                        </div>
                        <div className={b('field-actions')}>
                            <Button onClick={removeField.bind(null, {field, placeholder})}>
                                <Icon data={XmarkIcon} size={16} />
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
