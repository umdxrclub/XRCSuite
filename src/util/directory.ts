import fs from "fs";
import path from "path";

export function walkDirectory(dirPath: string, extension: string) {
    let contents = fs.readdirSync(dirPath)
    let files: string[] = []
    contents.forEach(item => {
        let itemPath = path.resolve(dirPath, item);
        let stat = fs.statSync(itemPath);
        if (stat.isDirectory()) {
            files = files.concat(walkDirectory(itemPath, extension))
        } else if (item.endsWith(extension)) {
            files.push(itemPath)
        }
    });

    return files
}
