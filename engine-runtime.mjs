import { registerHooks } from 'node:module';

// These are the same dependency sources shipped with the browser game.
const bundled = new Map(['ngraph.graph', 'ngraph.path', 'ngraph.events'].map(name =>
  [name, new URL(`./src/build/node_modules/${name}/index.js`, import.meta.url).href]));
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (bundled.has(specifier)) return { url: bundled.get(specifier), shortCircuit: true };
    return nextResolve(specifier, context);
  }
});

export const { Constants } = await import('./src/js/tt/constants.js');
export const { GameController } = await import('./src/js/tt/gamecontroller.js');
export const { BootCampGameMode } = await import('./src/js/tt/bootcampgamemode.js');
export const { InputState } = await import('./src/js/tt/inputstate.js');
Constants.setMode(Constants.MODE_SERVER);
