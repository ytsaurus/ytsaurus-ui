import React from 'react';
import {Flex, Text, TextProps} from '@gravity-ui/uikit';

type Props = Omit<TextProps, 'ellipsis' | 'whiteSpace'> & {children: React.ReactNode};

export function WidgetText(props: Props) {
    return (
        <Flex width={'100%'} overflow={'hidden'}>
            <Text {...props} ellipsis whiteSpace={'nowrap'}>
                {props.children}
            </Text>
        </Flex>
    );
}
