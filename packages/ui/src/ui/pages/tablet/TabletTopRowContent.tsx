import React from 'react';
import cn from 'bem-cn-lite';

import {RowWithName} from '../../containers/AppNavigation/TopRowContent/SectionName';
import {Page} from '../../constants';
import {EditableAsText} from '../../components/EditableAsText/EditableAsText';
import {getCluster} from '../../store/selectors/global';
import {useSelector} from 'react-redux';
import {useRouteMatch} from 'react-router';

import './TabletTopRowContent.scss';
import {Breadcrumbs, BreadcrumbsItem} from '../../components/Breadcrumbs';
import {getAppBrowserHistory} from '../../store/window-store';
const block = cn('tablet-top-row-content');

function TabletTopRowContent() {
    return (
        <RowWithName page={Page.TABLET}>
            <TabletBreadcrumbs />
        </RowWithName>
    );
}

export default React.memo(TabletTopRowContent);

function TabletBreadcrumbs() {
    const {
        params: {id},
    } = useRouteMatch<{id: string}>();
    const cluster = useSelector(getCluster);

    const handleEdit = React.useCallback(
        (tabletId?: string) => {
            getAppBrowserHistory().push(`/${cluster}/${Page.TABLET}/${tabletId || ''}`);
        },
        [cluster],
    );

    return (
        <>
            <EditableAsText className={block('editable')} text={id} onChange={handleEdit}>
                <Breadcrumbs showRoot>
                    <BreadcrumbsItem>{id}</BreadcrumbsItem>
                </Breadcrumbs>
            </EditableAsText>
        </>
    );
}
