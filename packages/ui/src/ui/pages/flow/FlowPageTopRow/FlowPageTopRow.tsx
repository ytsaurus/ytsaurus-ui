import {Breadcrumbs} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';
import {Page} from '../../../../shared/constants/settings';
import Link from '../../../components/Link/Link';
import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';
import {FlowTab} from '../../../store/reducers/flow/filters';
import {useSelector} from '../../../store/redux-hooks';
import {
    getFlowCurrentComputation,
    getFlowCurrentPartition,
    getFlowCurrentWorker,
    getFlowPipelinePath,
} from '../../../store/selectors/flow/filters';
import {makeFlowLink} from '../../../utils/app-url';
import i18n from '../i18n';
import './FlowPageTopRow.scss';

const block = cn('yt-flow-page-top-row');

export function FlowPageTopRow() {
    return (
        <RowWithName page={Page.FLOWS}>
            <FlowBreadcrumbs />
        </RowWithName>
    );
}

function FlowBreadcrumbs() {
    const computation = useSelector(getFlowCurrentComputation);
    const worker = useSelector(getFlowCurrentWorker);
    const partition = useSelector(getFlowCurrentPartition);
    const path = useSelector(getFlowPipelinePath);

    return (
        <Breadcrumbs className={block('breadcrumbs')} showRoot>
            <Breadcrumbs.Item>
                <BCName path={path} />
            </Breadcrumbs.Item>
            {computation
                ? [
                      <Breadcrumbs.Item key="computations">
                          <Link
                              theme="secondary"
                              url={makeFlowLink({path, tab: FlowTab.COMPUTATIONS})}
                              routed
                              routedPreserveLocation
                          >
                              {i18n('computations')}
                          </Link>
                      </Breadcrumbs.Item>,
                      <Breadcrumbs.Item key="item">
                          <Link
                              theme="secondary"
                              url={makeFlowLink({path, tab: FlowTab.COMPUTATIONS, computation})}
                              routed
                              routedPreserveLocation
                          >
                              {computation}
                          </Link>
                      </Breadcrumbs.Item>,
                  ]
                : null}
            {partition
                ? [
                      <Breadcrumbs.Item disabled key="partition">
                          {i18n('partition')}
                      </Breadcrumbs.Item>,
                  ]
                : null}
            {worker
                ? [
                      <Breadcrumbs.Item key="workers">
                          <Link
                              theme="secondary"
                              url={makeFlowLink({path, tab: FlowTab.WORKERS})}
                              routed
                              routedPreserveLocation
                          >
                              {i18n('workers')}
                          </Link>
                      </Breadcrumbs.Item>,
                      <Breadcrumbs.Item key="item">{worker}</Breadcrumbs.Item>,
                  ]
                : null}
        </Breadcrumbs>
    );
}

function BCName({path}: {path: string}) {
    return (
        <Link theme="secondary" url={makeFlowLink({path})} routed routedPreserveLocation>
            {'<Root>'}
        </Link>
    );
}
