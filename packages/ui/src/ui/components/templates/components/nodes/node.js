/* global YT */
import React from 'react';
import hammer from '../../../../common/hammer';

import Link from '../../../../components/Link/Link';
import StatusBlock from '../../../../components/StatusBlock/StatusBlock';

import {TABLET_SLOTS} from './nodes';
import templates from '../../../../components/templates/utils';
import {genTabletCellBundlesCellUrl} from '../../../../utils/tablet_cell_bundles';

templates.add('components/nodes/node', {
    cell_id(item) {
        const url = genTabletCellBundlesCellUrl(item.cell_id, YT.cluster);

        return item.cell_id ? (
            <Link url={url} theme="ghost" routed>
                {item.cell_id}
            </Link>
        ) : (
            hammer.format.NO_VALUE
        );
    },
    peer_id(item) {
        return item.peer_id;
    },
    state(item) {
        const {text, theme} = TABLET_SLOTS[item.state];

        return item.state ? <StatusBlock theme={theme} text={text} /> : hammer.format.NO_VALUE;
    },
});
