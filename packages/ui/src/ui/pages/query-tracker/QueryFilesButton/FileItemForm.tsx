import React, {ChangeEvent, FC, KeyboardEvent, useCallback, useRef, useState} from 'react';
import cn from 'bem-cn-lite';
import {Button, Icon, TextInput} from '@gravity-ui/uikit';
import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';
import CheckIcon from '@gravity-ui/icons/svgs/check.svg';
import './FileItemForm.scss';
import {QueryFile} from '../../../types/query-tracker/api';

const block = cn('file-item-form');

export type ValidatorError = {name?: string; content?: string};
export type FileValidator = (oldName: string, file: QueryFile) => ValidatorError;

export type Props = {
    file: QueryFile;
    onCancel: () => void;
    onSave: (data: QueryFile) => void;
    validator: FileValidator;
    className?: string;
};

export const FileItemForm: FC<Props> = ({file, validator, onCancel, onSave, className}) => {
    const [errors, setErrors] = useState<ValidatorError | undefined>(undefined);
    const tempFile = useRef({...file});
    const isLink = file.type === 'url';

    const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
        setErrors(undefined);
        tempFile.current.name = e.currentTarget.value;
    };

    const handleChangeContent = (e: ChangeEvent<HTMLInputElement>) => {
        setErrors(undefined);
        tempFile.current.content = e.currentTarget.value;
    };

    const handleSave = useCallback(() => {
        const validationResult = validator(file.name, tempFile.current);
        setErrors(validationResult);
        if (!validationResult.name && !validationResult.content) {
            onSave(tempFile.current);
        }
    }, [file.name, onSave, validator]);

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
            <div className={block(isLink ? 'link-form' : 'form')}>
                <TextInput
                    defaultValue={file.name}
                    onChange={handleChangeName}
                    onKeyDown={handleKeyDown}
                    error={errors?.name}
                    size="l"
                />
                {isLink && (
                    <TextInput
                        defaultValue={file.content}
                        onChange={handleChangeContent}
                        onKeyDown={handleKeyDown}
                        error={errors?.content}
                        size="l"
                    />
                )}
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
