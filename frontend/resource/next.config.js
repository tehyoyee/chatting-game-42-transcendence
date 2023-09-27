/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	images: {
		domains: ['localhost'],
		unoptimized: true,
	}
}

module.exports = nextConfig
