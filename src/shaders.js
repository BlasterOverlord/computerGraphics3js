/**
 * shaders.js
 * Hand-crafted GLSL vertex and fragment shaders:
 *   1. Atmospheric Sky Shader: Renders a cinematic sunset sky dome with Rayleigh/Mie
 *      scattering gradient, horizon haze, and a prominent glowing sun disc + corona
 *      that moves in real time as the user moves the mouse.
 *   2. Highway Asphalt Shader: Renders the 2-lane asphalt highway with road texture,
 *      Blinn-Phong specular highlight (wet/smooth asphalt sheen), and dynamic diffuse
 *      lighting from the moving sun.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. Atmospheric Sky Shader
// ─────────────────────────────────────────────────────────────────────────────
export const skyVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const skyFragmentShader = /* glsl */ `
  uniform vec3 uSunDirection; // Normalized world direction toward the sun

  varying vec3 vWorldPosition;

  void main() {
    vec3 dir = normalize(vWorldPosition);

    // Height t: -0.1 at ground, 0.0 at horizon, 1.0 at zenith
    float t = clamp(dir.y, -0.05, 1.0);

    // Golden hour / sunset palette
    vec3 groundHaze   = vec3(0.22, 0.26, 0.18); // Dark rural horizon tint
    vec3 horizonGold  = vec3(1.00, 0.52, 0.15); // Glowing amber-orange
    vec3 midSky       = vec3(0.92, 0.45, 0.35); // Warm salmon/rose
    vec3 zenithIndigo = vec3(0.12, 0.14, 0.38); // Deep twilight indigo

    vec3 skyColor;
    if (t < 0.0) {
      skyColor = mix(groundHaze, horizonGold, t * 10.0 + 1.0);
    } else if (t < 0.22) {
      skyColor = mix(horizonGold, midSky, t / 0.22);
    } else {
      skyColor = mix(midSky, zenithIndigo, (t - 0.22) / 0.78);
    }

    // Solar calculation
    float sunDot = max(dot(dir, uSunDirection), 0.0);

    // Sharp, glowing sun disc
    float sunDisc = smoothstep(0.997, 0.999, sunDot) * 4.0;

    // Atmospheric solar halo & wide corona
    float coronaWide  = pow(sunDot, 8.0) * 0.45;
    float coronaTight = pow(sunDot, 48.0) * 1.8;

    vec3 sunColor = vec3(1.0, 0.92, 0.65);
    skyColor += sunColor * (sunDisc + coronaTight + coronaWide);

    gl_FragColor = vec4(skyColor, 1.0);
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// 2. Highway Asphalt Custom Shader
// ─────────────────────────────────────────────────────────────────────────────
export const asphaltVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const asphaltFragmentShader = /* glsl */ `
  uniform sampler2D uRoadTexture;
  uniform vec3      uSunPosition;
  uniform vec3      uSunColor;
  uniform vec3      uAmbientColor;
  uniform vec3      uCameraPosition;
  uniform float     uSunIntensity;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec4 texColor = texture2D(uRoadTexture, vUv);

    vec3 normal   = normalize(vNormal);
    vec3 lightDir = normalize(uSunPosition - vWorldPosition);
    vec3 viewDir  = normalize(uCameraPosition - vWorldPosition);

    // Lambertian diffuse
    float NdotL = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = uSunColor * texColor.rgb * NdotL * uSunIntensity;

    // Blinn-Phong specular (wet asphalt / smooth bitumen sheen)
    vec3 halfDir = normalize(lightDir + viewDir);
    float NdotH  = max(dot(normal, halfDir), 0.0);
    float spec   = pow(NdotH, 24.0) * 0.35;
    vec3 specular = uSunColor * spec;

    // Ambient lighting
    vec3 ambient = uAmbientColor * texColor.rgb;

    // Fresnel highway reflection
    float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 4.0) * 0.18;
    vec3 skyReflect = vec3(0.9, 0.55, 0.3) * fresnel;

    gl_FragColor = vec4(ambient + diffuse + specular + skyReflect, texColor.a);
  }
`;
