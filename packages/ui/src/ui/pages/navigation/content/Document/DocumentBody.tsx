import React, {FC, Fragment} from 'react';
import cn from 'bem-cn-lite';

import {Alert, Button, Flex} from '@gravity-ui/uikit';

// @ts-ignore
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import MetaTable from '../../../../components/MetaTable/MetaTable';
import {main} from '../../../../components/MetaTable/presets';
import Yson from '../../../../components/Yson/Yson';
import {UnipikaSettings} from '../../../../components/Yson/StructuredYson/StructuredYsonTypes';
import Icon from '../../../../components/Icon/Icon';
import {OpenQueryButtons} from '../../../../containers/OpenQueryButtons/OpenQueryButtons';
import {useSelector} from 'react-redux';
import {getPath} from '../../../../store/selectors/navigation';
import {getCluster} from '../../../../store/selectors/global';

import './DocumentBody.scss';

const block = cn('yt-document-body');

type Props = {
    attributes: Record<any, any>;
    document: any;
    settings: UnipikaSettings;
    onEditClick: () => void;
    queryAutoOpen?: boolean;
};

const EditButton: FC<Pick<Props, 'onEditClick'>> = ({onEditClick}) => {
    return (
        <Button onClick={onEditClick}>
            <Icon awesome={'pencil'} />
            Edit
        </Button>
    );
};

function OpenYqlViewButton({autoOpen}: {autoOpen?: boolean}) {
    const path: string = useSelector(getPath);
    const cluster = useSelector(getCluster);

    return (
        <OpenQueryButtons
            path={path}
            cluster={cluster}
            className={block('yql')}
            autoOpen={autoOpen}
        />
    );
}

function DocumentExtraTools({
    onEditClick,
    attributes,
    queryAutoOpen,
}: Pick<Props, 'attributes' | 'onEditClick' | 'queryAutoOpen'>) {
    const isYqlView = 'view' === ypath.getValue(attributes, '/_yql_type');
    return (
        <Flex gap={4}>
            {isYqlView && <OpenYqlViewButton autoOpen={queryAutoOpen} />}
            <EditButton onEditClick={onEditClick} />
        </Flex>
    );
}

function DocumentBody({attributes, settings, onEditClick, document = null, queryAutoOpen}: Props) {
    const [type] = ypath.getValues(attributes, ['/type']);

    return (
        <Fragment>
            <MetaTable items={[main(attributes), [{key: 'type', value: type}]]} />
            {document === null ? (
                <Alert
                    layout="horizontal"
                    theme="info"
                    message="Document is empty."
                    actions={<EditButton onEditClick={onEditClick} />}
                />
            ) : (
                <Yson
                    value={document}
                    settings={settings}
                    folding
                    extraTools={
                        <DocumentExtraTools
                            onEditClick={onEditClick}
                            attributes={attributes}
                            queryAutoOpen={queryAutoOpen}
                        />
                    }
                />
            )}
        </Fragment>
    );
}

export default DocumentBody;
