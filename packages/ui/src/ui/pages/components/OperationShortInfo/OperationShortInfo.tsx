import React from 'react';
import cn from 'bem-cn-lite';
import moment from 'moment';
import {useSelector} from '../../../store/redux-hooks';

// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {getCluster} from '../../../store/selectors/global';

import MetaTable from '../../../components/MetaTable/MetaTable';
import {showErrorPopup} from '../../../utils/utils';
import format from '../../../common/hammer/format';

import ypath from '../../../common/thor/ypath';
import {TYPED_OUTPUT_FORMAT} from '../../../constants';
import {ClickableText} from '../../../components/ClickableText/ClickableText';
import Link from '../../../components/Link/Link';

import './OperationShortInfo.scss';

const block = cn('operation-short-info');

interface Props {
    id: string;
    type?: string;
    output_attribute_name?: string; // example: '/@spec/output_table_path'
}

export function OperationShortInfo(props: Props) {
    const {id, type, output_attribute_name} = props;

    const [operation, setOperation] = React.useState();

    const finishTimeRaw = ypath.getValue(operation, '/finish_time');
    React.useEffect(() => {
        if (finishTimeRaw) {
            return;
        }
        const timerId = setInterval(() => {
            yt.v3
                .getOperation({
                    output_format: TYPED_OUTPUT_FORMAT,
                    operation_id: id,
                })
                .then((operation: any) => {
                    setOperation(operation);
                });
        }, 3000);
        return () => {
            clearInterval(timerId);
        };
    }, [finishTimeRaw, setOperation]);

    const cluster = useSelector(getCluster);
    const output = output_attribute_name
        ? ypath.getValue(operation, output_attribute_name) || '...'
        : '...';
    const error = ypath.getValue(operation, '/result/error');
    const code = ypath.getValue(error, '/code');

    const startTime = moment(ypath.getValue(operation, '/start_time'));
    const finishTime = moment(finishTimeRaw);
    const diff = finishTime.diff(startTime);

    return (
        <div className={block()}>
            <MetaTable
                items={[
                    {
                        key: 'Id',
                        value: <Link url={`/${cluster}/operations/${id}`}>{id}</Link>,
                    },
                    {
                        key: 'Type',
                        value: (
                            <span className={block('value')}>
                                {ypath.getValue(operation, '/type') || type || '...'}
                            </span>
                        ),
                    },
                    ...(!output_attribute_name
                        ? []
                        : [
                              {
                                  key: 'Output',
                                  value: <span title={output}>{output}</span>,
                              },
                          ]),
                    {
                        key: 'Duration',
                        value: format.TimeDuration(diff),
                    },
                    {
                        key: 'Status',
                        value: (
                            <OperationState state={ypath.getValue(operation, '/state') || '...'} />
                        ),
                    },
                    ...(!code || code === '0'
                        ? []
                        : [
                              {
                                  key: 'Error',
                                  value: (
                                      <ClickableText onClick={() => showErrorPopup(error)}>
                                          {ypath.getValue(error, '/message')}
                                      </ClickableText>
                                  ),
                              },
                          ]),
                ]}
            />
        </div>
    );
}

function OperationState({state}: {state: string}) {
    return <span className={block('state', {state})}>{state}</span>;
}
