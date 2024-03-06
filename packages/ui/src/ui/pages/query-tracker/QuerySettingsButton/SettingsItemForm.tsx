import React, {ChangeEvent, FC, KeyboardEvent, useCallback, useRef, useState} from 'react';
import cn from 'bem-cn-lite';
import {Button, Icon, TextInput} from '@gravity-ui/uikit';
import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';
import CheckIcon from '@gravity-ui/icons/svgs/check.svg';
import './SettingsItemForm.scss';

const block = cn('settings-item-form');

export type ValidatorError = {name?: string; value?: string};
export type SaveFormData = {oldName: string; name: string; value: string};
export type EditConfig = {name: boolean; value: boolean};

export type Props = {
    name: string;
    value: string;
    onCancel: () => void;
    onSave: (data: SaveFormData) => void;
    validator: (oldName: string, name: string, value: string) => ValidatorError;
    className?: string;
    config?: EditConfig;
};

export const SettingsItemForm: FC<Props> = ({
    name,
    value,
    validator,
    onCancel,
    onSave,
    className,
    config,
}) => {
    const [errors, setErrors] = useState<ValidatorError | undefined>(undefined);
    const setting = useRef({name, value});

    const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
        setErrors(undefined);
        setting.current.name = e.currentTarget.value;
    };

    const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
        setErrors(undefined);
        setting.current.value = e.currentTarget.value;
    };

    const handleSave = useCallback(() => {
        const validationResult = validator(name, setting.current.name, setting.current.value);
        setErrors(validationResult);
        if (!validationResult.name && !validationResult.value) {
            onSave({oldName: name, name: setting.current.name, value: setting.current.value});
        }
    }, [name, onSave, validator]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                handleSave();
            }
            if (e.key === 'Escape') {
                onCancel();
            }
        },
        [handleSave, onCancel],
    );

    return (
        <div className={block(null, className)}>
            <div className={block('form')}>
                <TextInput
                    defaultValue={name}
                    onChange={handleChangeName}
                    onKeyDown={handleKeyDown}
                    error={errors?.name}
                    size="l"
                    disabled={config ? !config.name : false}
                />
                <TextInput
                    defaultValue={value}
                    onChange={handleChangeValue}
                    onKeyDown={handleKeyDown}
                    error={errors?.value}
                    size="l"
                    disabled={config ? !config.value : false}
                />
            </div>
            <div className={block('actions')}>
                <Button view="normal" onClick={handleSave} size="l">
                    <Icon data={CheckIcon} size={16} />
                </Button>
                <Button view="flat" onClick={onCancel} size="l">
                    <Icon data={XmarkIcon} size={16} />
                </Button>
            </div>
        </div>
    );
};
