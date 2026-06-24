import React from 'react';
import cn from 'bem-cn-lite';
import {TextInput} from '@gravity-ui/uikit';
import {Yson} from '../../../../../components/Yson/Yson';
import i18n from './i18n';
import './SeparatorInput.scss';

const block = cn('separator-input');

export interface Props {
    className?: string;

    value?: string;
    disabled?: boolean;
    placeholder?: string;
    onChange: (v: Props['value']) => void;
}

export default function SeparatorInput(props: Props) {
    const {value, onChange, disabled, placeholder, className} = props;

    const {value: separator, error} = prepareSeparatorValue(value);

    return (
        <>
            <div className={block(null, className)}>
                <div className={block('item')}>
                    <TextInput
                        value={value}
                        placeholder={placeholder}
                        onUpdate={onChange}
                        disabled={disabled}
                    />
                </div>
                <div className={block('item', {preview: true})}>
                    <Yson
                        value={separator}
                        settings={{escapeWhitespace: true, decodeUTF8: false}}
                    />
                </div>
            </div>
            {error && <div className={block('error', 'elements-form__label')}>{error}</div>}
        </>
    );
}

export function prepareSeparatorValue(v?: string) {
    let res = v || '';
    try {
        res = JSON.parse(`"${v}"`);
    } catch (e) {}

    let error;
    // getting size in bytes `new Blob(['ы']).size !== 'ы'.length`
    const {size} = new Blob([res]);
    if (size !== 1) {
        error = i18n('alert_expected-length-1', {size});
    }
    return {value: res, error};
}
