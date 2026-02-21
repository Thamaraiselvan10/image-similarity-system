import os
import sys
import torch
import open_clip
from PIL import Image

# Add project root to python path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

class EmbeddingGenerator:
    """
    Handles loading the OpenCLIP model and generating embeddings for images.
    """
    def __init__(self, model_name="ViT-B-32", pretrained="laion2b_s34b_b79k"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Loading OpenCLIP model '{model_name}' on {self.device}...")
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            model_name, pretrained=pretrained
        )
        self.model.to(self.device)
        self.model.eval()

        # Dimension of the embedding depends on the model architecture
        # For ViT-L-14 it is 768.
        self.embedding_dim = self.model.visual.output_dim
        print(f"Model loaded successfully. Embedding dimension: {self.embedding_dim}")

    def generate_embedding(self, image_input):
        """
        Loads an image from a path or directly from a PIL Image, passes it through OpenCLIP, 
        and returns the normalized embedding as a flattened 1D numpy array.
        Returns None if the image cannot be read.
        """
        try:
            # Load and preprocess image
            if isinstance(image_input, str):
                image = Image.open(image_input).convert("RGB")
            else:
                image = image_input.convert("RGB")
                
            image_input_tensor = self.preprocess(image).unsqueeze(0).to(self.device)

            # Generate embedding
            with torch.no_grad():
                image_features = self.model.encode_image(image_input_tensor)

            # Normalize embedding (L2 normalization is important for FAISS cosine similarity/IndexFlatIP)
            image_features = image_features / image_features.norm(dim=-1, keepdim=True)
            
            # Convert back to numpy array on CPU
            return image_features.cpu().numpy().flatten()
            
        except Exception as e:
            print(f"Failed to generate embedding for {image_path}: {e}")
            return None

# Simple test if run directly
if __name__ == "__main__":
    generator = EmbeddingGenerator()
    print("Ready to embed.")
