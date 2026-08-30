import React from 'react';
import cn from 'bem-cn-lite';
import {TextInput} from '@gravity-ui/uikit';
import {Yson} from '../Yson/Yson';
import {prepareSeparatorValue} from './utils';
import './SeparatorInput.scss';

const block = cn('separator-input');

type Props = {
    className?: string;
    value?: string;
    disabled?: boolean;
    placeholder?: string;
    onChange: (value: string) => void;
};

export const SeparatorInput = (props: Props) => {
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
};
