import React from 'react'
import { HomeIcon } from '@heroicons/react/24/outline'

interface HeroSectionProps {
  appClientError?: Error | null
}

const HeroSection: React.FC<HeroSectionProps> = () => (
  <div className="relative px-6 pt-16 pb-12 sm:pt-24 lg:static lg:px-8 lg:py-32 flex items-center">
    <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-lg">
      <div className="absolute inset-y-0 left-0 -z-10 w-full overflow-hidden bg-gray-100 ring-1 ring-gray-900/10 lg:w-1/2">
        <svg
          aria-hidden="true"
          className="absolute inset-0 size-full mask-[radial-gradient(100%_100%_at_top_right,white,transparent)] stroke-gray-200"
        >
          <defs>
            <pattern x="100%" y={-1} id="hero-pattern" width={200} height={200} patternUnits="userSpaceOnUse">
              <path d="M130 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <rect fill="white" width="100%" height="100%" strokeWidth={0} />
          <svg x="100%" y={-1} className="overflow-visible fill-gray-50">
            <path d="M-470.5 0h201v201h-201Z" strokeWidth={0} />
          </svg>
          <rect fill="url(#hero-pattern)" width="100%" height="100%" strokeWidth={0} />
        </svg>
      </div>
      <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 mb-2">
        <HomeIcon className="h-10 w-10 text-teal-500" />
      </span>
      <h1 className="text-4xl font-bold text-gray-900">Fractional Real Estate Demo</h1>
      <p className="mt-6 text-lg text-gray-600 max-w-lg">
        List properties, view available listings, and buy fractional shares. Connect your wallet to get started.
      </p>

      <a
        href="https://github.com/your-org/fractional-realestate-ts"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 mt-8 bg-gray-900 text-white rounded-lg shadow hover:bg-gray-800 transition"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.606-2.665-.304-5.466-1.334-5.466-5.931 0-1.31.468-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.52 11.52 0 0 1 3.003-.404c1.02.005 2.047.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.12 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.625-5.475 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 21.796 24 17.299 24 12c0-6.627-5.373-12-12-12z" />
        </svg>
        Star on GitHub
      </a>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Why build on Algorand?</h3>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>Fast, low-cost transactions</li>
          <li>Native support for digital assets</li>
          <li>Write smart contracts in Typescript or Python</li>
        </ul>
      </div>

      <div className="flex gap-4 mt-8 items-center">
        <img src="/algorand-logo-icon.svg" alt="Algorand" className="h-8" title="Algorand" />
        <img src="/react-logo.svg" alt="React" className="h-8" title="React" />
        <img src="/typescript-logo.svg" alt="TypeScript" className="h-8" title="TypeScript" />
        <img src="/tailwind-logo.svg" alt="Tailwind CSS" className="h-8" title="Tailwind CSS" />
      </div>

      <div className="mt-8 space-y-2">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">More Resources</h3>
        <div className="flex gap-4">
          <a
            href="https://discord.gg/algorand"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 hover:underline flex items-center gap-1"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.317 4.369A19.791 19.791 0 0 0 16.885 3.1a.074.074 0 0 0-.078.037c-.34.607-.719 1.396-.984 2.01a18.524 18.524 0 0 0-5.59 0 12.51 12.51 0 0 0-.997-2.01.077.077 0 0 0-.078-.037A19.736 19.736 0 0 0 3.684 4.369a.07.07 0 0 0-.032.027C.533 9.09-.32 13.579.099 18.021a.082.082 0 0 0 .031.056c2.104 1.547 4.13 2.488 6.102 3.104a.077.077 0 0 0 .084-.027c.47-.646.888-1.329 1.245-2.049a.076.076 0 0 0-.041-.104c-.662-.251-1.293-.549-1.902-.892a.077.077 0 0 1-.008-.128c.128-.096.256-.197.378-.299a.074.074 0 0 1 .077-.01c3.993 1.826 8.285 1.826 12.242 0a.075.075 0 0 1 .078.009c.122.102.25.203.379.299a.077.077 0 0 1-.006.128 12.298 12.298 0 0 1-1.903.892.076.076 0 0 0-.04.105c.36.72.778 1.403 1.246 2.049a.076.076 0 0 0 .084.028c1.978-.616 4.004-1.557 6.107-3.104a.077.077 0 0 0 .03-.055c.5-5.177-.838-9.637-3.549-13.625a.061.061 0 0 0-.03-.028zM8.02 15.331c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.095 2.156 2.418 0 1.334-.955 2.419-2.156 2.419zm7.974 0c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.095 2.156 2.418 0 1.334-.946 2.419-2.156 2.419z" />
            </svg>
            Discord
          </a>
          <a
            href="https://x.com/algodevs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 hover:underline flex items-center gap-1"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 0 0-8.39 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.254a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.057 0 14.009-7.496 14.009-13.986 0-.21-.005-.423-.015-.633A9.936 9.936 0 0 0 24 4.557z" />
            </svg>
            Twitter
          </a>
          <a
            href="https://dev.algorand.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 hover:underline flex items-center gap-1"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h13v-2H6V6h13V4H6zm2 2v12h11V6H8zm-2 0v12V6z" />
            </svg>
            Algorand Docs
          </a>
          <a
            href="https://www.youtube.com/@algodevs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 hover:underline flex items-center gap-1"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M23.498 6.186a2.994 2.994 0 0 0-2.107-2.12C19.228 3.5 12 3.5 12 3.5s-7.228 0-9.391.566A2.994 2.994 0 0 0 .502 6.186C0 8.36 0 12 0 12s0 3.64.502 5.814a2.994 2.994 0 0 0 2.107 2.12C4.772 20.5 12 20.5 12 20.5s7.228 0 9.391-.566a2.994 2.994 0 0 0 2.107-2.12C24 15.64 24 12 24 12s0-3.64-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            YouTube
          </a>
        </div>
      </div>
    </div>
  </div>
)

export default HeroSection
