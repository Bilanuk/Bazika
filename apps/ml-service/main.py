import sys
import json
import os

# --- macOS Concurrency Fixes ---
# Must be set before ANY other imports that use OpenMP/BLAS
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'
os.environ['OMP_NUM_THREADS'] = '1'
os.environ['VECLIB_MAXIMUM_THREADS'] = '1'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
# -------------------------------

# Suppress TensorFlow logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['HF_HOME'] = os.path.join(os.path.dirname(__file__), 'models/cache')

print("Loading modules...", file=sys.stderr)

# CRITICAL: Import Torch/SentenceTransformers BEFORE TensorFlow/Keras on macOS
from sentence_transformers import SentenceTransformer, util
import tensorflow as tf

# Other imports (moved down to avoid early initialization)
import cv2
import numpy as np
from PIL import Image
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

# --- CONFIG ---
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models/deepdanbooru')
MODEL_PATH = os.path.join(MODEL_DIR, 'model-resnet_custom_v3.h5')
TAGS_PATH = os.path.join(MODEL_DIR, 'tags.txt')

# Whitelist: Only useful tags for recommendation system
USEFUL_TAGS = {
    # Visual style
    '3d', 'anime_coloring', 'cel_shading', 'flat_color', 'sketch', 'lineart',
    'watercolor_(medium)', 'painting_(medium)', 'realistic', 'semi-realistic',
    'monochrome', 'greyscale', 'sepia', 'pixel_art', 'chibi', 'super_deformed',
    'traditional_media', 'manga_(style)', 'comic', 'western_style',
    '1970s_(style)', '1980s_(style)', '1990s_(style)', 'retro_artstyle',
    
    # Environment
    'outdoors', 'indoors', 'city', 'cityscape', 'street', 'urban',
    'forest', 'tree', 'woods', 'jungle', 'nature', 'field',
    'beach', 'ocean', 'sea', 'water', 'underwater', 'lake', 'river',
    'mountain', 'cliff', 'hill', 'desert',
    'sky', 'cloud', 'cloudy_sky', 'night', 'night_sky', 'starry_sky', 'day',
    'sunset', 'sunrise', 'dusk', 'dawn', 'twilight',
    'rain', 'raining', 'snow', 'snowing', 'storm', 'wind', 'fog', 'mist',
    'space', 'planet', 'moon', 'star_(sky)', 'galaxy',
    'building', 'house', 'castle', 'ruins', 'temple', 'shrine', 'church',
    'school', 'classroom', 'office', 'room',
    'fantasy', 'sci-fi', 'cyberpunk', 'steampunk',
    
    # Action
    'fighting', 'fighting_stance', 'battle', 'combat', 'weapon', 'sword', 'gun',
    'magic', 'spell', 'energy', 'fire', 'ice', 'explosion',
    'running', 'walking', 'jumping', 'flying', 'falling', 'floating',
    'dancing', 'action', 'dynamic_pose',
    
    # Mood
    'dark', 'dark_theme', 'horror_(theme)', 'scary',
    'light', 'bright', 'warm_colors', 'cool_colors',
    'serious', 'dramatic', 'epic', 'peaceful', 'calm',
    'romantic', 'cute', 'beautiful', 'elegant', 'mysterious',
    
    # Effects
    'lens_flare', 'light_particles', 'sparkle', 'glowing', 'aura',
    'backlighting', 'cinematic_lighting', 'god_rays', 'spotlight', 'silhouette',
    'depth_of_field', 'bokeh', 'bloom',
    
    # Color themes
    'blue_theme', 'red_theme', 'green_theme', 'yellow_theme',
    'purple_theme', 'pink_theme', 'colorful',
    
    # Character types
    'animal_ears', 'wings', 'horns', 'tail',
    'robot', 'mecha', 'cyborg', 'monster', 'creature',
    'demon', 'angel', 'elf', 'ghost', 'vampire',
    
    # Objects
    'vehicle', 'car', 'train', 'airplane', 'ship', 'spacecraft',
    'weapon', 'sword', 'gun', 'shield', 'armor',
    'instrument', 'guitar', 'piano',
}

def is_useful_tag(tag: str) -> bool:
    """Check if tag is useful for recommendations."""
    if tag.startswith('rating:'):
        return False
    if tag in USEFUL_TAGS:
        return True
    # Allow composite tags with useful keywords
    useful_keywords = ['scenery', 'landscape', 'background', 'effect', 'lighting', 'theme', 'style', 'atmosphere']
    return any(keyword in tag for keyword in useful_keywords)

# --- GLOBAL MODELS ---
clip_model = None
danbooru_model = None
tags = []

app = FastAPI(title="Bazika ML Service")

def load_models():
    global clip_model, danbooru_model, tags
    
    print("Loading CLIP...", file=sys.stderr)
    # CLIP (PyTorch) - this will download to HF_HOME if not present
    clip_model = SentenceTransformer('clip-ViT-B-32')
    
    print("Loading DeepDanbooru...", file=sys.stderr)
    # DeepDanbooru (Keras/TensorFlow)
    if os.path.exists(MODEL_PATH):
        danbooru_model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    else:
        print(f"Warning: DeepDanbooru model not found at {MODEL_PATH}", file=sys.stderr)
    
    # Load tags
    if os.path.exists(TAGS_PATH):
        with open(TAGS_PATH, 'r') as f:
            tags = [line.strip() for line in f]
    else:
        print(f"Warning: Tags file not found at {TAGS_PATH}", file=sys.stderr)

