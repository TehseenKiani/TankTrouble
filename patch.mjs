import fs from 'node:fs';

console.log('1. Patching index.html...');
let html = fs.readFileSync('public/index.html', 'utf8');
html = html.replace('var g_initialPremiumPresent = false;', 'var g_initialPremiumPresent = true;');
fs.writeFileSync('public/index.html', html, 'utf8');
console.log('index.html patched.');

console.log('2. Patching index-4YALVKHK.js...');
let js = fs.readFileSync('public/build/js/index-4YALVKHK.js', 'utf8');

// Enable Premium everywhere
const oldPrem1 = 'static hasPremium=!1;';
const newPrem1 = 'static hasPremium=!0;';
if (js.includes(oldPrem1)) {
  js = js.replace(oldPrem1, newPrem1);
  console.log('Patched static hasPremium=!0');
}

const oldPrem2 = 'static isPremiumPresent(){return s.hasPremium}';
const newPrem2 = 'static isPremiumPresent(){return!0}';
if (js.includes(oldPrem2)) {
  js = js.replace(oldPrem2, newPrem2);
  console.log('Patched isPremiumPresent(){return!0}');
}

// Fix createNewGame to start battle with selected settings
const oldCreate = 'createNewGame(e,t,i,a,n,r){d.setMode(d.MODE_CLIENT_ONLINE),this.joiningGame=!0,this._updateGameButtons(),Ze.getClient().createGame(e,t,i,a,n,r)}';
const newCreate = 'createNewGame(e,t,i,a,n,r){this.joiningGame=!0,this._updateGameButtons(),d.setMode(d.MODE_CLIENT_LOCAL);let gc=new no(new oo,!1,Boolean(t),Boolean(i),n||d.CLIENT.MAX_PLAYERS,r||d.GAME_MODE_INFO[d.GAME_MODES.BOOT_CAMP].DEFAULT_AVAILABLE_CRATES,!0,getSelectedTheme(d.MAZE_THEMES)),pids=q.getAllPlayerIds();for(let idx=0;idx<pids.length;++idx)gc.addPlayer(pids[idx]);if(pids.length<=1&&xs.isReady()){let ai=xs.getAvailableAIId(gc.getId());ai&&(xs.addAIManager(gc,ai),gc.addPlayer(ai))}this.state.start("Game",!0,!1,gc)}';

if (js.includes(oldCreate)) {
  js = js.replace(oldCreate, newCreate);
  console.log('Patched createNewGame in UILobbyState!');
} else {
  console.error('ERROR: oldCreate string not found in index-4YALVKHK.js');
}

// Fix _randomGame to start a battle instead of hanging
const oldRandom = '_joinRandomGame(){d.setMode(d.MODE_CLIENT_ONLINE),Ze.getClient().quickjoinGame()}';
const newRandom = '_joinRandomGame(){this._createLocalGame()}';
if (js.includes(oldRandom)) {
  js = js.replace(oldRandom, newRandom);
  console.log('Patched _randomGame in UILobbyState!');
}

// Enable premium in _createLocalGame
const oldLocalPrem = 'DEFAULT_AVAILABLE_CRATES,!1,d.MAZE_THEMES.RANDOM';
const newLocalPrem = 'DEFAULT_AVAILABLE_CRATES,!0,d.MAZE_THEMES.RANDOM';
if (js.includes(oldLocalPrem)) {
  js = js.replace(oldLocalPrem, newLocalPrem);
  console.log('Patched _createLocalGame premium=!0!');
}

fs.writeFileSync('public/build/js/index-4YALVKHK.js', js, 'utf8');
console.log('All patches applied successfully!');
