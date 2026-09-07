# Asset provenance

All architecture, furniture, wand, landscape geometry, interface, particle effects, lake shader, and synthesized audio were authored for this experience. No movie frames, actor scans, official logos, or proprietary game meshes are included. The user-provided soundtrack added in immersion-v2 is credited separately below and is not project-authored audio.

The following physically based 1K texture sets are from Poly Haven and offered under CC0:

- Castle Wall Variation — Rob Tuytel: https://polyhaven.com/a/castle_wall_varriation
- Roof Slates 02: https://polyhaven.com/a/roof_slates_02
- Monastery Stone Floor: https://polyhaven.com/a/monastery_stone_floor
- License reference: https://polyhaven.com/license

Each set includes diffuse, OpenGL normal, and roughness maps. The original JPG masters are retained in source; runtime uses resized WebP copies. Texture files are bundled locally in the Storvia package. Runtime does not contact Poly Haven.

Harry Potter and Hogwarts setting names remain the property of their respective rights holders. This is an unofficial, artistic reconstruction; it does not claim to reproduce an authoritative architectural blueprint.

## Refinement assets (2026-09-07)

- Large Sandstone Blocks — Rob Tuytel / Poly Haven, CC0: https://polyhaven.com/a/large_sandstone_blocks
- Wood Table 001 — Poly Haven, CC0: https://polyhaven.com/a/wood_table_001
- Both added scanned sets use bundled 1K diffuse, OpenGL normal and roughness WebP copies. Normal maps use quality 94; color and roughness maps use quality 84. Original JPG masters remain in source.
- Six original magical-school oil portraits: built-in OpenAI imagegen, 3×2 atlas, resized to 1296×1152 WebP (232,374 bytes).
- Four original lion, serpent, eagle and badger embroidered heraldic panels: built-in OpenAI imagegen, 2×2 atlas, resized to 1024×1024 WebP (454,512 bytes). These are new illustrations, not official crests.
- Exact generation prompts and source dimensions are in `docs/texture-generation.json`. Gallery art is sampled from the atlas with independent UV transforms. No reference screenshot is bundled.
- Glass leadwork, flame/smoke shaders, animated banners, Sorting Hat, telescope, armillary, galleries and moving stairs are project-authored.

Setting references: [The Great Hall](https://www.harrypotter.com/fact-file/locations/the-great-hall), [The Sorting Hat](https://www.harrypotter.com/writing-by-jk-rowling/the-sorting-hat), [Hogwarts staircases, portraits and enchanted ceiling](https://www.harrypotter.com/features/10-cool-hogwarts-facts-to-impress-your-friends). Architecture and interactive dialogue remain an original interpretation.

## Single-player chapter (2026-09-07)

- The rescue approach, morning study, recovering professor, window shutters, research props, quest objects, parchment interface, house assistance and environmental animations are authored in this project. The professor is a stylized procedural character, not an actor scan or an imported game model.
- Existing bundled stone, wood, portrait and heraldry assets are reused. No new raster file was produced for this chapter. A proposed illustration atlas was rejected by the image tool at its output moderation stage (`moderation_blocked`; category `other`); there was no usable output. The same rejected request was not retried.
- All five language versions of the new dialogue are project-written fan fiction. Parallel survival and recovery events are explicitly identified as an original alternate story. Canon research is recorded separately in `docs/CANON-AND-EASTER-EGGS.md`.
- Readable story text remains localized HTML, so language changes require no alternate baked texture and work without a generation API. No player action invokes a paid model.

## Immersion polish v2 (2026-09-07)

- **John Williams — Hedwig’s Theme**: the user explicitly supplied and requested this [MP3 source](https://cdn.storviai.com/images/John%20Williams%20-%20Hedwigs%20Theme.mp3). The original bytes are bundled at `src/assets/audio/hedwigs-theme.mp3` (4,946,484 bytes; SHA-256 `106bbee8a4a676c277d29caa22f68968ac8df146aeaa23a32f3443408404b875`). This is a soundtrack recording, not newly composed or generated music; it is not covered by the texture assets’ CC0 license. Runtime uses the local copy and does not fetch the CDN.
- The chibi professor, facial details, hair, garments, idle animations, illustrated SVG medallions, envelope folds, wax seal and restrained stained-glass palette were authored procedurally for this update. The user’s figurine reference guided proportions; its pixels and mesh are not bundled. No new image-generation output was needed for this pass.
- Sorting Hat speech uses an optional, explicitly selected browser voice marked as a local service. No recorded actor performance, AI voice generation or paid speech request is included. Subtitles and the mouth animation remain available when a local voice is absent.
- [Official production-design reference](https://www.harrypotter.com/features/designing-hogwarts-castle) describes Hogwarts through medieval Gothic architecture. The colored glazing here is this project’s art direction, not a claim that every pane matches a canonical film set.

## Art and prose v3 (2026-09-07)

- Three new assets were generated with the built-in OpenAI image_gen tool: blank kraft paper, a 24-object storybook icon atlas, and an original chibi professor facial material. No movie frame or actor face was used. The face image is mapped onto original 3D geometry; the hair and body remain procedural models.
- Runtime files: `src/assets/polish-v3/kraft-paper.webp` (512×512; 5,600 bytes), `story-objects.webp` (1152×768; 115,846 bytes), `professor-face.webp` (768×768; 15,592 bytes).
- [Exact prompts and file mapping](./outputs/art-v3/prompts.json); generated PNG masters remain in `outputs/art-v3/`. Cropping, padding, resizing and WebP compression used Sharp. TinyPNG was not used.
- [Hosted URLs, SHA-256 and upload checks](./outputs/art-v3/hosted-assets.json). Uploaded through the existing PicGo desktop configuration using the Tencent Cloud uploader (`tcyun`), served at cdn.storviai.com. Downloaded bytes were compared against the local compressed assets; each matched.
- The linked ZIP uses the hosted kraft-paper and icon atlas URLs plus the user’s original music URL. The 15.6 KB face texture stays local: the tested CDN responses did not include a cross-origin authorization header for the localhost origin. The offline ZIP retains all media locally.
- The revised prose is original fan fiction using setting details and character attitudes; it is not copied prose or a claim of reproducing a particular author's writing style. Brief Traditional Chinese name checks used [the character translation list](https://harrypotter.fandom.com/wiki/List_of_characters_in_translations_of_Harry_Potter) and [Minerva McGonagall’s Chinese entry](https://zh.wikipedia.org/wiki/米奈娃·麥).
