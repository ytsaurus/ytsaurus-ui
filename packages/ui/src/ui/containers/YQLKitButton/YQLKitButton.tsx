import React from 'react';
import UIFactory, {YQLButtonProps} from '../../UIFactory';

export function YQLKitButton(props: YQLButtonProps) {
    return <React.Fragment>{UIFactory.yqlWidgetSetup?.renderButton(props)}</React.Fragment>;
}
