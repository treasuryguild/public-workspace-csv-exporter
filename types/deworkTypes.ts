// ../types/deworkTypes.ts

export interface Organization {
  id: string;
  name: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  name?: string;
  tags?: Tag[];
  storyPoints?: number;
  status?: string;
  assignees?: Assignee[];
  dueDate?: string;
  creator?: User;
  createdAt: string;
  doneAt?: string | null;
  auditLog?: AuditLogEntry[];
  workspaceId: string;
}

interface Tag {
  id: string;
  label: string;
}

interface Assignee {
  username: string;
}

interface User {
  username: string;
}

interface AuditLogEntry {
  createdAt: string;
  diff: AuditLogDiff[];
}

interface AuditLogDiff {
  kind: string;
  rhs: string;
}