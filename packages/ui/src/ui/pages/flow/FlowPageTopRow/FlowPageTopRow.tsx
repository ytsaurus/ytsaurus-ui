import {Breadcrumbs} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';
import {Page} from '../../../../shared/constants/settings';
import ypath from '../../../common/thor/ypath';
import Link from '../../../components/Link/Link';
import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';
import {useSelector} from '../../../store/redux-hooks';
import {
    getFlowCurrentComputation,
    getFlowPipelinePath,
} from '../../../store/selectors/flow/filters';
import {makeFlowLink} from '../../../utils/app-url';
import i18n from '../i18n';
import './FlowPageTopRow.scss';
import {FlowTab} from '../../../store/reducers/flow/filters';

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
    const path = useSelector(getFlowPipelinePath);

    return (
        <Breadcrumbs className={block('breadcrumbs')} showRoot>
            <Breadcrumbs.Item>
                <BCName path={path} />
            </Breadcrumbs.Item>
            {computation ? (
                <Breadcrumbs.Item>
                    <Link
                        theme="secondary"
                        url={makeFlowLink({path, tab: FlowTab.COMPUTATIONS})}
                        routed
                        routedPreserveLocation
                    >
                        {i18n('computations')}
                    </Link>
                </Breadcrumbs.Item>
            ) : null}
            {computation ? <Breadcrumbs.Item>{computation}</Breadcrumbs.Item> : null}
        </Breadcrumbs>
    );
}

function BCName({path}: {path: string}) {
    const name = React.useMemo(() => {
        const parsedPath = path ? ypath.YPath.create(path, 'absolute') : undefined;
        return parsedPath?.fragments?.pop()?.name;
    }, [path]);

    return (
        <Link theme="secondary" url={makeFlowLink({path})} routed routedPreserveLocation>
            {name}
        </Link>
    );
}
