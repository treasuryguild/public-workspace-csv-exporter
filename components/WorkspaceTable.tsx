// components/WorkspaceTable.tsx
import React from 'react';
import styles from '../styles/deworkexports.module.css';
import { Workspace } from '../types/deworkTypes';
import { countAuditedTasks, countNonAuditedTasks } from '../utils/deworkUtils';

interface WorkspaceTableProps {
  workspaces: Record<string, Workspace>;
  organizationSlug: string;
  onExport: (workspace: Workspace) => void;
}

export const WorkspaceTable: React.FC<WorkspaceTableProps> = ({ workspaces, organizationSlug, onExport }) => {
  const openLink = (workspaceSlug: string) => {
    window.open(`https://app.dework.xyz/${organizationSlug}/${workspaceSlug}/view/board`, '_blank');
  };

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.tableHeader}>Workspace</th>
          <th className={styles.tableHeader}>Fund Request</th>
          <th className={styles.tableHeader}>Other</th>
          <th className={styles.tableHeader}>Link</th>
          <th className={styles.tableHeader}>Export</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(workspaces).map(([key, workspace]) => {
          const fundRequestCount = countAuditedTasks(workspace.tasks);
          const nonFundRequestCount = countNonAuditedTasks(workspace.tasks);
          const rowClass = fundRequestCount > 0 ? styles.greenRow : '';
          
          return (
            <tr key={key} className={rowClass}>
              <td className={styles.tableCell}>{workspace.name}</td>
              <td className={`${styles.tableCell} ${styles.textCenter}`}>{fundRequestCount}</td>
              <td className={`${styles.tableCell} ${styles.textCenter}`}>{nonFundRequestCount}</td>
              <td className={styles.tableCell}>
                <button onClick={() => openLink(workspace.slug)} className={`${styles.button} ${styles.buttonBlue}`}>
                  Open Board
                </button>
              </td>
              <td className={styles.tableCell}>
                {fundRequestCount > 0 ? (
                  <button onClick={() => onExport(workspace)} className={`${styles.button} ${styles.buttonGreen}`}>
                    Export CSV
                  </button>
                ) : (
                  <button disabled className={`${styles.button} ${styles.buttonGray}`}>
                    Export CSV
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};