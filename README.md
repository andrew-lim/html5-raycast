# HTML5 Raycast

![](raycast3d.jpg)

A Wolfenstein 3D style JavaScript Raycaster using the browser's HTML5 Canvas for rendering.

Heavily modified from [this article by Jacob Seidelin](http://dev.opera.com/articles/view/creating-pseudo-3d-games-with-html-5-can-1/).

Main Differences from original article:
- **&lt;canvas&gt;** elements are now used for rendering the main scene. In the original article &lt;div&gt; and &lt;img&gt; strips 
  were used to render the walls, floor and ceiling.
- **Unit circle coordinates** are now used for the player's rotation. So turning left counterclockwise 
  is a positive angle.
- **Walls and tiles now use fixed game units**. The player's position in a tile is no longer a floating point 
  value between 0 to 1, but an integer between 0 to 128. In the original Wolfenstein 3D game a wall was apparently 8 feet and 1 foot was 16 game units.
- **Horizontal walls** now used a **darker texture**.
