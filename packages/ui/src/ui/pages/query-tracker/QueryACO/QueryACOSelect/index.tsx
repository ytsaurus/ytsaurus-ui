import * as React from 'react';
import {Select} from '@gravity-ui/uikit';
import {useCallback} from 'react';
import {useQueryACO} from '../useQueryACO';

import Link from '../../../../components/Link/Link';
import {genNavigationUrl} from '../../../../utils/navigation/navigation';
import Icon from '../../../../components/Icon/Icon';

import './QueryACOSelect.scss';
import {SHARED_QUERY_ACO} from '../../module/query/selectors';
export const QueryACOSelect: React.FunctionComponent<{}> = () => {
    const {selectACOOptions, isFlight, changeDraftQueryACO, currentDraftQueryACO, trackerInfo} =
        useQueryACO();

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
                label="Query access:"
                className={'query-aco-select'}
                options={selectACOOptions}
                value={currentDraftQueryACO}
                onUpdate={handleACOChange}
                multiple
            />
            {currentDraftQueryACO.includes(SHARED_QUERY_ACO) && (
                <>
                    &nbsp; &nbsp;
                    <Link
                        target="_blank"
                        url={genNavigationUrl({
                            cluster: trackerInfo.cluster_name,
                            path: `//sys/access_control_object_namespaces/queries/${currentDraftQueryACO}`,
                        })}
                    >
                        Edit {currentDraftQueryACO}
                        &nbsp;
                        <Icon awesome="external-link" />
                    </Link>
                </>
            )}
        </>
    );
};
