import {createSelector} from 'reselect';
import _ from 'lodash';
import {calculateLoadingStatus} from '../../utils/utils';
import {concatByAnd} from '../../common/hammer/predicate';
import {PERMISSIONS_SETTINGS} from '../../constants/acl';
import {
    getApproversSubjectFilter,
    getObjectSubjectFilter,
    getObjectPermissionsFilter,
} from './acl-filters';

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

export const getAllObjectPermissionsWithSplittedSubjects = createSelector(
    [getAllObjectPermissions],
    SplitSubjects,
);

export const getObjectPermissionsTypesList = (idmKind) => {
    return createSelector(
        [
            getObjectPermissionsFilter,
            (state) => getAllObjectPermissionsWithSplittedSubjects(state, idmKind),
        ],
        (permissionsFilter, items) => {
            const uniquePermisions = new Set();
            const {permissionTypes} = PERMISSIONS_SETTINGS[idmKind] || {};
            [...permissionTypes, ...permissionsFilter].forEach((permission) =>
                uniquePermisions.add(permission),
            );
            items.forEach((item) => {
                const {permissions} = item;
                permissions.forEach((permission) => uniquePermisions.add(permission));
            });
            return _.sortBy([...uniquePermisions], (permission) => permission);
        },
    );
};

function SplitSubjects(items) {
    const res = [];
    _.forEach(items, (item) => {
        const {subjects} = item;
        if (subjects && subjects.length > 1) {
            _.forEach(subjects, (subject, index) => {
                res.push({...item, subjects: [subject], isSplitted: true, subjectIndex: index});
            });
        } else {
            res.push(item);
        }
    });
    return res;
}

const subjectFilterPredicate = (item, filter) => {
    const {subjectType, groupInfo} = item;
    if (subjectType === 'group') {
        return _.some(Object.entries(groupInfo), ([key, value]) => {
            let str = String(value);
            if (key === 'url') {
                if (str[str.length - 1] === '/') str = str.slice(0, -1);
                str = str.split('/').pop();
            }
            return -1 !== str.toLowerCase().indexOf(filter);
        });
    }
    const value = item.subjects[0];
    return -1 !== value.toLowerCase().indexOf(filter);
};

function FilterBySubject(items, subjectFilter) {
    if (!subjectFilter) return items;
    const lowerNameFilter = subjectFilter.toLowerCase();
    return _.filter(items, (item) => subjectFilterPredicate(item, lowerNameFilter));
}

const permissionsFilterPredicate = (item, filter) => {
    const {permissions} = item;
    return _.difference(filter, permissions).length === 0;
};

export const getAllObjectPermissionsFiltered = createSelector(
    [
        getAllObjectPermissionsWithSplittedSubjects,
        getObjectSubjectFilter,
        getObjectPermissionsFilter,
    ],
    (items, subjectFilter, permissionsFilter) => {
        const predicates = [];
        if (subjectFilter) {
            const lowerNameFilter = subjectFilter.toLowerCase();
            predicates.push((item) => subjectFilterPredicate(item, lowerNameFilter));
        }
        if (Array.isArray(permissionsFilter) && permissionsFilter.length > 0) {
            predicates.push((item) => permissionsFilterPredicate(item, permissionsFilter));
        }
        return _.filter(items, concatByAnd(...predicates));
    },
);

export const getAllObjectPermissionsOrderedByInheritanceAndSubject = createSelector(
    [getAllObjectPermissionsFiltered],
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

export const getHasApprovers = createSelector([getAllApprovers], (items) => items.length > 0);

export const getApproversFiltered = createSelector(
    [getAllApprovers, getApproversSubjectFilter],
    FilterBySubject,
);

export const getApproversFilteredAndOrdered = createSelector(
    [getApproversFiltered],
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

const getAclLoading = (state, idmKind) => state.acl[idmKind].loading;
const getAclLoaded = (state, idmKind) => state.acl[idmKind].loaded;
const getAclError = (state, idmKind) => state.acl[idmKind].error;

export const getAclLoadState = createSelector(
    [getAclLoading, getAclLoaded, getAclError],
    (loading, loaded, error) => {
        return calculateLoadingStatus(loading, loaded, error);
    },
);
