import React from 'react';
import cn from 'bem-cn-lite';

import {ClipboardButton, MetaTable} from '@ytsaurus/components';
import {Yson} from '../../../../../components/Yson/Yson';
import {type AccessLogTransactionInfo} from '../../../../../store/reducers/navigation/tabs/access-log/access-log';
import i18n from './i18n';

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
                    key: 'id',
                    label: i18n('field_id'),
                    value: <CopyText text={data.transaction_id} />,
                },
                {
                    key: 'title',
                    label: i18n('field_title'),
                    value: <CopyText text={data.transaction_title || ''} />,
                    visible: Boolean(data.transaction_title),
                },
                {
                    key: 'operation-id',
                    label: i18n('field_operation-id'),
                    value: <CopyText text={data.operation_id || ''} />,
                    visible: Boolean(data.operation_id),
                },
                {
                    key: 'operation-title',
                    label: i18n('field_operation-title'),
                    value: <CopyText text={data.operation_title || ''} />,
                    visible: Boolean(data.operation_title),
                },
                {
                    key: 'parent',
                    label: i18n('field_parent'),
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
