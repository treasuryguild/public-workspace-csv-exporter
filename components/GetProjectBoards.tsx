// components/GetProjectBoards.tsx
import { useEffect, useState } from 'react';

interface Repository {
  org: string;
  repo: string;
}

interface ProjectBoard {
  id: number;
  name: string;
  url: string;
  org: string;
  repo: string;
}

const repositories: Repository[] = [
  //{ org: 'treasuryguild', repo: 'treasury-guild-governance' },
  { org: 'SingularityNET-Archive', repo: 'SingularityNET-Archive' },
  //{ org: 'Automate-Workgroup', repo: 'Automate-Workgroup' },
];

export default function GetProjectBoards() {
  const [projectBoards, setProjectBoards] = useState<ProjectBoard[]>([]);

  return (
    <div>
      <p>Select a Project Board:</p>
    </div>
  );
}