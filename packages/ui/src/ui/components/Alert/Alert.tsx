import React from 'react';

import {YTErrorBlock, YTErrorBlockProps} from '../../components/Block/Block';

export function YTAlertBlock(props: YTErrorBlockProps) {
    return <YTErrorBlock {...props} type="alert" />;
}
