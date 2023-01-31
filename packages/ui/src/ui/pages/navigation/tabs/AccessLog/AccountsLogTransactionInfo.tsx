import React from 'react';
import cn from 'bem-cn-lite';

import MetaTable from '../../../../components/MetaTable/MetaTable';
import Yson from '../../../../components/Yson/Yson';
import {AccessLogTransactionInfo} from '../../../../store/reducers/navigation/tabs/access-log/access-log';
import ClipboardButton from '../../../../components/ClipboardButton/ClipboardButton';

import './AccountsLogTransactionInfo.scss';

const block = cn('accounts-log-transaction-info');

interface Props {
    data: AccessLogTransactionInfo;
}

function TransactionInfo(props: Props) {
    const {data} = props;
    return (
        <MetaTable
            items={[
                {
                    key: 'Id',
                    value: <CopyText text={data.transaction_id} />,
                },
                {
                    key: 'Title',
                    value: <CopyText text={data.transaction_title || ''} />,
                    visible: Boolean(data.transaction_title),
                },
                {
                    key: 'Operation Id',
                    value: <CopyText text={data.operation_id || ''} />,
                    visible: Boolean(data.operation_id),
                },
                {
                    key: 'Operation title',
                    value: <CopyText text={data.operation_title || ''} />,
                    visible: Boolean(data.operation_title),
                },
                {
                    key: 'Parent',
                    value: <Yson value={data.parent} />,
                    visible: Boolean(data.parent),
                },
            ]}
        />
    );
}

function CopyText({text, copyText}: {text: string; copyText?: string}) {
    return (
        <div className={block('copy')}>
            <span className={block('copy-text')}>{text}</span>
            <ClipboardButton
                className={block('copy-btn')}
                view="flat-secondary"
                text={copyText ?? text}
            />
        </div>
    );
}

export default React.memo(TransactionInfo);
