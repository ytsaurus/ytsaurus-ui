import React, {FC} from 'react';
import block from 'bem-cn-lite';
import {QueryFullResult, QueryResultMeta} from '../../../../types/query-tracker/api';
import './QueryFullResultList.scss';
import {QueryFullResultRow} from './QueryFullResultRow';
import {QueryEngine} from '../../../../../shared/constants/engines';

type Props = {
    fullResult: Required<QueryResultMeta>['full_result'];
    engine: QueryEngine;
    className?: string;
};

const b = block('query-full-result-list');

export const QueryFullResultList: FC<Props> = ({fullResult, engine, className}) => {
    const items: QueryFullResult[] = Array.isArray(fullResult) ? fullResult : [fullResult];

    return (
        <div className={b(null, className)}>
            {items.map(({exist, cluster, table_path}, index) => {
                return (
                    <QueryFullResultRow
                        id={index + 1}
                        engine={engine}
                        key={`${cluster}:${table_path}`}
                        cluster={cluster}
                        path={table_path}
                        isExist={Boolean(exist)}
                    />
                );
            })}
        </div>
    );
};
