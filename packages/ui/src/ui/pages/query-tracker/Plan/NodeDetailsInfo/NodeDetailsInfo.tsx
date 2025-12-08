import * as React from 'react';

import {Button, Text} from '@gravity-ui/uikit';
import {default as Collapse} from '../../../../components/CollapsibleSection/CollapsibleSection';
import {NodeDetails, Stream} from '../models/plan';
import cn from 'bem-cn-lite';

import '../NodeDetailsInfo.scss';
import i18n from './i18n';

const block = cn('node-details-info');

interface NodeDetailsInfoProps {
    Streams?: NodeDetails['Streams'];
    InputColumns?: NodeDetails['InputColumns'];
    InputKeyFilterColumns?: NodeDetails['InputKeyFilterColumns'];
}

export default function NodeDetailsInfo({
    Streams,
    InputColumns,
    InputKeyFilterColumns,
}: NodeDetailsInfoProps) {
    return (
        <div className={block()}>
            {Streams && (
                <Collapse name="Streams" size="ns" collapsed={false}>
                    <div className={block('streams')}>
                        {Object.keys(Streams).map((key) => (
                            <OperationStreamEntry key={key} name={key} data={Streams[key]} />
                        ))}
                    </div>
                </Collapse>
            )}
            <OperationInputColumns data={InputColumns} title="InputColumns" />
            <OperationInputColumns data={InputKeyFilterColumns} title="InputKeyFilterColumns" />
        </div>
    );
}

function OperationStreamEntry({name, data}: {name: string; data?: Stream[]}) {
    return (
        <div className={block('entry')}>
            <div className={block('entry-name')}>{name}</div>
            {Array.isArray(data) && (
                <div className={block('entry-items')}>
                    {data.map((item, index) => (
                        <OperationStreamItem key={index} {...item} />
                    ))}
                </div>
            )}
        </div>
    );
}

function OperationStreamItem({Name, Children}: Stream) {
    return (
        <div className={block('item')}>
            <Text className={block('item-name')} color="complementary">
                {Name}
            </Text>
            {Array.isArray(Children) && (
                <div className={block('item-children')}>
                    {Children.map((list, groupIndex) => (
                        <div key={groupIndex} className={block('item-group')}>
                            {list.map((item, index) => (
                                <OperationStreamItem key={index} {...item} />
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function areColumnsForMultipleTables(data?: string | string[] | string[][]): data is string[][] {
    return Array.isArray(data) && data.some((item: string | string[]) => Array.isArray(item));
}

function OperationInputColumns({
    data,
    title,
}: {
    data?: string | string[] | string[][];
    title: string;
}) {
    if (!data) {
        return null;
    }
    if (areColumnsForMultipleTables(data)) {
        return (
            <React.Fragment>
                {data.map((columnsData, index) => {
                    if (!columnsData) {
                        return null;
                    }
                    let columns: string[];
                    if (Array.isArray(columnsData)) {
                        columns = columnsData;
                    } else {
                        columns = [columnsData];
                    }
                    return (
                        <Collapse key={index} name={`${title} #${index + 1}`} size="ns">
                            <ExpandableList items={columns} limit={20} />
                        </Collapse>
                    );
                })}
            </React.Fragment>
        );
    }

    let columns: string[];
    if (Array.isArray(data)) {
        columns = data;
    } else {
        columns = [data];
    }

    return (
        <Collapse name={title} size="ns" collapsed={false}>
            <ExpandableList items={columns} limit={20} />
        </Collapse>
    );
}

function moreText(count: number) {
    return i18n('action_show-more-items', {count: String(count)});
}

interface ExpandableListProps<T> {
    items: T[];
    limit: number;
    className?: string;
}
function ExpandableList<T extends string>({items, limit, className}: ExpandableListProps<T>) {
    const [expanded, setExpanded] = React.useState(false);

    const length = limit && !expanded ? Math.min(items.length, limit) : items.length;
    const lengthExceed = items.length - length;
    const isEmpty = length === 0;
    const itemsToShow = lengthExceed > 0 ? items.slice(0, length) : items;

    return (
        <div className={block('columns', className)}>
            {itemsToShow.map((name, index) => {
                return (
                    <div key={index} className={block('columns-column')}>
                        <Text color="complementary" /* overflow="ellipsis" */>{name}</Text>
                    </div>
                );
            })}
            {Boolean(lengthExceed) && (
                <Button
                    className={block('columns-expand')}
                    onClick={(e) => {
                        e.stopPropagation();
                        setExpanded(true);
                    }}
                >
                    {moreText(lengthExceed)}
                </Button>
            )}
            {isEmpty && <div className={block('columns-empty')}>{i18n('context_empty-list')}</div>}
        </div>
    );
}
