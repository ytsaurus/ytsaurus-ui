import * as React from 'react';
import {Select} from '@gravity-ui/uikit';
import {useCallback} from 'react';
import {useQueryACO} from '../useQueryACO';
import './QueryACOSelect.scss';
import {selectIsMultipleAco} from '../../module/query_aco/selectors';
import {useSelector} from 'react-redux';
import {hideSharedAco} from './hideSharedAco';

export const QueryACOSelect: React.FunctionComponent<{}> = () => {
    const isMultipleAco = useSelector(selectIsMultipleAco);
    const {selectACOOptions, isFlight, changeDraftQueryACO, currentDraftQueryACO} = useQueryACO();

    const handleACOChange = useCallback(
        (value: string[]) => {
            return changeDraftQueryACO({aco: value});
        },
        [changeDraftQueryACO],
    );

    return (
        <>
            <Select<string>
                filterable
                disabled={isFlight}
                width={'auto'}
                label="Access:"
                className={'query-aco-select'}
                options={hideSharedAco(selectACOOptions)}
                value={hideSharedAco(currentDraftQueryACO)}
                onUpdate={handleACOChange}
                multiple={isMultipleAco}
            />
        </>
    );
};
