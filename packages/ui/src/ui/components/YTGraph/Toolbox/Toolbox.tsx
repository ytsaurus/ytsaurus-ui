import React, {FC, useState} from 'react';
import {MagnifierMinus, MagnifierPlus, SquareDashed} from '@gravity-ui/icons';
import {Button, Flex, Icon, Tooltip} from '@gravity-ui/uikit';
import {Graph} from '@gravity-ui/graph';
import {useGraphEvent} from '@gravity-ui/graph/react';
import cn from 'bem-cn-lite';
import './Toolbox.scss';
import {ZOOM_PADDING} from '../constants';
import i18n from './i18n';

type Props = {className?: string; graph: Graph};
const ZOOM_STEP = 0.08;

const block = cn('yt-graph-toolbox');

export const Toolbox: FC<Props> = ({className, graph}) => {
    const [scale, setScale] = useState(1);

    useGraphEvent(graph, 'camera-change', (data) => {
        setScale(data.scale);
    });

    return (
        <Flex
            grow={1}
            justifyContent="center"
            className={block(null, className)}
            direction="column"
        >
            <Tooltip content={i18n('action_zoom-in')} placement="right">
                <Button
                    view="raised"
                    onClick={() => {
                        graph.zoom({scale: graph.cameraService.getCameraScale() + ZOOM_STEP});
                    }}
                    disabled={scale >= graph.cameraService.getCameraState().scaleMax}
                >
                    <Icon data={MagnifierPlus} />
                </Button>
            </Tooltip>
            <Tooltip content={i18n('action_fit-to-viewport')} placement="right">
                <Button
                    pin="brick-brick"
                    view="raised"
                    onClick={() => {
                        graph.api.zoomToViewPort({padding: ZOOM_PADDING});
                    }}
                >
                    <Icon data={SquareDashed} />
                </Button>
            </Tooltip>
            <Tooltip content={i18n('action_zoom-out')} placement="right">
                <Button
                    view="raised"
                    onClick={() => {
                        graph.zoom({scale: graph.cameraService.getCameraScale() - ZOOM_STEP});
                    }}
                    disabled={scale <= graph.cameraService.getCameraState().scaleMin}
                >
                    <Icon data={MagnifierMinus} />
                </Button>
            </Tooltip>
        </Flex>
    );
};
