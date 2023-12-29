import {combineReducers} from 'redux';

import attributesEditor from './attributes-editor';
import createDirectory from './create-directory';
import restoreObject from './restore-object';
import deleteObject from './delete-object';
import createTable from './create-table';
import moveObject from './move-object';
import copyObject from './copy-object';
import tableEraseModal from './table-erase-modal';
import tableMergeSortModal from './table-merge-sort-modal';
import remoteCopyModal from './remote-copy-modal';
import dynTablesStateModal from './dyn-tables-state-modal';
import linkToModal from './link-to-modal';
import createACOModal from './create-aco';

export default combineReducers({
    attributesEditor,
    createDirectory,
    restoreObject,
    deleteObject,
    createTable,
    moveObject,
    copyObject,
    tableEraseModal,
    tableMergeSortModal,
    remoteCopyModal,
    dynTablesStateModal,
    linkToModal,
    createACOModal,
});
