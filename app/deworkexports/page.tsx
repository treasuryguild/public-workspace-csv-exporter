// ../app/deworkexports/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import styles from '../../styles/deworkexports.module.css';
import { LoadingBar } from '../../components/LoadingBar';
import { WorkspaceTable } from '../../components/WorkspaceTable';
import { Organization, Workspace, Task } from '../../types/deworkTypes';
import { fetchOrgDetails, fetchWorkspaceSlug, fetchInitialWorkspaceTasks, fetchWorkspaceTasksForExport } from '../../utils/deworkApiFunctions';
import { countAuditedTasks, countNonAuditedTasks, getChargeMonth } from '../../utils/deworkUtils';

const organizations: Organization[] = [
  { id: '5c29434c-e830-442b-b9f5-d2fb00ee7b34', name: 'SNET' },
  { id: '67bd2c66-8ee8-4e2e-a22b-6cdc5d805a85', name: 'Swarm' },
];

export default function DeworkExports() {
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [workspaces, setWorkspaces] = useState<Record<string, Workspace>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [organizationSlug, setOrganizationSlug] = useState<string>('');
  const [totalWorkspaces, setTotalWorkspaces] = useState<number>(0);
  const [loadedWorkspaces, setLoadedWorkspaces] = useState<number>(0);

  useEffect(() => {
    if (selectedOrg) {
      getOrgDetails();
    }
  }, [selectedOrg]);

  async function getOrgDetails() {
    setIsLoading(true);
    setLoadedWorkspaces(0);
    setTotalWorkspaces(0);
    setWorkspaces({}); 
    setOrganizationSlug('');
    try {
      const data = await fetchOrgDetails(selectedOrg);
      setWorkspaces(data);
      const workspaceCount = Object.keys(data).length;
      setTotalWorkspaces(workspaceCount);
      await getDework(data, workspaceCount);
    } catch (error) {
      console.error('Error fetching organization details:', error);
      setIsLoading(false);
    }
  }

  async function getDework(orgData: Record<string, Workspace>, workspaceCount: number) {
    try {
      const slugs = await fetchWorkspaceSlug(selectedOrg);
      updateObjectWithSlugs(orgData, slugs);
      await getTasks(orgData, workspaceCount);
      setWorkspaces(orgData);
      setOrganizationSlug(slugs.data.getOrganization.slug);
    } catch (error) {
      console.error('Error fetching Dework data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function updateObjectWithSlugs(object: Record<string, Workspace>, slugs: any) {
    slugs.data.getOrganization.workspaces.forEach((workspace: any) => {
      Object.keys(object).forEach((key) => {
        if (object[key].id === workspace.id) {
          object[key].name = workspace.name;
          object[key].slug = workspace.slug;
        }
      });
    });
  }

  async function getTasks(workspaceObj: Record<string, Workspace>, workspaceCount: number) {
    const workspaceIds = Object.keys(workspaceObj);
    let completedCount = 0;

    const fetchPromises = workspaceIds.map(async (key) => {
      try {
        const tasks = await fetchInitialWorkspaceTasks(workspaceObj[key].id);
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

  async function exportData(workspace: Workspace) {
    console.log('Exporting data for workspace:', workspace);
    try {
      const tasksData = await fetchWorkspaceTasksForExport(workspace.id);
      console.log('Received tasksData for export:', tasksData);

      let tasks;
      if (tasksData && tasksData.data && tasksData.data.getWorkspace && tasksData.data.getWorkspace.tasks) {
        tasks = tasksData.data.getWorkspace.tasks;
      } else if (Array.isArray(tasksData)) {
        tasks = tasksData;
      } else {
        console.error('Unexpected data structure:', tasksData);
        throw new Error('Unexpected data structure from fetchWorkspaceTasksForExport');
      }

      console.log(`Number of tasks to export: ${tasks.length}`);

      let csvContent = '"Name","Link","Tags","Story Points","Status","Assignees","Wallet Address","Reward","Due Date","Activities","Budget Month"\n';

      for (let task of tasks) {
        csvContent += generateCsvRow(task, workspace, organizationSlug);
      }

      console.log('CSV content generated, length:', csvContent.length);

      downloadCsv(csvContent, workspace.name);
    } catch (error) {
      console.error('Error exporting data:', error);
      // You might want to show an error message to the user here
    }
  }

  function generateCsvRow(task: Task, workspace: Workspace, orgSlug: string): string {
    const link = `https://app.dework.xyz/${orgSlug}/${workspace.slug}?taskId=${task.id}`;
    const tags = task.tags?.map((t) => t.label).join(',') || '';
    const assignees = task.assignees?.map((a) => a.username).join(',') || '';
    const activities = generateActivities(task);
    const budgetMonth = getChargeMonth(task);

    return `"${task.name || ''}","${link}","${tags}","${task.storyPoints || ''}","${task.status || ''}","${assignees}","","","${task.dueDate || ''}","${activities}","${budgetMonth}"\n`;
  }

  function generateActivities(task: Task): string {
    let activities = `${task.creator?.username || 'no-username'} created on ${formatDate(task.createdAt)}`;
    if (task.doneAt) {
      activities += `, Task completed on ${formatDate(task.doneAt)}`;
    }
    return activities.replace(/(\d{4}) at/g, '$1');
  }

  function formatDate(date: string): string {
    return new Date(date).toLocaleString('en-US', {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  function downloadCsv(csvContent: string, workspaceName: string) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${workspaceName}-tasks-list.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOrg(e.target.value);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dework Exports</h1>
      <select
        value={selectedOrg}
        onChange={handleOrgChange}
        className={styles.select}
        disabled={isLoading}
      >
        <option value="">Select an organization</option>
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>{org.name}</option>
        ))}
      </select>
      
      {isLoading ? (
        <div>
          <LoadingBar current={loadedWorkspaces} total={totalWorkspaces} />
          <div className={styles.loadingText}>Loading Dework workspaces...</div>
        </div>
      ) : (
        selectedOrg && Object.keys(workspaces).length > 0 && (
          <WorkspaceTable
            workspaces={workspaces}
            organizationSlug={organizationSlug}
            onExport={exportData}
          />
        )
      )}
    </div>
  );
}