import React from 'react';
import cn from 'bem-cn-lite';
import {useSelector} from 'react-redux';
import {Engines, QueryEngine} from '../module/api';
import {QueryTrackerNewButton} from '../QueryTrackerNewButton';
import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';
import {getCluster} from '../../../store/selectors/global';
import {Page} from '../../../../shared/constants/settings';
import {QueryMetaForm} from './QueryMetaForm';

import './index.scss';

const block = cn('query-tracker-top-row-content');

export function QueryHeader() {
    const cluster = useSelector(getCluster);

    return (
        <div className={block()}>
            <div className={block('meta')}>
                <QueryMetaForm className={block('meta-form')} />
            </div>
            <div>
                <QueryTrackerNewButton
                    defaultEngine={QueryEngine.YQL}
                    cluster={cluster}
                    engines={Engines}
                    renderDefaultTitle={({engineTitle}) => `New query in ${engineTitle} syntax`}
                />
            </div>
        </div>
    );
}

export function QueryTrackerTopRow() {
    return (
        <RowWithName page={Page.QUERIES}>
            <QueryHeader />
        </RowWithName>
    );
}
