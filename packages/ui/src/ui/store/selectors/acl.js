import {createSelector} from 'reselect';
import _ from 'lodash';
import {calculateLoadingStatus} from '../../utils/utils';

const prepareColumnsNames = (columnsPermissions) => {
    const columns = _.map(columnsPermissions, (permission) => permission.columns);

    return _.uniq(_.flatten(columns));
};

const prepareSubjects = (subjects, type) => {
    return _.map(subjects, (subject) => ({
        ...subject,
        type,
        subjects: [subject.value],
        subjectType: subject.type === 'users' ? 'user' : 'group',
        groupInfo:
            subject.type === 'groups' ? {name: subject.group_name, url: subject.url} : undefined,
    }));
};

export const getAllUserPermissions = (state, idmKind) => state.acl[idmKind].userPermissions;
export const getAllObjectPermissions = (state, idmKind) => state.acl[idmKind].objectPermissions;

export const getAllObjectPermissionsOrderedByInheritanceAndSubject = createSelector(
    [getAllObjectPermissions],
    OrderByInheritanceAndSubject,
);

export const getAllObjectPermissionsOrderedByStatus = createSelector(
    [getAllObjectPermissions],
    OrderByRoleStatus,
);
export const getAllColumnGroups = (state, idmKind) => state.acl[idmKind].columnGroups;
export const getAllColumnGroupsActual = createSelector([getAllColumnGroups], (items) => {
    const filtered = _.filter(items, (item) => !item.removed);
    return _.sortBy(filtered, ['name']);
});

function OrderByRoleStatus(items) {
    const unrecognized = [];
    const requested = [];
    const depriving = [];
    const rest = [];
    _.forEach(items, (item) => {
        const {isDepriving, isRequested, isUnrecognized, isApproved} = item;
        if (isUnrecognized) {
            unrecognized.push(item);
        } else if (isDepriving) {
            depriving.push(item);
        } else if (isRequested || isApproved) {
            requested.push(item);
        } else {
            rest.push(item);
        }
    });
    return [...requested, ...depriving, ...unrecognized, ...rest];
}

function OrderByInheritanceAndSubject(items) {
    return _.sortBy(items, [
        (item) => !item.inherited,
        (item) => (item.subjects && item.subjects[0]) || true,
    ]);
}

export const getColumnsColumns = (state, idmKind) => state.acl[idmKind].columnsColumns;
export const getObjectSubjects = (state, idmKind) => state.acl[idmKind].objectSubject;

const getReadApprovers = (state, idmKind) => state.acl[idmKind].readApprovers;
const getResponsibles = (state, idmKind) => state.acl[idmKind].responsible;
const getAuditors = (state, idmKind) => state.acl[idmKind].auditors;

export const getNotInheritedReadApprovers = createSelector([getReadApprovers], (readApprovers) =>
    _.filter(readApprovers, (readApprover) => !readApprover.inherited),
);
export const getNotInheritedResponsibles = createSelector([getResponsibles], (responsibles) =>
    _.filter(responsibles, (responsible) => !responsible.inherited),
);
export const getNotInheritedAuditors = createSelector([getAuditors], (auditros) =>
    _.filter(auditros, (auditro) => !auditro.inherited),
);

const getAllApprovers = createSelector(
    [getReadApprovers, getResponsibles, getAuditors],
    (readApprovers, responsibles, auditros) => {
        return [
            ...prepareSubjects(readApprovers, 'read_approver'),
            ...prepareSubjects(responsibles, 'responsible'),
            ...prepareSubjects(auditros, 'auditor'),
        ];
    },
);

export const getApproversOrderedByInheritanceAndSubject = createSelector(
    [getAllApprovers],
    OrderByInheritanceAndSubject,
);

export const getApprovers = createSelector([getAllApprovers], OrderByRoleStatus);

export const getAllAccessColumnsPermissions = createSelector(
    [getAllObjectPermissions],
    (objectPermissions) => {
        const filteredPermissions = _.filter(
            objectPermissions,
            (permission) => permission.action === 'allow' && permission.columns?.length > 0,
        );
        return _.map(filteredPermissions, (permission) => ({
            ...permission,
            type: 'columns',
        }));
    },
);

export const getAllAccessColumnsPermissionsOrderedByInheritanceAndSubject = createSelector(
    [getAllAccessColumnsPermissions],
    OrderByInheritanceAndSubject,
);

const getAllDenyColumnsPermissions = createSelector(
    [getAllObjectPermissions],
    (objectPermissions) => {
        const filteredPermissions = _.filter(
            objectPermissions,
            (permission) => permission.action === 'deny' && permission.columns?.length > 0,
        );

        return _.map(filteredPermissions, (permission) => ({
            ...permission,
            type: 'columns',
        }));
    },
);

export const getAllAccessColumnsNames = createSelector(
    [getAllAccessColumnsPermissions],
    prepareColumnsNames,
);

