import React, {FC} from 'react';
import {ErrorPosition, QueryError} from '../../module/api';
import {ErrorCloud} from './ErrorCloud';
import {isInfoNode} from './helpers/isInfoNode';

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
                    initialExpanded={isInfoNode(error) ? false : expanded}
                    onErrorClick={onErrorClick}
                    onShowParent={onShowParent}
                    fromCloud={fromCloud}
                />
            ))}
        </div>
    );
};
