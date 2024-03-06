import React, {FC, useCallback} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import LinkIcon from '@gravity-ui/icons/svgs/link.svg';
import {AddFileButton} from './AddFileButton';
import {
    SaveFormData,
    Props as SettingsItemEditFormProps,
    SettingsItemForm,
} from '../QuerySettingsButton/SettingsItemForm';
import './FilesAddForm.scss';
import cn from 'bem-cn-lite';
import {QueryFile} from '../module/api';

const block = cn('files-add-form');

type Props = {
    onAddFile: (file: QueryFile) => void;
    validator: SettingsItemEditFormProps['validator'];
    formVisible: boolean;
    toggleForm: () => void;
};

export const FilesAddForm: FC<Props> = ({onAddFile, validator, formVisible, toggleForm}) => {
    const handleAddFile = useCallback(
        ({name, value}: SaveFormData) => {
            onAddFile({name, content: value, type: 'url'});
        },
        [onAddFile],
    );

    return (
        <div className={block()}>
            {formVisible && (
                <SettingsItemForm
                    name=""
                    value=""
                    onCancel={toggleForm}
                    onSave={handleAddFile}
                    validator={validator}
                />
            )}
            <div className={block('buttons')}>
                <AddFileButton onLoad={onAddFile} />
                <Button width="auto" size="l" onClick={toggleForm} disabled={formVisible}>
                    <Icon data={LinkIcon} size={16} />
                    Add URL
                </Button>
            </div>
        </div>
    );
};
