import React from 'react';
import {Button} from '@gravity-ui/uikit';

import Icon from '../../../../../../../../components/Icon/Icon';

export function renderControls(
    _item: any,
    _onCreate: (active?: boolean) => void,
    onRemove?: () => void,
) {
    return (
        <Button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                onRemove?.();
                e.stopPropagation();
            }}
        >
            <Icon awesome={'trash-alt'} /> Delete column
        </Button>
    );
}
