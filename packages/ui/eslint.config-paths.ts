import path from "node:path";

const configRoot = import.meta.dirname;

export function filesFrom(directory: string, patterns: string | string[]) {
  const relativeDirectory = path
    .relative(configRoot, directory)
    .split(path.sep)
    .join("/");
  const patternList = Array.isArray(patterns) ? patterns : [patterns];

  return patternList.map((pattern) =>
    relativeDirectory ? `${relativeDirectory}/${pattern}` : pattern,
  );
}
