import React, {useCallback, useRef, useState} from 'react';
import cn from 'bem-cn-lite';

import MetaTable from '../../../components/MetaTable/MetaTable';
// @ts-ignore
import format from '../../../common/hammer/format';
import {useUpdater} from '../../../hooks/use-updater';
import {getStateForHost, loadMasters} from '../../../store/actions/system/masters';
import {useDispatch} from 'react-redux';
import moment from 'moment';

const block = cn('operation-short-info');

interface Props {
    newLeaderAddress: string;
}

export function SwitchLeaderShortInfo(props: Props) {
    const startTime = useRef(moment.now());
    const [currentTime, setCurrentTime] = useState<any>(moment());
    const [finishTime, setFinishTime] = useState<any>();
    const dispatch = useDispatch();

    const updateFn = useCallback(async () => {
        if (finishTime) {
            return;
        }

        const hostState = await getStateForHost(props.newLeaderAddress);

        setCurrentTime(moment());

        if (hostState === 'leading') {
            setFinishTime(moment());
            dispatch(loadMasters());
        }
    }, [finishTime, currentTime]);

    useUpdater(updateFn, {timeout: 3 * 1000});

    return (
        <div className={block()}>
            <MetaTable
                items={[
                    {
                        key: 'Duration',
                        value: format.TimeDuration(
                            (finishTime || currentTime).diff(startTime.current),
                        ),
                    },
                    {
                        key: 'Status',
                        value: (
                            <SwitchLeaderShortInfoStatus
                                state={finishTime ? 'Complete' : 'In progress'}
                            />
                        ),
                    },
                ]}
            />
        </div>
    );
}

function SwitchLeaderShortInfoStatus({state}: {state: string}) {
    return <span className={block('state', {state})}>{state}</span>;
}
