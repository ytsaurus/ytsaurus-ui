import React from 'react';
import cn from 'bem-cn-lite';

import format from '../../../../common/hammer/format';
import i18n from '../i18n';

import Label from '../../../../components/Label';
import Link from '../../../../containers/Link/Link';
import ChartLink from '../../../../components/ChartLink/ChartLink';
import Icon from '../../../../components/Icon/Icon';
import ColumnHeader from '../../../../components/ColumnHeader/ColumnHeader';

import {lastWord, printUsageLimit} from '../../../../utils';
import ClickableAttributesButton from '../../../../components/AttributesButton/ClickableAttributesButton';
import {makeNavigationLink} from '../../../../utils/app-url';
import {ClipboardButton, Tooltip} from '@ytsaurus/components';
import {Progress} from '@gravity-ui/uikit';
import {computeProgress, getProgressTheme} from '../../../../utils/progress';
import {type OrderType} from '../../../../utils/sort-helpers';

import {type ColumnRenderProps, type ColumnsParams, type RowData} from './types';
import './CellsBundleController.scss';

export const block = cn('cells-bundle-controller');

type RenderColumnHeaderParams = ColumnsParams & {
    column: keyof RowData;
    title: string;
    allowedOrderTypes?: Array<OrderType>;
};

export const renderColumnHeader = ({
    column,
    title,
    sortState,
    onSortChange,
    allowedOrderTypes,
}: RenderColumnHeaderParams) => {
    if (!onSortChange) {
        return title;
    }

    const {column: sortColumn, order} = sortState ?? {};

    return (
        <ColumnHeader
            column={column}
            title={title}
            order={sortColumn === column ? order : undefined}
            onSort={onSortChange}
            allowedOrderTypes={allowedOrderTypes}
            withUndefined={!allowedOrderTypes}
        />
    );
};

export const renderAddress = (props: ColumnRenderProps<RowData>) => {
    const {url, address} = props.row;
    return (
        <span>
            <Link className={block('address-host')} url={url} routed>
                {address}
            </Link>
            {address && (
                <ClipboardButton text={address} view={'flat'} inlineMargins visibleOnRowHover />
            )}
        </span>
    );
};

export const renderType = (props: ColumnRenderProps<RowData>) => {
    const {memory, vcpu} = props.row.data?.resource || {};
    const formattedMemory = format.Bytes(memory);
    const formattedVcpu = format.vCores(vcpu);
    return (
        <div>
            {formattedMemory}, {formattedVcpu}
        </div>
    );
};

export const renderStaticMemory = (props: ColumnRenderProps<RowData>) => {
    const {tablet_static_memory} = props.row;
    if (!tablet_static_memory) {
        return format.NO_VALUE;
    }

    const {used, limit} = tablet_static_memory;
    const text = printUsageLimit(format.Bytes(used), format.Bytes(limit));
    const progress = computeProgress(used, limit) ?? 0;
    return <Progress value={progress} theme={getProgressTheme(progress)} text={text} />;
};

export const renderAllocationRequest = (props: ColumnRenderProps<RowData>) => {
    const {hulkRequestPath} = props.row;
    if (!hulkRequestPath) {
        return format.NO_VALUE;
    }

    const {suffix: uuid} = lastWord(hulkRequestPath, '/');
    return (
        <span className={block('alloc-request')}>
            <ClickableAttributesButton
                className={block('alloc-request-attrs')}
                title={uuid}
                exactPath={hulkRequestPath}
            />
            <Link
                className={block('alloc-request-url')}
                url={makeNavigationLink({path: hulkRequestPath})}
            >
                {uuid}
            </Link>
        </span>
    );
};

export const renderAllocationState = (props: ColumnRenderProps<RowData>) => {
    const {allocationState} = props.row;
    const tooltip =
        allocationState === 'IN_PROGRESS' ? i18n('context_in-progress-allocation') : undefined;

    return !allocationState ? (
        format.NO_VALUE
    ) : (
        <Tooltip content={tooltip} useFlex>
            <Label text={format.ReadableField(allocationState.toLocaleLowerCase())} />
            {Boolean(tooltip) && <Icon awesome="question-circle" color="secondary" />}
        </Tooltip>
    );
};

export const renderDeployUrl = (row: RowData) => {
    const {deployUrl} = row;
    return !deployUrl ? null : (
        <Tooltip
            className={block('link-icon')}
            content={i18n('action_deploy')}
            placement={['top-end', 'bottom-end']}
        >
            <ChartLink url={deployUrl} hideIcon>
                <Icon awesome="rocket" face="solid" />
            </ChartLink>
        </Tooltip>
    );
};

export const renderNannyUrl = (row: RowData) => {
    const {nannyUrl} = row;
    if (!nannyUrl) {
        return null;
    }
    return (
        <Tooltip
            className={block('link-icon')}
            content={'Nanny'}
            placement={['top-end', 'bottom-end']}
        >
            <ChartLink url={nannyUrl} hideIcon>
                <Icon awesome={'cloud'} face="solid" />
            </ChartLink>
        </Tooltip>
    );
};

export const renderActions = (props: ColumnRenderProps<RowData>) => {
    return (
        <React.Fragment>
            {renderDeployUrl(props.row)}
            {renderNannyUrl(props.row)}
        </React.Fragment>
    );
};
