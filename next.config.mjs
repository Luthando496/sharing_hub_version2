/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // OAuth profile photos
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com', port: '', pathname: '/**' },
      // Uploaded files and thumbnails
      { protocol: 'https', hostname: 'ik.imagekit.io', port: '', pathname: '/**' },
    ],
  },
};

export default nextConfig;
