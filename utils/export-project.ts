import JSZip from "jszip"
import type { FileItem } from "@/types/file-system"

export async function exportProjectAsZip(fileSystem: FileItem[], projectName = "playground-project") {
  const zip = new JSZip()

  function addItemsToZip(items: FileItem[], folder: JSZip = zip) {
    items.forEach((item) => {
      if (item.type === "file" && item.content !== undefined) {
        // Remove leading slash from path for zip
        const filePath = item.path.startsWith("/") ? item.path.substring(1) : item.path
        folder.file(filePath, item.content)
      } else if (item.type === "folder" && item.children) {
        const folderPath = item.path.startsWith("/") ? item.path.substring(1) : item.path
        const subFolder = folder.folder(folderPath)
        if (subFolder) {
          addItemsToZip(item.children, subFolder)
        }
      }
    })
  }

  // Add all files to zip
  addItemsToZip(fileSystem)

  // Add package.json for better project structure
  const packageJson = {
    name: projectName,
    version: "1.0.0",
    description: "Generated from Code Playground",
    main: "index.html",
    scripts: {
      serve: "python -m http.server 8000",
      "serve-node": "npx http-server -p 8000",
    },
    keywords: ["html", "css", "javascript", "playground"],
    author: "Code Playground",
    license: "MIT",
  }

  zip.file("package.json", JSON.stringify(packageJson, null, 2))

  // Add README
  const readme = `# ${projectName}

Generated from Code Playground

## How to run

### Option 1: Python
\`\`\`bash
python -m http.server 8000
\`\`\`

### Option 2: Node.js
\`\`\`bash
npx http-server -p 8000
\`\`\`

### Option 3: Live Server (VS Code)
Install the Live Server extension and right-click on index.html

Then open http://localhost:8000 in your browser.
`

  zip.file("README.md", readme)

  // Generate and download zip
  const content = await zip.generateAsync({ type: "blob" })
  const url = URL.createObjectURL(content)
  const a = document.createElement("a")
  a.href = url
  a.download = `${projectName}.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
