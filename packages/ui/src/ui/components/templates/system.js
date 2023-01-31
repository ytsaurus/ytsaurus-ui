import React from 'react';
import block from 'bem-cn-lite';

import Label from '../../components/Label/Label';
import Icon from '../../components/Icon/Icon';

import templates from './utils.js';
import hammer from '../../common/hammer';

const b = block('system');

templates.add('system/chunk-cells', {
    __default__(item, columnName) {
        const column = this.getColumn(columnName);
        const value = column?.get(item);
        const theme = column?.label?.(value) || 'default';
        const text = hammer.format['Number'](value);

        return <Label theme={theme} text={text} />;
    },
    cell_tag(item, columnName) {
        const column = this.getColumn(columnName);
        const cellTag = column.get(item);

        const cellTagClassNames = b('master-quorum-cell');
        const cellTagIconClassNames = b('master-quorum-cell-icon');

        return (
            <div className={cellTagClassNames} title={`Cell tag: ${cellTag}`}>
                <Icon className={cellTagIconClassNames} face="solid" awesome="tag" />
                &nbsp;
                <span>{hammer.format['Hex'](cellTag)}</span>
            </div>
        );
    },
});
