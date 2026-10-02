import React from 'react';
import hammer from '../../../../common/hammer';

import Link from '../../../../containers/Link/Link';
import StatusBlock from '../../../../components/StatusBlock/StatusBlock';

import {TABLET_SLOTS} from './nodes';
import templates from '../../../../components/templates/utils';
import {genTabletCellBundlesCellUrl} from '../../../../utils/tablet_cell_bundles';
import {type TabletSlotState} from '../../../../store/reducers/components/nodes/nodes/node';
import {YT} from '../../../../config/yt-config';

templates.add<{cell_id?: string; peer_id?: number; state: TabletSlotState}>(
    'components/nodes/node',
    {
        cell_id(item) {
            return item.cell_id ? (
                <Link
                    url={genTabletCellBundlesCellUrl(item.cell_id, YT.cluster)}
                    theme="ghost"
                    routed
                >
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
    },
);