export const getAllDenyColumnsNames = createSelector(
    [getAllDenyColumnsPermissions],
    prepareColumnsNames,
);

export const getDenyColumnsItems = createSelector([getAllDenyColumnsNames], (names) =>
    _.map(names, (name) => ({key: name, value: name, title: name})),
);

export const isPermissionDeleted = (state, idmKind) => state.acl[idmKind].isPermissionDeleted;
export const permissionDeletionError = (state, idmKind) => state.acl[idmKind].deletionError;
export const getLastDeletedPermissionKey = (state, idmKind) => state.acl[idmKind].deletedItemKey;
export const getIdmPermissionsRequestError = (state, idmKind) =>
    state.acl[idmKind].idmPermissionsRequestError;
export const getIdmManageAclRequestError = (state, idmKind) =>
    state.acl[idmKind].idmManageAclRequestError;
export const getIdmPathVersion = (state, idmKind) => state.acl[idmKind].version;

const makeReadApproversHighlightedIndex = createSelector(
    [getApprovers, getObjectSubjects],
    (readApprovers, subjectFilter) => {
        const textCache = {};
        const rowCache = {};
        if (subjectFilter) {
            _.forEach(readApprovers, ({value}, index) => {
                const pos = value.indexOf(subjectFilter);
                textCache[value] = {start: pos, length: subjectFilter.length};
                rowCache[index] = rowCache[index] || pos === -1;
            });
        }
        return {
            text: (subject) => {
                return textCache[subject] || {};
            },
            row: (index) => {
                return rowCache[index];
            },
        };
    },
);

const makePermissionSubjectHighlightedIndex = createSelector(
    [getAllObjectPermissionsOrderedByStatus, getObjectSubjects],
    (permissions, subjectFilter) => {
        const textCache = {};
        const rowCache = {};
        if (subjectFilter) {
            _.forEach(permissions, ({subjects, subjectType, tvmInfo}, index) => {
                let rowIsHighlighted = false;
                _.forEach(subjects, (subject) => {
                    const text = subjectType === 'tvm' ? `${tvmInfo.name} (${subject})` : subject;
                    const pos = text.toLowerCase().indexOf(subjectFilter.toLowerCase());
                    textCache[text] = {
                        start: pos,
                        length: subjectFilter.length,
                    };
                    rowIsHighlighted = rowIsHighlighted || pos !== -1;
                });
                rowCache[index] = !rowIsHighlighted;
            });
        }

        return {
            text: (subject) => {
                return textCache[subject] || {};
            },
            row: (index) => {
                return rowCache[index];
            },
        };
    },
);

const makeColumnHighlighterIndex = createSelector(
    [getAllAccessColumnsPermissions, getObjectSubjects, getColumnsColumns],
    (columnPermissions, subjectFilter, columnFilter) => {
        const textCache = {};
        const rowCache = {};
        if (columnFilter || subjectFilter) {
            _.forEach(columnPermissions, ({subjects, columns}, index) => {
                let subjectFound = !subjectFilter;
                if (subjectFilter) {
                    _.forEach(subjects, (subject) => {
                        const pos = subject.indexOf(subjectFilter);
                        subjectFound = subjectFound || pos !== -1;
                    });
                }
                let columnFound = !columnFilter;
                if (columnFilter) {
                    _.forEach(columns, (column) => {
                        const pos = column.indexOf(columnFilter);
                        if (pos !== -1) {
                            textCache[column] = {
                                start: pos,
                                length: columnFilter.length,
                            };
                        }
                        columnFound = columnFound || pos !== -1;
                    });
                }
                rowCache[index] = !subjectFound || !columnFound;
            });
        }
        return {
            text: (column) => {
                return textCache[column] || {};
            },
            row: (index) => {
                return rowCache[index];
            },
        };
    },
);

export const getAclHightlightedByFilter = createSelector(
    [
        makeReadApproversHighlightedIndex,
        makePermissionSubjectHighlightedIndex,
        makeColumnHighlighterIndex,
    ],
    (approvers, permission, columns) => {
        return {
            subjects(type, subject) {
                if (type !== undefined && type !== 'columns') {
                    return approvers.text(subject);
                }
                return permission.text(subject);
            },
            columns: columns.text,

            approverRows: approvers.row,
            permissionRows: permission.row,
            columnRows: columns.row,
        };
    },
);

const getAclLoading = (state, idmKind) => state.acl[idmKind].loading;
const getAclLoaded = (state, idmKind) => state.acl[idmKind].loaded;
const getAclError = (state, idmKind) => state.acl[idmKind].error;

export const getAclLoadState = createSelector(
    [getAclLoading, getAclLoaded, getAclError],
    (loading, loaded, error) => {
        return calculateLoadingStatus(loading, loaded, error);
    },
);
