import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { workspace } = req.body;

  if (!workspace) {
    return res.status(400).json({ error: 'Workspace ID is required' });
  }

  const query = `
    query GetWorkspaceTasksQuery {
      getWorkspace(id: "${workspace}") {
        id
        tasks(filter: { statuses: [IN_REVIEW] }) {
          id
          status
          tags {
            id
            label
          }
          workspaceId
        }
      }
    }
  `;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': process.env.DEWORK_AUTH || '',
  };

  try {
    const response = await fetch('https://api.deworkxyz.com/graphql?op=GetWorkspaceTasksQuery', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ query }),
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

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching workspace details:', error);
    res.status(500).json({ error: 'An error occurred while fetching workspace details.' });
  }
}