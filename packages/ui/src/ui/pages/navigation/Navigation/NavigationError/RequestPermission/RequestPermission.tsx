import React from 'react';
import cn from 'bem-cn-lite';
import {Button, Flex, Link} from '@gravity-ui/uikit';
import {ArrowUpRightFromSquare} from '@gravity-ui/icons';

import ypath from '../../../../../common/thor/ypath';

import {ErrorToClipboardButton} from '../../../../../components/ErrorToClipboardButton/ErrorToClipboardButton';
import RequestPermissions from '../../../tabs/ACL/RequestPermissions/RequestPermissions';

import {useGetExternalDescriptionQuery} from '../../../../../store/api/pages/navigation/tabs/description';

import {getParentPath} from '../../../../../utils/navigation';
import {YTError} from '../../../../../../@types/types';
import UIFactory from '../../../../../UIFactory';

import {RequestPermissionIsNotAllowed} from './RequestPermissionIsNotAllowed';

import './RequestPermission.scss';

const block = cn('request-permission');

type Props = {
    error: YTError;
    cluster: string;
    path?: string;
};

export function RequestPermission(props: Props) {
    const {path: currentPath, error, cluster} = props;

    const objectType = ypath.getValue(error?.attributes, '/object_type');
    const errorPath = ypath.getValue(error?.attributes, '/path');
    const isRequestPermissionsForPathAllowed = objectType === 'map_node';

    const path = errorPath ?? currentPath;

    const pathForRequest = isRequestPermissionsForPathAllowed ? path : getParentPath(path);

    const {data} = useGetExternalDescriptionQuery({cluster, path});

    return (
        <div>
            {!isRequestPermissionsForPathAllowed && (
                <RequestPermissionIsNotAllowed objectType={objectType} />
            )}
            <Flex direction="row" gap={3}>
                <RequestPermissions
                    buttonClassName={block('request-permissions-button')}
                    path={pathForRequest}
                    cluster={cluster}
                    buttonProps={{size: 'l', width: 'max'}}
                />
                <ErrorToClipboardButton className={block('copy')} view="outlined" error={error}>
                    Copy error details
                </ErrorToClipboardButton>
                {data?.externalAnnotationLink && (
                    <Link href={data.externalAnnotationLink || ''}>
                        <Button view={'outlined'}>
                            <Flex alignItems={'center'} gap={1}>
                                <ArrowUpRightFromSquare />
                                {UIFactory.externalAnnotationSetup?.externalServiceName ||
                                    'External'}{' '}
                                description{' '}
                            </Flex>
                        </Button>
                    </Link>
                )}
            </Flex>
        </div>
    );
}
