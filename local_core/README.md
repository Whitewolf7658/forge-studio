# Spectra Core — your private local AI for Spectra Studio

Spectra Core is a locally hosted AI assistant built for your Roblox VFX and sound workflow. It connects to Ollama models running on your **own Windows PC**. The assistant has actual project-editing tools, optional public-web search, and image/video/audio reference analysis. You must **approve its project changes** before they affect the editor.

**No cloud model fees, accounts or subscriptions required.** Local generation speed and quality depend on your hardware and installed model. The foundation models are open weights, not trained by Spectra.

## Easiest setup: packaged Windows app (no Python or Node installation)

Open the GitHub Actions workflow [Spectra Core portable Windows app](https://github.com/Whitewolf7658/forge-studio/actions/workflows/windows.yml), select the latest **successful** run, and download the **Spectra-Core-Windows** artifact at the bottom of that run. Extract it and double-click **Spectra-Core.exe**.

This file includes the built Spectra editor and the private AI companion server. It opens your default web browser to http://127.0.0.1:8765. Close its console window to stop the assistant.

The only required external installation for the packaged version is **Ollama for Windows** at https://ollama.com/download/windows, plus at least one model (run ollama pull qwen3:4b in a terminal). For image understanding, optionally run ollama pull qwen2.5vl:3b. FFmpeg is optional for audio/video files. The portable executable includes Python itself and does not require npm.

The workflow artifact expires after 30 days; rebuild or download a newer one at any time. It is not a signed commercial installer. Windows may show an unsigned app warning. Only run executables you have verified came from your own GitHub repository.

## Quick setup — Windows 11

Install these free programs once:

1. **Node.js 22+** — https://nodejs.org/
2. **Python 3.11+** — https://python.org/downloads/ (enable the Python launcher)
3. **Ollama for Windows** — https://ollama.com/download/windows
4. **Optional for recording/video analysis:** FFmpeg — https://ffmpeg.org/download.html (add ffmpeg to PATH)

Open a terminal and download your text tool-calling model:

    ollama pull qwen3:4b

For vision and image/video frame understanding:

    ollama pull qwen2.5vl:3b

Optional: run ollama pull qwen3:8b for potentially stronger planning, if your hardware has enough memory. Qwen3 handles text/tool calling; Qwen2.5-VL handles image understanding separately.

Get the Spectra Studio repository onto your Windows PC (clone or download), then double-click **local_core/start_windows.bat**. The launcher builds the browser editor, starts its local companion, and opens:

**http://127.0.0.1:8765**

Keep the launcher window open while using Spectra Core. The URL is private to your computer; **the public Render URL does not run the AI**. Manual VFX and Sound Studio tools still work on Render.

### If setup fails

- Ollama missing: install/reopen Ollama, then reopen your terminal.
- No models installed: run ollama pull qwen3:4b and restart.
- Image reference asks for vision model: install qwen2.5vl:3b.
- Recording/video analysis fails: install FFmpeg and restart the terminal.
- Browser page doesn't open: confirm the launcher is listening on localhost port 8765.
- Slow responses: use qwen3:4b, fewer reference frames and shorter prompts.

## Capabilities

**Private creative memory:** Save your preferred effect style and sound direction in the assistant's Personalize panel. Recent text exchanges and those preferences stay in browser-local storage on your computer; you can clear the chat history inside the panel. The model receives this context during future prompts. Media files are not saved as assistant memories.

**Creation and modification:** inspect active project, add particle emitters, add procedural sound layers, edit/remove specific layers, and set timeline duration/BPM. Multi-layer prompts can propose several changes. **Changes remain drafts until you click Apply.** The edit becomes a single undo step.

**Web research:** disabled by default. Opt in with **Web access** before searching or reading public HTTPS webpages. Web search uses a public RSS search source (subject to availability); content extraction reads publicly accessible text. No logins or private-account scraping.

**Image reference:** JPG/PNG/WebP (max 24 MB) analyzed by a separate installed local vision model. Its description is passed to the planning model.

**Video reference:** FFmpeg samples up to four frames (approximately four seconds apart) from MP4/WEBM/MOV. This is not continuous video understanding. It also attempts approximate soundtrack volume analysis. It does not download arbitrary YouTube videos.

**Audio reference:** WAV/MP3/OGG/M4A with FFmpeg for signal duration and relative loudness over time. There is currently **no transcription or semantic sound recognition**. The measured properties can inform editing.

**Sound generation:** editable procedural synthesizer layers through Sound Studio, not neural synthesis of photorealistic audio waveforms.

**Limits:** maximum 18 tools per request, bounded layer counts and properties, no arbitrary file system access or OS shell execution, no asset publishing, no purchases.

## Privacy and security

- Server binds only to 127.0.0.1 and rejects unknown Host and cross-origin requests.
- Ollama models run locally. Search requests reach a public provider only when web research is enabled.
- Uploaded media is processed in temporary local directories.
- Public HTTPS pages only; private/reserved IP destinations are blocked.
- Treat external websites as untrusted reference text, not agent instructions.
- Review activity logs and proposed changes. Models can make mistakes.
- Never expose the companion port to the internet or place secret API keys in the static site.

## Tests

From repository root:

    python -m unittest discover -s local_core/tests -v
    npm test
    npm run build

GitHub Actions runs all three. Automated tests mock model responses; success does not certify the quality of real local inference or compatibility with every media codec.

## Implementation

- local_core/core.py — agent orchestration, tools, web research, vision and reference analysis
- local_core/server.py — local-only API and browser-editor hosting
- local_core/tests/ — offline tests
- src/core/ai-ui.js — private assistant dock and gated project application
- src/styles/ai-core.css — desktop styling

When adding tools, edit the TOOLS definitions and apply_tool function in core.py, and add regression tests. Keep all edits proposal-only.
