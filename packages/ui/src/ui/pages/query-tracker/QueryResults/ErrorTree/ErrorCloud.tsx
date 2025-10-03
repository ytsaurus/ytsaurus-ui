import {ErrorPosition, QueryError} from '../../../../types/query-tracker/api';
import {useToggle} from 'react-use';
import {Text} from '@gravity-ui/uikit';
import React, {FC, useCallback, useState} from 'react';
import {ErrorTreeNode} from './ErrorTreeNode';
import {ErrorList} from './ErrorList';
import cn from 'bem-cn-lite';
import {calculateCloudLevel} from '../helpers';
import './ErrorCloud.scss';
import {ExpandButton} from '../../../../components/ExpandButton';
import {ClickableText} from '../../../../components/ClickableText/ClickableText';

const block = cn('yt-error-cloud');

type Props = {
    error: QueryError;
    initialExpanded: boolean;
    disableCloud: boolean;
    level: number;
    onErrorClick: (data: ErrorPosition) => void;
    onShowParent?: () => void;
    fromCloud?: boolean;
};
export const ErrorCloud: FC<Props> = (props) => {
    const {error, level, disableCloud, onErrorClick, onShowParent, fromCloud} = props;
    const [expanded, toggleExpanded] = useToggle(props.initialExpanded);
    const [extracted, setExtracted] = useState(0);

    const handleExtractLevel = useCallback(() => {
        setExtracted((prevState) => prevState + 1);
    }, []);

    const handleExtractAll = useCallback(() => {
        setExtracted(calculateCloudLevel(error).length);
    }, [error]);

    const cloud = calculateCloudLevel(error, extracted);

    if (!disableCloud && cloud.length > 1) {
        return (
            <div>
                <div className={block('collapsed-messages')}>
                    <ExpandButton expanded={expanded} toggleExpanded={toggleExpanded} />
                    <Text color="secondary">{cloud.length} intermediate messages</Text>
                    <ClickableText
                        className={block('collapsed-messages-show-all')}
                        onClick={handleExtractAll}
                    >
                        Show all
                    </ClickableText>
                </div>
                {expanded && (
                    <div className={block('errors')}>
                        <ErrorList
                            errors={[{...cloud.issue}]}
                            level={level + 1}
                            expanded={expanded}
                            disableCloud
                            onErrorClick={onErrorClick}
                            onShowParent={handleExtractLevel}
                            fromCloud
                        />
                    </div>
                )}
            </div>
        );
    }
    return (
        <ErrorTreeNode
            error={error}
            level={level}
            expanded={expanded}
            fromCloud={fromCloud}
            disableCloud
            onErrorClick={onErrorClick}
            onShowParent={onShowParent}
        />
    );
};
