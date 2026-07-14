import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

// Pin Tailwind's config path so it loads correctly no matter the process CWD
// (some dev launchers run from a parent directory).
const here = dirname(fileURLToPath(import.meta.url))

export default {
  plugins: {
    tailwindcss: { config: resolve(here, 'tailwind.config.js') },
    autoprefixer: {},
  },
}
