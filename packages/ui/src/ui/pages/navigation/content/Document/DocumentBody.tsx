import React, {FC, Fragment} from 'react';
// @ts-ignore
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import MetaTable from '../../../../components/MetaTable/MetaTable';
import {main} from '../../../../components/MetaTable/presets';
import Yson from '../../../../components/Yson/Yson';
import {Alert, Button} from '@gravity-ui/uikit';
import {Icon} from '../../../../components';

type Props = {
    attributes: Record<any, any>;
    document: any;
    settings: any;
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
                    extraTools={<EditButton onEditClick={onEditClick} />}
                />
            )}
        </Fragment>
    );
};

export default DocumentBody;
