import { Configuration } from "webpack";

function walkDirectory(dirPath: string, extension: string): string[] {
  const fs = eval("require")("fs");
  const path = require("path");

  let contents = fs.readdirSync(dirPath);
  let files: string[] = [];
  contents.forEach((item: string) => {
    let itemPath = path.resolve(dirPath, item);
    let stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      files = files.concat(walkDirectory(itemPath, extension));
    } else if (item.endsWith(extension)) {
      files.push(itemPath);
    }
  });

  return files;
}

export function webpackIgnore(
  emptyObjPath: string,
  aliasDirectories: string[],
  fallbackModules: string[],
  previousTransformer?: (config: Configuration) => Configuration
): ((config: Configuration) => Configuration) | undefined {
  if (typeof window !== "undefined") return;

  const path = require("path");

  let aliasFiles = aliasDirectories.reduce((arr, dir) => {
    let dirPath = path.resolve(__dirname, dir);
    let files = walkDirectory(dirPath, ".ts");
    return arr.concat(files);
  }, [] as string[]);

  return (config: Configuration) => {
    if (previousTransformer) config = previousTransformer(config);

    let newConfig = {
      ...config,
      resolve: {
        ...config.resolve,
        fallback: {
          ...config.resolve?.fallback,
          ...fallbackModules.reduce((a, m) => {
            a[m] = false;
            return a;
          }, {} as Record<string, boolean>),
        },
        alias: {
          ...config.resolve?.alias,
          ...aliasFiles.reduce((a, f) => {
            a[f] = emptyObjPath;
            return a;
          }, {} as Record<string, string>),
        },
      },
    };

    return newConfig;
  };
}
