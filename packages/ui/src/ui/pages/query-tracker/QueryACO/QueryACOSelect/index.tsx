import * as React from 'react';
import {Select} from '@gravity-ui/uikit';
import {useCallback} from 'react';
import {useQueryACO} from '../useQueryACO';
import './QueryACOSelect.scss';
import {selectIsMultipleAco} from '../../../../store/selectors/query-tracker/queryAco';
import {useSelector} from '../../../../store/redux-hooks';
import {hideSharedAco} from './hideSharedAco';
import i18n from './i18n';

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
                label={i18n('field_access')}
                className={'query-aco-select'}
                options={hideSharedAco(selectACOOptions)}
                value={hideSharedAco(currentDraftQueryACO)}
                onUpdate={handleACOChange}
                multiple={isMultipleAco}
            />
        </>
    );
};
