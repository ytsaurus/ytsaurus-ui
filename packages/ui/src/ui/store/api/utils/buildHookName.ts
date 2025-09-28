export function buildHookName(name: string): `use${string}Query` {
    const capitalizedName = name.replace(name[0]!, name[0]!.toUpperCase());

    return `use${capitalizedName}Query`;
}
