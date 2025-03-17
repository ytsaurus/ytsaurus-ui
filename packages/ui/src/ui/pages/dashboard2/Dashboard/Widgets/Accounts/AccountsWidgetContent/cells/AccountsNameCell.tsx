import React from 'react';
import {ClipboardButton, Flex, Text} from '@gravity-ui/uikit';

export function AccountsNameCell({name}: {name: string}) {
    return (
        <Flex direction={'row'} alignItems={'center'} gap={1}>
            <ClipboardButton text={name} />
            <Text whiteSpace={'nowrap'} ellipsis>
                {name}
            </Text>
        </Flex>
    );
}
