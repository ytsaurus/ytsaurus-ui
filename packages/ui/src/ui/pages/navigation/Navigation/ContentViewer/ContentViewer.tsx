import React, {FC} from 'react';
import cn from 'bem-cn-lite';
import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';
import {Tab} from '../../../../constants/navigation';
import NavigationDescription from '../../NavigationDescription/NavigationDescription';
import {getComponentByContentType, getComponentByMode} from './helpers';

const block = cn('navigation');

type Props = {
    type: string;
    mode: string;
};

const ContentViewer: FC<Props> = ({type, mode}) => {
    const isContentTab = mode === Tab.CONTENT;
    const Component = isContentTab ? getComponentByContentType(type) : getComponentByMode(mode);

    if (!Component) return undefined;

    return (
        <ErrorBoundary>
            <div className={block('viewer', {mode})}>
                {isContentTab && <NavigationDescription className={block('description')} />}
                <Component />
            </div>
        </ErrorBoundary>
    );
};

export default ContentViewer;
