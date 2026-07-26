import {createSelector} from 'reselect';

import compact_ from 'lodash/compact';
import filter_ from 'lodash/filter';
import flatten_ from 'lodash/flatten';
import forEach_ from 'lodash/forEach';
import map_ from 'lodash/map';
import sortBy_ from 'lodash/sortBy';
import uniq_ from 'lodash/uniq';

import {concatByAnd} from '../../../common/hammer/predicate';
import {type RootState} from '../../../store/reducers';
import {
    selectAclFilterColumnGroupName,
    selectAclFilterColumns,
    selectAclFilterExpandedSubjects,
    selectAclRowAccessPredicateFilter,
    selectApproversSubjectFilter,
    selectObjectPermissionsFilter,
    selectObjectSubjectFilter,
} from '../../../store/selectors/acl/acl-filters';
import UIFactory from '../../../UIFactory';
import {
    permissionsFilterPredicate,
    splitSubjects,
    subjectFilterPredicate,
    type PreparedRole,
} from '../../../utils/acl';
import {aggregateBySubject, ObjectPermissionsRow} from '../../../utils/acl/acl-aggregate';
import {type YTPermissionTypeUI} from '../../../utils/acl/acl-api';
import {type IdmKindType, type PreparedAclSubject} from '../../../utils/acl/acl-types';
import {calculateLoadingStatus} from '../../../utils/utils';

export type PreparedAclSubjectColumn = Omit<PreparedAclSubject, 'type'> & {type: 'columns'};

function prepareColumnsNames(columnsPermissions: Array<{columns?: Array<string>}>) {
    const columns = map_(columnsPermissions, (permission) => permission.columns);

    return compact_(uniq_(flatten_(columns))).sort();
}

function prepareApprovers(
    approvers: Array<PreparedRole> | undefined,
    type: 'read_approver' | 'responsible' | 'auditor',
) {
    return map_(approvers, (subject) => {
        const extra = {
            type,
            subjects: [subject.value],
            subjectType: subject.type === 'users' ? ('user' as const) : ('group' as const),
            groupInfo:
                subject.type === 'groups'
                    ? {name: subject.group_name, url: subject.url, group: subject.group}
                    : undefined,
            action: undefined,
        };
        return {
            ...subject,
            ...extra,
        };
    });
}

export type PreparedApprover = ReturnType<typeof prepareApprovers>[number];

export const selectAllUserPermissions = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].userPermissions;
const selectAllObjectPermissions = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].objectPermissions;

const selectAllObjectPermissionsWithSplittedSubjects = createSelector(
    [selectAllObjectPermissions],
    splitSubjects,
);

export const selectObjectPermissionsTypesList = (idmKind: IdmKindType) => {
    return createSelector(
        [
            selectObjectPermissionsFilter,
            (state) => selectAllObjectPermissionsWithSplittedSubjects(state, idmKind),
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
            return sortBy_([...uniquePermisions], (permission) => permission);
        },
    );
};

function FilterBySubject<
    T extends {subjectType?: unknown; groupInfo?: unknown; subjects: Array<unknown>},
>(items: Array<T>, subjectFilter?: string) {
    if (!subjectFilter) return items;
    const lowerNameFilter = subjectFilter.toLowerCase();
    return filter_(items, (item) => subjectFilterPredicate(item, lowerNameFilter));
}

