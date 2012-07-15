# WebGL Experiments #

This is a repository of experiments I have done using
[WebGL](http://www.khronos.org/webgl/).  You can see these in action at my [WebGL
Experiments](http://jbryan.github.com/webgl-experiments) GitHub page.  

## [Conway's game of life](http://jbryan.github.com/webgl-experiments/life.html) ##
This is a GPGPU based rendering of Conway's game of life.  It renders 3 parallel
Games of Life on a 4096×2048 grid with a 3d torus topology.  Each color
represents a separate parallel game.  If you have Google Chrome, you can zoom in
on portions with the mouse wheel.  If you click on a portion, you can paint the
cells white and watch what new life grows out from there.

## [GPGPU Particle Demo](http://jbryan.github.com/webgl-experiments/gravity.html) ##
This is GPGPU based particle demo.  Particles of "negligable" mass are spawned
along the x axis with arbitrary velocities.  There is an invisible mass in the center 
attracting all particles.  Watch the system evolve the camera rotates around the
system.  All particle motions are computed on the GPU using textures to store
velocity and position data. 
