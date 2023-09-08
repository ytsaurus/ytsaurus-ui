import React from 'react';

import {RowWithName} from '@ytsaurus/ui/build/esm/ui/containers/AppNavigation/TopRowContent/SectionName';
import {CreateClusterNotificationButton} from '@ytsaurus/ui/build/esm/ui/pages/system/System/SystemTopRowContent';
import {odinPageId} from '../../../../../ya-shared/constants';

function OdinTopRowContent() {
    return (
        <RowWithName page={odinPageId} name={'Odin'}>
            <CreateClusterNotificationButton />
        </RowWithName>
    );
}

export default React.memo(OdinTopRowContent);
