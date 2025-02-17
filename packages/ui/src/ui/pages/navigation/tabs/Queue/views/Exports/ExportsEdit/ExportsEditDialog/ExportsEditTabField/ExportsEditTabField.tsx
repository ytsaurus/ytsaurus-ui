import React from 'react';
import b from 'bem-cn-lite';
import {Button} from '@gravity-ui/uikit';

import Icon from '../../../../../../../../../components/Icon/Icon';
import {
    TabFieldVertical,
    TabFieldVerticalProps,
} from '../../../../../../../../../components/Dialog';

import './ExportsEditTabField.scss';

const block = b('export-edit-tab-field');

type Props = TabFieldVerticalProps;

export default class ExportsEditTabField extends React.Component<Props> {
    static isTabControl = true as const;
    static isTabControlVertical = true;

    onAddExport(active = true) {
        const {onCreateTab = () => {}} = this.props;
        onCreateTab('exports', active);
    }

    render() {
        const {activeTab, ...rest} = this.props;

        return (
            <div className={block()}>
                <AddExport onAddExport={this.onAddExport.bind(this)} />
                <TabFieldVertical
                    {...rest}
                    activeTab={activeTab}
                    size={'m'}
                    className={block('exports')}
                />
            </div>
        );
    }
}

function AddExport({onAddExport}: {onAddExport: Function}) {
    return (
        <div className={block('add-export')}>
            <span className={block('add-export-label')}>Exports</span>
            <Button onClick={() => onAddExport(true)}>
                <Icon awesome={'plus'} />
                Add export
            </Button>
        </div>
    );
}
