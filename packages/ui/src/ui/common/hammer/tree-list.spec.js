const treeList = require('./tree-list');
const _ = require('lodash');

describe('hammer.tree-list', () => {
    const ROOT_NODE = 'Root';

    const parentGetter = (entry) => {
        if (entry.memberOf) {
            return entry.memberOf.length ? entry.memberOf : ROOT_NODE;
        }
    };

    describe('API', () => {
        const entries = {
            entry1: {
                payload: 10,
                memberOf: [],
            },
            entry2: {
                payload: 20,
                memberOf: [],
            },
            entry3: {
                payload: 30,
                memberOf: ['entry1'],
            },
            entry4: {
                payload: 40,
                memberOf: ['entry1'],
            },
        };

        describe('prepareTree()', () => {
            it('Exports', () => {
                expect(treeList.prepareTree).toBeDefined();
            });

            describe('behavior', () => {
                let treeNodes;

                beforeEach(() => {
                    treeNodes = treeList.prepareTree(entries, parentGetter);
                });

                it('Produces a map of all treeNodes structure including root node', () => {
                    expect(treeNodes[ROOT_NODE]).toBeDefined();
                    expect(treeNodes.entry1).toBeDefined();
                    expect(treeNodes.entry2).toBeDefined();
                    expect(treeNodes.entry3).toBeDefined();
                    expect(treeNodes.entry4).toBeDefined();
                });

                it('Each tree node has listed properties', () => {
                    Object.keys(treeNodes).forEach((treeNodeName) => {
                        expect(Object.keys(treeNodes[treeNodeName])).toEqual(
                            expect.arrayContaining([
                                'name',
                                'children',
                                'attributes',
                                'leaves',
                                '_initedBy',
                            ]),
                        );
                    });
                });

                it('Each tree node has empty leaves array, leaves are attached later', () => {
                    expect(treeNodes[ROOT_NODE].leaves).toHaveLength(0);
                });

                it('Puts entry into "attributes" property', () => {
                    expect(treeNodes.entry1.attributes).toEqual(entries.entry1);
                });

                it('Puts a list of treeNodes into "children" property', () => {
                    expect(treeNodes[ROOT_NODE].children).toEqual([
                        treeNodes.entry1,
                        treeNodes.entry2,
                    ]);
                });
            });
        });

        describe('attachTreeLeaves()', () => {
            it('Exports', () => {
                expect(treeList.attachTreeLeaves).toBeDefined();
            });

            describe('behavior', () => {
                // TODO
                // let treeNodes;
                //
                // beforeEach(() => {
                //     treeNodes = treeList.prepareTree(entries, parentGetter);
                // });
            });
        });

        describe('filterTree()', () => {
            it('Exports', () => {
                expect(treeList.filterTree).toBeDefined();
            });

            describe('behavior', () => {
                let treeNodes, filteredNodes;

                beforeEach(() => {
                    treeNodes = treeList.prepareTree(entries, parentGetter);
                });

                it('Does not change tree structure', () => {
                    filteredNodes = treeList.filterTree(treeNodes[ROOT_NODE], () => true);
                    expect(filteredNodes.name).toBe(treeNodes[ROOT_NODE].name);
                    expect(filteredNodes.children.length).toBe(
                        treeNodes[ROOT_NODE].children.length,
                    );
                    expect(filteredNodes.leaves.length).toBe(treeNodes[ROOT_NODE].leaves.length);
                });

                it('Removes non matching children and leaves', () => {
                    filteredNodes = treeList.filterTree(
                        treeNodes[ROOT_NODE],
                        (entry) => entry.name.indexOf('entry1') !== -1,
                    );
                    expect(filteredNodes.children).toHaveLength(1);
                });
            });
        });

        describe('sortTree()', () => {
            it('Exports', () => {
                expect(treeList.sortTree).toBeDefined();
            });

            describe('behavior', () => {
                let treeNodes, sortedNodes;

                const FIELDS = {
                    name: {
                        get: function (entry) {
                            return entry.name;
                        },
                    },
                };

                function getChildrenNames(children) {
                    return children.map((child) => {
                        return child.name;
                    });
                }

                beforeEach(() => {
                    treeNodes = treeList.prepareTree(entries, parentGetter);
                });

                it('Does not change tree structure', () => {
                    sortedNodes = treeList.sortTree(
                        treeNodes[ROOT_NODE],
                        {field: 'name', asc: true},
                        FIELDS,
                    );
                    expect(sortedNodes.name).toBe(treeNodes[ROOT_NODE].name);
                    expect(sortedNodes.children.length).toBe(treeNodes[ROOT_NODE].children.length);
                    expect(sortedNodes.leaves.length).toBe(treeNodes[ROOT_NODE].leaves.length);
                });

                it('Sorts according to sortState', () => {
                    sortedNodes = treeList.sortTree(
                        treeNodes[ROOT_NODE],
                        {field: 'name', asc: false},
                        FIELDS,
                    );
                    expect(getChildrenNames(sortedNodes.children)).toEqual(['entry2', 'entry1']);
                    expect(getChildrenNames(sortedNodes.children[1].children)).toEqual([
                        'entry4',
                        'entry3',
                    ]);
                });
            });
        });

        describe('flattenTree()', () => {
            it('Exports', () => {
                expect(treeList.flattenTree).toBeDefined();
            });
        });
    });

    describe('Functional', () => {
        const makeFilter = (filterString) => {
            return (treeNode) => {
                if (filterString === '') {
                    return true;
                } else {
                    return treeNode.name.indexOf(filterString) !== -1;
                }
            };
        };

        let entries;

        beforeEach(() => {
            entries = {
                sibling1: {
                    payload: 10,
                    memberOf: [],
                },
                sibling2: {
                    payload: 20,
                    memberOf: [],
                },
                child1: {
                    payload: 30,
                    memberOf: 'sibling1',
                },
                child2: {
                    payload: 40,
                    memberOf: 'child1',
                },
                child3: {
                    payload: 50,
                    memberOf: ['sibling2', 'child1'],
                },
            };
        });

        const leafParentGetter = (leaf) => leaf.pool || ROOT_NODE;

        const defaultSortInfo = {field: 'name', asc: true};
        const defaultSortFields = {
            name: {
                get: (treeNode) => treeNode.name,
            },
        };

        const produceFlatData = (
            entries,
            leaves,
            filter = '',
            sortInfo = defaultSortInfo,
            fields = defaultSortFields,
        ) => {
            let treeNodesMap = treeList.prepareTree(entries, parentGetter);

            treeNodesMap = treeList.attachTreeLeaves(treeNodesMap, leaves, leafParentGetter);

            let preparedTreeNode = treeList.filterTree(treeNodesMap[ROOT_NODE], makeFilter(filter));

            preparedTreeNode = treeList.sortTree(preparedTreeNode, sortInfo, fields);

            return treeList.flattenTree(preparedTreeNode);
        };

        const takeEssentials = (data) => {
            return data.map((node) => {
                return _.pick(node, 'level', 'key', 'name');
            });
        };

        it('empty filter and default sort ordering should produce expected set', () => {
            const expectedData = [
                {
                    level: 0,
                    key: 'Root/sibling1',
                    name: 'sibling1',
                },
                {
                    level: 1,
                    key: 'Root/sibling1/child1',
                    name: 'child1',
                },
                {
                    level: 2,
                    key: 'Root/sibling1/child1/child2',
                    name: 'child2',
                },
                {
                    level: 2,
                    key: 'Root/sibling1/child1/child3',
                    name: 'child3',
                },
                {
                    level: 0,
                    key: 'Root/sibling2',
                    name: 'sibling2',
                },
                {
                    level: 1,
                    key: 'Root/sibling2/child3',
                    name: 'child3',
                },
            ];

            expect(takeEssentials(produceFlatData(entries, []))).toEqual(expectedData);
        });

        it('original content is put into `attributes` property', () => {
            const expectedData = [
                {
                    payload: 10,
                    memberOf: [],
                },
                {
                    payload: 30,
                    memberOf: 'sibling1',
                },
                {
                    payload: 40,
                    memberOf: 'child1',
                },
                {
                    payload: 50,
                    memberOf: ['sibling2', 'child1'],
                },
                {
                    payload: 20,
                    memberOf: [],
                },
                {
                    payload: 50,
                    memberOf: ['sibling2', 'child1'],
                },
            ];

            const nodeAttributes = produceFlatData(entries, []).map((node) => node.attributes);

            expect(nodeAttributes).toEqual(expectedData);
        });

        it('a given filter and default sort ordering should produce expected dataset', () => {
            const expectedData = [
                {
                    level: 0,
                    key: 'Root/sibling1',
                    name: 'sibling1',
                },
                {
                    level: 1,
                    key: 'Root/sibling1/child1',
                    name: 'child1',
                },
                {
                    level: 2,
                    key: 'Root/sibling1/child1/child2',
                    name: 'child2',
                },
                {
                    level: 2,
                    key: 'Root/sibling1/child1/child3',
                    name: 'child3',
                },
            ];
            expect(takeEssentials(produceFlatData(entries, [], 'child1'))).toEqual(expectedData);
        });

        it('a given filter and a given sort ordering should produce expected dataset', () => {
            const expectedData = [
                {
                    level: 0,
                    key: 'Root/sibling2',
                    name: 'sibling2',
                },
                {
                    level: 1,
                    key: 'Root/sibling2/child3',
                    name: 'child3',
                },
                {
                    level: 0,
                    key: 'Root/sibling1',
                    name: 'sibling1',
                },
                {
                    level: 1,
                    key: 'Root/sibling1/child1',
                    name: 'child1',
                },
                {
                    level: 2,
                    key: 'Root/sibling1/child1/child3',
                    name: 'child3',
                },
                {
                    level: 2,
                    key: 'Root/sibling1/child1/child2',
                    name: 'child2',
                },
            ];
            const sortInfo = {field: 'name', asc: false};

            expect(takeEssentials(produceFlatData(entries, [], '', sortInfo))).toEqual(
                expectedData,
            );
        });

        describe('Attach leaves', () => {
            let entries, leaves;

            beforeEach(() => {
                entries = {
                    abt: {
                        memberOf: [],
                    },
                    'abt-premium': {
                        memberOf: ['abt'],
                    },
                    'abt-prod': {
                        memberOf: ['abt'],
                    },
                };

                leaves = {
                    op1: {},
                    op2: {pool: 'abt'},
                    op3: {pool: 'abt-premium'},
                    op4: {pool: 'abt-prod'},
                    op5: {pool: 'abt-prod'},
                };
            });

            it('Show all leaves for matching nodes, filter = "", filterLeaves = false', () => {
                const expectedData = [
                    {
                        level: 0,
                        key: 'Root/op1',
                        name: 'op1',
                    },
                    {
                        level: 0,
                        key: 'Root/abt',
                        name: 'abt',
                    },
                    {
                        level: 1,
                        key: 'Root/abt/op2',
                        name: 'op2',
                    },
                    {
                        level: 1,
                        key: 'Root/abt/abt-premium',
                        name: 'abt-premium',
                    },
                    {
                        level: 2,
                        key: 'Root/abt/abt-premium/op3',
                        name: 'op3',
                    },
                    {
                        level: 1,
                        key: 'Root/abt/abt-prod',
                        name: 'abt-prod',
                    },
                    {
                        level: 2,
                        key: 'Root/abt/abt-prod/op4',
                        name: 'op4',
                    },
                    {
                        level: 2,
                        key: 'Root/abt/abt-prod/op5',
                        name: 'op5',
                    },
                ];

                expect(takeEssentials(produceFlatData(entries, leaves, ''))).toEqual(expectedData);
            });

            it('Show all leaves for matching root node, filterLeaves = false', () => {
                const expectedData = [
                    {
                        level: 0,
                        key: 'Root/op1',
                        name: 'op1',
                    },
                ];

                expect(takeEssentials(produceFlatData(entries, leaves, 'Root'))).toEqual(
                    expectedData,
                );
            });

            it('Show all leaves for matching nodes, filterLeaves = false', () => {
                const expectedData = [
                    {
                        level: 0,
                        key: 'Root/abt',
                        name: 'abt',
                    },
                    {
                        level: 1,
                        key: 'Root/abt/abt-premium',
                        name: 'abt-premium',
                    },
                    {
                        level: 2,
                        key: 'Root/abt/abt-premium/op3',
                        name: 'op3',
                    },
                    {
                        level: 1,
                        key: 'Root/abt/abt-prod',
                        name: 'abt-prod',
                    },
                    {
                        level: 2,
                        key: 'Root/abt/abt-prod/op4',
                        name: 'op4',
                    },
                    {
                        level: 2,
                        key: 'Root/abt/abt-prod/op5',
                        name: 'op5',
                    },
                ];

                expect(takeEssentials(produceFlatData(entries, leaves, 'abt-pr'))).toEqual(
                    expectedData,
                );
            });
        });
    });

    describe('treeForEach', () => {
        const A = {
            name: 'A',
            children: [
                {
                    name: 'B',
                    children: [
                        {name: 'E'},
                        {
                            name: 'D',
                            children: [{name: 'F'}, {name: 'G'}],
                        },
                    ],
                },
                {name: 'C'},
            ],
        };

        let tree;
        let visitor;
        let names;

        beforeEach(() => {
            tree = _.cloneDeep(A);
            names = [];
            visitor = jest.fn((node) => names.push(node.name));
        });

        it('Visit all elements of tree', () => {
            treeList.treeForEach(tree, visitor);

            expect(names.join('')).toEqual('ABEDFGC');
            expect(tree).toEqual(A);
        });

        it('Visit all elements of an array of trees', () => {
            treeList.treeForEach(tree.children, visitor);

            expect(names.join('')).toEqual('BEDFGC');
            expect(tree.children).toEqual(A.children);
        });
    });
});
