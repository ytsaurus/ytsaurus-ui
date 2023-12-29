import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import {compose} from 'redux';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import {renderMapNodesTableIcon} from '../../../../../pages/navigation/content/MapNode/MapNodesTable';
import ErrorBoundary from '../../../../../components/ErrorBoundary/ErrorBoundary';
import MetaTable from '../../../../../components/MetaTable/MetaTable';
import HelpLink from '../../../../../components/HelpLink/HelpLink';
import {Checkbox, Loader} from '@gravity-ui/uikit';
import Error from '../../../../../components/Error/Error';
import Modal from '../../../../../components/Modal/Modal';
import Label from '../../../../../components/Label/Label';

import {
    closeDeleteModal,
    deleteObject,
    deleteObjects,
    getRealPath,
    getRealPaths,
    togglePermanentlyDelete,
} from '../../../../../store/actions/navigation/modals/delete-object';
import withScope from '../../../../../hocs/components/Modal/withScope';
import {checkIsTrash} from '../../../../../store/selectors/navigation';
import hammer from '../../../../../common/hammer';

import './DeleteObjectModal.scss';
import UIFactory from '../../../../../UIFactory';

const block = cn('navigation-delete-object-modal');

export class DeleteObjectModal extends Component {
    static resourceUsage = PropTypes.shape({
        disk_space: PropTypes.number,
        node_count: PropTypes.number,
    });

    static propTypes = {
        visible: PropTypes.bool.isRequired,
        error: PropTypes.bool.isRequired,
        loadingRealPath: PropTypes.bool.isRequired,
        errorRealPath: PropTypes.bool.isRequired,
        errorData: PropTypes.object.isRequired,
        errorDataRealPath: PropTypes.object.isRequired,
        permanently: PropTypes.bool.isRequired,
        loading: PropTypes.bool.isRequired,
        multipleMode: PropTypes.bool.isRequired,
        realPath: PropTypes.string.isRequired,
        inTrash: PropTypes.bool.isRequired,
        resourceUsage: DeleteObjectModal.resourceUsage.isRequired,
        item: PropTypes.shape({
            $attributes: PropTypes.object,
            name: PropTypes.string,
            path: PropTypes.string,
            type: PropTypes.string,
            rows: PropTypes.number,
            unmergedRows: PropTypes.number,
        }).isRequired,
        multipleInfo: PropTypes.arrayOf(
            PropTypes.shape({
                path: PropTypes.string.isRequired,
                account: PropTypes.string.isRequred,
                type: PropTypes.string.isRequired,
                resourceUsage: DeleteObjectModal.resourceUsage.isRequired,
            }),
        ).isRequired,

        getRealPath: PropTypes.func.isRequired,
        getRealPaths: PropTypes.func.isRequired,
        deleteObject: PropTypes.func.isRequired,
        deleteObjects: PropTypes.func.isRequired,
        closeDeleteModal: PropTypes.func.isRequired,
        togglePermanentlyDelete: PropTypes.func.isRequired,
    };

    componentDidUpdate(prevProps) {
        const {visible, item, getRealPath, getRealPaths, multipleMode} = this.props;

        if (!prevProps.visible && visible) {
            if (multipleMode) {
                getRealPaths(item);
            } else {
                getRealPath(item);
            }
        }
    }

    get content() {
        const {loadingRealPath, errorRealPath, error, multipleMode} = this.props;

        if (loadingRealPath) {
            return this.renderLoader();
        } else if (errorRealPath || error) {
            return this.renderError();
        }

        return multipleMode ? this.renderMultipleModeContent() : this.renderContent();
    }

    handleDeleteClick = () => {
        const {multipleMode, deleteObject, deleteObjects} = this.props;

        if (multipleMode) {
            deleteObjects();
        } else {
            deleteObject();
        }
    };

    renderLoader() {
        return (
            <div className={block({loading: true})}>
                <Loader />
            </div>
        );
    }

    renderError() {
        const {error, errorData, errorDataRealPath} = this.props;
        const errorContent = error ? errorData : errorDataRealPath;

        return (
            <div className={block({error: true})}>
                <Error error={errorContent} />
            </div>
        );
    }

    renderPermanentlyCheckbox() {
        const {permanently, togglePermanentlyDelete, inTrash} = this.props;

        return (
            <p className={block('delete', {permanently})}>
                <Checkbox
                    size="l"
                    disabled={inTrash}
                    checked={permanently}
                    content="Delete permanently"
                    onChange={togglePermanentlyDelete}
                />

                <Label theme="danger" text="This action CANNOT be undone" />
            </p>
        );
    }

