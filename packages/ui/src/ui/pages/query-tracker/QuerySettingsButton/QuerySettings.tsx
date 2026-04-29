import React, {type FC, useCallback} from 'react';
import {SettingsAddForm} from './SettingsAddForm';
import {SettingsItem} from './SettingsItem';
import {VALIDATOR_ERRORS_TEXT, formValidator} from './formValidator';
import {type SaveFormData, type Props as SettingsItemEditFormProps} from './SettingsItemForm';
import './QuerySettings.scss';
import cn from 'bem-cn-lite';
import {type DraftQuery} from '../../../types/query-tracker/api';

const SETTINGS_WITHOUT_EDIT_NODE = ['cluster', 'clique'];
const SETTING_WITHOUT_REMOVE = 'cluster';

const block = cn('yt-query-settings');

type Props = {
    settings?: DraftQuery['settings'];
    onChange: (settings: DraftQuery['settings']) => void;
};

export const QuerySettings: FC<Props> = ({settings, onChange}) => {
    const handleDelete = useCallback(
        (name: string) => {
            const newSettings = {...settings};
            if (name in newSettings) delete newSettings[name];
            onChange(newSettings);
        },
        [onChange, settings],
    );

    const handleAddSettings = useCallback(
        ({name, value}: SaveFormData) => {
            const newSettings = {...settings};
            newSettings[name] = value;
            onChange(newSettings);
        },
        [onChange, settings],
    );

    const handleChangeSettings = useCallback(
        ({oldName, name, value}: SaveFormData) => {
            const newSettings = {...settings};
            if (oldName !== name) {
                delete newSettings[oldName];
            }
            newSettings[name] = value;
            onChange(newSettings);
        },
        [onChange, settings],
    );

    const validator = useCallback<SettingsItemEditFormProps['validator']>(
        (oldName, name, value) => {
            const result = formValidator(name, value);
            if (settings && name in settings) {
                if (oldName === name) return result;
                result.name = VALIDATOR_ERRORS_TEXT.NAME_ALREADY_EXIST;
            }
            return result;
        },
        [settings],
    );

    return (
        <>
            <div className={block()}>
                {Object.entries(settings || {}).map(([name, value]) => (
                    <SettingsItem
                        key={name}
                        name={name}
                        value={value as string}
                        canEdit={
                            SETTINGS_WITHOUT_EDIT_NODE.includes(name)
                                ? undefined
                                : {name: true, value: true}
                        }
                        canRemove={name !== SETTING_WITHOUT_REMOVE}
                        validator={validator}
                        onDelete={handleDelete}
                        onChange={handleChangeSettings}
                    />
                ))}
            </div>
            <SettingsAddForm onAdd={handleAddSettings} validator={validator} />
        </>
    );
};
