import React from 'react';
import cn from 'bem-cn-lite';

import {Checkbox} from '@gravity-ui/uikit';

import {docsUrl} from '../../../../../../config';
import MetaTable, {
    MetaTableItem,
    MetaTableProps,
} from '../../../../../../components/MetaTable/MetaTable';
import Link from '../../../../../../components/Link/Link';
import Icon from '../../../../../../components/Icon/Icon';

import './JobCounters.scss';

const block = cn('yt-job-counters');

export function JobCounters({
    data,
    helpUrl,
    allowHideEmpty,
}: {
    data: Record<string, Array<MetaTableItem>>;
    helpUrl: string;
    allowHideEmpty?: boolean;
}) {
    const [hideEmpty, setHideEmpty] = React.useState(true);

    return (
        <div className={block()}>
            {allowHideEmpty && (
                <div className={block('filters')}>
                    <Checkbox checked={hideEmpty} onUpdate={setHideEmpty}>
                        Hide empty
                    </Checkbox>
                </div>
            )}
            {Object.keys(data).map((key) => {
                const items = data[key];
                return (
                    <JobCoutnersSection
                        key={key}
                        name={key}
                        items={allowHideEmpty ? filterValues(hideEmpty, items) : items}
                    />
                );
            })}
            {docsUrl(
                <div className="elements-section">
                    <Link url={helpUrl}>
                        <Icon awesome="book" /> Help
                    </Link>
                </div>,
            )}
        </div>
    );
}

function filterValues(hideEmpty: boolean, items: Array<MetaTableItem>) {
    if (!hideEmpty) {
        return items;
    }

    return items.filter(({value}) => Boolean(value));
}

function JobCoutnersSection({name, items}: {name: string; items: MetaTableProps['items']}) {
    return (
        <div className="elements-section">
            <div className="elements-heading elements-heading_size_s">{name}</div>

            {items.length ? <MetaTable items={items} /> : 'No items'}
        </div>
    );
}
