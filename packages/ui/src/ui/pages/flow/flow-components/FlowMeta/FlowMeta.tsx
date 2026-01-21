import cn from 'bem-cn-lite';
import React from 'react';
import ClickableAttributesButton from '../../../../components/AttributesButton/ClickableAttributesButton';
import MetaTable, {MetaTableItem} from '../../../../components/MetaTable/MetaTable';
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

export function getLoadedDataMetaItems({label, data}: {label: string; data?: object}) {
    return !data
        ? []
        : [
              {
                  key: 'flow-loaded-data',
                  label,
                  labelTopPadding: '4px',
                  value: <ShowDataButton {...{label, data}} />,
              },
          ];
}

export function ShowDataButton({label, data}: {label: string; data?: object}) {
    return !data ? null : (
        <ClickableAttributesButton
            title={label}
            attributes={data}
            tooltipProps={{content: label}}
        />
    );
}

export function FlowPathMeta({items = []}: {items?: Array<MetaTableItem>}) {
    const path = useSelector(getFlowPipelinePath);

    return <MetaTable className={block()} items={[...getFlowPathMetaItems(path), ...items]} />;
}
