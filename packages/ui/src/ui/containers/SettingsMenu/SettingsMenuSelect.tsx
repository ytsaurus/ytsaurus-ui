import React, {useEffect, useState} from 'react';
import block from 'bem-cn-lite';
import {SelectSingle} from '../../components/Select/Select';

import './SettingsMenu.scss';

const b = block('elements-page');

type SettingsMenuSelectOption =
    | {options: Array<{value: string; text: string}>}
    | {getOptionsOnMount: () => Promise<Array<{value: string; text: string}>>};
type SettingsMenuSelectProps = {
    placeholder?: string;
    label?: string;
    getSetting: () => string;
    setSetting: (value?: string) => void;
} & SettingsMenuSelectOption;

export const SettingsMenuSelect = (props: SettingsMenuSelectProps) => {
    const value = props.getSetting();
    const [items, setItems] = useState('options' in props ? props.options : []);

    useEffect(() => {
        if ('getOptionsOnMount' in props) {
            props?.getOptionsOnMount().then((options) => {
                setItems(options);
            });
        }
    }, []);

    return (
        <div className={b('settings-item', {select: true})} title={props.label}>
            <SelectSingle
                value={value}
                items={items}
                onChange={(value) => props.setSetting(value)}
                placeholder={props.placeholder}
            />
        </div>
    );
};
