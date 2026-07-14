import type { CapacitorConfig } from '@capacitor/cli'

// Capacitor wraps the built web app (dist/) into a native Android project.
// Build flow:  npm run build  ->  npx cap add android  ->  npx cap sync  ->  npx cap open android
const config: CapacitorConfig = {
  appId: 'ro.bancuri.app',
  appName: 'Bancuri Românești',
  webDir: 'dist',
  backgroundColor: '#150a33',
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 900,
      backgroundColor: '#150a33',
      showSpinner: false,
    },
  },
}

export default config
