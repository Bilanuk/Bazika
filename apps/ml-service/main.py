import sys
import json
import os
import cv2
import numpy as np
from PIL import Image

# Suppress TensorFlow logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

print("Loading modules...", file=sys.stderr)
import tensorflow as tf
from sentence_transformers import SentenceTransformer, util

# --- CONFIG ---
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models/deepdanbooru')
MODEL_PATH = os.path.join(MODEL_DIR, 'model-resnet_custom_v3.h5')
TAGS_PATH = os.path.join(MODEL_DIR, 'tags.txt')

# --- LOAD MODELS ---
print("Loading CLIP...", file=sys.stderr)
# CLIP (PyTorch)
clip_model = SentenceTransformer('clip-ViT-B-32')

print("Loading DeepDanbooru...", file=sys.stderr)
# DeepDanbooru (Keras/TensorFlow)
danbooru_model = tf.keras.models.load_model(MODEL_PATH, compile=False)

# Load tags
with open(TAGS_PATH, 'r') as f:
    tags = [line.strip() for line in f]

def extract_frames(video_path, count=12):
    """Extracts N frames uniformly from the video, skipping the very beginning/end."""
    frames = []
    cam = cv2.VideoCapture(video_path)
    total_frames = int(cam.get(cv2.CAP_PROP_FRAME_COUNT))
    
    if total_frames == 0:
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
            
    cam.release()
    return frames

def analyze_danbooru(image_np):
    """Runs DeepDanbooru on a single image."""
    # Danbooru expects 512x512
    img_resized = tf.image.resize(image_np, size=(512, 512), method=tf.image.ResizeMethod.AREA)
    img_normalized = img_resized / 255.0 # Normalize [0,1]
    img_batch = np.expand_dims(img_normalized, axis=0) # Add batch dim
    
    # Inference
    probs = danbooru_model.predict(img_batch, verbose=0)[0]
    
    # Return all probabilities > 0.1 for aggregation logic
    results = {}
    for i, prob in enumerate(probs):
        if prob > 0.1: 
            results[tags[i]] = float(prob)
            
    return results

def analyze_video(video_path):
    try:
        pil_frames = extract_frames(video_path, count=12)
        if not pil_frames:
            return {"error": "No frames extracted"}

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
        # 1. Frequency: How many frames have this tag?
        # 2. Confidence: What was the score?
        tag_stats = {} # tag -> {count, max_score, sum_score}

        for f_tags in all_frame_tags:
            for tag, score in f_tags.items():
                if tag.startswith("rating:"): continue # handled separately
                
                if tag not in tag_stats:
                    tag_stats[tag] = {"count": 0, "max_score": 0.0, "sum_score": 0.0}
                
                tag_stats[tag]["count"] += 1
                tag_stats[tag]["max_score"] = max(tag_stats[tag]["max_score"], score)
                tag_stats[tag]["sum_score"] += score

        # Filter tags
        final_tags = []
        min_frames_threshold = 3 # Tag must appear in at least 3 frames (out of 12)
        
        for tag, stats in tag_stats.items():
            # Criteria: Appears in > 25% of frames OR has very high confidence (>0.85) in at least one frame
            if stats["count"] >= min_frames_threshold or stats["max_score"] > 0.85:
                final_tags.append(tag)
        
        # Determine rating
        # If explicit > 0.5 in any frame, mark as explicit (safety first)
        # Otherwise take max
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
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python main.py <video_path>"}))
        sys.exit(1)
        
    video_path = sys.argv[1]
    result = analyze_video(video_path)
    print(json.dumps(result))

