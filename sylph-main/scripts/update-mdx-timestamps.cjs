const fs = require("fs");
const path = require("path");

const updateTimestamps = (filePath, overrideCreated = false) => {
  const mdxContent = fs.readFileSync(filePath, "utf-8");
  const frontmatterRegex = /---\n([\s\S]*?)\n---/;
  const match = frontmatterRegex.exec(mdxContent);

  if (!match) return;

  let frontmatter = match[1];
  const fileStats = fs.statSync(filePath);
  const created = fileStats.birthtime.toISOString();
  const updated = fileStats.mtime.toISOString();

  if (overrideCreated || !/created:\s*"/.test(frontmatter)) {
    if (/created:\s*"/.test(frontmatter)) {
      frontmatter = frontmatter.replace(/created:\s*"[^"]*"/, () => `created: "${created}"`);
    } else if (/^time:/m.test(frontmatter)) {
      frontmatter = frontmatter.replace(/^time:\s*\n(\s+)/m, (_m, indent) => `time:\n${indent}created: "${created}"\n${indent}`);
    } else {
      frontmatter += `\ntime:\n  created: "${created}"`;
    }
  }

  if (/updated:\s*"/.test(frontmatter)) {
    frontmatter = frontmatter.replace(/updated:\s*"[^"]*"/, () => `updated: "${updated}"`);
  } else if (/^time:/m.test(frontmatter)) {
    frontmatter = frontmatter.replace(/(created:\s*"[^"]*")/, (_m, p1) => `${p1}\n  updated: "${updated}"`);
  } else {
    frontmatter += `\ntime:\n  updated: "${updated}"`;
  }

  const newBlock = `---\n${frontmatter}\n---`;
  const newContent = mdxContent.replace(frontmatterRegex, () => newBlock);
  fs.writeFileSync(filePath, newContent, "utf-8");
};

const findAllMdxFiles = (dirPath, overrideCreated = false) => {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);

    if (fs.statSync(fullPath).isDirectory()) {
      findAllMdxFiles(fullPath, overrideCreated);
    } else if (fullPath.endsWith(".mdx")) {
      updateTimestamps(fullPath, overrideCreated);
    }
  }
};

const overrideCreated = process.argv.includes("--override-created");

findAllMdxFiles(path.join(__dirname, "../app"), overrideCreated);
