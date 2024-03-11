import React, {FC} from 'react';
import {ErrorPosition, QueryError} from '../../module/api';
import {ErrorCloud} from './ErrorCloud';

type Props = {
    errors: QueryError[];
    expanded: boolean;
    disableCloud: boolean;
    level: number;
    onErrorClick: (data: ErrorPosition) => void;
    onShowParent?: () => void;
    fromCloud?: boolean;
};

export const ErrorList: FC<Props> = ({
    errors,
    level,
    expanded,
    onErrorClick,
    onShowParent,
    fromCloud,
    disableCloud,
}) => {
    return (
        <div>
            {errors.map((error, index) => (
                <ErrorCloud
                    key={index}
                    level={level}
                    disableCloud={disableCloud && !(errors.length > 1)}
                    error={error}
                    expanded={expanded}
                    onErrorClick={onErrorClick}
                    onShowParent={onShowParent}
                    fromCloud={fromCloud}
                />
            ))}
        </div>
    );
};
