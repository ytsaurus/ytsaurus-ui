import * as React from 'react';
import {Select} from '@gravity-ui/uikit';
import {useCallback} from 'react';
import {useQueryACO} from '../useQueryACO';

import './QueryACOSelect.scss';
export const QueryACOSelect: React.FunctionComponent<{}> = () => {
    const {selectACOOptions, isFlight, changeDraftQueryACO, currentDraftQueryACO} = useQueryACO();

    const handleACOChange = useCallback(
        (value: string[]) => {
            const aco = value[0];

            return changeDraftQueryACO({aco});
        },
        [changeDraftQueryACO],
    );

    return (
        <Select<string>
            filterable
            disabled={isFlight}
            width={'auto'}
            pin="clear-round"
            label="Query access:"
            className={'query-aco-select'}
            options={selectACOOptions}
            value={[currentDraftQueryACO]}
            onUpdate={handleACOChange}
        />
    );
};
