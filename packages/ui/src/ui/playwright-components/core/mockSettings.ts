import {http} from 'msw';

export function mockSettings(initialValues: Record<string, unknown> = {}) {
    const values = new Map(Object.entries(initialValues));
    return http.all<never, {value: unknown}>('*/api/settings/*', async ({request}) => {
        const key = decodeURIComponent(new URL(request.url).pathname.split('/').pop() ?? '');
        if (request.method === 'PUT') {
            values.set(key, (await request.json()).value);
        }
        return Response.json(values.get(key) ?? null);
    });
}
