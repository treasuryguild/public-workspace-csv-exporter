import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { organization } = req.body;

  const query = `
    query GetOrganizationDetailsQuery {
      getOrganization(id: "${organization}") {
        id
        slug
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

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching organization details:', error);
    res.status(500).json({ error: 'An error occurred while fetching organization details.' });
  }
}