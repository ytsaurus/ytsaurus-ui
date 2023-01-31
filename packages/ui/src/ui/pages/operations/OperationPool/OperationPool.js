import React from 'react';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';

import Icon from '../../../components/Icon/Icon';
import Link from '../../../components/Link/Link';
import Button from '../../../components/Button/Button';

import {Page} from '../../../constants/index';
import {Tab} from '../../../constants/scheduling';

import './OperationPool.scss';
import {Tooltip} from '../../../components/Tooltip/Tooltip';

OperationPool.poolType = PropTypes.shape({
    tree: PropTypes.string.isRequired,
    pool: PropTypes.string.isRequired,
    weight: PropTypes.number.isRequired,
    isEphemeral: PropTypes.bool,
});

OperationPool.propTypes = {
    pool: OperationPool.poolType.isRequired,
    cluster: PropTypes.string.isRequired,

    state: PropTypes.string,
    onEdit: PropTypes.func,
    compact: PropTypes.bool,
};

OperationPool.defaultProps = {
    compact: false,
};

const block = cn('operation-pool');

const renderButton = (onEdit, reserve) => {
    return !onEdit ? null : (
        <Button
            size="s"
            view="flat-secondary"
            onClick={onEdit}
            title="Edit pool"
            className={block('pool-edit', {reserve})}
        >
            <Icon awesome="pencil" />
        </Button>
    );
};

function OperationPool(props) {
    const {cluster, reserveEditButton, compact, onEdit, pool, state, erased} = props;
    const url = `/${cluster}/${Page.SCHEDULING}/${Tab.OVERVIEW}?pool=${pool.pool}&tree=${pool.tree}`;
    const isCorrectState = state !== 'completed' && state !== 'failed' && state !== 'aborted';
    const title = `${pool.pool} [${pool.tree}]`;
    const isEphemeral = pool.isEphemeral;

    return (
        <li className={block()} key={pool.tree}>
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

export default OperationPool;
