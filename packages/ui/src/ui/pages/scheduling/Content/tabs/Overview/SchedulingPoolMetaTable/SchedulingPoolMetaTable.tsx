import React from 'react';

import {MetaTable, type MetaTableProps} from '@ytsaurus/components';

import UIFactory from '../../../../../../UIFactory';

export type SchedulingPoolMetaTableProps = MetaTableProps;

export function SchedulingPoolMetaTable(props: SchedulingPoolMetaTableProps) {
    return UIFactory.renderSchedulingPoolMetaTable(props) || <MetaTable {...props} />;
}
