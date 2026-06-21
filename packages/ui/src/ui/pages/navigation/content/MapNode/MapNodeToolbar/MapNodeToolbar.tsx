import {DropdownMenu} from '@gravity-ui/uikit';
import React from 'react';
import {type ConnectedProps, connect} from 'react-redux';
import {NoWrap} from '@ytsaurus/components';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import cn from 'bem-cn-lite';

import map_ from 'lodash/map';

import {getConfigUploadTable} from '../../../../../config/index';

import RadioButton from '../../../../../components/RadioButton/RadioButton';
import Button from '../../../../../components/Button/Button';
import Filter from '../../../../../components/Filter/Filter';
import {SelectSingle} from '../../../../../components/Select/Select';
import Icon from '../../../../../components/Icon/Icon';
import TTLInfo from '../../../../../components/TTLInfo/TTLInfo';
import {selectIsCreateTableModalVisible} from '../../../../../store/selectors/navigation/modals/create-table';

import {openCreateTableModal} from '../../../../../store/actions/navigation/modals/create-table';
import {selectPath, selectTransaction} from '../../../../../store/selectors/navigation';
import {selectNavigationPathAttributes} from '../../../../../store/selectors/navigation/navigation';
import {getMediumList} from '../../../../../store/selectors/thor';
import {
    selectContentMode,
    selectError,
    selectFilterState,
    selectIsRootNode,
    selectLoadState,
    selectMapNodeResourcesLoading,
    selectMediumType,
} from '../../../../../store/selectors/navigation/content/map-node';

import {OPEN_CREATE_DIRECTORY_POPUP} from '../../../../../constants/navigation/modals/create-directory';

import {openEditingPopup} from '../../../../../store/actions/navigation/modals/path-editing-popup';
import {
    fetchNodes,
    setContentMode,
    setFilter,
    setMediumType,
    updateResourceUsage,
} from '../../../../../store/actions/navigation/content/map-node';

import hammer from '../../../../../common/hammer';
import {UploadManagerCreate} from '../../Table/UploadManager/UploadManagerCreate';
import NodesTypes from '../NodesTypes/NodesTypes';

import {ContentMode} from '../../../../../constants/navigation';
import {showLinkToModal} from '../../../../../store/actions/navigation/modals/link-to-modal';
import {openCreateACOModal} from '../../../../../store/actions/navigation/modals/create-aco';
import NavigationExtraActions from '../../../../../containers/NavigationExtraActions/NavigationExtraActions';
import UIFactory from '../../../../../UIFactory';
import {selectCluster} from '../../../../../store/selectors/global';
import {type RootState} from '../../../../../store/reducers';
import {UploadFileManager} from '../../../UploadFileManager';
import {CurrentPathActions} from '../../../components/CurrentPathActions/CurrentPathActions';
import {MapNodeUserSettings} from './MapNodeUserSettings/MapNodeUserSettings';

import './MapNodeToolbar.scss';
import i18n from './i18n';

const block = cn('map-node-toolbar');
const tbBlock = cn('elements-toolbar');

function mapStateToProps(state: RootState) {
    const path = selectPath(state);

    return {
        path,
        showACOCreateButton: path === '//sys/access_control_object_namespaces/queries',
        loadState: selectLoadState(state),
        error: selectError(state),
        contentMode: selectContentMode(state),
        filterState: selectFilterState(state),
        transaction: selectTransaction(state),
        mediumList: getMediumList(state),
        mediumType: selectMediumType(state),
        showCreateTableModal: selectIsCreateTableModalVisible(state),
        attributes: selectNavigationPathAttributes(state),
        cluster: selectCluster(state),
    };
}

const mapDispatchToProps = {
    setFilter,
    setContentMode,
    fetchNodes,
    setMediumType,
    openEditingPopup,
    openCreateTableModal,
    showLinkToModal,
    openCreateACOModal,
};

type MapNodeToolbarProps = ConnectedProps<typeof connector>;

type State = {
    uploadFileVisible: boolean;
    uploadTableVisible: boolean;
};

class MapNodeToolbarImpl extends React.PureComponent<MapNodeToolbarProps, State> {
    state: State = {
        uploadFileVisible: false,
        uploadTableVisible: false,
    };

    createDirectoryButtonClick = () => {
        const {path, openEditingPopup} = this.props;
        openEditingPopup(null, path + '/', OPEN_CREATE_DIRECTORY_POPUP);
    };

    createTableButtonClick = () => {
        const {path} = this.props;
        this.props.openCreateTableModal(path);
    };

    uploadTableButtonClick = () => {
        this.setState({uploadTableVisible: true});
    };

    uploadFileButtonClick = () => {
        this.setState({uploadFileVisible: true});
    };

    createLinkButtonClick = () => {
        const {path} = this.props;
        this.props.showLinkToModal({path: `${path}/new_link`});
    };

    createACOButtonClick = () => {
        const {path} = this.props;

        this.props.openCreateACOModal({path, namespace: 'queries'});
    };

