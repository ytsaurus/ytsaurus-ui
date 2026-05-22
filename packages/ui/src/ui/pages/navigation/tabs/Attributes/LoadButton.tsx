import React, {useCallback} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import {ArrowDownToLine} from '@gravity-ui/icons';

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
        <Button
            className={className}
            onClick={handleRequestLoad}
            size="xs"
            loading={loading}
            qa="load-button"
        >
            <Icon data={ArrowDownToLine} size={12} />
        </Button>
    );
};
