import React, {FC, useState} from 'react';
import cn from 'bem-cn-lite';
import './SettingsItem.scss';
import {Button, Icon, Text, Tooltip} from '@gravity-ui/uikit';
import PencilIcon from '@gravity-ui/icons/svgs/pencil.svg';
import TrashBinIcon from '@gravity-ui/icons/svgs/trash-bin.svg';
import GearIcon from '@gravity-ui/icons/svgs/gear.svg';
import {
    SaveFormData,
    Props as SettingsItemEditFormProps,
    SettingsItemForm,
} from './SettingsItemForm';

const block = cn('settings-item');

type Props = {
    name: string;
    value: string;
    onDelete: (name: string) => void;
    onChange: (data: SaveFormData) => void;
    validator: SettingsItemEditFormProps['validator'];
    canEdit?: SettingsItemEditFormProps['config'];
};

export const SettingsItem: FC<Props> = ({name, value, canEdit, onDelete, validator, onChange}) => {
    const [edit, setEdit] = useState(false);
    const handleDelete = () => {
        onDelete(name);
    };

    const handleToggleEdit = () => {
        setEdit((prevState) => !prevState);
    };

    const handleChange = (data: SaveFormData) => {
        onChange(data);
        setEdit(false);
    };

    if (edit) {
        return (
            <div className={block({edit: true})}>
                <SettingsItemForm
                    name={name}
                    value={value}
                    onSave={handleChange}
                    onCancel={handleToggleEdit}
                    validator={validator}
                    config={canEdit}
                />
            </div>
        );
    }

    return (
        <div className={block()}>
            <div className={block('info')}>
                <Icon className={block('icon')} data={GearIcon} size={16} />
                <Text variant="subheader-2" ellipsis>
                    {name}
                </Text>
                <Text className={block('value')} ellipsis>
                    {value}
                </Text>
            </div>

            <div className={block('actions')}>
                {canEdit && (
                    <Tooltip content="Edit" placement="top">
                        <Button onClick={handleToggleEdit} view="flat" size="l">
                            <Icon data={PencilIcon} size={16} />
                        </Button>
                    </Tooltip>
                )}

                <Tooltip content="Remove" placement="top">
                    <Button onClick={handleDelete} view="flat" size="l">
                        <Icon data={TrashBinIcon} size={16} />
                    </Button>
                </Tooltip>
            </div>
        </div>
    );
};
