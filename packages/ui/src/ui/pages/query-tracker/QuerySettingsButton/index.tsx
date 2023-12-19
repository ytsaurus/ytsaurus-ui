import {Button, Icon, List, Popup, Text, TextInput} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React, {KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import GearIcon from '@gravity-ui/icons/svgs/gear.svg';
import GearDotIcon from '@gravity-ui/icons/svgs/gear-dot.svg';
import closeIcon from '@gravity-ui/icons/svgs/xmark.svg';
import checkIcon from '@gravity-ui/icons/svgs/check.svg';
import pencilIcon from '@gravity-ui/icons/svgs/pencil.svg';
import trashIcon from '@gravity-ui/icons/svgs/trash-bin.svg';
import plusIcon from '@gravity-ui/icons/svgs/plus.svg';
import './index.scss';

type QuerySetting = {name: string; value: string};

type UpdateQuerySettingHandler = (setting: QuerySetting, id: string) => void | string;
type AddQuerySettingHandler = (setting: QuerySetting) => void | string;

type QuerySettingFormProps = {
    setting: QuerySetting;
    id?: string;
    error?: string;
    onChange: (setting: QuerySetting) => void | string;
    onClose: () => void;
};

const form = cn('query-setting-form');
const QuerySettingForm = (props: QuerySettingFormProps) => {
    const [name, setName] = useState(props.setting.name);
    const [value, setValue] = useState(props.setting.value);
    const [error, setError] = useState<string | undefined>(undefined);
    useEffect(() => {
        setName(props.setting.name);
        setValue(props.setting.value);
    }, [props.setting]);

    // Reset error on change name
    useEffect(() => {
        setError(undefined);
    }, [name]);

    const onSubmit = useCallback(() => {
        setError(
            props.onChange({
                name,
                value,
            }) || undefined,
        );
    }, [name, value, setError, props.onChange]);

    const onReset = useCallback(() => {
        setName(props.setting.name);
        setValue(props.setting.value);
        props.onClose();
    }, [name, value]);

    const handleHotkeys = useCallback(
        (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Enter': {
                    if (name && value) {
                        onSubmit();
                    }
                    break;
                }
                case 'Escape': {
                    onReset();
                }
            }
        },
        [onSubmit, onReset],
    );

    return (
        <div className={form()}>
            <TextInput
                placeholder="Name"
                className={form('item')}
                autoFocus
                error={error}
                value={name}
                onUpdate={setName}
                onKeyDown={handleHotkeys}
            />
            <TextInput
                className={form('item')}
                placeholder="Value"
                value={value}
                onUpdate={setValue}
                onKeyDown={handleHotkeys}
            />
            <Button
                className={form('item')}
                onClick={onSubmit}
                disabled={!name || !value || Boolean(error)}
            >
                <Icon data={checkIcon} />
            </Button>
            <Button className={form('item')} onClick={onReset}>
                <Icon data={closeIcon} />
            </Button>
        </div>
    );
};

type QuerySettingViewProps = {
    setting: QuerySetting;
    onEdit: () => void;
    onDelete: () => void;
};
const settingBlock = cn('query-setting-view');
const QuerySettingView = (props: QuerySettingViewProps) => {
    return (
        <div className={settingBlock()}>
            <div className={settingBlock('value')}>
                <Text title={props.setting.name} variant="subheader-2">
                    {props.setting.name}:
                </Text>
                &nbsp; &nbsp;
                <Text title={props.setting.value} ellipsis>
                    {props.setting.value}
                </Text>
            </div>
            <Button className={settingBlock('control')} view="flat" onClick={props.onEdit}>
                <Icon data={pencilIcon} />
            </Button>
            <Button className={settingBlock('control')} view="flat" onClick={props.onDelete}>
                <Icon data={trashIcon} />
            </Button>
        </div>
    );
};

