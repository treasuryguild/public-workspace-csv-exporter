// pages/api/github-project-board.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Octokit } from '@octokit/rest';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Invalid project board URL' });
    return;
  }

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  try {
    const response = await octokit.request(`GET ${url}`);

    if (response.status === 200) {
      res.status(200).json(response.data);
    } else {
      console.error('Unexpected API response status:', response.status);
      res.status(500).json({ error: 'Unexpected API response' });
    }
  } catch (error) {
    console.error('Error fetching project board data:', error);
    res.status(500).json({ error: 'Failed to fetch project board data' });
  }
}