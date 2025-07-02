import React from 'react';
import {Text, TextProps} from '@gravity-ui/uikit';

type Props = Omit<TextProps, 'ellipsis' | 'whiteSpace'> & {children: React.ReactNode};

export function WidgetText(props: Props) {
    return (
        <Text {...props} ellipsis whiteSpace={'nowrap'}>
            {props.children}
        </Text>
    );
}
