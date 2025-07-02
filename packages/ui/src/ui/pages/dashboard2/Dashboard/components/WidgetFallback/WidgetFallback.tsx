import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import {NoSearchResults} from '@gravity-ui/illustrations';
import {NoContent} from '../../../../../components/NoContent/NoContent';

type Props = {
    itemsName?: string;
    error?: unknown;
};

export function WidgetPrettyFallback(props: Props) {
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
                <NoContent hint={`No ${itemsName || 'items'} found`} imageSize={100} />
            )}
        </Flex>
    );
}

export function WidgetNoItemsTextFallback({itemsName}: {itemsName?: string}) {
    return (
        <Flex width={'100%'} height={'100%'} justifyContent={'center'} alignItems={'center'}>
            <Text variant={'body-3'} color={'secondary'}>{`No ${itemsName} found`}</Text>
        </Flex>
    );
}
