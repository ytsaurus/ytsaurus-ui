import React from 'react';
import cn from 'bem-cn-lite';
import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';
import {Page} from '../../../constants';
import RequestQoutaButton from '../../components/RequestQoutaButton/RequestQuotaButton';

import './DashboardTopRowContent.scss';

const block = cn('dashboard-top-row-content');

function DashboardTopRowContent() {
    return (
        <RowWithName page={Page.DASHBOARD}>
            <div className={block()}>
                <RequestQoutaButton page={Page.DASHBOARD} />
            </div>
        </RowWithName>
    );
}

export default React.memo(DashboardTopRowContent);
