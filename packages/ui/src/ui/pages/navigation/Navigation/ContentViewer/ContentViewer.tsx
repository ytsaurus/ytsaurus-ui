import React, {type FC} from 'react';
import cn from 'bem-cn-lite';
import ErrorBoundary from '../../../../containers/ErrorBoundary/ErrorBoundary';
import {Tab} from '../../../../constants/navigation';
import NavigationDescription from '../../NavigationDescription/NavigationDescription';
import {getComponentByContentType, getComponentByMode} from './helpers';
import {CypressNodeTypes} from '../../../../utils/cypress-attributes';
import {ReplicaStatuses} from '../../content/ReplicatedTable/ReplicaStatuses/ReplicaStatuses';

const block = cn('navigation');

type Props = {
    type: string;
    mode: string;
};

const ContentViewer: FC<Props> = ({type, mode}) => {
    const isContentTab = mode === Tab.CONTENT;
    const Component = isContentTab ? getComponentByContentType(type) : getComponentByMode(mode);
    const showReplicaStatuses =
        (type === CypressNodeTypes.REPLICATED_TABLE ||
            type === CypressNodeTypes.CHAOS_REPLICATED_TABLE) &&
        (mode === Tab.QUEUE || mode === Tab.CONSUMER);

    if (!Component) return undefined;

    return (
        <ErrorBoundary>
            <div className={block('viewer', {mode})}>
                {isContentTab && <NavigationDescription className={block('description')} />}
                {showReplicaStatuses && <ReplicaStatuses />}
                <Component />
            </div>
        </ErrorBoundary>
    );
};

export default ContentViewer;
