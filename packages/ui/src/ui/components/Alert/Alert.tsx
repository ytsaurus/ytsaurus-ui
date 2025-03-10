import React from 'react';

import {YTErrorBlock as Block, YTErrorBlockProps} from '../../components/Block/Block';

export default function Alert(props: YTErrorBlockProps) {
    return <Block {...props} type="alert" />;
}
