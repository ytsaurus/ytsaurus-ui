import {http} from 'msw';

export function makeAccount(name: string, parent = 'root', nodeCount = 7) {
    return {
        $value: name,
        $attributes: {
            parent_name: parent,
            resource_usage: {node_count: nodeCount},
            recursive_resource_usage: {node_count: nodeCount},
            resource_limits: {node_count: 100},
        },
    };
}

interface Parameters {
    path?: string;
    attributes?: string[];
    requests?: Array<{parameters: Parameters}>;
}

export async function readParameters(request: Request): Promise<Parameters> {
    const encoded = [...request.headers]
        .filter(([name]) => name.startsWith('x-yt-parameters-'))
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([, value]) => value)
        .join('');
    const parameters = encoded ? JSON.parse(atob(encoded)) : {};
    const body = request.method === 'POST' ? await request.clone().json() : {};
    return {...parameters, ...body};
}

export function createAccountsMock() {
    const data = {
        accounts: [
            makeAccount('parent', 'root', 90),
            makeAccount('child', 'parent', 11),
            makeAccount('usable-only', 'parent', 22),
            makeAccount('hidden', 'parent', 57),
        ],
        usable: ['child', 'usable-only'],
        requests: [] as Array<{command: string; parameters: Parameters}>,
    };
    const settings = new Map<string, unknown>([
        ['local::test-cluster::accounts::favourites', [{path: 'child'}]],
    ]);
    const project = (account: ReturnType<typeof makeAccount>, attributes: string[] = []) => ({
        ...account,
        $attributes: Object.fromEntries(
            Object.entries(account.$attributes).filter(([key]) => attributes.includes(key)),
        ),
    });
    async function respond(request: Request) {
        const command = new URL(request.url).pathname.split('/').pop() ?? '';
        const parameters = await readParameters(request);
        data.requests.push({command, parameters});
        if (command === 'list') {
            return Response.json(
                data.accounts.map((account) => project(account, parameters.attributes)),
            );
        }
        if (command === 'execute_batch') {
            return Response.json(
                parameters.requests?.map(({parameters: item}) => {
                    const account = data.accounts.find(
                        (value) => item.path === `//sys/accounts/${value.$value}`,
                    );
                    return account
                        ? {output: {...project(account, item.attributes), $value: {}}}
                        : {error: {code: 500, message: 'Account is unavailable'}};
                }),
            );
        }
        if (parameters.path?.endsWith('/@usable_accounts')) return Response.json(data.usable);
        return Response.json(
            parameters.path === '//sys/accounts/@'
                ? {
                      total_resource_usage: {disk_space_per_medium: {}},
                      total_resource_limits: {disk_space_per_medium: {}},
                  }
                : {},
        );
    }
    const handlers = [
        http.all('*/api/v3/*', ({request}) => respond(request)),
        http.all<never, {value: unknown}>('*/api/settings/*', async ({request}) => {
            const path = decodeURIComponent(new URL(request.url).pathname.split('/').pop() ?? '');
            if (request.method === 'PUT') settings.set(path, (await request.json()).value);
            return Response.json(settings.get(path) ?? null);
        }),
    ];
    return Object.assign(data, {handlers, respond});
}
