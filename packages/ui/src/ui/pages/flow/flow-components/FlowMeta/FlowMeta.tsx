import cn from 'bem-cn-lite';
import React from 'react';
import MetaTable from '../../../../components/MetaTable/MetaTable';
import {NavigationBreadcrumbs} from '../../../../containers/NavigationBreadcrumbs/NavigationBreadcrumbs';
import {useSelector} from '../../../../store/redux-hooks';
import {getFlowPipelinePath} from '../../../../store/selectors/flow/filters';
import './FlowMeta.scss';
import i18n from './i18n';

const block = cn('yt-flow-meta');

export function getFlowPathMetaItems(path: string) {
    return [
        {
            key: 'pipeline_path',
            label: i18n('flow-path'),
            value: <NavigationBreadcrumbs path={path} />,
            className: block('item'),
        },
    ];
}

export function FlowPathMeta() {
    const path = useSelector(getFlowPipelinePath);

    return <MetaTable className={block()} items={getFlowPathMetaItems(path)} />;
}
