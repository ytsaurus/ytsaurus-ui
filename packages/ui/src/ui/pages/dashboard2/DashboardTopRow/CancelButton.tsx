import React from 'react';
import {Button} from '@gravity-ui/uikit';

export function CancelButton({onCancel}: {onCancel: () => void}) {
    return (
        <Button size={'m'} view={'action'} onClick={onCancel}>
            Cancel
        </Button>
    );
}
