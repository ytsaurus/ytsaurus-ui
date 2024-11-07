import React, {FC, Fragment} from 'react';
import {Flex} from '@gravity-ui/uikit';

// @ts-ignore
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import MetaTable from '../../../../components/MetaTable/MetaTable';
import {main} from '../../../../components/MetaTable/presets';
import Yson from '../../../../components/Yson/Yson';
import {Alert, Button} from '@gravity-ui/uikit';
import {UnipikaSettings} from '../../../../components/Yson/StructuredYson/StructuredYsonTypes';
import Icon from '../../../../components/Icon/Icon';
import {OpenQueryButton} from '../../../../containers/OpenQueryButton/OpenQueryButton';
import {YQLKitButton} from '../../../../containers/YQLKitButton/YQLKitButton';
import {useSelector} from 'react-redux';
import {getPath} from '../../../../store/selectors/navigation';
import {getCluster} from '../../../../store/selectors/global';

type Props = {
    attributes: Record<any, any>;
    document: any;
    settings: UnipikaSettings;
    onEditClick: () => void;
};

const EditButton: FC<Pick<Props, 'onEditClick'>> = ({onEditClick}) => {
    return (
        <Button onClick={onEditClick}>
            <Icon awesome={'pencil'} />
            Edit
        </Button>
    );
};

function OpenYqlViewButton() {
    const path: string = useSelector(getPath);
    const cluster = useSelector(getCluster);

    return <OpenQueryButton path={path} cluster={cluster} />;
}

function DocumentExtraTools({onEditClick, attributes}: Pick<Props, 'attributes' | 'onEditClick'>) {
    const isYqlView = 'view' === ypath.getValue(attributes, '/_yql_type');
    return (
        <Flex gap={4}>
            {isYqlView && <OpenYqlViewButton />}
            {isYqlView && <YQLKitButton />}
            <EditButton onEditClick={onEditClick} />
        </Flex>
    );
}

const DocumentBody: FC<Props> = ({attributes, settings, onEditClick, document = null}) => {
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
                        <DocumentExtraTools onEditClick={onEditClick} attributes={attributes} />
                    }
                />
            )}
        </Fragment>
    );
};

export default DocumentBody;