export const selectAllObjectPermissionsFiltered = createSelector(
    [
        selectAllObjectPermissionsWithSplittedSubjects,
        selectObjectSubjectFilter,
        selectObjectPermissionsFilter,
        selectAclFilterColumns,
        selectAclRowAccessPredicateFilter,
    ],
    (items, subjectFilter, permissionsFilter, columns, rowAccessPredicateFilter) => {
        const {mainPermissions, columnPermissions, rowPermissions} = items.reduce(
            (acc, item) => {
                if (!item.columns?.length && !item.row_access_predicate) {
                    acc.mainPermissions.push(item);
                }

                if (item.row_access_predicate) {
                    acc.rowPermissions.push(item);
                }

                if (item.columns?.length) {
                    acc.columnPermissions.push(item);
                }

                return acc;
            },
            {mainPermissions: [], columnPermissions: [], rowPermissions: []} as Record<
                'mainPermissions' | 'columnPermissions' | 'rowPermissions',
                typeof items
            >,
        );

        const withColumns = columnPermissions.map((item) => {
            return {...item, columns: sortBy_(item.columns)};
        });

        const lowerNameFilter = subjectFilter?.toLocaleLowerCase();
        const filterBySubject = lowerNameFilter
            ? (item: ObjectPermissionsRow) => subjectFilterPredicate(item, lowerNameFilter)
            : undefined;

        const permissionsFilterSet = new Set<YTPermissionTypeUI>(permissionsFilter);
        const filterByPermissions = permissionsFilterSet.size
            ? (item: ObjectPermissionsRow) =>
                  permissionsFilterPredicate(item, permissionsFilterSet) ?? false
            : undefined;

        const visibleColumns = new Set(columns);
        const filterByColumns = visibleColumns.size
            ? ({columns}: ObjectPermissionsRow) => {
                  return columns?.some((colName) => visibleColumns.has(colName)) ?? false;
              }
            : undefined;

        const mainPredicates = compact_([filterBySubject, filterByPermissions]);
        const columnsPredicates = compact_([filterBySubject, filterByColumns]);
        const rowsPredicate = compact_([
            filterBySubject,
            rowAccessPredicateFilter
                ? ({row_access_predicate}: ObjectPermissionsRow) => {
                      return 0 <= (row_access_predicate?.indexOf(rowAccessPredicateFilter) ?? -1);
                  }
                : undefined,
        ]);

        return {
            mainPermissions: mainPredicates.length
                ? mainPermissions.filter(concatByAnd(...mainPredicates))
                : mainPermissions,
            columnsPermissions: columnsPredicates.length
                ? withColumns.filter(concatByAnd(...columnsPredicates))
                : withColumns,
            rowPermissions: rowsPredicate.length
                ? rowPermissions.filter(concatByAnd(...rowsPredicate))
                : rowPermissions,
        };
    },
);

export const selectObjectPermissionsAggregated = createSelector(
    [selectAllObjectPermissionsFiltered, selectAclFilterExpandedSubjects],
    (data, expandedSubjects) => {
        const keys = Object.keys(data) as Array<keyof typeof data>;
        return keys.reduce(
            (acc, k) => {
                const key = k as (typeof keys)[number];
                const item = data[key];
                acc[key] = {
                    ...aggregateBySubject(item, expandedSubjects),
                    count: item.length,
                };
                return acc;
            },
            {} as Record<
                (typeof keys)[number],
                ReturnType<typeof aggregateBySubject> & {count: number}
            >,
        );
    },
);

export const selectAllObjectPermissionsOrderedByStatus = createSelector(
    [selectAllObjectPermissions],
    OrderByRoleStatus,
);
export const selectAllColumnGroups = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].columnGroups;
export const selectAllColumnGroupsActual = createSelector(
    [selectAllColumnGroups, selectAclFilterColumns, selectAclFilterColumnGroupName],
    (items, columnsFilter, nameFilter) => {
        const visibleColumns = new Set(columnsFilter);
        type ItemType = (typeof items)[number];
        const nameFilterLower = nameFilter?.toLowerCase();
        const predicates = compact_([
            (item: ItemType) => {
                return !item.removed;
            },
            visibleColumns.size > 0
                ? (item: ItemType) => {
                      return item.columns?.some((name) => visibleColumns.has(name)) ?? false;
                  }
                : undefined,
            nameFilterLower?.length
                ? (item: ItemType) =>
                      -1 !== (item.name?.toLowerCase()?.indexOf(nameFilterLower) ?? -1)
                : undefined,
        ]);
        const filtered = filter_(items, concatByAnd(...predicates)).map((item) => {
            return {...item, columns: sortBy_(item.columns)};
        });
        return sortBy_(filtered, ['name']);
    },
);

