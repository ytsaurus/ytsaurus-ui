import React, {FC} from 'react';
import {Tooltip} from '../../../../../../components/Tooltip/Tooltip';
import ypath from '../../../../../../common/thor/ypath';
import hammer from '../../../../../../common/hammer';
import {Flex, Icon} from '@gravity-ui/uikit';
import CircleQuestionIcon from '@gravity-ui/icons/svgs/circle-question.svg';
import map_ from 'lodash/map';
import MetaTable from '../../../../../../components/MetaTable/MetaTable';
import {RawJob} from '../../../../../../types/operations/job';

type Props = {
    statistics: RawJob['statistics'];
    type: string;
};

const prepareStatistics = (statistics: RawJob['statistics']) => {
    return map_(ypath.getValue(statistics), (value, key: string) => {
        let result = hammer.format.Number(value);

        if (key.endsWith('_data_size') || key.endsWith('_data_weight')) {
            result = hammer.format.Bytes(value);
        } else if (key.endsWith('_time')) {
            result = hammer.format.TimeDuration(value, {format: 'milliseconds'});
        }

        return {
            key: hammer.format.Readable(key),
            value: <div style={{textAlign: 'right'}}>{result}</div>,
        };
    });
};

export const JobDetails: FC<Props> = ({statistics, type}) => {
    if (!statistics || type === 'vanilla') return null;

    const [rowCount, dataSize] = ypath.getValues(statistics, [
        '/processed_input_row_count',
        '/processed_input_uncompressed_data_size',
    ]);

    if (!rowCount && !dataSize) return null;

    return (
        <Tooltip content={<MetaTable items={prepareStatistics(statistics)} />}>
            <Flex gap={2} alignItems="center" wrap>
                <span>{hammer.format['Number'](rowCount)}</span>
                <span>({hammer.format['Bytes'](dataSize)})</span>
                <Icon data={CircleQuestionIcon} size={16} />
            </Flex>
        </Tooltip>
    );
};
