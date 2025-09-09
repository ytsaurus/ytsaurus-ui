import React, {FC} from 'react';
import {useSelector} from 'react-redux';
import ypath from '../../../../../common/thor/ypath';

import keys_ from 'lodash/keys';
import map_ from 'lodash/map';

import CollapsableText from '../../../../../components/CollapsableText/CollapsableText';
import MetaTable from '../../../../../components/MetaTable/MetaTable';
import Yson from '../../../../../components/Yson/Yson';
import {canRenderAsMap} from './helpers/canRenderAsMap';
import {getYsonSettingsDisableDecode} from '../../../../../store/selectors/thor/unipika';
import {DetailedOperationSelector} from '../../../selectors';

type Props = {
    description: DetailedOperationSelector['description'];
};

export const Description: FC<Props> = ({description}) => {
    const settings = useSelector(getYsonSettingsDisableDecode);

    if (canRenderAsMap(description)) {
        const value = ypath.getValue(description);
        const keys = keys_(value).sort();
        const items = map_(keys, (key) => ({
            key,
            value: <CollapsableText settings={settings} value={value[key]} />,
        }));

        return <MetaTable items={items} />;
    }

    return <Yson settings={settings} value={description} />;
};
