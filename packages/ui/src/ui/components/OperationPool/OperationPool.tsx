import React from 'react';
import cn from 'bem-cn-lite';

import Icon from '../../components/Icon/Icon';
import Link from '../../components/Link/Link';
import Button from '../../components/Button/Button';
import {Tooltip} from '../../components/Tooltip/Tooltip';

import {Page} from '../../constants/index';
import {Tab} from '../../constants/scheduling';

import {LightWeightIcon} from './LightWeightIcon';

import './OperationPool.scss';

const block = cn('operation-pool');

const renderButton = (
    onEdit?: () => void,
    {
        detachable,
        visibility,
    }: {detachable?: boolean; visibility?: OperationPoolProps['editBtnVisibility']} = {},
) => {
    return !onEdit ? null : (
        <span
            className={block('pool-edit', {
                detachable: detachable && visibility !== 'always',
                visibility,
            })}
        >
            <Button size="s" view="flat-secondary" onClick={onEdit} title="Edit pool">
                <Icon awesome="pencil" />
            </Button>
        </span>
    );
};

export type OperationPoolProps = {
    operationRefId?: string;
    className?: string;
    cluster: string;
    allowDetachEditBtn?: boolean;
    onEdit?: () => void;
    editBtnVisibility?: 'always' | 'by-hover';
    state?: 'completed' | 'failed' | 'aborted' | string;
    pool: {
        pool: string;
        tree: string;
        isEphemeral?: boolean;
        isLightweight?: boolean;
        weight?: number;
    };
    erased?: boolean;
    hideIcon?: boolean;
    hideTree?: boolean;

    routed?: boolean;
};

export function OperationPool({
    operationRefId,
    className,
    cluster,
    allowDetachEditBtn,
    onEdit,
    editBtnVisibility = 'by-hover',
    pool,
    state,
    erased,
    hideIcon,
    hideTree,
    routed,
}: OperationPoolProps) {
    const url =
        `/${cluster}/${Page.SCHEDULING}/${Tab.OVERVIEW}?pool=${pool.pool}&tree=${pool.tree}` +
        (operationRefId ? `&operation_ref=${operationRefId}` : '');
    const isCorrectState = state !== 'completed' && state !== 'failed' && state !== 'aborted';
    const title = `${pool.pool} [${pool.tree}]`;
    const {isEphemeral, isLightweight} = pool;

    return (
        <li className={block(null, className)} key={pool.tree}>
            <span className="elements-ellipsis">
                <Link url={url} title={title} theme="primary" routed={routed}>
                    {!hideIcon && <Icon awesome="tasks" size={14} />}
                    <span className={block('pool-link', {'no-icon': hideIcon})}>{pool.pool}</span>
                </Link>

                {!hideTree && (
                    <span className={block('pool-tree')}>
                        [
                        <span
                            className={block('pool-tree-name', {
                                erased: Boolean(erased),
                            })}
                        >
                            {pool.tree}
                        </span>
                        ]
                    </span>
                )}
            </span>

            {!hideIcon && isEphemeral && (
                <Tooltip content="Ephemeral pool">
                    <Icon awesome="ghost" />
                </Tooltip>
            )}
            {!hideIcon && isLightweight && <LightWeightIcon />}
            {isCorrectState &&
                renderButton(onEdit, {
                    detachable: allowDetachEditBtn,
                    visibility: editBtnVisibility,
                })}
        </li>
    );
}
