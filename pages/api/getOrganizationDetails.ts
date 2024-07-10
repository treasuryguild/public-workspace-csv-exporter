import type { NextApiRequest, NextApiResponse } from 'next';

function getPrefix(organizationName: string): string {
  const lowercaseName = organizationName.toLowerCase();
  if (lowercaseName.includes('singularitynet ambassador program')) {
    return 'snet';
  } else if (lowercaseName.includes('swarm')) {
    return 'swarm';
  } else {
    // Handle other cases or return a default
    return 'defaultPrefix';
  }
}

function transformWorkspaces(workspaces: any[], organizationName: string): Record<string, any> {
  const prefix = getPrefix(organizationName);
  let result: Record<string, any> = {};

  workspaces.forEach((workspace: any) => {
    const key = prefix + workspace.name.replace(/[^\w\s]/gi, '').replace(/\s+/g, '');
    result[key] = {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      tasks: []
    };
  });

  return result;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { organizationId } = req.body;

  const query = `
    query GetOrganizationDetailsQuery {
      getOrganization(id: "${organizationId}") {
        name
        workspaces {
          id
          name
          slug
        }
      }
    }
  `;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': process.env.DEWORK_AUTH || '',
  };

  try {
    const response = await fetch('https://api.deworkxyz.com/graphql?op=GetOrganizationDetailsQuery', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    const organization = responseData.data.getOrganization;
    const transformedWorkspaces = transformWorkspaces(organization.workspaces, organization.name);

    res.status(200).json(transformedWorkspaces);
  } catch (error) {
    console.error('Error fetching organization details:', error);
    res.status(500).json({ error: 'An error occurred while fetching organization details.' });
  }
}