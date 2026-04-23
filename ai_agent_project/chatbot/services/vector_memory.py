import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# 1. The 'Smell' Maker (Translates text to numbers)
model = SentenceTransformer('all-MiniLM-L6-v2')
# 2. The Filing Cabinet (The index)
index = faiss.IndexFlatL2(384) 
metadata = [] # The actual paper copies of the memories

def add_to_vector_db(role, message):
    """Put a new memory in the cabinet."""
    text = f"{role}: {message}"
    vector = model.encode([text])
    index.add(np.array(vector).astype('float32'))
    metadata.append(text)

def search_memory(query, top_k=2):
    """Go sniff the cabinet for similar past messages."""
    if index.ntotal == 0: return ""
    query_vec = model.encode([query])
    distances, indices = index.search(np.array(query_vec).astype('float32'), top_k)
    return "\n".join([metadata[i] for i in indices[0] if i != -1])