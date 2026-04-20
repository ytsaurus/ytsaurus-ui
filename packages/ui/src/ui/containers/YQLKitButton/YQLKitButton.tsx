import React from 'react';
import UIFactory, {type YQLButtonProps} from '../../UIFactory';

export function YQLKitButton(props: YQLButtonProps) {
    return <React.Fragment>{UIFactory.yqlWidgetSetup?.renderButton(props)}</React.Fragment>;
}
