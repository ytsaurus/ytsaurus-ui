import React from 'react';

import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';

import {Page} from '../../../../shared/constants/settings';

export function DashboardTopRow() {
    return (<RowWithName page={Page.DASHBOARD}></RowWithName>);
}