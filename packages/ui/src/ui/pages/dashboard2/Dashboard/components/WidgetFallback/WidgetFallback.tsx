import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import {NoSearchResults, NotFound} from '@gravity-ui/illustrations';

type Props = {
    itemsName?: string;
    error?: unknown;
};

export function WidgetFallback(props: Props) {
    const {itemsName, error} = props;

    return (
        <Flex
            direction={'row'}
            alignItems={'center'}
            width={'100%'}
            height={'100%'}
            justifyContent={'center'}
            gap={10}
        >
            {error ? (
                <>
                    <NoSearchResults height={100} width={100} />
                    <Flex maxWidth={300} justifyContent={'center'} direction={'column'} gap={2}>
                        <Text variant={'subheader-2'} color={'primary'}>
                            An error occurred while loading widget data
                        </Text>
                        {error && typeof error === 'object' && 'message' in error && (
                            <Text variant={'body-1'} color={'secondary'}>
                                {String(error.message)}
                            </Text>
                        )}
                    </Flex>
                </>
            ) : (
                <NoWidgetItems itemsName={itemsName} />
            )}
        </Flex>
    );
}

function NoWidgetItems({itemsName}: {itemsName?: string}) {
    return (
        <>
            <NotFound height={100} width={100} />
            <Flex maxWidth={300} alignItems={'center'}>
                <Text variant={'subheader-2'} color={'primary'}>
                    No {itemsName || 'items'} found
                </Text>
            </Flex>
        </>
    );
}
