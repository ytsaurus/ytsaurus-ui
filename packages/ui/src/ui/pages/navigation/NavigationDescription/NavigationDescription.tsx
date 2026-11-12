import React from 'react';
import cn from 'bem-cn-lite';
import {Flex} from '@gravity-ui/uikit';
import {NavigationDescriptionToolbar} from './NavigationDescriptionToolbar/NavigationDescriptionToolbar';
import {NavigationDescriptionContent} from './NavigationDescriptionContent/NavigationDescriptionContent';
import './NavigationDescription.scss';

const block = cn('navigation-description');

type Props = {
    className?: string;
};

function NavigationDescription({className}: Props) {
    return (
        <Flex direction="column" gap={3} className={block(null, className)}>
            <NavigationDescriptionToolbar />
            <div className={block('content')}>
                <NavigationDescriptionContent />
            </div>
        </Flex>
    );
}

export default NavigationDescription;
