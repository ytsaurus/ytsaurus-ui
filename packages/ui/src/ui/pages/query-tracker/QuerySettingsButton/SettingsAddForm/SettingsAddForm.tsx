import {Button, Icon} from '@gravity-ui/uikit';
import React, {FC, useCallback, useState} from 'react';
import plusIcon from '@gravity-ui/icons/svgs/plus.svg';
import {
    SaveFormData,
    Props as SettingsItemEditFormProps,
    SettingsItemForm,
} from '../SettingsItemForm';
import './SettingsAddForm.scss';
import cn from 'bem-cn-lite';
import i18n from './i18n';

type Props = {
    onAdd: (data: SaveFormData) => void;
    validator: SettingsItemEditFormProps['validator'];
};

const block = cn('settings-add-form');

export const SettingsAddForm: FC<Props> = ({validator, onAdd}) => {
    const [open, setOpen] = useState(false);

    const handleToggleForm = useCallback(() => {
        setOpen((prevState) => !prevState);
    }, []);

    const handleAddSetting = useCallback(
        (data: SaveFormData) => {
            onAdd(data);
            setOpen(false);
        },
        [onAdd],
    );

    return (
        <div className={block()}>
            {open && (
                <SettingsItemForm
                    name=""
                    value=""
                    onCancel={handleToggleForm}
                    onSave={handleAddSetting}
                    validator={validator}
                    className={block('add-form')}
                />
            )}
            <Button className={block('button')} onClick={handleToggleForm} disabled={open} size="l">
                <Icon data={plusIcon} size={16} />
                {i18n('action_add-setting')}
            </Button>
        </div>
    );
};
