import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import unipika from '../../../../../common/thor/unipika';
import _ from 'lodash';

import ClipboardButton from '../../../../../components/ClipboardButton/ClipboardButton';
import YqlValue from '../../../../../components/YqlValue/YqlValue';
import DataTable from '@gravity-ui/react-data-table';
import {Loader} from '@gravity-ui/uikit';
import copyToClipboard from 'copy-to-clipboard';
import Icon from '../../../../../components/Icon/Icon';
import Yson from '../../../../../components/Yson/Yson';
import Label from '../../../../../components/Label/Label';
import SchemaDataType from '../../../../../components/SchemaDataType/SchemaDataType';
import {getSettingTableDisplayRawStrings} from '../../../../../store/selectors/settings';
import {getSchemaByName} from '../../../../../store/selectors/navigation/tabs/schema';

import './DataTableWrapper.scss';
import {Tooltip} from '../../../../../components/Tooltip/Tooltip';

const dataTableBlock = cn('data-table');
const block = cn('data-table-wrapper');

function unquote(string) {
    const match = /^"(.*)"$/.exec(string);
    return match ? match[1] : string;
}

function isValueEmptyOrTruncated(value) {
    return !value || value?.$incomplete;
}

ColumnCell.propTypes = {
    ysonSettings: Yson.settingsProps.isRequired,
    yqlTypes: PropTypes.array,
    value: PropTypes.any,
    allowRawStrings: PropTypes.bool,
};

function ColumnCell({value = null, yqlTypes, ysonSettings, allowRawStrings}) {
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
            {hovered && !isValueEmptyOrTruncated(value) && (
                <div className={dataTableBlock('clipboard-button-wrapper')}>
                    <Tooltip
                        content={
                            !allowRawCopy ? undefined : (
                                <span className={block('copy-value-tooltip')}>{copyTooltip}</span>
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
                </div>
            )}
        </div>
    );
}

function prepareColumns({
    columns,
    keyColumns,
    yqlTypes,
    ysonSettings,
    useRawStrings,
    schemaByName,
}) {
    return _.map(columns, (column) => {
        // eslint-disable-next-line react/prop-types
        const render = ({value}) => (
            <ColumnCell
                allowRawStrings={useRawStrings}
                value={value}
                yqlTypes={yqlTypes}
                ysonSettings={ysonSettings}
            />
        );
        const {sortOrder} = column;
        const isKeyColumn = keyColumns.indexOf(column.name) > -1;
        const {type_v3} = schemaByName[column.name] || {};
        const header = (
            <Tooltip content={Boolean(type_v3) && <SchemaDataType type_v3={type_v3} />}>
                <Yson value={unipika.unescapeKeyValue(column.name)} settings={ysonSettings} inline>
                    {isKeyColumn && (
                        <Icon
                            awesome={
                                sortOrder === 'descending'
                                    ? 'sort-amount-up'
                                    : 'sort-amount-down-alt'
                            }
                        />
                    )}
                </Yson>
            </Tooltip>
        );
        return Object.assign({}, column, {render, header});
    });
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
            requestAnimationFrame(() => {
                window.dispatchEvent(new Event('resize'));
            });
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
