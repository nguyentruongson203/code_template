export interface FileItem {
  id: string
  name: string
  type: "file" | "folder"
  language?: string
  content?: string
  children?: FileItem[]
  path: string
  parentId?: string
}

export interface FileSystemState {
  items: FileItem[]
  activeFileId: string | null
}
