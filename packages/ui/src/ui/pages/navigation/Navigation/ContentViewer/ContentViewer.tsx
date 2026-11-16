import React, {type FC} from 'react';
import cn from 'bem-cn-lite';
import ErrorBoundary from '../../../../containers/ErrorBoundary/ErrorBoundary';
import {Tab} from '../../../../constants/navigation';
import {NavigationDescriptionPreview} from '../../NavigationDescription/NavigationDescriptionPreview/NavigationDescriptionPreview';
import {getComponentByContentType, getComponentByMode} from './helpers';

const block = cn('navigation');

type Props = {
    type: string;
    mode: string;
};

const ContentViewer: FC<Props> = ({type, mode}) => {
    const isContentTab = mode === Tab.CONTENT;
    const Component = isContentTab ? getComponentByContentType(type) : getComponentByMode(mode);

    if (!Component) {
        return undefined;
    }

    return (
        <ErrorBoundary>
            <div className={block('viewer', {mode})}>
                {isContentTab && <NavigationDescriptionPreview />}
                <Component />
            </div>
        </ErrorBoundary>
    );
};

export default ContentViewer;
