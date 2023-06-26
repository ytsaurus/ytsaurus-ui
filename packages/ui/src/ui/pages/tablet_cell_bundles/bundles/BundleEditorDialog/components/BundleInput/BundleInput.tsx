import React, {useEffect, useState} from 'react';
import cn from 'bem-cn-lite';

import {Progress, TextInput} from '@gravity-ui/uikit';

import {DialogControlProps} from '../../../../../../components/Dialog/Dialog.types';
import {formatValue, parseValue} from '../../../../../../components/NumberInput/NumberInput';
import {Tooltip} from '../../../../../../components/Tooltip/Tooltip';

import {calcProgressProps} from '../../../../../../utils/utils';
import {ThemeThreshold} from '../../../../../../utils/progress';

import './BundleInput.scss';

const block = cn('bundle-input');

function toRawValue(value?: string | number) {
    return value === undefined ? '' : String(value);
}

function errorFromValue(value: BundleInputProps['value']) {
    if (Number.isNaN(value)) {
        return 'wrong format';
    }
    return undefined;
}

type BundleInputProps = DialogControlProps<
    number | undefined,
    {
        postfix?: string;
        hint?: string;
        className?: string;
        readonly?: boolean;
        hasClear?: boolean;
        tooltip?: React.ReactNode;
        withoutDetailedBar?: boolean;
        format?: 'Bytes' | 'Number';
        disabled?: boolean;
        decimalPlaces?: number;
        preciseInitialRawValue?: boolean;
        progress?: {
            usage?: number;
            limit?: number;
            themeThresholds?: ThemeThreshold[];
        };
        error?: string;
    }
>;

export function BundleInput(props: BundleInputProps) {
    const {
        value,
        onChange,
        postfix,
        hint,
        readonly,
        format,
        progress,
        withoutDetailedBar = false,
        hasClear = false,
        decimalPlaces,
        preciseInitialRawValue,
        error,
        disabled,
    } = props;
    const [parsedValue, setParsedValue] = useState<number | undefined>();
    const [parsedError, setParsedError] = useState<string | undefined>();
    const [rawValue, setRawValue] = useState<string | undefined>();
    const [formattedValue, setFormattedValue] = useState<string | undefined>();
    const [focused, setFocused] = useState<boolean>(false);

    useEffect(() => {
        if (parsedError !== error) {
            setParsedError(error);
        }
    }, [error]);

    useEffect(() => {
        if (parsedValue === value) {
            return;
        }

        const formatted = formatValue(value, format, {
            digits: decimalPlaces,
        });
        setParsedValue(value);
        setFormattedValue(formatted);

        if (rawValue === undefined) {
            setRawValue(preciseInitialRawValue ? toRawValue(value) : formatted);
        }
    }, [value]);

    const handleChange = (rawValue: string) => {
        const value = parseValue(rawValue, format);
        const error = errorFromValue(value);
        setParsedValue(value);
        setRawValue(rawValue);
        setFormattedValue(formatValue(value, format, {digits: decimalPlaces}));
        setParsedError(error);

        if (error) {
            return;
        }

        onChange(value);
    };

    const text = focused ? rawValue : formattedValue;
    const calcProgress =
        progress && calcProgressProps(progress?.usage || 0, Number(value) || 0, format);
    return (
        <div className={block(null)}>
            <div className={block('row')}>
                <div className={block('right')}>
                    <div className={block('control-block')}>
                        {readonly ? (
                            <span className={block('text')}>{value}</span>
                        ) : (
                            <TextInput
                                className={block('input')}
                                autoComplete={false}
                                value={text}
                                onUpdate={handleChange}
                                hasClear={hasClear}
                                error={Boolean(parsedError)}
                                onFocus={() => setFocused(true)}
                                onBlur={() => setFocused(false)}
                                disabled={disabled}
                            />
                        )}
                        {!withoutDetailedBar && (
                            <BundleInputDetailedBar data={postfix || formattedValue} />
                        )}
                    </div>
                </div>
            </div>
            {calcProgress && (
                <div className={block('row')}>
                    <Tooltip content="Usage">
                        <div className={block('left')}>
                            <Progress className={block('progress')} {...calcProgress} />
                        </div>
                    </Tooltip>
                </div>
            )}
            {!parsedError && hint && (
                <div className={block('row')}>
                    <span className={block('hint', block('right'))}>{hint}</span>
                </div>
            )}
            {parsedError && (
                <div className={block('row')}>
                    <span className={block('error', block('right'))}>{parsedError}</span>
                </div>
            )}
        </div>
    );
}

function BundleInputDetailedBar({data}: {data?: string}) {
    return !data ? null : <span className={block('meta')}>{data}</span>;
}

BundleInput.isEmpty = (value: string) => {
    return !value;
};

BundleInput.getDefaultValue = () => {
    return '';
};

BundleInput.hasErrorRenderer = true;
