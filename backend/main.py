from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import chromadb
from chromadb.utils import embedding_functions
import os

# Initialize the FastAPI application
app = FastAPI(title="Multimodal RAG API", version="1.0.0")

# Initialize ChromaDB client (local persistent storage within the container)
chroma_client = chromadb.PersistentClient(path="./chroma_data")

# Create or load the vector collection
# Note: For production with image support, you would configure an OpenCLIP embedding function here.
collection = chroma_client.get_or_create_collection(name="multimodal_assets")

@app.post("/ingest")
async def ingest_asset(file: UploadFile = File(...), description: str = Form(...)):
    """
    Accepts an uploaded file (image) and a text description.
    Generates embeddings and stores them in ChromaDB.
    """
    try:
        # In a full implementation, you would pass the file bytes through your CLIP model here
        # For now, we store the description as the primary embedding source
        collection.add(
            documents=[description],
            metadatas=[{"filename": file.filename}],
            ids=[file.filename] # Using filename as a naive ID for simplicity
        )
        return {"status": "success", "message": f"Successfully ingested {file.filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search")
async def search_assets(query: str = Form(...)):
    """
    Accepts a natural language query or an image, converts it to an embedding,
    and retrieves the nearest matches from the vector database.
    """
    try:
        # Queries the ChromaDB collection using the built-in embedding function
        results = collection.query(
            query_texts=[query],
            n_results=5
        )
        return {"status": "success", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))