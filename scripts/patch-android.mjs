// Patch-uri dupa `npx cap add android` / `npx cap sync` (idempotent, rulabil oricand):
// 1. AdMob APPLICATION_ID in AndroidManifest.xml (ID de TEST Google - inlocuieste la publicare).
// 2. Orientare portrait pe MainActivity (app-ul de bancuri e citit vertical, ca WhatsApp/Facebook).
// 3. Fara mod imersiv (utilizatorii au nevoie de bara de status pentru clock/notifications).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');

if (!fs.existsSync(manifestPath)) {
  console.error('AndroidManifest.xml lipseste - ruleaza intai `npx cap add android`.');
  process.exit(1);
}

let xml = fs.readFileSync(manifestPath, 'utf8');

// 1) AdMob APPLICATION_ID (TEST - inlocuieste la publicare cu ID-ul real)
const ADMOB_META = `        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="ca-app-pub-3940256099942544~3347511713"/>`;
if (!xml.includes('com.google.android.gms.ads.APPLICATION_ID')) {
  xml = xml.replace(/(<application[^>]*>)/, `$1\n\n${ADMOB_META}`);
  console.log('+ AdMob APPLICATION_ID adaugat (ID de TEST Google)');
} else {
  console.log('= AdMob APPLICATION_ID exista deja');
}

// 2) portrait pe activitate (app-ul de bancuri se citeste vertical)
if (!xml.includes('android:screenOrientation')) {
  xml = xml.replace(/(<activity\b)/, '$1\n            android:screenOrientation="portrait"');
  console.log('+ screenOrientation=portrait adaugat');
} else {
  console.log('= screenOrientation exista deja');
}

fs.writeFileSync(manifestPath, xml);
console.log('Patch Android OK');
