import React from 'react';
import {Icon as GravityIcon} from '@gravity-ui/uikit';

import hammer from '../../common/hammer';
import ypath from '../../common/thor/ypath';

import Icon from '../../components/Icon/Icon';

import UIFactory from '../../UIFactory';

import {getIconNameForType} from '../../utils/navigation/path-editor';
import {isTrashNode} from '../../utils/navigation/isTrashNode';
import {isLinkToTrashNode} from '../../utils/navigation/isLinkToTrashNode';

import QueueConsumerIcon from '../../assets/img/svg/icons/queue-consumer.svg';
import QueueProducerIcon from '../../assets/img/svg/icons/queue-producer.svg';

import NodePipelineIcon from '../../assets/img/svg/icons/node-pipeline.svg';

import type {BaseMapNode} from '../../utils/navigation/content/map-nodes/node';
import {isPipelineNode} from '../../utils/navigation/isPipelineNode';

import './MapNodeIcon.scss';

export function MapNodeIcon({node}: {node: BaseMapNode}) {
    const item = ypath.getAttributes(node);
    const iconType = item?.type === 'table' && item?.dynamic ? 'table_dynamic' : item?.type;
    let icon = UIFactory.getNavigationMapNodeSettings()?.renderNodeIcon(node);

    if (icon) {
        // do nothing
    } else if (isTrashNode(item?.path) || isLinkToTrashNode(item?.targetPath)) {
        icon = <Icon awesome="trash-alt" />;
    } else {
        icon = <Icon awesome={getIconNameForType(iconType, item.targetPathBroken)} />;
    }

    let title = hammer.format['ReadableField'](item.type);
    if (iconType === 'table') {
        title = 'Static table';
    }

    if (iconType === 'table_dynamic') {
        if (item?.sorted) {
            title = 'Dynamic table';
        } else {
            title = 'Queue table';
            icon = <Icon awesome="queue-table" />;
        }
    }

    if (item?.treat_as_queue_consumer) {
        title = 'Queue consumer';
        icon = <GravityIcon data={QueueConsumerIcon} />;
    }

    if (item?.treat_as_queue_producer) {
        title = 'Queue producer';
        icon = <GravityIcon data={QueueProducerIcon} />;
    }

    if (isPipelineNode(node.$attributes)) {
        title = 'Flow';
        icon = <GravityIcon data={NodePipelineIcon} />;
    }

    return (
        <span className={'icon-wrapper'} title={title}>
            {icon}
        </span>
    );
}
