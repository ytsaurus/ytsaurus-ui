import React from 'react';
import block from 'bem-cn-lite';

import {Icon} from '@gravity-ui/uikit';

import arrowIcon from '../../../assets/img/svg/chevron.svg';

import './SelectControl.scss';

const b = block('yc-selector-control');

interface SelectControlProps {
    disabled?: boolean;
    focused?: boolean;
    badgeFocused?: boolean;
    displayArrow?: boolean;
    size?: string;
    value?: string[];

    label?: string;
    placeholder?: string;
    icon?: React.ReactNode;

    width?: string;
    onClick?: () => void;

    badgeRef?: React.Ref<HTMLDivElement>;
    onBadgeClick?: (e: React.MouseEvent) => void;
}

function renderValue({value, placeholder}: {value: string[]; placeholder?: string}) {
    if (value.length > 0) {
        return <span className={b('value')}>{value.join(', ')}</span>;
    } else {
        return <span className={b('placeholder')}>{placeholder}</span>;
    }
}

export function SelectControl({
    size = 's',
    width,
    label,
    focused,
    disabled,
    displayArrow,
    value,
    icon,
    badgeFocused,
    badgeRef,
    onBadgeClick,
    onClick,
    placeholder,
}: SelectControlProps) {
    const controlStyles: React.CSSProperties = {};

    if (width) {
        controlStyles.width = width;
    }

    const controlRef = React.useRef<HTMLDivElement>(null);

    if (!value) {
        return null;
    }
    return (
        <div
            ref={controlRef}
            className={b({size, focused, disabled})}
            style={controlStyles}
            onClick={onClick}
        >
            {Boolean(label) && <span className={b('label')}>{label}</span>}
            {Boolean(icon) && <div className={b('selected-item-icon')}>{icon}</div>}

            {renderValue({value, placeholder})}

            {Boolean(value.length > 0) && (
                <div
                    ref={badgeRef}
                    className={b('badge', {focused: badgeFocused})}
                    onClick={onBadgeClick}
                >
                    {value.length}
                </div>
            )}
            {displayArrow && (
                <div className={b('arrow')}>
                    <Icon data={arrowIcon} />
                </div>
            )}
        </div>
    );
}
