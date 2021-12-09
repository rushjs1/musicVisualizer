Music visualization for ableton live in realtime using ableton-js, threejs and socket.io.

https://warm-fjord-27743.herokuapp.com/

<h2>Notes on using the application</h2><br />
The main scene is compatible with both audio from Ableton Live as well as the preloaded songs from the THREE.AudioLoader. The second scene displaying frequency information is only for the preloaded songs.

Please note if you would like to use the application with Ableton Live, you will need to visit the Ableton-js repo located in the credits section and follow the instructions for installing and activating the MIDI Remote Scripts from Ableton.js. Then, youll need to clone this project, install dependencies, and follow these commands (In order)

1.) Launch Dev Server - npm run dev

2.) Launch Node Server - node server.js

3.) terminate dev server, then click back onto the applicaiton and wait for the log that a user has been connected.

4.) Play something from Ableton Live and enjoy. :)

<h2>To do </h2> <br />
1.) Finish converting into modules. <br />
2.) Lazers using Cylinder Geometry. <br />
3.) Fire or C02 cannon.<br />
4.) More Light effects.<br />
5.) Preformance Optimization.<br />
6.) Allow user to upload mp3 files.<br />
7.) Explore Max for Live for a way to retireve raw audio data.<br />

<h2>Credits </h2><br />
Ableton-js library - https://github.com/leolabs/ableton-js

Grand Piano 3D Model - https://sketchfab.com/3d-models/grand-piano-820675636b69403daaf19719e02ad31d

Concert Stage 3D Model - https://sketchfab.com/3d-models/concert-stage-4f0cbcb0b1b64d5e88ec1122e23d9d4c
