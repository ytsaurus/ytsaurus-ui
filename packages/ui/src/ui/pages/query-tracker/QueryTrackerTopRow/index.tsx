import React from 'react';
import cn from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';
import {Page} from '../../../../shared/constants/settings';
import {QueryMetaForm} from './QueryMetaForm/QueryMetaForm';
import {getQueryGetParams} from '../module/query/selectors';
import {resetQueryTracker} from '../module/query/actions';
import {QueriesListSidebarToggleButton} from '../QueriesListSidebarToggleButton/QueriesListSidebarToggleButton';

import './index.scss';

const block = cn('query-tracker-top-row-content');

export function QueryHeader() {
    const dispatch = useDispatch();
    const routeParams = useSelector(getQueryGetParams);

    const handleClickOnNewQueryButton = () => {
        dispatch(resetQueryTracker());
    };

    return (
        <div className={block()}>
            <div className={block('meta')}>
                <QueryMetaForm
                    onClickOnNewQueryButton={handleClickOnNewQueryButton}
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
            <QueriesListSidebarToggleButton />
        </RowWithName>
    );
}
