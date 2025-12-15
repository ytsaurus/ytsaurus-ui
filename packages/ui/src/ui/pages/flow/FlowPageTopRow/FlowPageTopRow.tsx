import React from 'react';

import {Breadcrumbs} from '@gravity-ui/uikit';

import {Page} from '../../../../shared/constants/settings';
import ypath from '../../../common/thor/ypath';
import Link from '../../../components/Link/Link';
import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';
import {useSelector} from '../../../store/redux-hooks';
import {getFlowPipelinePath} from '../../../store/selectors/flow/filters';
import {makeFlowLink} from '../../../utils/app-url';

export function FlowPageTopRow() {
    return (
        <RowWithName page={Page.FLOWS}>
            <FlowBreadcrumbs />
        </RowWithName>
    );
}

function FlowBreadcrumbs() {
    return (
        <Breadcrumbs showRoot>
            <Breadcrumbs.Item>
                <BCName />
            </Breadcrumbs.Item>
        </Breadcrumbs>
    );
}

function BCName() {
    const path = useSelector(getFlowPipelinePath);
    const name = React.useMemo(() => {
        const parsedPath = ypath.YPath.create(path, 'absolute');
        return parsedPath?.fragments?.pop()?.name;
    }, [path]);

    return (
        <Link theme="secondary" url={makeFlowLink({path})} routed routedPreserveLocation>
            {name}
        </Link>
    );
}
