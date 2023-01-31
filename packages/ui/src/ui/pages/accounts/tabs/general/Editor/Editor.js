import React, {Component} from 'react';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';
import Tabs from '../../../../../components/Tabs/Tabs';
import {contentTabs} from '../../../../../utils/accounts/editor';
import GeneralContent from './content/GeneralContent';
import DeleteContent from './content/DeleteContent';
import NodesContent from './content/NodesContent';
import ChunksContent from './content/ChunksContent';
import MediumContent from './content/MediumContent';
import TabletsContent from './content/TabletsContent';
import MasterMemoryContent from './content/MasterMemoryContent';
import {EDITOR_TABS} from '../../../../../constants/accounts/editor';
import ErrorBoundary from '../../../../../components/ErrorBoundary/ErrorBoundary';

import './Editor.scss';

const b = block('accounts-editor');

export default class Editor extends Component {
    static propTypes = {
        //from parent component
        account: PropTypes.object,
    };

    state = {
        activeTab: EDITOR_TABS.general,
    };

    onTabChange = (value) => {
        this.setState({activeTab: value});
    };

    render() {
        const {activeTab} = this.state;
        const {account} = this.props;

        return (
            <div className={b('edit')}>
                <div className={b('edit-sidebar')}>
                    <div className={b('edit-tabs')}>
                        <Tabs
                            items={contentTabs}
                            size="m"
                            layout="vertical"
                            active={activeTab}
                            onTabChange={this.onTabChange}
                        />
                    </div>
                </div>
                <ErrorBoundary>
                    <div className={b('edit-content', 'pretty-scroll')}>
                        {activeTab === EDITOR_TABS.general && <GeneralContent account={account} />}
                        {activeTab === EDITOR_TABS.delete && <DeleteContent account={account} />}
                        {activeTab === EDITOR_TABS.nodes && <NodesContent account={account} />}
                        {activeTab === EDITOR_TABS.chunks && <ChunksContent account={account} />}
                        {activeTab === EDITOR_TABS.medium && <MediumContent account={account} />}
                        {activeTab === EDITOR_TABS.tablets && <TabletsContent account={account} />}
                        {activeTab === EDITOR_TABS.masterMemory && (
                            <MasterMemoryContent account={account} />
                        )}
                    </div>
                </ErrorBoundary>
            </div>
        );
    }
}
