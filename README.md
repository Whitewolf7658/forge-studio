# Spectra Studio — VFX + Audio for Roblox

Spectra Studio is a browser-based particle-effects and audio-design workstation created for building Roblox game assets. It replaces the former Forge Studio modelling interface; the existing GitHub repository and Render Static Site can be reused.

## Spectra Core — private local AI

Spectra Studio now includes the **Spectra Core** assistant dock. It is intended for your own Windows PC and uses free Ollama models locally, rather than charging per prompt.

- Inspect your current project, propose editable emitter and synth-sound layers, revise existing layers and arrange timeline properties.
- Research public webpages (explicit opt-in), show sources, and analyze image or video references with an optional local vision model.
- Analyze audio/video soundtrack loudness and timing when FFmpeg is available.
- Review proposed changes in an Apply / Discard panel. Spectra does not modify the project without your approval.
- Every applied AI change is added to the editor's undo history.

**To use AI you must run the private companion locally.** The Render static site shows the assistant dock and setup information but **cannot run the local model on its own**. See the [Windows setup and limitations](local_core/README.md). The recommended free setup is Ollama with qwen3:4b, plus qwen2.5vl:3b for images. You'll also need Node.js and Python for the launcher. More capable models may require more RAM/VRAM.

The assistant does not train a new foundation model, does not yet semantically understand recorded audio, and does not generate photorealistic neural audio waveforms. These would require additional dedicated models. It can create editable procedural Sound Studio layers now.

## Included workspaces

### Particle Lab
- **New Effect** creates a completely independent emitter with neutral settings; presets are optional shortcuts, not required.
- Layered real-time 3D particle preview with orbit/pan/zoom and top/front views.
- 10 included effects: embers, magic, smoke, impacts, snow, dust, portals, confetti, electricity, and fire.
- Spawn shape, rate, burst count, lifetime, velocity, spread, gravity, drag, turbulence, position, size, opacity, colour, sprite and blending settings.
- Per-layer mute and solo; manual emission and animation timeline.
- Export a generated particle sprite as a transparent PNG.
- Export a Roblox Luau script that constructs `ParticleEmitter` instances on attachments and schedules bursts and emissions.

### Sound Studio
- **New Sound** creates a blank synth layer with a sine oscillator and no added noise or effects; every sound parameter is editable.
- 10 procedural synth presets, including lasers, whooshes, explosions, UI blips, impacts, bells and ambient wind.
- Multi-layer stereo sound design with oscillator waveforms, pitch glide, amplitude envelope, low-pass filtering, drive/saturation, pan, noise and delay.
- Import audio supported by the browser (`wav`, `mp3`, `ogg` etc.) and retain up to the first 12 seconds in a portable project file.
- Stereo waveform preview, playback, selected-sound preview and 16-bit / 44.1 kHz stereo WAV export.

### Cue Composer
- Synchronized timeline of sound and particle layers.
- Drag clips to move or resize; hold Shift while dragging for beat snapping based on BPM.
- Play/pause, stop, scrub, timeline zoom, project length, undo/redo.

## Project files

All editing happens locally. File → Save downloads a `.spectra.json` project. The editor also attempts to keep a browser-local autosave; use the downloaded file for long-term backups, especially on school or shared devices.

## Roblox workflow

1. Design particle effects and audio in Spectra.
2. Export the Roblox `.lua` emitter setup and paste it into a Script in Roblox Studio.
3. For custom particle sprite appearance, export a PNG and upload it to Roblox Creator Dashboard. Paste the resulting `rbxassetid://...` into the emitter's asset ID field, then export the Lua again.
4. Export the WAV audio and upload it separately to Roblox. Paste its asset ID into each sound layer and re-export the Lua. The exported script creates Sound instances and schedules those with valid IDs.

**Important:** The preview is an approximation of Roblox particle rendering; the simulator's procedural turbulence, ring emission, gradients and glow shapes will not always translate 1:1 to Roblox `ParticleEmitter` properties. Verify final effects in Roblox Studio. Spectra does not automatically upload textures or audio or assign Roblox asset IDs.

## Development

Requires Node 22+.

```sh
npm install
npm run dev
npm test
npm run build
```

The build outputs a static `dist/` directory, suitable for Render Static Site. Use `npm install && npm run build` with publish directory `dist`.

The code uses browser Canvas 2D, Web Audio and native ES modules; no third-party runtime dependency is needed. Unit tests cover sound generation, WAV format, project validation and Roblox export. Browser interaction tests were performed with Chromium before deployment.
## AI generation direction

A future optional AI integration may translate text and image references into editable emitter projects, or generate sounds with a third-party sound-effects model. It is **not implemented or enabled** in the local editor. Online generation requires a separate secure backend, provider credentials, billing safeguards and explicit user consent. Never put provider API keys into this static site's JavaScript.
