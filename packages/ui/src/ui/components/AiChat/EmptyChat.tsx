import React, {FC} from 'react';
import {Flex, Text} from '@gravity-ui/uikit';

export const EmptyChat: FC = () => {
    return (
        <Flex alignItems="center" justifyContent="center" direction="column" grow={1}>
            <Text variant="header-1">Hi, I&apos;m Code Assistant!</Text>
            <Text>How can I help you today?</Text>
        </Flex>
    );
};
