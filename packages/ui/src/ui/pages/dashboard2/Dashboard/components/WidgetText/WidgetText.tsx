import React from 'react';
import {Flex, Text, TextProps} from '@gravity-ui/uikit';

type Props = Omit<TextProps, 'ellipsis' | 'whiteSpace'> & {
    children: React.ReactNode;
    width?: string;
};

export function WidgetText(props: Props) {
    return (
        <Flex width={props?.width} overflow={'hidden'}>
            <Text {...props} ellipsis whiteSpace={'nowrap'}>
                {props.children}
            </Text>
        </Flex>
    );
}
