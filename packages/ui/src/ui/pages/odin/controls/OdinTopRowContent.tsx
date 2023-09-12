import React from 'react';

import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';
import {CreateClusterNotificationButton} from '../../system/System/SystemTopRowContent';

import {ODIN_PAGE_ID} from '../odin-constants';

function OdinTopRowContent() {
    return (
        <RowWithName page={ODIN_PAGE_ID} name={'Odin'}>
            <CreateClusterNotificationButton />
        </RowWithName>
    );
}

export default React.memo(OdinTopRowContent);
