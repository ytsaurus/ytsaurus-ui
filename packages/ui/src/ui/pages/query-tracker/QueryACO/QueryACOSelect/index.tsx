import * as React from 'react';
import {Select} from '@gravity-ui/uikit';
import {useCallback} from 'react';
import {useQueryACO} from '../useQueryACO';

import Link from '../../../../components/Link/Link';
import {genNavigationUrl} from '../../../../utils/navigation/navigation';
import Icon from '../../../../components/Icon/Icon';

import './QueryACOSelect.scss';
export const QueryACOSelect: React.FunctionComponent<{}> = () => {
    const {selectACOOptions, isFlight, changeDraftQueryACO, currentDraftQueryACO, trackerInfo} =
        useQueryACO();

    const handleACOChange = useCallback(
        (value: string[]) => {
            const aco = value[0];

            return changeDraftQueryACO({aco});
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
                value={[currentDraftQueryACO]}
                onUpdate={handleACOChange}
            />
            {currentDraftQueryACO === 'nobody' ? null : (
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
