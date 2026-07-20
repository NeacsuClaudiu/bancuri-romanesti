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

// 1) AdMob APPLICATION_ID (ID-ul REAL al aplicatiei Bancuri Romanesti)
const ADMOB_APP_ID = 'ca-app-pub-5712899602059155~3771189190';
const ADMOB_META = `        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="${ADMOB_APP_ID}"/>`;
if (!xml.includes('com.google.android.gms.ads.APPLICATION_ID')) {
  xml = xml.replace(/(<application[^>]*>)/, `$1\n\n${ADMOB_META}`);
  console.log('+ AdMob APPLICATION_ID adaugat:', ADMOB_APP_ID);
} else if (!xml.includes(ADMOB_APP_ID)) {
  // suprascrie un ID vechi (de ex. cel de TEST) - altfel `cap sync` il lasa neatins
  xml = xml.replace(
    /(<meta-data\s+android:name="com\.google\.android\.gms\.ads\.APPLICATION_ID"\s+android:value=")[^"]*(")/,
    `$1${ADMOB_APP_ID}$2`
  );
  console.log('~ AdMob APPLICATION_ID actualizat:', ADMOB_APP_ID);
} else {
  console.log('= AdMob APPLICATION_ID deja corect');
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
