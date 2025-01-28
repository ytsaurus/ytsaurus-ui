import React, {Component} from 'react';
import {ResolveThunks, connect} from 'react-redux';
// @ts-expect-error
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import {compose} from 'redux';
import cn from 'bem-cn-lite';

import map_ from 'lodash/map';

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
import type {RootState} from '../../../../../store/reducers';
import {DeleteObjectItem} from '../../../../../store/reducers/navigation/modals/delete-object';

const block = cn('navigation-delete-object-modal');

type OwnProps = {};

type StateProps = ReturnType<typeof mapStateToProps>;

type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

type DeleteObjectModalProps = OwnProps & StateProps & DispatchProps;

export class DeleteObjectModal extends Component<DeleteObjectModalProps> {
    componentDidUpdate(prevProps: DeleteObjectModalProps) {
        const {visible, item, getRealPath, getRealPaths, multipleMode} = this.props;

        if (!prevProps.visible && visible) {
            if (multipleMode) {
                getRealPaths(item as DeleteObjectItem[]);
            } else {
                getRealPath(item as DeleteObjectItem);
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
                        <div className={block('table-header')}>
                            <div className={block('preview-icon')} />
                            <div className={block('preview-name')}>Name</div>
                            <div className={block('preview-disk-space')}>Disk space</div>
                            <div className={block('preview-node-count')}>Node count</div>
                            <div className={block('preview-node-count')}>Row count</div>
                        </div>

                        {map_(multipleInfo, ({path, resourceUsage}, index) => {
                            const {type, titleUnquoted, rows, unmergedRows} = (
                                item as DeleteObjectItem[]
                            )[index];
                            const diskSpace = ypath.get(resourceUsage, '/disk_space');
                            const nodeCount = ypath.get(resourceUsage, '/node_count');

                            return (
                                <React.Fragment key={path}>
                                    {renderMapNodesTableIcon((item as DeleteObjectItem[])[index])}
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
        const {type, rows, unmergedRows} = item as DeleteObjectItem;
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
                            <span className={block('path')}>{(item as DeleteObjectItem).path}</span>
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
                contentClassName={block('content')}
                onCancel={closeDeleteModal}
                onConfirm={this.handleDeleteClick}
            />
        );
    }
}

const mapStateToProps = (state: RootState) => {
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
