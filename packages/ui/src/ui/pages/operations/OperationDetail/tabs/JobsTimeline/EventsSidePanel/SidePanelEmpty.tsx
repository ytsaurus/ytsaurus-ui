import React, {FC} from 'react';
import {Flex} from '@gravity-ui/uikit';
import './SidePanelEmpty.scss';
import cn from 'bem-cn-lite';
import {NoContent} from '../../../../../../components/NoContent/NoContent';

const block = cn('yt-side-panel-empty');

export const SidePanelEmpty: FC = () => {
    return (
        <Flex className={block()} alignItems="center" justifyContent="center">
            <NoContent className={block('message')} hint="Select job for more details" />
        </Flex>
    );
};
