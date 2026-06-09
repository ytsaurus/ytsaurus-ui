import React, {useCallback} from 'react';
import {ActionTooltip, Button, Icon} from '@gravity-ui/uikit';
import {ArrowDownToLine} from '@gravity-ui/icons';

import i18n from './i18n';

type Props = {
    ypath: string;
    loading: boolean;
    onRequestLoadPath: (ypath: string) => void;
    className?: string;
};

export const LoadButton = (props: Props) => {
    const {className, ypath, loading, onRequestLoadPath} = props;

    const handleRequestLoad = useCallback(() => {
        onRequestLoadPath(ypath);
    }, [onRequestLoadPath, ypath]);

    return (
        <ActionTooltip title={i18n('action_load-opaque-attribute')}>
            <Button
                className={className}
                onClick={handleRequestLoad}
                size="xs"
                loading={loading}
                qa="load-button"
            >
                <Icon data={ArrowDownToLine} size={12} />
            </Button>
        </ActionTooltip>
    );
};
