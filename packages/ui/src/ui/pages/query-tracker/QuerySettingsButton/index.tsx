import {Button, Icon, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import GearIcon from '@gravity-ui/icons/svgs/gear.svg';
import GearDotIcon from '@gravity-ui/icons/svgs/gear-dot.svg';
import {SettingsItem} from './SettingsItem';
import {SaveFormData, Props as SettingsItemEditFormProps} from './SettingsItemForm';
import './index.scss';
import {SettingsAddForm} from './SettingsAddForm';
import {PopupWithCloseButton} from './PopupWithCloseButton';
import {VALIDATOR_ERRORS_TEXT, formValidator} from './formValidator';

const SETTINGS_WITHOUT_EDIT_NODE = ['cluster', 'clique'];
const SETTING_WITHOUT_REMOVE = 'cluster';

const block = cn('query-settings-popup');

export const QuerySettingsButton = ({
    settings,
    className,
    onChange,
}: {
    className?: string;
    onChange: (settings: Record<string, string>) => void;
    settings?: Record<string, string>;
}) => {
    const [opened, setOpened] = useState<boolean>(false);
    const ref = useRef(null);

    const toggleOpened = useCallback(() => {
        setOpened(!opened);
    }, [setOpened, opened]);

    const count = useMemo(() => {
        return settings ? Object.keys(settings).length : 0;
    }, [settings]);

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
            <Button
                className={className}
                onClick={toggleOpened}
                ref={ref}
                view={opened ? 'outlined-info' : 'outlined'}
                selected={opened}
                size="l"
            >
                <Icon data={count ? GearDotIcon : GearIcon} size={16} />
            </Button>
            <PopupWithCloseButton
                anchorRef={ref}
                open={opened}
                className={block()}
                onClose={toggleOpened}
            >
                <div className={block('header')}>
                    <Text variant="subheader-3">Settings </Text>
                    {count > 0 && (
                        <Text variant="subheader-3" color="secondary">
                            {count}
                        </Text>
                    )}
                </div>
                <div className={block('body')}>
                    {Object.entries(settings || {}).map(([name, value]) => (
                        <SettingsItem
                            key={name}
                            name={name}
                            value={value}
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
            </PopupWithCloseButton>
        </>
    );
};
