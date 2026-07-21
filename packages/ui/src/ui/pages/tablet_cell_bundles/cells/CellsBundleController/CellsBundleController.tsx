import React from 'react';

import filter_ from 'lodash/filter';

import i18n from '../i18n';

import {Toolbar} from '../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import Filter from '../../../../components/Filter/Filter';
import WithStickyToolbar from '../../../../components/WithStickyToolbar/WithStickyToolbar';
import {DataTableYT} from '../../../../components/DataTableYT';

import {block} from './utils';
import {TABLE_SETTINGS} from './constants';
import {useColumns} from './useColumns';
import {type RowData} from './types';

type Props = {
    hideColumns?: Array<string>;
    items: Array<RowData>;
};

export const CellsBundleController = ({items, hideColumns}: Props) => {
    const [filter, setFilter] = React.useState('');

    const data = React.useMemo(() => {
        return !filter ? items : filter_(items, ({address}) => -1 !== address?.indexOf(filter));
    }, [items, filter]);

    const columns = useColumns(hideColumns);

    const renderToolbar = (
        <Toolbar
            itemsToWrap={[
                {
                    name: 'filter',
                    node: (
                        <Filter
                            hasClear
                            size="m"
                            type="text"
                            value={filter}
                            placeholder={i18n('field_filter-placeholder')}
                            onChange={setFilter}
                            autofocus={false}
                            debounce={400}
                            skipBlurByEnter
                        />
                    ),
                },
            ]}
        />
    );

    return (
        <div className={block()}>
            <WithStickyToolbar
                hideToolbarShadow
                toolbar={renderToolbar}
                content={
                    <DataTableYT<RowData>
                        useThemeYT
                        columns={columns}
                        data={data}
                        settings={TABLE_SETTINGS}
                        emptyDataMessage={i18n('alert_no-items')}
                    />
                }
            />
        </div>
    );
};