    render() {
        const {
            setFilter,
            contentMode,
            setContentMode,
            mediumList,
            mediumType,
            setMediumType,
            filterState,
            path,
            attributes,
            showACOCreateButton,
            cluster,
        } = this.props;

        const {uploadTableExcelBaseUrl} = getConfigUploadTable({cluster});

        const {menuItems, renderModals} = UIFactory.getMapNodeExtraCreateActions([
            {
                action: this.createTableButtonClick,
                text: <NoWrap>{i18n('action_table')}</NoWrap>,
                iconStart: <Icon awesome={'table'} face={'solid'} />,
            },
            {
                action: this.createDirectoryButtonClick,
                text: <NoWrap>{i18n('action_directory')}</NoWrap>,
                iconStart: <Icon awesome={'folder'} face={'solid'} />,
            },
            {
                action: this.createLinkButtonClick,
                text: <NoWrap>{i18n('action_link')}</NoWrap>,
                iconStart: <Icon awesome={'link'} />,
            },
            ...(showACOCreateButton
                ? [
                      {
                          action: this.createACOButtonClick,
                          text: <NoWrap>ACO</NoWrap>,
                          iconStart: <Icon awesome={'acl-object'} />,
                      },
                  ]
                : []),
            ...(!uploadTableExcelBaseUrl
                ? []
                : [
                      {
                          action: this.uploadTableButtonClick,
                          text: <NoWrap>{i18n('action_upload-xlsx')}</NoWrap>,
                          iconStart: <Icon awesome={'upload'} />,
                      },
                  ]),
            {
                action: this.uploadFileButtonClick,
                text: <NoWrap>{i18n('action_upload-file')}</NoWrap>,
                iconStart: <Icon awesome={'upload'} />,
            },
        ]);

        return (
            <div className={block('toolbar')}>
                <div className={tbBlock('container')}>
                    <div className={block('filter', tbBlock('component'))}>
                        <Filter
                            size="m"
                            key={path}
                            debounce={300}
                            value={filterState}
                            onChange={setFilter}
                            qa="map-node-filter"
                        />
                    </div>

                    <TTLInfo attributes={attributes} size={'m'} className={tbBlock('component')} />

                    <div className={tbBlock('component')}>
                        <MapNodeUserSettings />
                    </div>

                    <div className={block('content-mode', tbBlock('component'))}>
                        <RadioButton
                            size="m"
                            name="navigation-map-node-content-mode"
                            value={contentMode}
                            items={[
                                {
                                    value: ContentMode.DEFAULT,
                                    text: i18n(`title_default`),
                                },
                                {
                                    value: ContentMode.RESOURCES,
                                    text: i18n(`title_resources`),
                                },
                            ]}
                            onChange={(event) => setContentMode(event.target.value)}
                        />
                    </div>

                    <div className={block('show-resources', tbBlock('component'))}>
                        <ShowResourcesButton />
                    </div>

                    {mediumList?.length && (
                        <div className={block('medium-type', tbBlock('component'))}>
                            <SelectSingle
                                label={i18n('field_medium') + ':'}
                                placeholder={i18n('value_all')}
                                value={mediumType}
                                items={map_(mediumList, (type) => ({
                                    value: type,
                                    text: hammer.format['ReadableField'](type),
                                }))}
                                onChange={setMediumType}
                                width="max"
                                hideFilter={true}
                            />
                        </div>
                    )}

                    <NavigationExtraActions
                        className={block('copy-to-remote', tbBlock('component'))}
                    />

                    <div className={block('create-object', tbBlock('component'))}>
                        <DropdownMenu
                            items={menuItems}
                            renderSwitcher={(props) => (
                                <Button {...props} size="m" title={i18n('action_create-object')}>
                                    {i18n('action_create-object')}
                                </Button>
                            )}
                        />
                    </div>
                    <div>
                        <CurrentPathActions />
                    </div>
                </div>
                <div className="nodes-types">
                    <NodesTypes />
                </div>
                <UploadManagerCreate
                    visible={this.state.uploadTableVisible}
                    onClose={() => {
                        this.setState({uploadTableVisible: false});
                    }}
                />
                <UploadFileManager
                    visible={this.state.uploadFileVisible}
                    onClose={() => {
                        this.setState({uploadFileVisible: false});
                    }}
                    title={i18n('action_upload-file')}
                />
                {renderModals()}
            </div>
        );
    }
}

function ShowResourcesButton() {
    const dispatch = useDispatch();
    const isRoot = useSelector(selectIsRootNode);
    const loading = useSelector(selectMapNodeResourcesLoading);
    return (
        <Button
            size="m"
            title={i18n('context_show-resources')}
            disabled={isRoot}
            loading={loading}
            onClick={() => dispatch(updateResourceUsage())}
            hotkey={[{keys: 'shift+s', handler: updateResourceUsage, scope: 'all'}]}
        >
            {i18n('action_show-resources')}
        </Button>
    );
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export const MapNodeToolbar = connector(MapNodeToolbarImpl);
