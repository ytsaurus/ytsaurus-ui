import React, {Component} from 'react';
import PropTypes from 'prop-types';
import unipika from '../../../../../common/thor/unipika';
import ypath from '../../../../../common/thor/ypath';
import _ from 'lodash';

import CollapsableText from '../../../../../components/CollapsableText/CollapsableText';
import MetaTable from '../../../../../components/MetaTable/MetaTable';
import Yson from '../../../../../components/Yson/Yson';

export default class Description extends Component {
    static propTypes = {
        description: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    };

    get settings() {
        return {...unipika.prepareSettings(), escapeWhitespace: false};
    }

    // TODO support getting correct type in UNIPIKA (e.g. account for tagged type)
    renderAsMap(value) {
        const {
            utils: {
                yson: {attributes, type},
            },
        } = unipika;
        const isWithoutTags = !Object.hasOwnProperty.call(attributes(value), '_type_tag');
        const isMap = type(value) === 'object';

        return isMap && isWithoutTags;
    }

    renderAsYSON(value) {
        return <Yson settings={this.settings} value={value} />;
    }

    renderMetaTable(description) {
        const value = ypath.getValue(description);
        const keys = _.keys(value).sort();
        const items = _.map(keys, (key) => ({
            key,
            value: <CollapsableText settings={this.settings} value={value[key]} />,
        }));

        return <MetaTable items={items} />;
    }

    render() {
        const {description} = this.props;

        return this.renderAsMap(description)
            ? this.renderMetaTable(description)
            : this.renderAsYSON(description);
    }
}
