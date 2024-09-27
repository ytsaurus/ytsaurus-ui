import React from 'react';
import PropTypes from 'prop-types';

import forEach_ from 'lodash/forEach';
import isEmpty_ from 'lodash/isEmpty';
import values_ from 'lodash/values';

import {Progress} from '@gravity-ui/uikit';

import hammer from '../../../../common/hammer';
import Account from '../../../../pages/accounts/selector';
import {isNull} from '../../../../utils';

import {STACKED_PROGRESS_BAR_COLORS} from '../../../../constants/colors';
import {getAccountName} from '../../../../store/selectors/accounts/accounts';
import {ProgressTooltip} from './ProgressTooltip';
import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';
import {
    ACCOUNT_RESOURCE_TYPES_DESCRIPTION,
    AccountResourceName,
} from '../../../../constants/accounts/accounts';
import {Tooltip} from '../../../../components/Tooltip/Tooltip';

const colors = STACKED_PROGRESS_BAR_COLORS;

function prepareProgressStack(treeItem, useChildren, getTreeItemInfoFn) {
    if (!treeItem) {
        return {};
    }

    const recursiveInfo = getTreeItemInfoFn(treeItem, true);
    if (isEmpty_(recursiveInfo)) {
        return {};
    }
    const {
        limit = 0,
        progressText,
        committed: recursiveCommitted = 0,
        uncommitted: recursiveUncommitted = 0,
    } = recursiveInfo;

    const children = treeItem.children;
    const items = useChildren && children.length > 0 ? [treeItem, ...children] : [treeItem];

    const allLimit = Math.max(recursiveCommitted + recursiveUncommitted, limit);

    let colorIndex = 0;
    const progressStack = [];
    const tooltipInfo = [];

    forEach_(items, (item, index) => {
        if (item.isAggregation) {
            return;
        }

        const recursive = index !== 0 || !useChildren;
        const {committed, uncommitted, limit, progress, theme} = getTreeItemInfoFn(item, recursive);
        const [committedEl, uncommittedEl] = Account.prepareProgressStack(
            committed,
            uncommitted,
            allLimit,
            theme,
        );

        const tooltipItem = {
            name: getAccountName(item),
            committed,
            limit,
        };
        if (progress > 0) {
            if (useChildren && children.length > 0) {
                tooltipItem.color = committedEl.color = colors[(4 + colorIndex++) % colors.length];
            }
            progressStack.push(committedEl, uncommittedEl);
            tooltipInfo.push(tooltipItem);
        } else if (index === 0) {
            // children should be rendered with different color
            ++colorIndex;
        }
    });
    return {progressText, progressStack, tooltipInfo: tooltipInfo, limit};
}

function ProgressStackImpl({
    treeItem,
    infoGetter,
    useChildren,
    className,
    formatNumber,
    popupClassName,
}) {
    if (!treeItem || treeItem.isAggregation) {
        return hammer.format.NO_VALUE;
    }

    try {
        const {value, progressText, progressStack, tooltipInfo, limit} = prepareProgressStack(
            treeItem,
            useChildren,
            infoGetter,
        );
        if (isNull(value) && isNull(progressStack)) {
            return hammer.format.NO_VALUE;
        }
        const progressValue =
            !progressStack || !progressStack.length
                ? value
                : progressStack.reduce((acc, {value}) => (isNaN(value) ? acc : acc + value), 0);
        const progress = (
            <Progress value={progressValue} stack={progressStack} text={progressText} />
        );

        if (!useChildren) {
            return progress;
        }

        return (
            <Tooltip
                className={className}
                content={
                    <ProgressTooltip info={tooltipInfo} limit={limit} formatNumber={formatNumber} />
                }
                placement={['right', 'left', 'top', 'bottom']}
                tooltipClassName={popupClassName}
            >
                {progress}
            </Tooltip>
        );
    } catch (err) {
        console.error(err);
        return hammer.format.NO_VALUE;
    }
}

const ProgressStackTypeProp = PropTypes.oneOf(values_(AccountResourceName));

ProgressStackByTreeItem.propTypes = {
    className: PropTypes.string,
    popupClassName: PropTypes.string,
    activeAccount: PropTypes.string,
    mediumType: PropTypes.string,

    type: ProgressStackTypeProp.isRequired,
    treeItem: PropTypes.object.isRequired,
};

export function ProgressStackByTreeItem({
    treeItem,
    activeAccount,
    type,
    mediumType,
    className,
    popupClassName,
}) {
    const accountName = getAccountName(treeItem);
    const isActiveAccount = activeAccount === accountName;
    const {format = 'Number', getInfo} = ACCOUNT_RESOURCE_TYPES_DESCRIPTION[type];
    const infoGetter = (item, recursive) => {
        const {attributes: account} = item;
        return getInfo(account, recursive, mediumType);
    };
    const formatNumber = hammer.format[format];
    return (
        <ErrorBoundary>
            <ProgressStackImpl
                {...{
                    treeItem,
                    infoGetter,
                    useChildren: isActiveAccount,
                    formatNumber,
                    className,
                    popupClassName,
                }}
            />
        </ErrorBoundary>
    );
}
