/** @type {import('next').NextConfig} */
import path from 'path'
 module.exports = {
      reactStrictMode: true,
      output: "standalone", // Required for standalone output
      experimental: {
        outputFileTracingRoot: path.join(__dirname, "../../"), // Adjust this path based on your app's location relative to the monorepo root
      },
    };
