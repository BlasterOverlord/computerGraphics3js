# 🚚 Bangladeshi Truck — Interactive 3D Highway Simulation
> Built with **Three.js (WebGL)**, **GLSL Shaders**, and **Vite**.

---

## 📖 Table of Contents
1. [Project Overview](#-project-overview)
2. [Course Assignment Requirements & Compliance](#-course-assignment-requirements--compliance)
3. [Key Features & Visual Highlights](#-key-features--visual-highlights)
4. [Project Architecture & File Map](#-project-architecture--file-map)
5. [Technical Deep-Dive (For Course Reports & Presentations)](#-technical-deep-dive-for-course-reports--presentations)
   - [1. Custom GLSL Shaders](#1-custom-glsl-shaders)
   - [2. Lighting Architecture & Shadow Mapping](#2-lighting-architecture--shadow-mapping)
   - [3. Camera & Perspective Projection](#3-camera--perspective-projection)
   - [4. Texturing System (UV & Image Textures)](#4-texturing-system-uv--image-textures)
   - [5. Animation & Infinite Highway Mechanics](#5-animation--infinite-highway-mechanics)
   - [6. User Interaction (Mouse & Keyboard)](#6-user-interaction-mouse--keyboard)
6. [Controls & Hotkeys Reference](#-controls--hotkeys-reference)
7. [Installation & Running Instructions](#-installation--running-instructions)
8. [Developer & AI Continuation Guide (Roadmap for Next Steps)](#-developer--ai-continuation-guide-roadmap-for-next-steps)
9. [External Assets & Attribution](#-external-assets--attribution)

---

## 🌟 Project Overview

This project is an interactive, photorealistic, and culturally authentic 3D simulation of a classic **Bangladeshi cargo truck** (featuring traditional hand-painted floral motifs and authentic *"সাধারণ পরিবহন"* typography) driving along a scenic two-lane national highway during golden hour / sunset.

The project demonstrates core principles of modern 3D computer graphics:
- **Programmable pipeline** with hand-written vertex and fragment GLSL shaders.
- **Physically-inspired lighting models** (Lambertian diffuse, Blinn-Phong specular, ambient, hemisphere, spotlights, and point lights).
- **Hierarchical scene graphs**, modular ring-buffer recycling for infinite environments, and continuous wheel-axle rotation animation.
- **Interactive input mapping** allowing real-time camera orbiting and dynamic solar light positioning.

---

## 🎯 Course Assignment Requirements & Compliance

### Provided Course Instructions
> **General Requirements:**
> 1. Custom shaders  
> 2. Implementation of lighting  
> 3. Perspective projection  
> 4. Texture for each object  
> 5. Animation  
> 6. Mouse and keyboard interaction  
>
> **Assigned Project: "A Truck"**
> - **3D objects:**  
>   1. Truck body [with texture]  
>   2. Truck wheel [with texture]  
> - **Keyboard interaction:** Camera will move around the truck  
> - **Mouse interaction:** Light position will rotate around the truck  
> - **Animation:** Wheels will rotate  
>
> **Additional Notes:**  
> 1. *Option to import an existing model or construct using Three.js geometries.* (Authentic Bangladeshi truck model imported and optimized).  
> 2. *Free to enhance with additional features.* (Implemented complete 2-lane infinite highway, oncoming traffic fleet, curved streetlights, guardrails, trees, audio, HUD, camera presets).  
> 3. *Assessed on aesthetic aspects.* (Sunset atmospheric scattering, Blinn-Phong road sheen, soft shadows, warm golden lighting).

### Compliance Matrix

| Requirement | Rubric Criteria | Project Implementation | Primary Source File | Status |
|---|---|---|---|---|
| **1. Custom Shaders** | Custom GLSL vertex & fragment shaders | • **Atmospheric Sky Shader**: Simulates Rayleigh/Mie scattering sunset gradient + dynamic glowing solar disc & corona.<br>• **Blinn-Phong Road Shader**: Calculates specular sheen (wet/smooth asphalt reflection) and diffuse lighting from moving sun. | [`src/shaders.js`](file:///c:/code/computerGraphics3js/src/shaders.js) | ✅ 100% Pass |
| **2. Implementation of Lighting** | Multiple light sources & interaction | • **Directional Sun Light** with 2048x2048 PCFSoftShadowMap.<br>• **Ambient Twilight Light** for soft base illumination.<br>• **Hemisphere Light** for sky-to-ground bounce.<br>• **Highway Streetlights** (curved poles with warm downward point lights).<br>• **Vehicle Headlights & Taillights** (spotlights & glowing lens meshes). | [`src/main.js`](file:///c:/code/computerGraphics3js/src/main.js)<br>[`src/scene.js`](file:///c:/code/computerGraphics3js/src/scene.js)<br>[`src/truck.js`](file:///c:/code/computerGraphics3js/src/truck.js) | ✅ 100% Pass |
| **3. Perspective Projection** | Camera with perspective projection | `THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)` initialized with realistic FOV and dynamic aspect ratio update on resize. | [`src/main.js`](file:///c:/code/computerGraphics3js/src/main.js) | ✅ 100% Pass |
| **4. Texture for Each Object** | UV / image textures on all geometry | • **Truck body & wheels**: Authentic UV diffuse textures.<br>• **Highway asphalt**: Seamless local CC0 asphalt image sampled by the custom road shader.<br>• **Roadside terrain & shoulders**: Seamless local CC0 grass/soil and gravel images.<br>• **Guardrails & Streetlights**: Local weathered-metal image maps with their original metalness/roughness values preserved.<br>• **Trees & Traffic**: Original embedded GLB materials, unchanged. | [`src/truck.js`](file:///c:/code/computerGraphics3js/src/truck.js)<br>[`src/textures.js`](file:///c:/code/computerGraphics3js/src/textures.js)<br>[`src/scene.js`](file:///c:/code/computerGraphics3js/src/scene.js) | ✅ 100% Pass |
| **5. Animation** | Wheel rotation & motion | • **Wheel Rotation**: Truck wheels rotate around local axles in forward direction proportional to driving delta.<br>• **Infinite Highway**: 3-segment modular road system endlessly recycled.<br>• **Traffic Flow**: Oncoming vehicles travel along opposite lane.<br>• **Engine Vibration**: Subtle rhythmic idle vibration on truck cab. | [`src/truck.js`](file:///c:/code/computerGraphics3js/src/truck.js)<br>[`src/scene.js`](file:///c:/code/computerGraphics3js/src/scene.js) | ✅ 100% Pass |
| **6. Interaction: Keyboard** | Camera moves around truck | Arrow keys (<kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd>) and <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> smoothly orbit the camera azimuthally and vertically around the truck center in spherical coordinates. Keys <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd> provide instant preset views. | [`src/controls.js`](file:///c:/code/computerGraphics3js/src/controls.js) | ✅ 100% Pass |
| **7. Interaction: Mouse** | Light position rotates around truck | Moving the mouse horizontally and vertically dynamically calculates spherical coordinates for the directional sun light, rotating the sun disc across the sky dome and casting real-time rotating soft shadows. | [`src/controls.js`](file:///c:/code/computerGraphics3js/src/controls.js) | ✅ 100% Pass |
| **Assigned: A Truck** | Truck body + wheel [with textures] | Authentic Bangladeshi Bedford/Tata cargo truck with high-detail body paint, Bengali typography, metal grille, and textured rotating wheels. | [`src/truck.js`](file:///c:/code/computerGraphics3js/src/truck.js)<br>[`public/models/truck.glb`](file:///c:/code/computerGraphics3js/public/models/truck.glb) | ✅ 100% Pass |
| **Aesthetic Assessment** | Visual polish & realism | Golden hour color harmony, ACESFilmic tone mapping, atmospheric fog blending, soft shadows, warm streetlights, reflective lane markers, and roadside vegetation. | [`src/main.js`](file:///c:/code/computerGraphics3js/src/main.js)<br>[`src/shaders.js`](file:///c:/code/computerGraphics3js/src/shaders.js) | ✅ 100% Pass |

---

## 🎨 Key Features & Visual Highlights

- **Drifting sunset clouds**: A time-driven procedural cloud layer in the original sky shader adds movement and soft golden edges without extra meshes or downloads. Mouse-controlled sunlight remains active.
- **Truck horn from a sound file**: Right-click the scene or press **H** to play `public/sounds/truck-horn.mp3`. Playback starts only on a user gesture and repeated input cannot overlap the sound. The **M / Sound** toggle controls the background loop separately.

- **Left-Lane Authentic Bangladeshi Driving**:
  - The truck travels forward in the **left lane** (`X = -2.65`), reflecting Bangladeshi left-hand traffic regulations.
  - Oncoming vehicles travel in the **right lane** (`X = +2.65`) facing the player with illuminated headlights.
- **Seamless Infinite Highway**:
  - 3 modular segments spanning 420 units along the Z axis.
  - As segments pass behind the camera, they reposition to the front of the queue, ensuring the highway **never ends or terminates into empty terrain**.
- **Cinematic Golden Hour Sunset**:
  - Procedural Rayleigh and Mie scattering approximation in custom GLSL.
  - Solar disc with intense corona and exponential horizon glow.
- **Glassmorphic Interactive HUD**:
  - Displays hotkeys, lane legend, quick camera preset buttons, and real-time audio toggle indicator.
- **Atmospheric Highway Audio**:
  - Integrated highway background audio loop (`public/sounds/highway.mp3`) with clean browser policy handling and interactive mute toggle.

---

## 📂 Project Architecture & File Map

```
computerGraphics3js/
├── index.html              # Entry HTML shell, viewport styling, and glassmorphic HUD overlay
├── package.json            # Project dependencies (three, vite)
├── vite.config.js          # Vite build configuration (base: './')
├── public/                 # Static assets served by Vite
│   ├── models/             # 3D GLTF/GLB models
│   │   ├── truck.glb       # Authentic Bangladeshi cargo truck model (main object)
│   │   ├── tree.glb        # Roadside deciduous trees
│   │   ├── ferrari.glb     # Traffic sports car
│   │   ├── CesiumMilkTruck.glb # Traffic commercial box truck
│   │   ├── car3_minivan.glb    # Traffic yellow minivan
│   │   └── car1_truck.glb      # Traffic pickup truck
│   └── sounds/
│       ├── highway.mp3     # Continuous ambient highway background audio
│       └── truck-horn.mp3  # User-supplied truck horn recording
└── src/                    # JavaScript & GLSL source code
    ├── main.js             # Master orchestrator, scene lifecycle, animation loop, resize
    ├── scene.js            # Infinite 2-lane road, streetlights, guardrails, trees, traffic fleet
    ├── truck.js            # Truck loading, scale/pivot normalization, headlights, wheel animation
    ├── shaders.js          # Custom GLSL vertex & fragment shaders (Sky & Asphalt)
    ├── controls.js         # Keyboard camera orbit & mouse sun light rotation manager
    ├── textures.js         # Local seamless environment image texture loader/configuration
    └── audio.js            # HTML5 Audio manager with reactive UI synchronization
```

---

## 🔬 Technical Deep-Dive

### 1. Custom GLSL Shaders
Located in [`src/shaders.js`](file:///c:/code/computerGraphics3js/src/shaders.js).

#### A. Atmospheric Sky Shader (`skyVertexShader`, `skyFragmentShader`)
- **Mathematical Basis**: Approximates atmospheric scattering across a large inverted sphere (`radius = 280`).
- **Gradient Computation**: Uses the normalized world-space height component $t = \text{clamp}(dir.y, -0.05, 1.0)$ to interpolate through a multi-stop color gradient:
  - Deep rural ground haze: $\text{RGB}(0.22, 0.26, 0.18)$
  - Golden amber horizon: $\text{RGB}(1.00, 0.52, 0.15)$
  - Warm rose twilight: $\text{RGB}(0.92, 0.45, 0.35)$
  - Deep zenith indigo: $\text{RGB}(0.12, 0.14, 0.38)$
- **Solar Disc & Corona**:
  - Evaluates dot product between view ray and sun direction vector: $\cos\theta = \max(\vec{V} \cdot \vec{L}_{\text{sun}}, 0.0)$.
  - **Sun Disc**: $\text{smoothstep}(0.997, 0.999, \cos\theta) \times 4.0$ creates a crisp, glowing solar core.
  - **Solar Corona**: Two-tier exponential scattering: $\text{pow}(\cos\theta, 48.0) \times 1.8$ (tight core) + $\text{pow}(\cos\theta, 8.0) \times 0.45$ (wide halo).

#### B. Highway Asphalt Road Shader (`asphaltVertexShader`, `asphaltFragmentShader`)
- **Mathematical Basis**: Combines **Lambertian Diffuse** and **Blinn-Phong Specular Reflection** with Fresnel surface sheen.
- **Lighting Equations**:
  $$\vec{H} = \frac{\vec{L} + \vec{V}}{\|\vec{L} + \vec{V}\|}$$
  $$I_{\text{diffuse}} = (\vec{N} \cdot \vec{L}) \cdot C_{\text{sun}} \cdot C_{\text{texture}} \cdot k_{\text{intensity}}$$
  $$I_{\text{specular}} = (\vec{N} \cdot \vec{H})^{24.0} \cdot C_{\text{sun}} \cdot 0.35$$
  $$I_{\text{fresnel}} = (1.0 - \max(\vec{V} \cdot \vec{N}, 0.0))^{4.0} \cdot C_{\text{sky}} \cdot 0.18$$
  $$I_{\text{total}} = I_{\text{ambient}} + I_{\text{diffuse}} + I_{\text{specular}} + I_{\text{fresnel}}$$
- Gives the road a realistic wet/smooth asphalt sheen that responds dynamically to both camera angle and moving sun position.

---

### 2. Lighting Architecture & Shadow Mapping
Implemented in [`src/main.js`](file:///c:/code/computerGraphics3js/src/main.js) and [`src/scene.js`](file:///c:/code/computerGraphics3js/src/scene.js).

1. **Primary Directional Sun Light**:
   - Color: `#FFE2A0` (warm golden sunlight), Intensity: `2.2`.
   - Shadow Map Resolution: `2048 x 2048` with `THREE.PCFSoftShadowMap` filtering.
   - Shadow Frustum: Orthographic bounding volume ($[-25, 25]$ on X/Y, near `1.0`, far `180.0`) centered around the truck.
   - Dynamic Orbit: Controlled by mouse position, orbiting on a hemisphere of radius 85 units around the truck.
2. **Ambient Fill Light**:
   - Color: `#FFC088`, Intensity: `0.45` — fills shadows with a warm sunset ambient glow to prevent pitch-black occluded surfaces.
3. **Hemisphere Sky-to-Ground Light**:
   - Sky Color: `#FFA060` (warm amber), Ground Color: `#2A4518` (dark agricultural earth), Intensity: `0.55`.
4. **Highway Streetlights**:
   - Positioned along shoulders every 35 units with curved Bezier masts.
   - Each head features a warm `THREE.PointLight` (`#FFE8A8`, intensity `1.4`, distance `22`) casting light down onto the road and guardrails.
5. **Truck & Traffic Vehicle Headlights**:
   - Forward `THREE.SpotLight` cones (`#FFF2A8` and `#FFF8C0`) casting directed light onto the road surface ahead of each vehicle.
   - Paired with emissive sphere geometry representing glowing headlight glass lenses.

---

### 3. Camera & Perspective Projection
Implemented in [`src/main.js`](file:///c:/code/computerGraphics3js/src/main.js) and [`src/controls.js`](file:///c:/code/computerGraphics3js/src/controls.js).

- **Perspective Formulation**:
  $$x_{\text{ndc}} = \frac{x \cdot \frac{1}{\tan(\text{FOV}/2) \cdot \text{aspect}}}{-z}, \quad y_{\text{ndc}} = \frac{y \cdot \frac{1}{\tan(\text{FOV}/2)}}{-z}$$
  Configured with:
  - Field of View (FOV): $60^\circ$ (natural human eye perspective without wide-angle distortion).
  - Near plane: `0.1`, Far plane: `1000.0`.
- **Spherical Orbit Coordinate System**:
  The camera orbits around the truck center $\vec{P}_{\text{truck}} = (-2.65, 1.8, 0.0)$ using spherical angles:
  $$x = P_x + r \cdot \sin(\theta) \cdot \cos(\phi)$$
  $$y = P_y + r \cdot \sin(\phi)$$
  $$z = P_z + r \cdot \cos(\theta) \cdot \cos(\phi)$$
  Where:
  - $\theta$: Azimuthal orbit angle (controlled by <kbd>←</kbd> <kbd>→</kbd> / <kbd>A</kbd> <kbd>D</kbd>).
  - $\phi$: Elevation angle (clamped between $0.08$ and $1.35$ rad by <kbd>↑</kbd> <kbd>↓</kbd> / <kbd>W</kbd> <kbd>S</kbd>).
  - $r$: Orbit radius / zoom (clamped between $5.0$ and $38.0$ units by scroll wheel or <kbd>+</kbd> <kbd>−</kbd>).
  - Smooth interpolation via linear interpolation (`lerp`) factor of $0.08$ per frame for fluid, cinematic motion.

---

### 4. Texturing System (UV & Image Textures)
Implemented in [`src/textures.js`](file:///c:/code/computerGraphics3js/src/textures.js).

- **Local seamless image textures**:
  - CC0 1K diffuse maps are stored in `public/textures/`, so rendering has no runtime image dependency on external hosts.
  - Asphalt remains sampled by the existing custom road shader; lane and edge markings remain separate intentional materials.
  - Grass/soil terrain and gravel shoulders use independently scaled repeat wrapping appropriate to their geometry.
  - Guardrail beams/posts and streetlight poles/fixtures use separate weathered-metal texture instances while retaining their original PBR metalness and roughness values.
  - Source, author, and license details are recorded in [`public/textures/ATTRIBUTION.md`](file:///c:/code/computerGraphics3js/public/textures/ATTRIBUTION.md).
- **3D Model UV Textures**:
  - `truck.glb` contains authentic UV diffuse maps for the truck cab, wooden flatbed with Bengali typography (*"সাধারণ পরিবহন"*), mudguards, and tire treads.
  - Imported truck, tree, and traffic GLB materials are left unchanged.

---

### 5. Animation & Infinite Highway Mechanics
Implemented in [`src/truck.js`](file:///c:/code/computerGraphics3js/src/truck.js) and [`src/scene.js`](file:///c:/code/computerGraphics3js/src/scene.js).

1. **Truck Wheel Rotation**:
   - Model nodes named `tire`, `back tire`, and `back_tire` are indexed on load.
   - For each frame, the wheels are rotated around their local axle:
     $$\Delta\theta_{\text{wheel}} = \text{speed} \cdot \Delta t \cdot 4.2$$
     $$\text{wheel.rotation.z} \mathrel{+}= \Delta\theta_{\text{wheel}}$$
   - Synchronized with the perceived forward travel speed down the highway.
2. **Infinite Road Ring-Buffer Recycling**:
   - Three road segment groups (`length = 140` each, total length = 420 units) scroll along $+Z$ at $\text{driveDelta} = \text{speed} \cdot \Delta t \cdot 14.0$:
     $$\text{segment.position.z} \mathrel{+}= \text{driveDelta}$$
   - When $\text{segment.position.z} > \text{SEGMENT\_LENGTH}$, the segment is wrapped:
     $$\text{segment.position.z} \mathrel{-}= \text{SEGMENT\_LENGTH} \times \text{NUM\_SEGMENTS}$$
   - Creates a seamless, endless highway loop that never tears or hits an empty boundary.
3. **Two-Way Traffic Fleet**:
   - Oncoming cars are placed in the right lane (`X = +2.7`).
   - Move along $+Z$ at relative speed $\text{driveDelta} + v_{\text{car}} \cdot \Delta t \cdot 14.0$.
   - Automatically respawn at randomized distances behind the horizon ($-260$ to $-320$) once passing beyond $+50$ units.

---

### 6. User Interaction (Mouse & Keyboard)
Implemented in [`src/controls.js`](file:///c:/code/computerGraphics3js/src/controls.js).

- **Keyboard Interaction**:
  - Continuous keyboard state polling via `keydown` and `keyup` listeners on `window`.
  - Orbit azimuth $\theta$ and elevation $\phi$ updated smoothly every animation tick.
  - Hotkeys <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd> transition to preset spherical angles:
    - **Preset 1 (Chase)**: $\theta = 0.04, \phi = 0.26, r = 14.0$ (Directly behind the truck in the left lane).
    - **Preset 2 (Side)**: $\theta = \pi/2, \phi = 0.22, r = 13.5$ (Elevated side profile showing wheels and typography).
    - **Preset 3 (Front)**: $\theta \approx \pi, \phi = 0.18, r = 16.0$ (Front low-angle looking down the oncoming highway).
  - Hotkey <kbd>M</kbd>: Toggles background audio loop with sound manager listener update.
- **Mouse Interaction**:
  - Listens to `mousemove` across the client viewport.
  - Normalizes viewport X to sweep sun azimuth across the forward horizon: $\text{angleX} = 0.60 + 0.28 \cdot \frac{x}{\text{width}}$.
  - Normalizes viewport Y to adjust solar elevation: $\text{elevation} = 0.12 + 0.45 \cdot (1.0 - \frac{y}{\text{height}})$.
  - Dynamically repositions `sunLight.position`, updates `uSunDirection` on the sky shader, and moves `sunMesh` across the sky dome.

---

## 🎮 Controls & Hotkeys Reference

| Input | Target | Description |
|---|---|---|
| <kbd>←</kbd> <kbd>→</kbd> or <kbd>A</kbd> <kbd>D</kbd> | Camera Orbit | Orbit horizontally around the truck center |
| <kbd>↑</kbd> <kbd>↓</kbd> or <kbd>W</kbd> <kbd>S</kbd> | Camera Height | W / ↑ raises the camera; S / ↓ lowers it |
| <kbd>+</kbd> <kbd>−</kbd> or **Mouse Wheel** | Camera Zoom | Smoothly zoom in and out |
| **Move Mouse** | Sun Position | Rotates the sun across the sky and casts dynamic soft shadows |
| <kbd>H</kbd> or **Right Click** on scene | Truck Horn | Play the truck horn MP3 (independent of background sound) |
| <kbd>1</kbd> or **"1: Chase"** Button | View Preset | Cinematic chase camera behind the truck in the left lane |
| <kbd>2</kbd> or **"2: Side"** Button | View Preset | Side profile camera showing the wheel animation and Bangla typography |
| <kbd>3</kbd> or **"3: Front"** Button | View Preset | Low-angle front camera facing oncoming traffic and truck cab |
| <kbd>M</kbd> or **"Sound"** Button | Audio Toggle | Toggle ambient highway background sound ON / OFF |

---

## 💻 Installation & Running Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0 or higher recommended)
- Modern web browser with WebGL 2.0 support (Chrome, Edge, Firefox, Safari)

### Step-by-step Setup
```bash
# 1. Clone or navigate to the project root directory
cd computerGraphics3js

# 2. Install dependencies (Three.js and Vite)
npm install

# 3. Start the local development server with Hot Module Replacement (HMR)
npm run dev
```

Once started, open your browser to the printed local URL:
```
http://localhost:5173/
```

### Truck Horn Sound

The horn recording is included at **`public/sounds/truck-horn.mp3`**. To replace it, save a short MP3 recording you have permission to use at the same path.

Refresh the page, then **right-click the scene** or press **H**. No code changes are needed. If the recording is missing or cannot be played, the scene continues normally and a console warning explains the problem. After replacing the sound, run `npm run build` again for deployment. The original HUD is unchanged; horn controls are documented here. There is no synthesized fallback.

### Production Build & Preview
```bash
# Build optimized production bundle to /dist
npm run build

# Preview production build locally
npm run preview
```

---

## 🚀 Developer & AI Continuation Guide (Roadmap for Next Steps)

If you are an AI assistant or human developer working on the next iteration or writing the academic report, here is the exact context on how the codebase is organized and recommended next features:

### Codebase Organization Rules
- **Lane Positions**:
  - Left lane (truck travel direction along $-Z$): $X = -2.65$
  - Right lane (oncoming traffic travel direction along $+Z$): $X = +2.65$
- **Adding New Traffic Vehicles**:
  - Add your GLB model into `public/models/`.
  - In [`src/scene.js`](file:///c:/code/computerGraphics3js/src/scene.js), call `loadTrafficCar('/models/your_car.glb', targetLength)` inside `Promise.all`.
  - Note: `loadTrafficCar()` automatically normalizes scale and neutralizes bounding box center offsets so that car bodies always align with road center lines and headlight flares.
- **Modifying Shaders**:
  - Keep shader code in [`src/shaders.js`](file:///c:/code/computerGraphics3js/src/shaders.js).
  - Uniforms are bound in `skyMat` and `roadShaderMat` in [`src/scene.js`](file:///c:/code/computerGraphics3js/src/scene.js).
  - Any new time or lighting uniforms can be updated in `updateScene()` inside the animation loop in [`src/main.js`](file:///c:/code/computerGraphics3js/src/main.js).

### Recommended Extension Ideas
1. **Dynamic Day / Night Cycle**:
   - Animate `sunAngleX` and `sunElevation` continuously over time (with a pause/manual override toggle in the HUD).
   - Invert sky colors at night to deep navy/black with twinkling star particles, while increasing the intensity of streetlight point lights and car headlight spotlights.
2. **Weather System (Monsoon Rain & Wet Asphalt)**:
   - Add a `THREE.Points` particle system for falling raindrops with velocity along $-Y$ and $-Z$.
   - Increase the Blinn-Phong specular exponent in `asphaltFragmentShader` and add normal-map ripple distortion to simulate rain puddles.
3. **Interactive Truck Driving**:
   - Allow user keyboard steering (<kbd>A</kbd> / <kbd>D</kbd> or <kbd>←</kbd> / <kbd>→</kbd> in drive mode) to switch lanes or avoid slow traffic.
   - Add acceleration / braking (<kbd>W</kbd> / <kbd>S</kbd>) modifying `HIGHWAY_SPEED`.
4. **Driver Cockpit Camera View (Preset 4)**:
   - Add camera preset 4 positioned inside the truck cab looking through the front windshield, complete with dashboard steering wheel geometry and rear-view mirror reflection.

---

## 📦 External Assets & Attribution

All external 3D models, audio, and utilities used in this project are documented below with their respective creator attributions, repositories, and direct download links:

| Asset Name | Local File Path | Creator / Source Platform | Link & Repository | Description & Notes |
|---|---|---|---|---|
| **Tata Bangladeshi Truck** | [`public/models/truck.glb`](file:///c:/code/computerGraphics3js/public/models/truck.glb) | **MD. NAHID HASAN** (Sketchfab) | [Sketchfab Model Page](https://sketchfab.com/3d-models/tata-bangladashi-truck-1d46922d2a0b4aa688349dd005fe5ee1) | Primary project subject: authentic Bangladeshi cargo truck with hand-painted floral motifs, wooden cargo bed, chassis, and *"সাধারণ পরিবহন"* typography. |
| **Ferrari 458 Italia** | [`public/models/ferrari.glb`](file:///c:/code/computerGraphics3js/public/models/ferrari.glb) | **Three.js Examples** (mrdoob / contributors) | [Three.js GitHub Repository](https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf/ferrari.glb) • [Raw Model](https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/ferrari.glb) | High-performance sports car featured in the oncoming traffic fleet. |
| **Cesium Milk Truck** | [`public/models/CesiumMilkTruck.glb`](file:///c:/code/computerGraphics3js/public/models/CesiumMilkTruck.glb) | **KhronosGroup glTF Sample Models** (Analytical Graphics / Cesium) | [KhronosGroup GitHub](https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0/CesiumMilkTruck) • [Raw Model](https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMilkTruck/glTF-Binary/CesiumMilkTruck.glb) | Commercial box cargo truck featured in the oncoming traffic fleet (CC-BY 4.0). |
| **Low-Poly Yellow Minivan** | [`public/models/car3_minivan.glb`](file:///c:/code/computerGraphics3js/public/models/car3_minivan.glb) | **Nick Bogie** (`nbogie/three-js-cars-2`) | [GitHub Repository](https://github.com/nbogie/three-js-cars-2) • [Raw Model](https://raw.githubusercontent.com/nbogie/three-js-cars-2/main/models/car3_minivan.glb) | Low-poly family minivan featured in the oncoming traffic fleet. |
| **Low-Poly Pickup Truck** | [`public/models/car1_truck.glb`](file:///c:/code/computerGraphics3js/public/models/car1_truck.glb) | **Nick Bogie** (`nbogie/three-js-cars-2`) | [GitHub Repository](https://github.com/nbogie/three-js-cars-2) • [Raw Model](https://raw.githubusercontent.com/nbogie/three-js-cars-2/main/models/car1_truck.glb) | Low-poly utility pickup truck featured in the oncoming traffic fleet. |
| **Roadside Deciduous Tree** | [`public/models/tree.glb`](file:///c:/code/computerGraphics3js/public/models/tree.glb) | **Javi Agenjo** (`jagenjo/GTR_Framework`) | [GitHub Repository](https://github.com/jagenjo/GTR_Framework) • [Raw Model](https://raw.githubusercontent.com/jagenjo/GTR_Framework/master/data/prefabs/tree.glb) | Realistic deciduous tree prefabs lining the highway outer banks. |
| **Highway Ambient Sound** | [`public/sounds/highway.mp3`](file:///c:/code/computerGraphics3js/public/sounds/highway.mp3) | **Highway Traffic Audio** | [Local Audio Path](file:///c:/code/computerGraphics3js/public/sounds/highway.mp3) | Continuous looping ambient highway road hiss and vehicle engine sound. |
| **Draco 3D Geometry Decoder** | Web CDN | **Google Draco** | [Google Draco CDN](https://www.gstatic.com/draco/versioned/decoders/1.5.7/) | Used by `DRACOLoader` in `scene.js` for fast decompression of compressed GLTF models. |
