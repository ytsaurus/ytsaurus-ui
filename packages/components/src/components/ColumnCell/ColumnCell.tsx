import React, {useState} from 'react';
import cn from 'bem-cn-lite';

import {Button, Flex, Icon as UIKitIcon} from '@gravity-ui/uikit';
import {Eye} from '@gravity-ui/icons';

import unipika from '../../utils/unipika';
import {ClipboardButton} from '../ClipboardButton';
import {YqlValue} from '../YqlValue';
import {Yson} from '../../internal/Yson';
import {Label} from '../Label';
import {type TypeArray} from '../SchemaDataType/dataTypes';
import {Tooltip} from '../Tooltip';
import {UnipikaSettings} from '../../internal/Yson/StructuredYson/StructuredYsonTypes';
import {type LogErrorFn, useUnipikaSettings, useYtComponentsConfig} from '../../context';

import i18n from './i18n';

import './ColumnCell.scss';

const block = cn('yt-column-cell');

function unquote(v: string) {
    const match = /^"(.*)"$/.exec(v);
    return match ? match[1] : v;
}

type CellValueType =
    | null
    | (CellValueData & {
          $incomplete?: boolean;
          [k: number]: {inc?: boolean};
      });

type CellValueData = {$type: string; $value: string} | {$type?: undefined; $value: unknown};

type ColumnCellProps = {
    className?: string;

    value?: CellValueType | null;
    yqlTypes: Array<TypeArray> | null;
    ysonSettings?: UnipikaSettings;
    allowRawStrings?: boolean | null;
    rowIndex: number;
    columnName: string;
    onShowPreview: (columnName: string, rowIndex: number, tag?: string) => void | Promise<void>;
    useYqlTypes?: boolean;
};

export function ColumnCell({
    value = null,
    yqlTypes,
    ysonSettings,
    allowRawStrings,
    className,
    rowIndex,
    columnName,
    onShowPreview,
    useYqlTypes,
}: ColumnCellProps) {
    const {logError} = useYtComponentsConfig();
    const contextUnipika = useUnipikaSettings();
    const effectiveYsonSettings = ysonSettings || contextUnipika;
    const [hovered, setHovered] = useState(false);
    const handleMouseEnter = () => setHovered(true);
    const handleMouseLeave = () => setHovered(false);

    const formatType = yqlTypes && value ? yqlTypes[Number(value[1])] : undefined;

    const escapedValue =
        formatType && value
            ? YqlValue.getFormattedValue(value[0], formatType, {
                  ...effectiveYsonSettings,
                  asHTML: false,
              })
            : unipika.prettyprint(value, {...effectiveYsonSettings, asHTML: false});
    const formattedValue =
        formatType && value ? (
            <YqlValue value={value[0]} type={formatType} settings={ysonSettings} />
        ) : (
            <Yson value={value} settings={ysonSettings} />
        );

    const {tag, isIncompleteTagged, isIncompleteValue} = React.useMemo(() => {
        let isIncompleteTagged = false;
        let isIncompleteValue = false;
        let tag: string | undefined;

        if (value && formatType) {
            const flags: {incomplete: boolean} = {incomplete: false};

            const {$tag} = unipika.converters.yql(
                [value[0], formatType],
                effectiveYsonSettings,
                flags,
            );

            isIncompleteValue = flags.incomplete;
            isIncompleteTagged = flags.incomplete && $tag;
            tag = $tag;
        } else if (value) {
            isIncompleteValue = Boolean(value.$incomplete);
        }

        return {tag, isIncompleteTagged, isIncompleteValue};
    }, [value, formatType, effectiveYsonSettings]);

    const valueType = useYqlTypes ? formatType : value?.$type;
    const rawValue = useYqlTypes ? value?.[0] : value?.$value;

    const allowRawCopy = typeof rawValue === 'string' && isStringType(valueType, logError);
    const useRawString = allowRawCopy && allowRawStrings;
    let shiftCopyValue;
    if (allowRawCopy) {
        shiftCopyValue = useRawString ? unquote(escapedValue) : rawValue;
    }
    let copyTooltip = i18n('hold-shift-raw');
    if (useRawString) {
        copyTooltip = i18n('hold-shift-escaped');
    }

    const visibleValue = !useRawString ? (
        formattedValue
    ) : (
        <div className={'unipika-wrapper'}>
            <pre className={'unipika'}>
                <span className={'string'}>{rawValue}</span>
            </pre>
        </div>
    );

    const [isPreviewInProgress, setPreviewInProgress] = React.useState(false);

    return (
        <div
            className={block(null, className) /*dataTableBlock('value')*/}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {isIncompleteTagged ? (
                <Label theme="warning" text={i18n('incomplete-type', {tag})} />
            ) : (
                visibleValue
            )}
            {(hovered || isIncompleteTagged) && (
                <div className={block('control-button-wrapper')}>
                    <Flex alignItems="center">
                        {value && !isIncompleteValue && (
                            <Tooltip
                                content={
                                    !allowRawCopy ? undefined : (
                                        <span className={block('copy-value-tooltip')}>
                                            {copyTooltip}
                                        </span>
                                    )
                                }
                            >
                                <ClipboardButton
                                    view="flat-secondary"
                                    size="m"
                                    text={useRawString ? rawValue : unquote(escapedValue)}
                                    shiftText={shiftCopyValue}
                                />
                            </Tooltip>
                        )}
                        {isIncompleteValue && (
                            <Button
                                view="flat-secondary"
                                size="m"
                                qa="truncated-preview-button"
                                onClick={async () => {
                                    setPreviewInProgress(true);
                                    try {
                                        if (!isPreviewInProgress) {
                                            await onShowPreview(columnName, rowIndex, tag);
                                        }
                                    } finally {
                                        setPreviewInProgress(false);
                                    }
                                }}
                                loading={isPreviewInProgress}
                            >
                                <UIKitIcon data={Eye} size="12" />
                            </Button>
                        )}
                    </Flex>
                </div>
            )}
        </div>
    );
}

function isStringType(type?: string | TypeArray, logError?: LogErrorFn) {
    if (!type) {
        return false;
    }
    if (typeof type === 'string') {
        return type === 'string';
    }

    try {
        if (type[0] !== 'DataType') {
            return false;
        }
        const lower = type[1].toLowerCase();
        return lower === 'string' || lower === 'json' || lower === 'utf8';
    } catch (error: any) {
        logError?.({message: `ColumnCell: unexpected type: '${JSON.stringify(type)}'`}, error);
        return false;
    }
}
