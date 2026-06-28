import React from 'react';
import {AclTableWithToolbar} from '../../../../../../containers/ACL/AclTableWithToolbar/AclTableWithToolbar';

export function OperationAcl() {
    return (
        <AclTableWithToolbar
            title={'Operation permissions'}
            noItemsText={'No data to display'}
            items={[]}
            loaded={true}
            columns={[]}
            toolbar={<div />}
        />
    );
}
