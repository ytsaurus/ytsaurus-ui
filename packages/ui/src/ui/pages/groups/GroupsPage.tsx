import React from 'react';
import cn from 'bem-cn-lite';
import WithStickyToolbar from '../../components/WithStickyToolbar/WithStickyToolbar';

import GroupsPageFilters from './GroupsPageFilters/GroupsPageFilters';
import GroupsPageTable from './GroupsPageTable/GroupsPageTable';

const block = cn('groups-page');

export default function GroupsPage() {
    return (
        <div className={block(null, 'elements-main-section')}>
            <WithStickyToolbar
                className="elements-section"
                toolbar={<GroupsPageFilters />}
                content={<GroupsPageTable />}
            />
        </div>
    );
}
