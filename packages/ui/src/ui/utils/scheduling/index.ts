export function prepareAbcService(abcService?: {
    value?: string;
    title: string;
    id: string | number;
}) {
    if (!abcService || !abcService.value) {
        return {};
    }
    const slug = abcService.value.startsWith('svc_')
        ? abcService.value.slice(4) // remove 'svc_' prefix;
        : abcService.value;
    const name = abcService.title;

    return {slug, name, id: Number(abcService.id)};
}
