import {createSelector} from 'reselect';
import _ from 'lodash';
import {calculateLoadingStatus} from '../../utils/utils';
import {concatByAnd} from '../../common/hammer/predicate';
import {
    getApproversSubjectFilter,
    getObjectPermissionsFilter,
    getObjectSubjectFilter,
} from './acl-filters';
import UIFactory from '../../UIFactory';
import {RootState} from '../../store/reducers';
import {IdmKindType, PreparedAclSubject} from '../../utils/acl/acl-types';
import {PreparedRole} from '../../utils/acl';
import {YTPermissionTypeUI} from '../../utils/acl/acl-api';
//import {ResponsibleType} from '../../utils/acl/acl-types';

function prepareColumnsNames<T extends {columns?: unknown}>(columnsPermissions: Array<T>) {
    const columns = _.map(columnsPermissions, (permission) => permission.columns);

    return _.uniq(_.flatten(columns));
}

const prepareSubjects = (
    subjects: Array<PreparedRole> | undefined,
    type: 'read_approver' | 'responsible' | 'auditor',
) => {
    return _.map(subjects, (subject) => ({
        ...subject,
        type,
        subjects: [subject.value],
        subjectType: subject.type === 'users' ? ('user' as const) : ('group' as const),
        groupInfo:
            subject.type === 'groups' ? {name: subject.group_name, url: subject.url} : undefined,
    }));
};

export const getAllUserPermissions = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].userPermissions;
export const getAllObjectPermissions = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].objectPermissions;

export const getAllObjectPermissionsWithSplittedSubjects = createSelector(
    [getAllObjectPermissions],
    splitSubjects,
);

export const getObjectPermissionsTypesList = (idmKind: IdmKindType) => {
    return createSelector(
        [
            getObjectPermissionsFilter,
            (state) => getAllObjectPermissionsWithSplittedSubjects(state, idmKind),
        ],
        (permissionsFilter, items) => {
            const uniquePermisions = new Set<YTPermissionTypeUI>();
            const {permissionTypes} = UIFactory.getAclPermissionsSettings()[idmKind] || {};
            [...permissionTypes, ...permissionsFilter].forEach((permission) =>
                uniquePermisions.add(permission),
            );
            items.forEach((item) => {
                const {permissions} = item;
                permissions?.forEach((permission) => uniquePermisions.add(permission));
            });
            return _.sortBy([...uniquePermisions], (permission) => permission);
        },
    );
};

type HasSplitted = {
    isSplitted?: boolean;
    subjectIndex?: number;
};

function splitSubjects<T extends {subjects: Array<unknown>}>(items: Array<T>) {
    const res: Array<T & HasSplitted> = [];
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

function subjectFilterPredicate<
    T extends {subjectType?: unknown; groupInfo?: unknown; subjects: Array<unknown>},
>(item: T, filter: string) {
    const {subjectType, groupInfo} = item;
    if (subjectType === 'group') {
        return _.some(Object.entries(groupInfo ?? {}), ([key, value]) => {
            let str: string | undefined = String(value);
            if (key === 'url') {
                if (str[str.length - 1] === '/') str = str.slice(0, -1);
                str = str.split('/').pop();
            }
            return -1 !== str?.toLowerCase().indexOf(filter);
        });
    }
    const value = String(item.subjects[0] ?? '');
    return -1 !== value.toLowerCase().indexOf(filter);
}

function FilterBySubject<
    T extends {subjectType?: unknown; groupInfo?: unknown; subjects: Array<unknown>},
>(items: Array<T>, subjectFilter?: string) {
    if (!subjectFilter) return items;
    const lowerNameFilter = subjectFilter.toLowerCase();
    return _.filter(items, (item) => subjectFilterPredicate(item, lowerNameFilter));
}

const permissionsFilterPredicate = (
    item: PreparedAclSubject,
    filter: Array<YTPermissionTypeUI>,
) => {
    const {permissions} = item;
    return _.difference(filter, permissions ?? []).length === 0;
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
            predicates.push((item: PreparedAclSubject & HasSplitted) =>
                subjectFilterPredicate(item, lowerNameFilter),
            );
        }
        if (Array.isArray(permissionsFilter) && permissionsFilter.length > 0) {
            predicates.push((item: PreparedAclSubject & HasSplitted) =>
                permissionsFilterPredicate(item, permissionsFilter),
            );
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
export const getAllColumnGroups = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].columnGroups;
export const getAllColumnGroupsActual = createSelector([getAllColumnGroups], (items) => {
    const filtered = _.filter(items, (item) => !item.removed);
    return _.sortBy(filtered, ['name']);
});

function OrderByRoleStatus<
    T extends {
        isDepriving?: boolean;
        isRequested?: boolean;
        isUnrecognized?: boolean;
        isApproved?: boolean;
    },
>(items: Array<T>) {
    const unrecognized: typeof items = [];
    const requested: typeof items = [];
    const depriving: typeof items = [];
    const rest: typeof items = [];
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

function OrderByInheritanceAndSubject<T extends {inherited?: boolean; subjects: Array<unknown>}>(
    items: Array<T>,
) {
    const res = _.sortBy(items, [
        (item) => !item.inherited,
        (item) => (item.subjects && item.subjects[0]) || true,
    ]);
    return res;
}

const getReadApprovers = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].readApprovers;
const getResponsibles = (state: RootState, idmKind: IdmKindType) => state.acl[idmKind].responsible;
const getAuditors = (state: RootState, idmKind: IdmKindType) => state.acl[idmKind].auditors;

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
            (permission) => permission.action === 'allow' && permission.columns?.length! > 0,
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
            (permission) => permission.action === 'deny' && permission.columns?.length! > 0,
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

export const isPermissionDeleted = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].isPermissionDeleted;
export const permissionDeletionError = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].deletionError;
export const getLastDeletedPermissionKey = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].deletedItemKey;
export const getIdmPermissionsRequestError = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].idmPermissionsRequestError;
export const getIdmManageAclRequestError = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].idmManageAclRequestError;
export const getIdmPathVersion = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].version;

const getAclLoading = (state: RootState, idmKind: IdmKindType) => state.acl[idmKind].loading;
const getAclLoaded = (state: RootState, idmKind: IdmKindType) => state.acl[idmKind].loaded;
const getAclError = (state: RootState, idmKind: IdmKindType) => state.acl[idmKind].error;

export const getAclLoadState = createSelector(
    [getAclLoading, getAclLoaded, getAclError],
    (loading, loaded, error) => {
        return calculateLoadingStatus(loading, loaded, error);
    },
);
