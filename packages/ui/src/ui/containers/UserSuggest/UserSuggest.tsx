import React from 'react';
import UIFactory from '../../UIFactory';

export interface UserSuggestProps {
    className?: string;
    width?: 'auto' | 'max' | number;

    value?: Array<string>;
    onUpdate: (value: UserSuggestProps['value']) => void;

    multiple?: boolean;
    pin?: `${SideType}-${SideType}`;
}

type SideType = 'round' | 'clear' | 'brick';

export function UserSuggest(props: UserSuggestProps) {
    return <>{UIFactory.renderUserSuggest(props)}</>;
}
