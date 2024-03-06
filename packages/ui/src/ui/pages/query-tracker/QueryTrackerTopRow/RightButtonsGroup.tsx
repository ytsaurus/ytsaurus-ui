import React, {FC} from 'react';
import {QueriesListSidebarToggleButton} from '../QueriesListSidebarToggleButton/QueriesListSidebarToggleButton';
import {NewQueryButton} from '../NewQueryButton';
import {Flex} from '@gravity-ui/uikit';

type Props = {
    onQueryCreate: () => void;
};

export const RightButtonsGroup: FC<Props> = ({onQueryCreate}) => {
    return (
        <Flex gap={2}>
            <QueriesListSidebarToggleButton />
            <NewQueryButton onClick={onQueryCreate} />
        </Flex>
    );
};
