import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev serves at root ('/'); the production build targets the GitHub Pages
// project subpath (https://orire.github.io/pickme-app/). All app paths are
// relative ('./'), so they resolve correctly under this base.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/pickme-app/' : '/',
}))
