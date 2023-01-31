import React from 'react';
import {useSelector} from 'react-redux';
import {Route, RouteComponentProps, Switch} from 'react-router';
import cn from 'bem-cn-lite';

import {Breadcrumbs, BreadcrumbsItem} from '@gravity-ui/uikit';

import Link from '../../../components/Link/Link';
import {Tab as ComponentsTab} from '../../../constants/components/main';
import {Page} from '../../../constants/index';
import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';
import {nodeHostSelector} from '../../../store/selectors/components/node/node';
import {getCluster} from '../../../store/selectors/global';

import './ComponentsTopRowContent.scss';

const block = cn('components-top-row-content');

function ComponentsTopRowContent({match}: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${match.path}/${ComponentsTab.NODES}/:host`}
                component={ComponentsNodeTopRowContent}
            />
            <Route path={''} render={() => <RowWithName page={Page.COMPONENTS} />} />
        </Switch>
    );
}

function ComponentsNodeTopRowContent() {
    return (
        <RowWithName page={Page.COMPONENTS}>
            <ComponentsBreadcrumbs />
        </RowWithName>
    );
}

function noop() {}

function ComponentsBreadcrumbs() {
    const cluster = useSelector(getCluster);
    const nodeHost = useSelector(nodeHostSelector);

    const items = React.useMemo(() => {
        const _items = [
            {
                text: '',
                action: noop,
                href: `/${cluster}/${Page.COMPONENTS}/${ComponentsTab.NODES}`,
            },
        ];
        if (nodeHost) {
            _items.push({
                text: nodeHost,
                action: noop,
                href: `/${cluster}/${Page.COMPONENTS}/${ComponentsTab.NODES}/${encodeURIComponent(
                    nodeHost,
                )}/general`,
            });
        }
        return _items;
    }, [cluster, nodeHost]);

    return (
        <Breadcrumbs
            className={block('breadcrumbs')}
            items={items}
            lastDisplayedItemsCount={2}
            firstDisplayedItemsCount={1}
            renderItemContent={renderBcItem}
        />
    );
}

function renderBcItem(item: BreadcrumbsItem, isCurrent: boolean) {
    return <BreadcrumbLink host={item.text} href={item.href} isCurrent={isCurrent} />;
}

interface BreadcrumbLinkProps {
    host: string;
    href?: string;
    isCurrent: boolean;
}

function BreadcrumbLink({host, href, isCurrent}: BreadcrumbLinkProps) {
    return (
        <Link
            className={block('breadcrumbs-item', {current: isCurrent})}
            theme={'ghost'}
            url={href}
            routed
        >
            {host || '<Root>'}
        </Link>
    );
}

export default React.memo(ComponentsTopRowContent);
