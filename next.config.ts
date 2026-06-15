import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  async headers() {
    return [
      {
        // Permissions-Policy para todas las rutas — permite mic y cámara desde el mismo origen
        source: '/(.*)',
        headers: [
          { key: 'Permissions-Policy', value: 'microphone=(self), camera=(self)' },
        ],
      },
      // COOP/COEP REMOVIDOS: causaban que getUserMedia fallara silenciosamente
      // en iOS Safari y Chrome Android. SharedArrayBuffer (MediaPipe) no lo requiere
      // en la versión CDN que usamos (@mediapipe/face_mesh@0.4).
    ];
  },
};

export default nextConfig;
