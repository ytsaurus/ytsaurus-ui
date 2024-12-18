import React, {useRef, useState} from 'react';
import cn from 'bem-cn-lite';

import MetaTable from '../../../components/MetaTable/MetaTable';
// @ts-ignore
import format from '../../../common/hammer/format';
import {getStateForHost, loadMasters} from '../../../store/actions/system/masters';
import {useDispatch} from 'react-redux';
import moment from 'moment';
import './SwitchLeaderShortInfo.scss';
import {useUpdater} from '../../../hooks/use-updater';

const block = cn('switch-leader-short-info');

interface Props {
    newLeaderPath: string;
}

export function SwitchLeaderShortInfo(props: Props) {
    const startTime = useRef(moment.now());
    const [currentTime, setCurrentTime] = useState<any>(moment());
    const [finishTime, setFinishTime] = useState<any>();
    const dispatch = useDispatch();

    const updateCurrentTime = React.useCallback(() => {
        if (!finishTime) {
            setCurrentTime(moment());
        }
    }, [finishTime]);
    useUpdater(updateCurrentTime, {timeout: 1000, forceAutoRefresh: true});

    const updateFn = React.useCallback(async () => {
        if (finishTime) {
            return;
        }

        const hostState = await getStateForHost(props.newLeaderPath);

        if (hostState === 'leading') {
            setFinishTime(moment());
            dispatch(loadMasters());
        }
    }, [props.newLeaderPath, finishTime, dispatch]);
    useUpdater(updateFn, {timeout: 3000, forceAutoRefresh: true});

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
                                state={finishTime ? 'complete' : 'in progress'}
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
