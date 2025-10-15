import React from 'react';
import {useSelector} from 'react-redux';
import {Route, RouteComponentProps, Switch, useHistory} from 'react-router';
import cn from 'bem-cn-lite';
import {Breadcrumbs} from '@gravity-ui/uikit';
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

function ComponentsBreadcrumbs() {
    const cluster = useSelector(getCluster);
    const nodeHost = useSelector(nodeHostSelector);
    const history = useHistory();
    const items = React.useMemo(() => {
        const result = [
            <Breadcrumbs.Item onClick={() => history.push(`/${cluster}/${Page.COMPONENTS}/${ComponentsTab.NODES}`)} key="<Root>">
                {'<Root>'}
            </Breadcrumbs.Item>,
        ];
        if (nodeHost) {
            result.push(
                <Breadcrumbs.Item
                    key={nodeHost}
                >
                    {nodeHost}
                </Breadcrumbs.Item>,
            );
        }
        return result;
    }, [cluster, nodeHost, history]);

    return (
        <Breadcrumbs showRoot className={block('breadcrumbs')}>
            {items}
        </Breadcrumbs>
    );
}

export default React.memo(ComponentsTopRowContent);
