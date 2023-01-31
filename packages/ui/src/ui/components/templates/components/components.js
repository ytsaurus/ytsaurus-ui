import React from 'react';
import hammer from '../../../common/hammer';
import Label from '../../../components/Label/Label';
import templates from '../../../components/templates/utils.js';
import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';
import StatusBlock from '../../../components/StatusBlock/StatusBlock';

templates.add('components', {
    host(item, columnName) {
        return (
            <div
                className="elements-column_type_id elements-column_with-hover-button"
                title={item.host}
            >
                <span className="elements-monospace elements-ellipsis">
                    {hammer.format['Address'](item.host)}
                </span>
                &nbsp;
                <ClipboardButton
                    text={item.host}
                    view="flat-secondary"
                    size="s"
                    title={'Copy ' + columnName}
                />
            </div>
        );
    },
    state(item) {
        const text = hammer.format['FirstUppercase'](item.state);
        const theme =
            {
                online: 'success',
                offline: 'danger',
                error: 'danger',
            }[item.state] || 'default';

        return <Label theme={theme} type="text" text={text} />;
    },
    banned(item) {
        return item.banned ? <StatusBlock text="B" theme="banned" /> : hammer.format.NO_VALUE;
    },
    decommissioned(item) {
        return item.decommissioned ? (
            <StatusBlock text="D" theme="decommissioned" />
        ) : (
            hammer.format.NO_VALUE
        );
    },
    full(item) {
        return item.full ? <StatusBlock text="F" theme="full" /> : hammer.format.NO_VALUE;
    },
    alerts(item) {
        return item.alerts?.length > 0 ? (
            <StatusBlock text={item.alerts.length} theme="alerts" />
        ) : (
            hammer.format.NO_VALUE
        );
    },
});
