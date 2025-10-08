import React, {FC} from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import i18n from './i18n';

export const EmptyChat: FC = () => {
    return (
        <Flex alignItems="center" justifyContent="center" direction="column" grow={1}>
            <Text variant="header-1">{i18n('title_greeting')}</Text>
            <Text>{i18n('context_help-offer')}</Text>
        </Flex>
    );
};
