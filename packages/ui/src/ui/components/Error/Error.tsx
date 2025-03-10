import React from 'react';

import {YTErrorBlock as Block, YTErrorBlockProps} from '../../components/Block/Block';

export function YTErrorBlock(props: YTErrorBlockProps) {
    return <Block {...props} type="error" />;
}
