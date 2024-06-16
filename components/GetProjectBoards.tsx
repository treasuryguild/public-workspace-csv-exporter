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
  const [selectedBoard, setSelectedBoard] = useState<ProjectBoard | null>(null);
  const [boardData, setBoardData] = useState<any | null>(null);

  useEffect(() => {
    fetch(`/api/test-github-api?repos=${JSON.stringify(repositories)}`)
      .then((response) => response.json())
      .then((data) => setProjectBoards(data))
      .catch((error) => console.error('Error fetching project boards:', error));
  }, []);

  const handleBoardSelect = (board: ProjectBoard) => {
    setSelectedBoard(board);
    fetch(`/api/github-project-board?url=${encodeURIComponent(board.url)}`)
      .then((response) => response.json())
      .then((data) => setBoardData(data))
      .catch((error) => console.error('Error fetching board data:', error));
  };

  return (
    <div>
      <h2>Select a Project Board:</h2>
      {projectBoards.map((board) => (
        <button key={board.id} onClick={() => handleBoardSelect(board)}>
          {board.name} ({board.org}/{board.repo})
        </button>
      ))}
      {boardData && (
        <div>
          <h3>Selected Board: {selectedBoard?.name}</h3>
          <pre>{JSON.stringify(boardData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}