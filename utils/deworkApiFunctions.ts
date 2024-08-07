// api.ts
import { Workspace } from '../types/deworkTypes';

export async function fetchOrgDetails(organizationId: string): Promise<Record<string, Workspace>> {
  try {
    const response = await fetch('/api/getOrganizationDetails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ organizationId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching organization details:', error);
    throw error;
  }
}

export async function fetchWorkspaceSlug(organizationId: string): Promise<any> {
  try {
    const response = await fetch('/api/getWorkspaceSlug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ organization: organizationId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching workspace slug:', error);
    throw error;
  }
}

export async function fetchInitialWorkspaceTasks(workspaceId: string): Promise<any> {
    try {
      const response = await fetch('/api/getDeworkData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workspace: workspaceId }),
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
      console.error('Error fetching initial workspace tasks:', error);
      throw error;
    }
  }
  
  export async function fetchWorkspaceTasksForExport(workspaceId: string): Promise<any> {
    try {
      const response = await fetch('/api/getWorkspaceTasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workspace: workspaceId }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Received data for export:', data);
  
      return data;
    } catch (error) {
      console.error('Error fetching workspace tasks for export:', error);
      throw error;
    }
  }