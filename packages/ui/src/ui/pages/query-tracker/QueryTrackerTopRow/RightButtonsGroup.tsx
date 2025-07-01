import React, {FC} from 'react';
import {QueriesListSidebarToggleButton} from '../QueriesListSidebarToggleButton/QueriesListSidebarToggleButton';
import {NewQueryButton} from '../NewQueryButton';
import {Flex} from '@gravity-ui/uikit';
import UIFactory from '../../../UIFactory';

type Props = {
    onQueryCreate: () => void;
};

export const RightButtonsGroup: FC<Props> = ({onQueryCreate}) => {
    const chatComponents = UIFactory.getAIChat();

    return (
        <Flex gap={2}>
            <QueriesListSidebarToggleButton />
            {chatComponents?.chat}
            {chatComponents?.toggleButton}
            <NewQueryButton onClick={onQueryCreate} />
        </Flex>
    );
};
