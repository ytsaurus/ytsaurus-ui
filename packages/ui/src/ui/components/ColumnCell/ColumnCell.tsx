import React, {useState} from 'react';
import cn from 'bem-cn-lite';
import copyToClipboard from 'copy-to-clipboard';

import {Button, Flex, Icon as UIKitIcon} from '@gravity-ui/uikit';
import {Eye} from '@gravity-ui/icons';

import unipika from '../../common/thor/unipika';
import ClipboardButton from '../../components/ClipboardButton/ClipboardButton';
import YqlValue from '../../components/YqlValue/YqlValue';
import Yson from '../../components/Yson/Yson';
import Label from '../../components/Label/Label';
import {TypeArray} from '../../components/SchemaDataType/dataTypes';
import {Tooltip} from '../../components/Tooltip/Tooltip';
import {UnipikaSettings} from '../../components/Yson/StructuredYson/StructuredYsonTypes';

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
    ysonSettings: UnipikaSettings;
    allowRawStrings?: boolean | null;
    rowIndex: number;
    columnName: string;
    onShowPreview: (columnName: string, rowIndex: number, tag?: string) => void;
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
}: ColumnCellProps) {
    const [hovered, setHovered] = useState(false);
    const handleMouseEnter = () => setHovered(true);
    const handleMouseLeave = () => setHovered(false);

    const formatType = yqlTypes && value ? yqlTypes[Number(value[1])] : undefined;

    const escapedValue =
        formatType && value
            ? YqlValue.getFormattedValue(value[0], formatType, {
                  ...ysonSettings,
                  asHTML: false,
              })
            : unipika.prettyprint(value, {...ysonSettings, asHTML: false});
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

            const {$tag} = unipika.converters.yql([value[0], formatType], ysonSettings, flags);

            isIncompleteValue = flags.incomplete;
            isIncompleteTagged = flags.incomplete && $tag;
            tag = $tag;
        }

        return {tag, isIncompleteTagged, isIncompleteValue};
    }, [value, formatType, ysonSettings]);

    const allowRawCopy = value?.$type === 'string';
    const useRawString = allowRawCopy && allowRawStrings;
    let copyTooltip = 'Hold SHIFT-key to copy raw value';
    if (useRawString) {
        copyTooltip = 'Hold SHIFT-key to copy escaped value';
    }

    const visibleValue = !useRawString ? (
        formattedValue
    ) : (
        <div className={'unipika-wrapper'}>
            <pre className={'unipika'}>
                <span className={'string'}>{value?.$value}</span>
            </pre>
        </div>
    );

    return (
        <div
            className={block(null, className) /*dataTableBlock('value')*/}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {isIncompleteTagged ? (
                <Label theme="warning" text={`Incomplete '${tag}' type`} />
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
                                    text={useRawString ? value.$value : unquote(escapedValue)}
                                    onCopy={(event: React.MouseEvent) => {
                                        if (event?.shiftKey && allowRawCopy) {
                                            copyToClipboard(
                                                useRawString ? unquote(escapedValue) : value.$value,
                                            );
                                        }
                                    }}
                                />
                            </Tooltip>
                        )}
                        {isIncompleteValue && (
                            <Button
                                view="flat-secondary"
                                size="m"
                                qa="truncated-preview-button"
                                onClick={() => onShowPreview(columnName, rowIndex, tag)}
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