# Load models on startup
load_models()

def extract_frames(video_path, count=12):
    """Extracts N frames uniformly from the video, skipping the very beginning/end."""
    frames = []
    try:
        cam = cv2.VideoCapture(video_path)
        if not cam.isOpened():
             raise Exception(f"Could not open video file: {video_path}")

        total_frames = int(cam.get(cv2.CAP_PROP_FRAME_COUNT))
        
        if total_frames == 0:
            # Fallback for streams or problematic files?
            raise Exception("Video is empty or cannot be opened")

        # Generate points from 10% to 90%
        points = np.linspace(0.1, 0.9, count)
        
        for p in points:
            target_frame = int(total_frames * p)
            cam.set(cv2.CAP_PROP_POS_FRAMES, target_frame)
            ret, frame = cam.read()
            if ret:
                # Convert BGR to RGB
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                frames.append(Image.fromarray(rgb_frame))
            else:
                print(f"Warning: Could not read frame at {target_frame}", file=sys.stderr)
                
        cam.release()
    except Exception as e:
        print(f"Error extracting frames: {e}", file=sys.stderr)
        if 'cam' in locals(): cam.release()
        raise e
        
    return frames

def analyze_danbooru(image_np):
    """Runs DeepDanbooru on a single image."""
    if danbooru_model is None:
        return {}

    # Danbooru expects 512x512
    img_resized = tf.image.resize(image_np, size=(512, 512), method=tf.image.ResizeMethod.AREA)
    img_normalized = img_resized / 255.0 # Normalize [0,1]
    img_batch = np.expand_dims(img_normalized, axis=0) # Add batch dim
    
    # Inference
    probs = danbooru_model.predict(img_batch, verbose=0)[0]
    
    # Return all probabilities > 0.1 for aggregation logic
    results = {}
    for i, prob in enumerate(probs):
        if prob > 0.1 and i < len(tags): 
            results[tags[i]] = float(prob)
            
    return results

class AnalyzeRequest(BaseModel):
    file_path: str

@app.post("/analyze")
async def analyze_video_endpoint(request: AnalyzeRequest):
    video_path = request.file_path
    
    if not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail=f"File not found: {video_path}")

    try:
        pil_frames = extract_frames(video_path, count=12)
        if not pil_frames:
            raise HTTPException(status_code=500, detail="No frames extracted")

        # --- 1. CLIP ANALYSIS ---
        # Compute vectors for all frames
        clip_embeddings = clip_model.encode(pil_frames)
        # Average vector (Temporal Pooling)
        avg_embedding = np.mean(clip_embeddings, axis=0)

        # Domain Classification
        domain_labels = ["anime", "photorealistic movie", "3d animation", "black and white manga"]
        domain_emb = clip_model.encode(domain_labels)
        domain_scores = util.cos_sim(avg_embedding, domain_emb)[0]
        best_domain = domain_labels[np.argmax(domain_scores)]

        # --- 2. DEEPDANBOORU ANALYSIS & AGGREGATION ---
        all_frame_tags = []
        rating_scores = {"safe": 0.0, "questionable": 0.0, "explicit": 0.0}
        
        for frame in pil_frames:
            img_np = np.array(frame)
            frame_tags = analyze_danbooru(img_np)
            all_frame_tags.append(frame_tags)
            
            # Check rating tags specifically
            for r in ["rating:safe", "rating:questionable", "rating:explicit"]:
                if r in frame_tags:
                    # Accumulate max score seen
                    key = r.replace("rating:", "")
                    rating_scores[key] = max(rating_scores[key], frame_tags[r])

        # Aggregation Logic: Weighted Confidence
        tag_stats = {} # tag -> {count, max_score, sum_score}

        for f_tags in all_frame_tags:
            for tag, score in f_tags.items():
                if tag.startswith("rating:"): continue # handled separately
                
                if tag not in tag_stats:
                    tag_stats[tag] = {"count": 0, "max_score": 0.0, "sum_score": 0.0}
                
                tag_stats[tag]["count"] += 1
                tag_stats[tag]["max_score"] = max(tag_stats[tag]["max_score"], score)
                tag_stats[tag]["sum_score"] += score

        # Filter tags: Only keep useful tags
        final_tags = []
        min_frames_threshold = 3 # Tag must appear in at least 3 frames (out of 12)
        
        for tag, stats in tag_stats.items():
            # Check if tag is useful for recommendations
            if not is_useful_tag(tag):
                continue
            
            # Criteria: Appears in > 25% of frames OR has very high confidence (>0.85) in at least one frame
            if stats["count"] >= min_frames_threshold or stats["max_score"] > 0.85:
                final_tags.append(tag)
        
        # Determine rating
        final_rating = "safe"
        if rating_scores["explicit"] > 0.5:
            final_rating = "explicit"
        elif rating_scores["questionable"] > 0.6:
            final_rating = "questionable"
        
        return {
            "success": True,
            "visual_embedding": avg_embedding.tolist(),
            "domain": best_domain,
            "tags": final_tags,
            "rating": final_rating,
            "meta": {
                "frames_analyzed": len(pil_frames),
                "model_versions": ["CLIP-ViT-B-32", "DeepDanbooru-v3"]
            }
        }

    except Exception as e:
        import traceback
        traceback.print_exc(file=sys.stderr)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "ok", "models_loaded": clip_model is not None}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    uvicorn.run(app, host="0.0.0.0", port=port)
