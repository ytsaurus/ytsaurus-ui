import {DropdownMenu} from '@gravity-ui/uikit';
import React from 'react';
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
import {
    selectIsRootNode,
    selectMapNodeResourcesLoading,
} from '../../../../../store/selectors/navigation/content/map-node';

import {OPEN_CREATE_DIRECTORY_POPUP} from '../../../../../constants/navigation/modals/create-directory';
import {updateResourceUsage} from '../../../../../store/actions/navigation/content/map-node';

import hammer from '../../../../../common/hammer';
import {UploadManagerCreate} from '../../Table/UploadManager/UploadManagerCreate';
import NodesTypes from '../NodesTypes/NodesTypes';

import {ContentMode} from '../../../../../constants/navigation';
import NavigationExtraActions from '../../../../../containers/NavigationExtraActions/NavigationExtraActions';
import UIFactory from '../../../../../UIFactory';
import {UploadFileManager} from '../../../UploadFileManager';
import {CurrentPathActions} from '../../../components/CurrentPathActions/CurrentPathActions';
import {MapNodeUserSettings} from './MapNodeUserSettings/MapNodeUserSettings';
import i18n from './i18n';

const block = cn('map-node-toolbar');
const tbBlock = cn('elements-toolbar');

type MapNodeToolbarProps = {
    path: string;
    showACOCreateButton: boolean;
    contentMode: (typeof ContentMode)[keyof typeof ContentMode];
    filterState: string;
    mediumList: string[];
    mediumType: string;
    attributes: React.ComponentProps<typeof TTLInfo>['attributes'];
    cluster: string;
    setFilter(filter?: string): void;
    setContentMode(contentMode: string): void;
    setMediumType(mediumType?: string): void;
    openEditingPopup: (
        objectPath: string | null,
        path: string,
        type: string,
        multipleMode?: boolean,
        items?: unknown[],
    ) => void;
    openCreateTableModal(parentDirectory?: string): void;
    showLinkToModal: (params?: {path?: string; target?: string} | undefined) => void;
    openCreateACOModal: (params?: {path?: string; namespace?: string} | undefined) => void;
};

type State = {
    uploadFileVisible: boolean;
    uploadTableVisible: boolean;
};

export class MapNodeToolbarBase extends React.PureComponent<MapNodeToolbarProps, State> {
    override state: State = {
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

    override render() {
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
