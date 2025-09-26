import React, {FC} from 'react';
import {Flex} from '@gravity-ui/uikit';
import {Detail} from '@gravity-ui/illustrations';
import './SidePanelEmpty.scss';
import cn from 'bem-cn-lite';

const block = cn('yt-side-panel-empty');

export const SidePanelEmpty: FC = () => {
    return (
        <Flex className={block()} alignItems="center" justifyContent="center">
            <Flex direction="column" alignItems="center" gap={1}>
                <Detail width={140} height={140} />
                Select job for more details
            </Flex>
        </Flex>
    );
};
