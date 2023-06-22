import React from 'react';

import Link from '../../../components/Link/Link';
import Icon from '../../../components/Icon/Icon';

import hammer from '../../../common/hammer';
import templates, {
    printColumnAsClickableId,
    printColumnAsClickableReadableField,
    printColumnAsError,
    printColumnAsNumberSkipZero,
    printColumnAsTime,
} from '../../../components/templates/utils';
import {VersionCellWithAction} from '../../../pages/components/tabs/Versions/VersionCell';

templates.add('components/versions', {
    __default__: printColumnAsNumberSkipZero,
    start_time: printColumnAsTime,
    type: printColumnAsClickableReadableField,
    error: printColumnAsError,
    address: printColumnAsClickableId,
    state: templates.get('components').state,
    banned: templates.get('components').banned,
    decommissioned: templates.get('components').decommissioned,
    full: templates.get('components').full,
    alerts: templates.get('components').alerts,
    version(item, columnName) {
        const column = this.getColumn(columnName);
        const version = column.get(item);
        const versionIsError = version === 'error';
        const versionIsTotal = version === 'total';
        const handleClick = () =>
            this.props.templates.data.handleItemClick(column.get(item), columnName);
        if (versionIsError || versionIsTotal) {
            return (
                <Link
                    theme="primary"
                    onClick={handleClick}
                    mix={{
                        block: `elements-monospace elements-ellipsis elements-table__cell_type_${version}`,
                    }}
                >
                    {versionIsError && <Icon awesome="exclamation-triangle" />}
                    {hammer.format['FirstUppercase'](version)}
                </Link>
            );
        } else {
            return <VersionCellWithAction version={version} />;
        }
    },
});
