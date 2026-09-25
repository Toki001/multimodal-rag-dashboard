import { useState } from 'react';

export default function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('query', query);
    
    try {
      // Connects to the FastAPI container endpoint
      const response = await fetch('http://localhost:8000/search', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error("Failed to fetch results:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="max-w-4xl mx-auto mb-10">
        <h1 className="text-3xl font-bold">Multimodal AI Search</h1>
      </header>
      
      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="Semantic search query..." 
              className="p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 py-3 rounded font-semibold transition-colors">
              Search Database
            </button>
          </form>
        </section>
        
        <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          {results ? (
            <pre className="bg-gray-950 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(results, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-400">No queries executed yet.</p>
          )}
        </section>
      </main>
    </div>
  );
}