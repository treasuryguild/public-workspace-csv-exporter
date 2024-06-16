// components/ExampleComponent.tsx
import { useEffect, useState } from 'react';

interface Data {
  name: string;
}

export default function ExampleComponent() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    fetch('/api/hello')
      .then((response) => {
        console.log('Response:', response);
        return response.json();
      })
      .then((data: Data) => {
        console.log('Data:', data);
        setData(data);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  return <div>{data.name}</div>;
}
