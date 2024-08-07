// ../utils/deworkUtils.ts
import { Task } from '../types/deworkTypes';

export function countAuditedTasks(tasks: Task[]): number {
  const auditedRegex = /\baudited\b/i;
  const fundRequestRegex = /(?=.*\bfund\b)(?=.*\brequest\b).*/i;
  return tasks.filter((task) => 
    task.tags?.some((tag) => auditedRegex.test(tag.label) || fundRequestRegex.test(tag.label)) ?? false
  ).length;
}

export function countNonAuditedTasks(tasks: Task[]): number {
  const auditedRegex = /\baudited\b/i;
  const fundRequestRegex = /(?=.*\bfund\b)(?=.*\brequest\b).*/i;
  return tasks.filter((task) => 
    !(task.tags?.some((tag) => auditedRegex.test(tag.label) || fundRequestRegex.test(tag.label)) ?? false)
  ).length;
}

export function getChargeMonth(task: Task): string {
  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getFullYear()).substr(-2)}`;
  };

  if (!task.auditLog || task.auditLog.length === 0) {
    return formatDate(task.createdAt);
  }

  for (let i = task.auditLog.length - 1; i >= 0; i--) {
    const log = task.auditLog[i];
    if (log.diff && log.diff.length > 0) {
      const change = log.diff[0];
      if (change.kind === 'E' && change.rhs === 'IN_REVIEW') {
        return formatDate(log.createdAt);
      }
    }
  }

  return formatDate(task.createdAt);
}