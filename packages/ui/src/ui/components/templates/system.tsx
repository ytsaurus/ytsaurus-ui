import React from 'react';
import block from 'bem-cn-lite';

import Label from '../../components/Label';
import Icon from '../../components/Icon/Icon';

import templates, {type TemplateContext} from './utils';
import hammer from '../../common/hammer';
import i18n from './i18n';

const b = block('system');

templates.add<object>('system/chunk-cells', {
    __default__(this: TemplateContext<object, number>, item, columnName) {
        const column = this.getColumn(columnName);
        const value = column?.get?.(item);
        const theme = column?.label?.(value) || 'default';
        const text = hammer.format['Number'](value);

        return <Label theme={theme} text={text} />;
    },
    cell_tag(this: TemplateContext<object, number>, item, columnName) {
        const column = this.getColumn(columnName);
        const cellTag = column?.get?.(item);

        const cellTagClassNames = b('master-quorum-cell');
        const cellTagIconClassNames = b('master-quorum-cell-icon');

        return (
            <div className={cellTagClassNames} title={i18n('context_cell-tag', {cellTag})}>
                <Icon className={cellTagIconClassNames} face="solid" awesome="tag" />
                &nbsp;
                <span>{hammer.format['Hex'](cellTag)}</span>
            </div>
        );
    },
});
