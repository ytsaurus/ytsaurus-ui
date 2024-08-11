import React from 'react';
import cn from 'bem-cn-lite';

import Icon from '../../components/Icon/Icon';
import Link from '../../components/Link/Link';
import Button from '../../components/Button/Button';
import {Tooltip} from '../../components/Tooltip/Tooltip';

import {Page} from '../../constants/index';
import {Tab} from '../../constants/scheduling';

import './OperationPool.scss';

const block = cn('operation-pool');

const renderButton = (onEdit?: () => void, reserve?: boolean) => {
    return !onEdit ? null : (
        <span className={block('pool-edit', {reserve})}>
            <Button size="s" view="flat-secondary" onClick={onEdit} title="Edit pool">
                <Icon awesome="pencil" />
            </Button>
        </span>
    );
};

export type OperationPoolProps = {
    className?: string;
    cluster: string;
    reserveEditButton?: boolean;
    compact?: boolean;
    onEdit?: () => void;
    state?: 'completed' | 'failed' | 'aborted' | string;
    pool: {
        pool: string;
        tree: string;
        isEphemeral?: boolean;
        weight?: number;
    };
    erased?: boolean;
};

export function OperationPool({
    className,
    cluster,
    reserveEditButton,
    compact = false,
    onEdit,
    pool,
    state,
    erased,
}: OperationPoolProps) {
    const url = `/${cluster}/${Page.SCHEDULING}/${Tab.OVERVIEW}?pool=${pool.pool}&tree=${pool.tree}`;
    const isCorrectState = state !== 'completed' && state !== 'failed' && state !== 'aborted';
    const title = `${pool.pool} [${pool.tree}]`;
    const isEphemeral = pool.isEphemeral;

    return (
        <li className={block(null, className)} key={pool.tree}>
            <span className="elements-ellipsis">
                <Link url={url} title={title}>
                    {!compact && <Icon awesome="tasks" />}
                    <span className={block('pool-link', {compact})}>{pool.pool}</span>
                </Link>

                {!compact && (
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

            {!compact && isEphemeral && (
                <Tooltip content="Ephemeral pool">
                    <Icon awesome="ghost" />
                </Tooltip>
            )}
            {isCorrectState && renderButton(onEdit, reserveEditButton)}
        </li>
    );
}
