import subprocess  # Changed from "from asyncio import subprocess"
import json
import os
import pathlib
import time
import uuid
import boto3
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import modal
from pydantic import BaseModel
import whisperx

"""
Main entrypoint for the AI Podcast Clipper backend using Modal and FastAPI.

- Defines a FastAPI-compatible Modal app for processing podcast video files.
- Sets up a custom Docker image with CUDA, ffmpeg, and required fonts.
- Mounts a persistent volume for model caching.
- Secures endpoints with HTTP Bearer authentication.
- Exposes a POST endpoint (`process_video`) for processing videos by S3 key.
- Includes a local entrypoint for testing the endpoint with a sample request.

Classes:
    ProcessVideoRequest: Pydantic model for incoming video processing requests.
    AiPodcastClipper: Modal class with model loading and video processing methods.

Usage:
    Run locally to test endpoint invocation, or deploy via Modal for production use.
"""

class ProcessVideoRequest(BaseModel):
    s3_key: str

image = (modal.Image.from_registry("nvidia/cuda:12.4.0-devel-ubuntu22.04", add_python="3.12")
         .apt_install(["ffmpeg", "libgl1-mesa-glx", "wget", "libcudnn8", "libcudnn8-dev"])
         .pip_install_from_requirements("requirements.txt")
        .run_commands(["mkdir -p /usr/share/fonts/truetype/custom", 
                       "wget -O /usr/share/fonts/truetype/custom/Anton-Regular.ttf https://github.com/google/fonts/raw/main/ofl/anton/Anton-Regular.ttf",
                       "fc-cache -f -v"])
        .add_local_dir("asd", "/asd", copy=True))

app = modal.App("ai-podcast-clipper", image=image)

volume = modal.Volume.from_name(
    "ai-podcast-clipper-model-cache", create_if_missing=True
)

mount_path="/root/.cache/torch"

auth_scheme = HTTPBearer()

@app.cls(gpu="L40S", timeout=900, retries=0, scaledown_window=20, secrets=[modal.Secret.from_name("ai-podcast-clipper-secret")],volumes={mount_path: volume})
class AiPodcastClipper:
    @modal.enter()
    def load_model(self):
        print("Loading model")
        
        self.whisperx_model = whisperx.load_model(
            "large-v2", device="cuda", compute_type="float16")
        
        self.alignment_model, self.metadata = whisperx.load_align_model(
            language_code="en", device="cuda"
        )

        print("Transcription model loaded......")

    def transcribe(self, base_dir: str, video_path: str) -> str:
        audio_path = base_dir / "audio.wav"
        extract_cmd = f"ffmpeg -i {video_path} -vn -acodec pcm_s16le -ar 16000 -ac 1 {audio_path}"
        subprocess.run(extract_cmd, shell=True, check=True, capture_output=True)

        print("Starting transcription with WhisperX...")
        start_time = time.time()

        audio = whisperx.load_audio(str(audio_path))
        result = self.whisperx_model.transcribe(
            audio, batch_size=16
        )

        # Perform alignment with the transcription results
        result = whisperx.align(
            result["segments"], 
            self.alignment_model, 
            self.metadata, 
            audio,
            device="cuda",
            return_char_alignments=False
        )

        duration = time.time() - start_time
        print(f"Transcription and alignment took {duration:.2f} seconds")

        segments = []

        if "word_segments" in result:
            for segment in result["word_segments"]:
                segments.append({
                    "start": segment["start"],
                    "end": segment["end"],
                    "word": segment["word"]
                })
        
        # Return the aligned result instead of just printing it
        return json.dumps(segments)

    @modal.fastapi_endpoint(method="POST")
    def process_video(self, request: ProcessVideoRequest, token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
        s3_key = request.s3_key

        if token.credentials != os.environ["AUTH_TOKEN"]:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail="Incorrect bearer token", headers={"WWW-Authenticate": "Bearer"})
        
        run_id = str(uuid.uuid4())
        base_dir = pathlib.Path("/tmp") / run_id
        base_dir.mkdir(parents=True, exist_ok=True)

        #Download video file
        video_path = base_dir / "input.mp4"
        s3_client = boto3.client('s3')
        s3_client.download_file("clipper-ai-podcast", s3_key, str(video_path))

        #1. Transcribe the video
        transcript_segments_json = self.transcribe(base_dir, video_path)
        transcript_segments = json.loads(transcript_segments_json)

        #2. Identify moments for clips - Gemini AI

        # Return the transcription result
        return {"transcription": transcript_segments_json}

@app.local_entrypoint()
def main():
    import requests

    ai_podcast_clipper = AiPodcastClipper()

    url = ai_podcast_clipper.process_video.web_url

    payload = {
        "s3_key": "test1/m16-5min.mp4"
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer 123123"
    }

    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()
    result = response.json()
    print(result)