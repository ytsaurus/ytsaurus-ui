import React from 'react';
import cn from 'bem-cn-lite';

import {CypressNodeRaw} from '../../../../../shared/yt-types';

import ypath from '../../../../common/thor/ypath';
import format from '../../../../common/hammer/format';
import OperationIOLink, {
    OperationIOLinkProps,
} from '../../../../pages/operations/OperationIOLink/OperationIOLink';
import {isTransactionAlive, isValidTransactionId} from '../../../../utils/operations/detail';

import './PathItem.scss';

const block = cn('yt-operations-list-path-item');

type PathItemProps = {
    caption: string;
    item: Omit<OperationIOLinkProps, 'path'> & {
        table: CypressNodeRaw<{transaction_id?: string}, string>;
        count: number;
    };
    user_transaction_id?: string;
    transaction_id?: string;
};

export function PathItem({caption, item, transaction_id, user_transaction_id}: PathItemProps) {
    const {table, count, ...rest} = item;
    const [activeTransaction, setActiveTransaction] = React.useState<string | undefined>();

    React.useEffect(() => {
        const tableTx = ypath.getValue(table, '/@transaction_id');
        if (isValidTransactionId(tableTx)) {
            return setActiveTransaction(tableTx);
        }
        if (isValidTransactionId(transaction_id)) {
            return setActiveTransaction(transaction_id);
        }

        isTransactionAlive(user_transaction_id).then(() =>
            setActiveTransaction(user_transaction_id),
        );
    }, [table, user_transaction_id, transaction_id]);

    return (
        <div key={caption} className={block(null, 'elements-meta-item')}>
            <div className="elements-meta-item__key">{format.ReadableField(caption)}</div>
            <div className="elements-meta-item__value">
                <span className={block('item-io')}>
                    <span className={block('item-count')}>{count}</span>
                    {
                        <OperationIOLink
                            path={ypath.getValue(table)}
                            {...rest}
                            transaction={activeTransaction}
                            theme={'ghost'}
                            className={block('item-io-table')}
                        />
                    }
                </span>
            </div>
        </div>
    );
}
