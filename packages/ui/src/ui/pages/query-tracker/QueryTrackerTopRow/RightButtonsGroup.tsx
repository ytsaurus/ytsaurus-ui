import React, {FC} from 'react';
import {QueriesListSidebarToggleButton} from '../QueriesListSidebarToggleButton/QueriesListSidebarToggleButton';
import {NewQueryButton} from '../NewQueryButton';
import {Flex} from '@gravity-ui/uikit';
import {ChatToggleButton} from '../../../components/AiChat/ChatToggleButton';

type Props = {
    onQueryCreate: () => void;
};

export const RightButtonsGroup: FC<Props> = ({onQueryCreate}) => {
    return (
        <Flex gap={2}>
            <QueriesListSidebarToggleButton />
            <ChatToggleButton />
            <NewQueryButton onClick={onQueryCreate} />
        </Flex>
    );
};
