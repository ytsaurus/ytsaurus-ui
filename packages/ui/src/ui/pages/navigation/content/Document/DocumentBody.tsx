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

function DocumentExtraTools({
    onEditClick,
    attributes,
    queryAutoOpen,
}: Pick<Props, 'attributes' | 'onEditClick' | 'queryAutoOpen'>) {
    const isYqlView = 'view' === ypath.getValue(attributes, '/_yql_type');
    return (
        <Flex gap={4}>
            {isYqlView && <OpenQueryButtons className={block('yql')} autoOpen={queryAutoOpen} />}
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
