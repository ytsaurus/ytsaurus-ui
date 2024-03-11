import React, {FC, useCallback} from 'react';
import {ErrorPosition, QueryError} from '../../module/api';
import {useToggle} from 'react-use';
import {Button, Icon, Link} from '@gravity-ui/uikit';
import showParentIcon from '@gravity-ui/icons/svgs/arrow-up.svg';
import {getIssuePosition} from '../helpers';
import cn from 'bem-cn-lite';
import {ErrorList} from './ErrorList';
import {CollapsedString} from '../../../../components/CollapsedString';
import errorIcon from '@gravity-ui/icons/svgs/triangle-exclamation-fill.svg';
import './ErrorTreeNode.scss';
import {ExpandButton} from '../../../../components/ExpandButton';
import ChevronUpIcon from '@gravity-ui/icons/svgs/chevron-up.svg';
import ChevronDownIcon from '@gravity-ui/icons/svgs/chevron-down.svg';
import unipika from '../../../../common/thor/unipika';
import Yson from '../../../../components/Yson/Yson';

const block = cn('yt-error-tree-node');

type Props = {
    error: QueryError;
    expanded?: boolean;
    level?: number;
    fromCloud?: boolean;
    disableCloud?: boolean;
    onErrorClick: (data: ErrorPosition) => void;
    onShowParent?: () => void;
};

export const ErrorTreeNode: FC<Props> = ({
    error,
    expanded = false,
    level = 0,
    fromCloud = false,
    disableCloud = false,
    onErrorClick,
    onShowParent,
}) => {
    const [expandedError, toggleExpandedError] = useToggle(expanded);
    const [expandedAttributes, toggleExpandedAttributes] = useToggle(false);
    const hasIssues = error.inner_errors && error.inner_errors.length > 0;
    const position = getIssuePosition(error);

    const handleIssueClick = useCallback(() => {
        if (error.attributes?.start_position) {
            onErrorClick(error.attributes.start_position);
        }
    }, [error.attributes.start_position, onErrorClick]);

    return (
        <div className={block({leaf: !hasIssues})}>
            <div className={block('error-body')}>
                <div className={block('line')}>
                    {hasIssues && (
                        <ExpandButton
                            expanded={expandedError}
                            toggleExpanded={toggleExpandedError}
                        />
                    )}
                    {fromCloud && (
                        <Button view="flat-secondary" title="Show parent" onClick={onShowParent}>
                            <Icon data={showParentIcon} size={16} />
                        </Button>
                    )}
                    <span className={block('header')}>
                        <Icon className={block('icon')} data={errorIcon} size={16} />
                        <span className={block('title')}>Error</span>
                        <Button view="flat-secondary" onClick={toggleExpandedAttributes}>
                            Attributes{' '}
                            <Icon
                                data={expandedAttributes ? ChevronUpIcon : ChevronDownIcon}
                                size={16}
                            />
                        </Button>
                    </span>
                    {position ? (
                        <Link
                            view="primary"
                            className={block('message')}
                            onClick={handleIssueClick}
                        >
                            <span className={block('place-text')} title="Position">
                                {position}
                            </span>
                            <div className={block('message-text')}>
                                <CollapsedString value={error.message} />
                            </div>
                        </Link>
                    ) : (
                        <span className={block('message')}>
                            <div className={block('message-text')}>
                                <CollapsedString value={error.message} />
                            </div>
                        </span>
                    )}
                    {error.code ? <span className={block('code')}>Code: {error.code}</span> : null}
                </div>
                {expandedAttributes && (
                    <Yson value={error.attributes} settings={unipika.prepareSettings({})} />
                )}
            </div>
            {hasIssues && expandedError && (
                <div className={block('errors')}>
                    <ErrorList
                        errors={error.inner_errors!}
                        level={level + 1}
                        expanded={expandedError}
                        disableCloud={disableCloud}
                        onErrorClick={onErrorClick}
                    />
                </div>
            )}
        </div>
    );
};
