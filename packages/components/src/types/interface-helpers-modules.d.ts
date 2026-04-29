declare module '@ytsaurus/interface-helpers/lib/hammer/format' {
    // CJS module: runtime API is wider than we model; `any` keeps call sites simple.
    const format: Record<string, any> & {
        NO_VALUE: string;
        HYPHEN: string;
    };
    export default format;
}

declare module '@ytsaurus/interface-helpers/lib/ypath' {
    const ypath: Record<string, any>;
    export default ypath;
}
