import React from 'react';
import {Button} from '@gravity-ui/uikit';

export function ImportButton({toggleImportDialog}: {toggleImportDialog: () => void}) {
    return (
        <Button size={'m'} view={'outlined'} onClick={toggleImportDialog}>
            Import config
        </Button>
    );
}
