import { useState } from 'react';

export default function App() {
  // Search State
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);

  // Ingestion State
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [ingestStatus, setIngestStatus] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('query', query);
    
    try {
      const response = await fetch('http://localhost:8080/search', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error("Failed to fetch results:", error);
    }
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !description) {
      setIngestStatus("Please provide both a file and a description.");
      return;
    }

    setIngestStatus("Uploading...");
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);

    try {
      const response = await fetch('http://localhost:8080/ingest', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setIngestStatus(data.message);
      setFile(null);
      setDescription('');
    } catch (error) {
      setIngestStatus("Upload failed.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="max-w-4xl mx-auto mb-10">
        <h1 className="text-3xl font-bold">Multimodal AI Search</h1>
      </header>
      
      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Ingestion Column */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">1. Ingest Data</h2>
          <form onSubmit={handleIngest} className="flex flex-col gap-4">
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="p-2 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
            />
            <input 
              type="text" 
              placeholder="Image description (for embeddings)..." 
              className="p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 py-3 rounded font-semibold transition-colors">
              Upload & Generate Embedding
            </button>
            {ingestStatus && <p className="text-sm text-green-400 mt-2">{ingestStatus}</p>}
          </form>
        </section>

        {/* Search Column */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-purple-400">2. Semantic Search</h2>
          <form onSubmit={handleSearch} className="flex flex-col gap-4 mb-6">
            <input 
              type="text" 
              placeholder="Query the vector database..." 
              className="p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-purple-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="bg-purple-600 hover:bg-purple-500 py-3 rounded font-semibold transition-colors">
              Search
            </button>
          </form>
          
          <h3 className="text-lg font-semibold mb-2">Raw Vector Results</h3>
          {results ? (
            <pre className="bg-gray-950 p-4 rounded text-xs overflow-auto max-h-64 border border-gray-700">
              {JSON.stringify(results, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500 text-sm">Upload an image, then search its description to see the vector match.</p>
          )}
        </section>

      </main>
    </div>
  );
}