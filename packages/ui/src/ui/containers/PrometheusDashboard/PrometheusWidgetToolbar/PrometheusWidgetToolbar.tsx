import React from 'react';
import cn from 'bem-cn-lite';

import {Button, Icon} from '@gravity-ui/uikit';

import maximizeSvg from '@gravity-ui/icons/svgs/chevrons-expand-up-right.svg';
import minimizeSvg from '@gravity-ui/icons/svgs/chevrons-collapse-up-right.svg';

import {PrometheusWidgetId} from '../../../../shared/prometheus/types';

import {usePrometheusDashboardContext} from '../PrometheusDashboardContext/PrometheusDashboardContext';

import './PrometheusWidgetToolbar.scss';

const block = cn('yt-prometheus-widget-toolbar');

type PrometheusToolbarProps = {
    id: PrometheusWidgetId;
};

export function PrometheusWidgetToolbar({id}: PrometheusToolbarProps) {
    const {expandedId, toggleExpanded} = usePrometheusDashboardContext();
    const [element, setElement] = React.useState<HTMLDivElement | null>(null);

    React.useEffect(() => {
        let timerId: ReturnType<typeof setTimeout> | undefined;
        if (id === expandedId) {
            timerId = setTimeout(() => element?.scrollIntoView(), 300);
        }
        return () => {
            clearTimeout(timerId);
        };
    }, [id, expandedId, element]);

    const isMaximized = id === expandedId;

    return (
        <React.Fragment>
            <div className={block()}>
                <Button view="flat-secondary" onClick={() => toggleExpanded(id)} size="xs">
                    <Icon data={isMaximized ? minimizeSvg : maximizeSvg} />
                </Button>
            </div>
            <div ref={setElement}></div>
        </React.Fragment>
    );
}
