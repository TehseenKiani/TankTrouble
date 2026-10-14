# Mobile controls

Touch controls activate on touch devices and viewports up to 900 CSS pixels wide. Portrait sizes its control row to the larger customized button plus a small gap and uses a compact bottom score row, leaving more height for the arena to fill the screen width. Landscape puts the score strip at the top-right, gives its old bottom row to the arena, and overlays controls on its sides. The Menu button reveals the normal header in landscape.

Controls opens size, position, opacity and dead-zone settings. Drag controls enables placement editing; Done resumes play. Portrait and landscape preferences are stored separately in localStorage under tank-touch-layout-v1. Swap sides and Reset layout apply to the current orientation. On a shared device, Controlled player selects the local tank operated by this joystick; network players each use their own device.

Steering points the tank toward the joystick direction, turns before driving when facing away, and uses an angular hysteresis band and central dead zone. The engine still uses its original digital speed/turn rates. Pointer capture and independent pointer ownership permit steering and firing together. Blur, visibility changes, cancelled touches, rotation and editing clear held controls. Input goes through the existing controller, including the room prediction/transport bridge, without timers in the touch path.

Landscape requests fullscreen and orientation lock when supported. Browsers that cannot lock orientation display an instruction to rotate manually. Physical devices may require HTTPS for fullscreen/orientation APIs; normal manual rotation remains usable.

Validation: node --test mobile-controls.test.mjs canvas-layout.test.mjs room-inputs.test.mjs (9 checks). Browser verified at 390x844 and 844x390: local game entry, arena/score layout, settings, dragging, rotation, steering/fire actions, and no console errors. Physical simultaneous multi-touch, iOS/Android fullscreen lock, real-device GPU/frame pacing, and room latency on mobile hardware remain unmeasured.

A single warm desktop Node run of 100,000 production steering calculations took 11.1 ms wall time, 32 ms process CPU and 53,580 KiB peak process RSS (includes Node). This is an arithmetic microbenchmark, not mobile frame-rate evidence. No equivalent prior touch path exists for a before/after comparison. Browser process-family CPU/memory and agent token costs were not measured.

The served build is checked in. Source mobilecontrols.js, touch-math.js and canvaslayout.js have matching public modules; Inputs, GameSession, ResizeManager and game arena scaling changes are also mirrored in the served bundle.
