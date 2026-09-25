from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import chromadb
from chromadb.utils.embedding_functions import OpenCLIPEmbeddingFunction
import numpy as np
from PIL import Image
import io

app = FastAPI(title="Multimodal RAG API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ChromaDB
chroma_client = chromadb.PersistentClient(path="./chroma_data")

# Initialize the Vision-Language Model
# This downloads the CLIP model on the first run (which is now safely cached!)
clip_ef = OpenCLIPEmbeddingFunction()

# Recreate the collection using the CLIP embedding function
collection = chroma_client.get_or_create_collection(
    name="multimodal_vision_assets",
    embedding_function=clip_ef
)

@app.post("/ingest")
def ingest_asset(file: UploadFile = File(...), description: str = Form(...)):
    """
    Reads the uploaded image bytes, converts them to a numpy array, 
    and uses OpenCLIP to generate visual embeddings.
    """
    try:
        # Read raw image bytes into a PIL Image, then into a Numpy array for Chroma
        file_bytes = file.file.read()
        image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        image_array = np.array(image)
        
        # Add the actual image to the vector database.
        # CLIP handles creating the embedding from the pixels.
        collection.add(
            images=[image_array],
            metadatas=[{"filename": file.filename, "description": description}],
            ids=[file.filename]
        )
        return {"status": "success", "message": f"Successfully vectorized and ingested {file.filename} using CLIP"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search")
def search_assets(query: str = Form(...)):
    """
    Takes a natural language text query and maps it into the same vector space 
    as the images to find the closest visual match.
    """
    try:
        # CLIP is multimodal, so we can query the image vectors using text!
        results = collection.query(
            query_texts=[query],
            n_results=2
        )
        return {"status": "success", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))