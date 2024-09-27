import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import unipika from '../../../../../common/thor/unipika';

import ClipboardButton from '../../../../../components/ClipboardButton/ClipboardButton';
import YqlValue from '../../../../../components/YqlValue/YqlValue';
import DataTable from '@gravity-ui/react-data-table';
import {Button, Flex, Loader, Icon as UIKitIcon} from '@gravity-ui/uikit';
import copyToClipboard from 'copy-to-clipboard';
import Yson from '../../../../../components/Yson/Yson';
import Label from '../../../../../components/Label/Label';
import {getSettingTableDisplayRawStrings} from '../../../../../store/selectors/settings';
import {getSchemaByName} from '../../../../../store/selectors/navigation/tabs/schema';

import './DataTableWrapper.scss';
import {Tooltip} from '../../../../../components/Tooltip/Tooltip';
import {Eye} from '@gravity-ui/icons';
import {showCellPreviewModal} from '../../../../../store/actions/navigation/modals/cell-preview';
import {prepareColumns} from '../../../../../utils/navigation/prepareColumns';

const dataTableBlock = cn('data-table');
const block = cn('data-table-wrapper');

function unquote(string) {
    const match = /^"(.*)"$/.exec(string);
    return match ? match[1] : string;
}

function isValueEmptyOrTruncated(value) {
    return !value || isValueTruncated(value);
}

function isValueTruncated(value) {
    return value?.$incomplete || getArrayValue(value)?.inc;
}

function getArrayValue(value) {
    const candidate = value?.[0];

    return Array.isArray(candidate) ? candidate[0] : candidate;
}

ColumnCell.propTypes = {
    ysonSettings: Yson.settingsProps.isRequired,
    yqlTypes: PropTypes.array,
    value: PropTypes.any,
    allowRawStrings: PropTypes.bool,
};

export function ColumnCell({
    value = null,
    yqlTypes,
    ysonSettings,
    allowRawStrings,
    rowIndex,
    columnName,
}) {
    const dispatch = useDispatch();
    const [hovered, setHovered] = useState(false);
    const handleMouseEnter = () => setHovered(true);
    const handleMouseLeave = () => setHovered(false);

    const escapedValue =
        yqlTypes && value
            ? YqlValue.getFormattedValue(value[0], yqlTypes[Number(value[1])], {
                  ...ysonSettings,
                  asHTML: false,
              })
            : unipika.prettyprint(value, {...ysonSettings, asHTML: false});
    const formattedValue =
        yqlTypes && value ? (
            <YqlValue value={value[0]} type={yqlTypes[Number(value[1])]} settings={ysonSettings} />
        ) : (
            <Yson value={value} settings={ysonSettings} />
        );

    let isIncompleteTagged = false;
    if (yqlTypes && value) {
        const yqlType = yqlTypes[Number(value[1])];

        if (value[0]?.inc === true && yqlType[0] === 'TaggedType') {
            isIncompleteTagged = true;
        }
    }

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
                <span className={'string'}>{value.$value}</span>
            </pre>
        </div>
    );

    return (
        <div
            className={dataTableBlock('value')}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {isIncompleteTagged ? (
                <Label
                    theme="warning"
                    text={`Incomplete '${yqlTypes[Number(value[1])][1]}' type`}
                />
            ) : (
                visibleValue
            )}
            {hovered && (
                <div className={dataTableBlock('control-button-wrapper')}>
                    <Flex alignItems="center">
                        {!isValueEmptyOrTruncated(value) && (
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
                                    onCopy={() => {
                                        if (window.event?.shiftKey && allowRawCopy) {
                                            copyToClipboard(
                                                useRawString ? unquote(escapedValue) : value.$value,
                                            );
                                        }
                                    }}
                                />
                            </Tooltip>
                        )}
                        {isValueTruncated(value) && (
                            <Button
                                view="flat-secondary"
                                size="m"
                                qa="truncated-preview-button"
                                onClick={() => dispatch(showCellPreviewModal(columnName, rowIndex))}
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

const rowKey = (row, index) => index;

DataTableWrapper.propTypes = {
    isFullScreen: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    loaded: PropTypes.bool.isRequired,
    columns: PropTypes.array.isRequired,
    keyColumns: PropTypes.arrayOf(PropTypes.string),
    ysonSettings: PropTypes.object,
    yqlTypes: PropTypes.array,
};

export default function DataTableWrapper(props) {
    const useRawStrings = useSelector(getSettingTableDisplayRawStrings);
    const schemaByName = useSelector(getSchemaByName);

    const {columns, keyColumns, ysonSettings, yqlTypes, loading, loaded, isFullScreen, ...rest} =
        props;
    const dtColumns = prepareColumns({
        columns,
        keyColumns,
        yqlTypes,
        ysonSettings,
        useRawStrings,
        schemaByName,
    });
    const initialLoading = loading && !loaded;
    const updating = loading && loaded;

    React.useEffect(() => {
        if (!loading && loaded && rest.data.length > 0) {
            setTimeout(
                () =>
                    requestAnimationFrame(() => {
                        window.dispatchEvent(new Event('resize'));
                    }),
                300,
            );
        }
    }, [loading, loaded, rest.data.length]);

    return (
        <div
            className={block({
                fullscreen: isFullScreen,
                loading: initialLoading,
                updating,
            })}
        >
            {updating && (
                <div className={block('updating-loader')}>
                    <Loader />
                </div>
            )}
            {initialLoading ? (
                <Loader />
            ) : (
                <DataTable theme="yt-internal" columns={dtColumns} rowKey={rowKey} {...rest} />
            )}
        </div>
    );
}