    renderMultipleModeContent() {
        const {item, multipleInfo} = this.props;

        return (
            <ErrorBoundary>
                <div className={block({multiple: true})}>
                    <div className={block('table')}>
                        <div className={block('preview-icon')} />
                        <div className={block('preview-name')}>Name</div>
                        <div className={block('preview-disk-space')}>Disk space</div>
                        <div className={block('preview-node-count')}>Node count</div>
                        <div className={block('preview-node-count')}>Row count</div>

                        {_.map(multipleInfo, ({path, resourceUsage}, index) => {
                            const {type, titleUnquoted, rows, unmergedRows} = item[index];
                            const diskSpace = ypath.get(resourceUsage, '/disk_space');
                            const nodeCount = ypath.get(resourceUsage, '/node_count');

                            return (
                                <React.Fragment key={path}>
                                    {renderMapNodesTableIcon(item[index])}
                                    <span title={path} className="elements-ellipsis">
                                        {titleUnquoted}
                                    </span>
                                    <span>{hammer.format['Bytes'](diskSpace)}</span>
                                    <span>
                                        {type === 'table'
                                            ? hammer.format.NO_VALUE
                                            : hammer.format['Number'](nodeCount)}
                                    </span>
                                    <span>
                                        {unmergedRows
                                            ? `≈ ${hammer.format['Number'](unmergedRows)}`
                                            : hammer.format['Number'](rows)}
                                    </span>
                                </React.Fragment>
                            );
                        })}
                    </div>
                    {this.renderPermanentlyCheckbox()}
                </div>
            </ErrorBoundary>
        );
    }

    renderContent() {
        const {item, resourceUsage} = this.props;
        const {type, rows, unmergedRows} = item;
        const diskSpace = ypath.get(resourceUsage, '/disk_space');
        const nodeCount = ypath.get(resourceUsage, '/node_count');

        const buildItems = () => {
            const items = [
                {
                    key: 'Disk space',
                    value: hammer.format['Bytes'](diskSpace),
                },
            ];

            switch (type) {
                case 'table':
                    items.push({
                        key: 'Rows',
                        value: unmergedRows
                            ? `≈ ${hammer.format['Number'](unmergedRows)}`
                            : hammer.format['Number'](rows),
                    });

                    return items;

                case 'access_control_object':
                    return [];

                default:
                    items.push({
                        key: 'Node count',
                        value: hammer.format['Number'](nodeCount),
                    });

                    return items;
            }
        };

        return (
            <ErrorBoundary>
                <div className={block()}>
                    <div className={block()}>
                        <p className={block('object')}>
                            {renderMapNodesTableIcon(item)}
                            <span className={block('path')}>{item.path}</span>
                        </p>

                        <MetaTable className={block('meta')} items={buildItems()} />

                        {this.renderPermanentlyCheckbox()}
                    </div>
                </div>
            </ErrorBoundary>
        );
    }

    render() {
        const {visible, closeDeleteModal, permanently, loading} = this.props;
        const theme = permanently ? 'outlined-danger' : 'action';
        const helpLinkUrl = UIFactory.docsUrls['common:regular_system_processes'];
        const helpLink =
            helpLinkUrl !== '' ? <HelpLink text="Documentation" url={helpLinkUrl} /> : null;

        return (
            <Modal
                title="Delete"
                visible={visible}
                loading={loading}
                confirmTheme={theme}
                confirmText="Delete"
                content={this.content}
                footerContent={helpLink}
                onCancel={closeDeleteModal}
                onConfirm={this.handleDeleteClick}
            />
        );
    }
}

const mapStateToProps = (state) => {
    const {
        error,
        errorData,
        loading,
        visible,
        permanently,
        item,
        loadingRealPath,
        errorRealPath,
        errorDataRealPath,
        realPath,
        resourceUsage,
        multipleInfo,
        multipleMode,
    } = state.navigation.modals.deleteObject;
    const inTrash = checkIsTrash(state);

    return {
        error,
        errorData,
        visible,
        permanently,
        item,
        loading,
        loadingRealPath,
        errorRealPath,
        errorDataRealPath,
        realPath,
        multipleInfo,
        resourceUsage,
        multipleMode,
        inTrash,
    };
};

const mapDispatchToProps = {
    getRealPath,
    deleteObject,
    deleteObjects,
    getRealPaths,
    closeDeleteModal,
    togglePermanentlyDelete,
};

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    withScope('delete-object-modal'),
)(DeleteObjectModal);
