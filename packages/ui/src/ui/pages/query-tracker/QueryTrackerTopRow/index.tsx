import React from 'react';
import cn from 'bem-cn-lite';
import {useSelector} from 'react-redux';
import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';
import {Page} from '../../../../shared/constants/settings';
import {QueryMetaForm} from './QueryMetaForm/QueryMetaForm';

import './index.scss';
import {getQueryGetParams} from '../module/query/selectors';
import {QueriesListToggleButton} from '../QueriesListToggleButton/QueriesListToggleButton';

const block = cn('query-tracker-top-row-content');

export function QueryHeader() {
    const routeParams = useSelector(getQueryGetParams);

    return (
        <div className={block()}>
            <div className={block('meta')}>
                <QueryMetaForm
                    className={block('meta-form')}
                    cluster={routeParams.cluster}
                    path={routeParams.path}
                />
            </div>
        </div>
    );
}

export default function QueryTrackerTopRow() {
    return (
        <RowWithName page={Page.QUERIES}>
            <QueryHeader />
            <QueriesListToggleButton />
        </RowWithName>
    );
}
