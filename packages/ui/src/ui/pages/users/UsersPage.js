import React from 'react';
import cn from 'bem-cn-lite';
import WithStickyToolbar from '../../components/WithStickyToolbar/WithStickyToolbar';

import UsersPageFilters from './UsersPageFilters/UsersPageFilters';
import UsersPageTable from './UsersPageTable/UsersPageTable';

const block = cn('users-page');

export default function UsersPage() {
    return (
        <div className={block(null, 'elements-main-section')}>
            <WithStickyToolbar
                className="elements-section"
                toolbar={<UsersPageFilters />}
                content={<UsersPageTable />}
            />
        </div>
    );
}
