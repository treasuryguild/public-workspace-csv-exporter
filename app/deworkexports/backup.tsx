// ../app/deworkexports/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import styles from '../../styles/deworkexports.module.css';

const orgSNET = '5c29434c-e830-442b-b9f5-d2fb00ee7b34';
const orgSwarm = '67bd2c66-8ee8-4e2e-a22b-6cdc5d805a85';

interface Task {
  id: string;
  name?: string;
  tags?: { id: string; label: string }[];
  storyPoints?: number;
  status?: string;
  assignees?: { username: string }[];
  dueDate?: string;
  creator?: { username: string };
  createdAt: string;
  doneAt?: string | null;
  auditLog?: { createdAt: string; diff: { kind: string; rhs: string }[] }[];
  workspaceId: string;
}

interface Workspace {
    id: string;
    name: string;
    slug: string;
    tasks: Task[];
}

interface Workspaces {
    [key: string]: Workspace;
}

function LoadingBar({ current, total }: { current: number; total: number }) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  return (
    <div>
      <div className={styles.loadingBarContainer}>
        <div 
          className={styles.loadingBarFill}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className={styles.loadingText}>
        Loading workspaces: {current} / {total}
      </div>
    </div>
  );
}

export default function DeworkExports() {
    const [selectedOrg, setSelectedOrg] = useState<string>('');
    const [hasSelected, setHasSelected] = useState<boolean>(false);
    const [workspaces, setWorkspaces] = useState<Workspaces>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [organizationSlug, setOrganizationSlug] = useState<string>('');
    const [totalWorkspaces, setTotalWorkspaces] = useState<number>(0);
    const [loadedWorkspaces, setLoadedWorkspaces] = useState<number>(0);

    useEffect(() => {
        if (hasSelected) {
            getOrgDetails();
        }
    }, [selectedOrg, hasSelected]);

    async function getOrgDetails() {
        setIsLoading(true);
        setLoadedWorkspaces(0);
        setTotalWorkspaces(0);
        try {
            const response = await fetch('/api/getOrganizationDetails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ organizationId: selectedOrg }),
            });
            const data = await response.json();
            setWorkspaces(data);
            const workspaceCount = Object.keys(data).length;
            setTotalWorkspaces(workspaceCount);
            getDework(data, workspaceCount);
        } catch (error) {
            console.error('Error fetching organization details:', error);
            setIsLoading(false);
        }
    }

    async function getDework(orgData: Workspaces, workspaceCount: number) {
        try {
            const slugs = await getWorkspaceSlug(selectedOrg);
            updateObjectWithSlugs(orgData, slugs);
            await getTasks(orgData, workspaceCount);
            setWorkspaces(orgData);
            setOrganizationSlug(slugs.data.getOrganization.slug);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching Dework data:', error);
            setIsLoading(false);
        }
    }

    async function getWorkspaceSlug(id: string) {
        const response = await fetch('/api/getWorkspaceSlug', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ organization: id }),
        });
        return response.json();
    }

    function updateObjectWithSlugs(object: Workspaces, slugs: any) {
        slugs.data.getOrganization.workspaces.forEach((workspace: any) => {
            Object.keys(object).forEach((key) => {
                if (object[key].id === workspace.id) {
                    object[key].name = workspace.name;
                    object[key].slug = workspace.slug;
                }
            });
        });
    }

    async function getTasks(workspaceObj: Workspaces, workspaceCount: number) {
        const workspaceIds = Object.keys(workspaceObj);
        let completedCount = 0;
    
        const fetchPromises = workspaceIds.map(async (key) => {
            try {
                const tasks = await getDeworkData(workspaceObj[key].id);
                completedCount++;
                setLoadedWorkspaces(completedCount);
                return { key, tasks: tasks.tasks };
            } catch (error) {
                console.error(`Error fetching tasks for workspace ${key}:`, error);
                completedCount++;
                setLoadedWorkspaces(completedCount);
                return { key, tasks: [] };
            }
        });
    
        try {
            const results = await Promise.all(fetchPromises);
            results.forEach(({ key, tasks }) => {
                workspaceObj[key].tasks = tasks;
            });
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }

    async function getDeworkData(id: string) {
        try {
            const response = await fetch('/api/getDeworkData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ workspace: id }),
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
    
            if (data.errors) {
                throw new Error(data.errors[0].message);
            }
    
            if (!data.data || !data.data.getWorkspace) {
                throw new Error('Unexpected response structure');
            }
    
            return data.data.getWorkspace;
        } catch (error) {
            console.error('Error in getDeworkData:', error);
            throw error;
        }
    }

    function countAuditedTasks(tasks: Task[]) {
        const auditedRegex = /\baudited\b/i;
        const fundRequestRegex = /(?=.*\bfund\b)(?=.*\brequest\b).*/i;
        return tasks.filter((task) => 
            task.tags?.some((tag) => auditedRegex.test(tag.label) || fundRequestRegex.test(tag.label)) ?? false
        ).length;
    }

    function countNonAuditedTasks(tasks: Task[]) {
        const auditedRegex = /\baudited\b/i;
        const fundRequestRegex = /(?=.*\bfund\b)(?=.*\brequest\b).*/i;
        return tasks.filter((task) => 
            !(task.tags?.some((tag) => auditedRegex.test(tag.label) || fundRequestRegex.test(tag.label)) ?? false)
        ).length;
    }

    function openLink(workspaceSlug: string) {
        window.open(`https://app.dework.xyz/${organizationSlug}/${workspaceSlug}/view/board`, '_blank');
    }

    function getChargeMonth(task: Task) {
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

    async function getWorkspaceTasks(id: string) {
      try {
          const response = await fetch('/api/getWorkspaceTasks', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ workspace: id }),
          });
  
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const data = await response.json();
          return data;
      } catch (error) {
          console.error('Error fetching workspace tasks:', error);
          throw error;
      }
    }

    async function exportData(workspace: Workspace) {
      console.log('Exporting data for workspace:', workspace);
      try {
          const tasksData = await getWorkspaceTasks(workspace.id);
          const tasks = tasksData.data.getWorkspace.tasks;
  
          let csvContent = '"Name","Link","Tags","Story Points","Status","Assignees","Wallet Address","Reward","Due Date","Activities","Budget Month"\n';
  
          for (let task of tasks) {
              let name = task.name || '';
              let link = `https://app.dework.xyz/${organizationSlug}/${workspace.slug}?taskId=${task.id}`;
              let tags = task.tags?.map((t: { label: string }) => t.label).join(',') || '';
              let storyPoints = task.storyPoints || '';
              let status = task.status || '';
              let assignees = task.assignees?.map((a: { username: string }) => a.username).join(',') || '';
              let walletAddress = '';
              let reward = '';
              let dueDate = task.dueDate || '';
              let creator = task.creator?.username || 'no-username';
              let createdAt = new Date(task.createdAt).toLocaleString('en-US', {
                  month: 'long',
                  day: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
              });
              let activities = `${creator} created on ${createdAt}`;
  
              if (task.doneAt) {
                  let doneAt = new Date(task.doneAt).toLocaleString('en-US', {
                      month: 'long',
                      day: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                  });
                  activities += `, Task completed on ${doneAt}`;
              }
              activities = activities.replace(/(\d{4}) at/g, '$1');
              let budgetMonth = getChargeMonth(task);
              csvContent += `"${name}","${link}","${tags}","${storyPoints}","${status}","${assignees}","${walletAddress}","${reward}","${dueDate}","${activities}","${budgetMonth}"\n`;
          }
  
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `${workspace.name}-tasks-list.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } catch (error) {
          console.error('Error exporting data:', error);
      }
    }

    const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOrg(e.target.value);
        setHasSelected(true);
    };

    return ( 
        <div className={styles.container}>
            <h1 className={styles.title}>Dework Exports</h1>
            <select
                value={selectedOrg}
                onChange={handleOrgChange}
                className={styles.select}
            >
                <option value="">Select an organization</option>
                <option value={orgSNET}>SNET</option>
                <option value={orgSwarm}>Swarm</option>
            </select>
            
            {isLoading ? (
                <div>
                    <LoadingBar current={loadedWorkspaces} total={totalWorkspaces} />
                    <div className={styles.loadingText}>Loading Dework workspaces...</div>
                </div>
            ) : (
              <table className={styles.table}>
                  <thead>
                      <tr>
                          <th className={styles.tableHeader}>Workspace</th>
                          <th className={styles.tableHeader}>Fund Request</th>
                          <th className={styles.tableHeader}>Not Fund Request</th>
                          <th className={styles.tableHeader}>Status</th>
                          <th className={styles.tableHeader}>Link</th>
                          <th className={styles.tableHeader}>Export</th>
                      </tr>
                  </thead>
                  <tbody>
                      {Object.entries(workspaces).map(([key, workspace]) => {
                          const fundRequestCount = countAuditedTasks(workspace.tasks);
                          const rowClass = fundRequestCount > 0 ? styles.greenRow : '';
                          
                          return (
                              <tr key={key} className={rowClass}>
                                  <td className={styles.tableCell}>{workspace.name}</td>
                                  <td className={`${styles.tableCell} ${styles.textCenter}`}>{fundRequestCount}</td>
                                  <td className={`${styles.tableCell} ${styles.textCenter}`}>{countNonAuditedTasks(workspace.tasks)}</td>
                                  <td className={`${styles.tableCell} ${countNonAuditedTasks(workspace.tasks) > 0 ? styles.textRed : styles.textGreen}`}>
                                      {countNonAuditedTasks(workspace.tasks) > 0 ? 'Not Audited' : 'All Audited'}
                                  </td>
                                  <td className={styles.tableCell}>
                                      <button onClick={() => openLink(workspace.slug)} className={`${styles.button} ${styles.buttonBlue}`}>
                                          Open Board
                                      </button>
                                  </td>
                                  <td className={styles.tableCell}>
                                      <button onClick={() => exportData(workspace)} className={`${styles.button} ${styles.buttonGreen}`}>
                                          Export CSV
                                      </button>
                                  </td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
          )}
      </div>
    );
}