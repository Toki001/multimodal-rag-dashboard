from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import chromadb
from chromadb.utils import embedding_functions
import os

app = FastAPI(title="Multimodal RAG API", version="1.0.0")

# Add this CORS middleware block
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Allows your React app
    allow_credentials=True,
    allow_methods=["*"], # Allows POST, GET, etc.
    allow_headers=["*"],
)
# Initialize ChromaDB client (local persistent storage within the container)
chroma_client = chromadb.PersistentClient(path="./chroma_data")

# Create or load the vector collection
# Note: For production with image support, you would configure an OpenCLIP embedding function here.
collection = chroma_client.get_or_create_collection(name="multimodal_assets")

@app.post("/ingest")
def ingest_asset(file: UploadFile = File(...), description: str = Form(...)):
    """
    Accepts an uploaded file (image) and a text description.
    Generates embeddings and stores them in ChromaDB.
    """
    try:
        collection.add(
            documents=[description],
            metadatas=[{"filename": file.filename}],
            ids=[file.filename]
        )
        return {"status": "success", "message": f"Successfully ingested {file.filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search")
def search_assets(query: str = Form(...)):
    """
    Accepts a natural language query or an image, converts it to an embedding,
    and retrieves the nearest matches from the vector database.
    """
    try:
        results = collection.query(
            query_texts=[query],
            n_results=5
        )
        return {"status": "success", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))