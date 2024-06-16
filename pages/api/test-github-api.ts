// pages/api/github-project-boards.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Octokit } from '@octokit/rest';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { repos } = req.query;

  if (!repos || typeof repos !== 'string') {
    res.status(400).json({ error: 'Invalid repositories parameter' });
    return;
  }

  const repositories = JSON.parse(repos);

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  try {
    const projectBoards = [];

    for (const { org, repo } of repositories) {
      const response = await await octokit.request(`GET /repos/${org}/${repo}/issues`, {
        owner: org,
        repo,
      });
      console.log('response', response);
      if (response.status === 200) {
        const repoProjectBoards = response.data;
        projectBoards.push(...repoProjectBoards);
      } else {
        console.error(`Unexpected API response status for repo ${org}/${repo}:`, response.status);
      }
    }

    res.status(200).json(projectBoards);
  } catch (error) {
    console.error('Error fetching project boards:', error);
    res.status(500).json({ error: 'Failed to fetch project boards' });
  }
}