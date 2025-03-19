import React, {useEffect, useState} from 'react';
import moment, {Moment} from 'moment';
import {useSelector} from 'react-redux';

import format from '../../../../../../common/hammer/format';
import MetaTable from '../../../../../../components/MetaTable/MetaTable';

import {RootState} from '../../../../../../store/reducers';
import {getDownloadTableInfo} from '../../../../../../store/selectors/navigation/content/download-manager';

interface Props {
    id: string;
    filename: string;
}

export function DownloadShortInfo({id, filename}: Props) {
    const [time, setTime] = useState<Moment>(moment());
    const {startTime, loading, loaded} =
        useSelector((state: RootState) => getDownloadTableInfo(state, id)) ?? {};

    useEffect(() => {
        if (loaded && !loading) return;
        const interval = setInterval(() => {
            setTime(moment());
        }, 1000);

        return () => clearInterval(interval);
    }, [loaded, loading]);

    const diff = moment(time).diff(startTime);

    return (
        <MetaTable
            items={[
                {
                    key: 'Filename',
                    value: filename,
                    visible: Boolean(filename),
                },
                {
                    key: 'Duration',
                    value: format.TimeDuration(diff),
                    visible: Boolean(format.TimeDuration(diff)),
                },
            ]}
        />
    );
}
