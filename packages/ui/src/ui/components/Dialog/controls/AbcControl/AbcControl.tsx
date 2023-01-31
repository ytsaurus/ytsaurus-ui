import React from 'react';
import UIFactory from '../../../../UIFactory';

interface Props {
    value: {slug: string; id: number} | undefined;
    onChange: (v?: Props['value']) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function AbcControl(props: Props) {
    const control = UIFactory.renderControlAbcService(props);
    return <>{control || '-'}</>;
}

AbcControl.getDefaultValue = () => {
    return undefined;
};