function useSettingsList(
    settings: Record<string, string>,
    onChange: (settings: Record<string, string>) => void,
): [
    QuerySetting[],
    AddQuerySettingHandler,
    UpdateQuerySettingHandler,
    (settingName: string) => void,
] {
    const [settingsMap, setSettingsMap] = useState<Map<string, QuerySetting>>(new Map());

    useEffect(() => {
        setSettingsMap(
            new Map(
                settings
                    ? Object.entries(settings).map(([name, value]) => {
                          return [
                              name,
                              {
                                  name,
                                  value,
                              },
                          ];
                      })
                    : [],
            ),
        );
    }, [settings]);

    const map = useMemo(() => {
        return Array.from(settingsMap.values());
    }, [settingsMap]);

    const onSettingChange = useCallback(
        (settingsMap: Map<string, QuerySetting>) => {
            onChange(
                Array.from(settingsMap).reduce((acc, [_, item]) => {
                    acc[item.name] = item.value;
                    return acc;
                }, {} as Record<string, string>),
            );
        },
        [onChange],
    );

    const addSetting = useCallback(
        (setting: QuerySetting): void | string => {
            if (!setting.name) {
                return 'Name is required field';
            }
            if (!setting.value) {
                return 'Values is required field';
            }
            if (settingsMap.has(setting.name)) {
                return 'This name is already in use, please type some another';
            }
            onSettingChange(new Map(settingsMap.set(setting.name, {...setting})));
        },
        [settingsMap, onSettingChange],
    );

    const updateSetting = useCallback(
        (nextSetting: QuerySetting, id: string): string | void => {
            const nextMap = new Map(settingsMap);
            nextMap.delete(id);
            nextMap.set(nextSetting.name, {...nextSetting});
            onSettingChange(nextMap);
        },
        [settingsMap, onSettingChange],
    );

    const deleteSetting = useCallback(
        (name: QuerySetting['name']) => {
            settingsMap.delete(name);
            onSettingChange(new Map(settingsMap));
        },
        [settingsMap, onSettingChange],
    );

    return [map, addSetting, updateSetting, deleteSetting];
}

const b = cn('query-settings-popup');

const SettingItem = ({
    setting,
    onDelete,
    onUpdate,
}: {
    setting: QuerySetting;
    onUpdate: UpdateQuerySettingHandler;
    onDelete: (name: string) => void;
}) => {
    const [edit, setEdit] = useState(false);

    const toggleEdit = useCallback(() => {
        setEdit(!edit);
    }, [setEdit, edit]);

    const onChange = useCallback(
        (nextSetting: QuerySetting): void | string => {
            const error = onUpdate(nextSetting, setting.name);
            if (!error) {
                setEdit(false);
            }
            return error;
        },
        [setting, onUpdate, setEdit],
    );

    return (
        <div className={b('list-item')}>
            {edit ? (
                <QuerySettingForm
                    id={setting.name}
                    setting={setting}
                    onChange={onChange}
                    onClose={toggleEdit}
                />
            ) : (
                <QuerySettingView
                    setting={setting}
                    onEdit={toggleEdit}
                    onDelete={() => onDelete(setting.name)}
                />
            )}
        </div>
    );
};

export const QuerySettingsButton = ({
    settings,
    className,
    onChange,
}: {
    className?: string;
    onChange: (settings: Record<string, string>) => void;
    settings?: Record<string, string>;
}) => {
    const [settingsList, onAdd, onUpdate, onDelete] = useSettingsList(settings || {}, onChange);

    const [opened, setOpened] = useState<boolean>(false);
    const [newSetting, setNewSetting] = useState<QuerySetting | undefined>(undefined);

    const ref = useRef(null);

    const toggleOpened = useCallback(() => {
        setOpened(!opened);
    }, [setOpened, opened]);

    const addNew = useCallback(() => {
        setNewSetting({name: '', value: ''});
    }, [setNewSetting]);

    const resetNew = useCallback(() => {
        setNewSetting(undefined);
    }, [setNewSetting]);

    const addNewSetting = useCallback(
        (setting: QuerySetting) => {
            const error = onAdd(setting);
            if (!error) {
                setNewSetting(undefined);
            }
            return error;
        },
        [onAdd, setNewSetting],
    );

    return (
        <>
            <Button className={className} onClick={toggleOpened} ref={ref} view="outlined" size="l">
                <Icon data={settingsList.length ? GearDotIcon : GearIcon} size={16} />
            </Button>
            <Popup anchorRef={ref} open={opened} className={b()} onOutsideClick={toggleOpened}>
                <div className={b('header')}>
                    <Text variant="subheader-3">
                        Settings{' '}
                        {settingsList.length ? (
                            <Text variant="subheader-3" color="secondary">
                                {settingsList.length}
                            </Text>
                        ) : null}
                    </Text>
                </div>
                <List
                    className={b('list')}
                    filterable={false}
                    sortable={false}
                    items={settingsList || []}
                    virtualized={false}
                    renderItem={(setting) => {
                        return (
                            <SettingItem
                                setting={setting}
                                onDelete={onDelete}
                                onUpdate={onUpdate}
                            ></SettingItem>
                        );
                    }}
                />
                <div className={b('footer')}>
                    {newSetting ? (
                        <QuerySettingForm
                            setting={newSetting}
                            onChange={addNewSetting}
                            onClose={resetNew}
                        />
                    ) : (
                        <Button onClick={addNew}>
                            <Icon data={plusIcon} />
                            Add setting
                        </Button>
                    )}
                </div>
            </Popup>
        </>
    );
};