const selectAllRowGroupsRaw = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].rowGroups;
export const selectAllRowGroupsActual = createSelector([selectAllRowGroupsRaw], (rowGroups) => {
    return sortBy_(rowGroups, 'name');
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
    forEach_(items, (item) => {
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
    const res = sortBy_(items, [
        (item) => !item.inherited,
        (item) => (item.subjects && item.subjects[0]) || true,
    ]);
    return res;
}

const selectReadApprovers = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].readApprovers;
const selectResponsibles = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].responsible;
const selectAuditors = (state: RootState, idmKind: IdmKindType) => state.acl[idmKind].auditors;

export const selectNotInheritedReadApprovers = createSelector(
    [selectReadApprovers],
    (readApprovers) => filter_(readApprovers, (readApprover) => !readApprover.inherited),
);
export const selectNotInheritedResponsibles = createSelector([selectResponsibles], (responsibles) =>
    filter_(responsibles, (responsible) => !responsible.inherited),
);
export const selectNotInheritedAuditors = createSelector([selectAuditors], (auditros) =>
    filter_(auditros, (auditro) => !auditro.inherited),
);

const selectAllApprovers = createSelector(
    [selectReadApprovers, selectResponsibles, selectAuditors],
    (readApprovers, responsibles, auditros) => {
        return [
            ...prepareApprovers(readApprovers, 'read_approver'),
            ...prepareApprovers(responsibles, 'responsible'),
            ...prepareApprovers(auditros, 'auditor'),
        ];
    },
);

export const selectHasApprovers = createSelector([selectAllApprovers], (items) => items.length > 0);

export const selectApproversFiltered = createSelector(
    [selectAllApprovers, selectApproversSubjectFilter],
    FilterBySubject,
);

export const selectApproversFilteredAndOrdered = createSelector(
    [selectApproversFiltered],
    OrderByInheritanceAndSubject,
);

export const selectApprovers = createSelector([selectAllApprovers], OrderByRoleStatus);

export const selectAllAccessColumnsPermissions = createSelector(
    [selectAllObjectPermissions],
    (objectPermissions) => {
        const filteredPermissions = filter_(
            objectPermissions,
            (permission) => permission.action === 'allow' && permission.columns?.length! > 0,
        );

        return map_(filteredPermissions, (item) => {
            const tmp: typeof item = {...item};
            tmp.type = 'columns';
            return tmp;
        });
    },
);

const selectAllDenyColumnsPermissions = createSelector(
    [selectAllObjectPermissions],
    (objectPermissions) => {
        const filteredPermissions = filter_(
            objectPermissions,
            (permission) => permission.action === 'deny' && permission.columns?.length! > 0,
        );

        return map_(
            filteredPermissions,
            (permission) =>
                ({
                    ...permission,
                    type: 'columns',
                }) as PreparedAclSubjectColumn,
        );
    },
);

export const selectAllAccessColumnsNames = createSelector(
    [selectAllAccessColumnsPermissions],
    prepareColumnsNames,
);

export const selectAllDenyColumnsNames = createSelector(
    [selectAllDenyColumnsPermissions],
    prepareColumnsNames,
);

export const selectDenyColumnsItems = createSelector([selectAllDenyColumnsNames], (names) =>
    map_(names, (name) => ({key: name, value: name, title: name})),
);

export const selectIsPermissionDeleted = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].isPermissionDeleted;
export const selectPermissionDeletionError = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].deletionError;
export const selectLastDeletedPermissionKey = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].deletedItemKey;
export const selectIdmPermissionsRequestError = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].idmPermissionsRequestError;
export const selectIdmManageAclRequestError = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].idmManageAclRequestError;
export const selectIdmPathVersion = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].version;

const selectAclLoading = (state: RootState, idmKind: IdmKindType) => state.acl[idmKind].loading;
const selectAclLoaded = (state: RootState, idmKind: IdmKindType) => state.acl[idmKind].loaded;
const selectAclError = (state: RootState, idmKind: IdmKindType) => state.acl[idmKind].error;

export const selectAclLoadState = createSelector(
    [selectAclLoading, selectAclLoaded, selectAclError],
    (loading, loaded, error) => {
        return calculateLoadingStatus(loading, loaded, error);
    },
);
