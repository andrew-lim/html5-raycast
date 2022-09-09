/**--------------------------------------------
JavaScript Canvas Wolfenstein 3D Raycaster
Author: Andrew Lim
https://github.com/andrew-lim/html5-raycast
---------------------------------------------**/
'use strict';

// Holds information about a wall hit from a single ray
class RayHit {
    constructor() {
      this.strip = 0; // screen column
      this.tileX = 0; // where inside the wall that was hit, used for texture mapping
      this.distance = 0; // distance between player and wall
      this.correctDistance = 0; // distance to correct for fishbowl effect
      this.horizontal = false; // horizontal wall hit?
      this.wallType = 0; // type of wall
      this.rayAngle = 0; // angle of ray hitting the wall
    }
}

class Raycaster
{
  static get TWO_PI() {
    return Math.PI * 2
  }

  static get MINIMAP_SCALE() {
    return 8
  }

  initMap()
  {
    this.map = [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,3,0,3,0,0,1,1,1,2,1,1,1,1,1,2,1,1,1,2,1,0,0,0,0,0,0,0,0,1],
      [1,0,0,3,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,3,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,3,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,3,0,0,0,0,3,1,1,1,1,1],
      [1,0,0,3,0,3,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,3,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,2],
      [1,0,0,3,0,3,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,3,3,3,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [1,0,0,0,0,0,0,0,0,3,3,3,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,3,3,3,0,0,3,3,3,0,0,0,0,0,0,0,0,0,3,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,3,3,3,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,4,0,0,4,2,0,2,2,2,2,2,2,2,2,0,2,4,4,0,0,4,0,0,0,0,0,0,0,1],
      [1,0,0,4,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,4,0,0,0,0,0,0,0,1],
      [1,0,0,4,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,4,0,0,0,0,0,0,0,1],
      [1,0,0,4,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,4,0,0,0,0,0,0,0,1],
      [1,0,0,4,3,3,4,2,2,2,2,2,2,2,2,2,2,2,2,2,4,3,3,4,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];
  }

  initPlayer()
  {
    this.player =  {
      x : 16 * 128, // current x, y position in game units
      y : 10 * 128,
      z : 0,
      dir : 0,    // the direction that the player is turning, either -1 for left or 1 for right.
      rot : 0,    // the current angle of rotation. Counterclockwise is positive.
      speed : 0,    // is the playing moving forward (speed = 1) or backwards (speed = -1).
      moveSpeed : (128/6),  // how far (in map units) does the player move each step/update
      rotSpeed : 4 * Math.PI / 180  // how much does the player rotate each step/update (in radians)
    }
  }

  constructor(mainCanvas, displayWidth=640, displayHeight=360, tileSize=128, textureSize=64, fovDegrees=90)
  {
    this.initMap()
    this.initPlayer()
    this.stripWidth = 1 // leave this at 1 for now
    this.ceilingHeight = 1 // ceiling height in blocks
    this.mainCanvas = mainCanvas
    this.mapWidth = this.map[0].length
    this.mapHeight = this.map.length
    this.displayWidth = displayWidth
    this.displayHeight = displayHeight
    this.rayCount = Math.ceil(displayWidth / this.stripWidth)
    this.tileSize = tileSize
    this.textureSize = textureSize
    this.fovRadians = fovDegrees * Math.PI / 180
    this.viewDist = (this.displayWidth/2) / Math.tan((this.fovRadians/2))
    this.rayAngles = null
    this.viewDistances = null
    this.backBuffer = null

    this.mainCanvasContext;
    this.screenImageData;
    this.textureIndex = 0
    this.textureImageDatas = []
    this.texturesLoadedCount = 0
    this.texturesLoaded = false
  }

  /**
   * https://stackoverflow.com/a/35690009/1645045
   */
  static setPixel(imageData, x, y, r, g, b, a)
  {
    let index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
  }

  static getPixel(imageData, x, y)
  {
    let index = (x + y * imageData.width) * 4;
    return {
      r : imageData.data[index+0],
      g : imageData.data[index+1],
      b : imageData.data[index+2],
      a : imageData.data[index+3]
    };
}

  init() {
    this.bindKeys()
    this.initScreen()
    this.drawMiniMap()
    this.createRayAngles()
    this.createViewDistances()
    this.gameCycle()
  }

  /*
  This is no longer called by us anymore because it interferes with the
  pixel manipulation of floor/ceiling texture mapping.

  https://stackoverflow.com/a/46920541/1645045
  https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio

  sharpenCanvas() {
    // Set display size (css pixels).
    var sizew = this.displayWidth;
    var sizeh = this.displayHeight;
    this.mainCanvas.style.width = sizew + "px";
    this.mainCanvas.style.height = sizeh + "px";

    // Set actual size in memory (scaled to account for extra pixel density).
    var scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
    this.mainCanvas.width = Math.floor(sizew * scale);
    this.mainCanvas.height = Math.floor(sizeh * scale);

    // Normalize coordinate system to use css pixels.
    this.mainCanvasContext.scale(scale, scale);
  }
  */

  initScreen() {
    this.mainCanvasContext = this.mainCanvas.getContext('2d');
    var screen = document.getElementById("screen");
    screen.style.width = this.displayWidth + "px";
    screen.style.height = this.displayHeight + "px";
    this.mainCanvas.width = this.displayWidth;
    this.mainCanvas.height = this.displayHeight;
    this.loadFloorCeilingImages();
  }

  loadFloorCeilingImages() {
    // Draw images on this temporary canvas to grab the ImageData pixels
    let canvas = document.createElement('canvas');
    canvas.width = 128
    canvas.height = 256
    let context = canvas.getContext('2d');

    // Save floor image pixels
    let floorimg = document.getElementById('floorimg');
    context.drawImage(floorimg, 0, 0, floorimg.width, floorimg.height);
    this.floorImageData = context.getImageData(0, 0, this.textureSize, this.textureSize);

    // Save ceiling image pixels
    let ceilingimg = document.getElementById('ceilingimg');
    context.drawImage(ceilingimg, 0, 0, ceilingimg.width, ceilingimg.height);
    this.ceilingImageData = context.getImageData(0, 0, this.textureSize, this.textureSize);

    // Save walls image pixels
    let wallsImage = document.getElementById('wallsImage');
    context.drawImage(wallsImage, 0, 0, wallsImage.width, wallsImage.height);
    this.wallsImageData = context.getImageData(0, 0, wallsImage.width, wallsImage.height);
    console.log("wallsImage.width="+wallsImage.width);
  }

  // bind keyboard events to game functions (movement, etc)
  bindKeys() {
    let this2 = this
    document.onkeydown = function(e) {
      e = e || window.event;
      switch (e.keyCode) { // which key was pressed?
        case 38: // up, move player forward, ie. increase speed
          this2.player.speed = 1;
          break;
        case 40: // down, move player backward, set negative speed
          this2.player.speed = -1;
          break;
        case 37: // left, rotate player left
          this2.player.dir = -1;
          break;
        case 39: // right, rotate player right
          this2.player.dir = 1;
          break;
      }
    }

    document.onkeyup = function(e) {
      e = e || window.event;
      switch (e.keyCode) {
        case 38:
        case 40:
          this2.player.speed = 0; // stop the player movement when up/down key is released
          break;
        case 37:
        case 39:
          this2.player.dir = 0;
          break;
      }
    }
  }

  gameCycle() {
    this.move();
    this.updateMiniMap();
    let rayHits = [];
    this.castRays(rayHits);
    this.drawWorld(rayHits);
    let this2 = this
    setTimeout(function() {
      this2.gameCycle()
    },1000/60);
  }

  stripScreenHeight(screenDistance, correctDistance, heightInGame)
  {
    return Math.round(screenDistance/correctDistance*heightInGame);
  }

  blit(imgdata,srcX,srcY,srcW,srcH,dstX,dstY,dstW,dstH)
  {
    let startY = Math.floor(dstY);
    let endY   = Math.floor(dstY + dstH);
    let textureX = Math.floor(srcX);
    let screenY = startY;
    let dy = endY - startY

    // Nothing to draw
    if (dy === 0) {
      return
    }

    let texStepY = srcH / dy
    let texY = srcY

    // Skip top pixels off screen
    if (screenY < 0) {
      texY = srcY + (0-screenY) * texStepY
      screenY = 0
    }

    for (; screenY<endY && screenY<this.displayHeight; screenY++) {
      let textureY = Math.trunc(texY)
      // let textureY = srcY + Math.floor( ((screenY-startY) / dstH) * srcH );
      let srcPixel = Raycaster.getPixel(imgdata, textureX, textureY);
      Raycaster.setPixel(this.backBuffer, dstX, screenY, srcPixel.r, srcPixel.g, srcPixel.b, 255);
      texY += texStepY
    }
  }

  drawWallStrip(rayHit, textureX, textureY, wallScreenHeight)
  {
    let swidth = 1;
    let sheight = this.textureSize;
    let imgx = rayHit.strip * this.stripWidth;
    let imgy = (this.displayHeight - wallScreenHeight)/2;
    let imgw = this.stripWidth;
    let imgh = wallScreenHeight;
    this.blit(this.wallsImageData,textureX,textureY,swidth,sheight,imgx,imgy,imgw,imgh);
    for (let level=1; level<this.ceilingHeight; ++level) {
      this.blit(this.wallsImageData,textureX,textureY,swidth,sheight,imgx,imgy-level*wallScreenHeight,imgw,imgh);
    }
  }

  drawSolidFloor()
  {
    for (let y=this.displayHeight/2; y<this.displayHeight; ++y) {
      for (let x=0; x<this.displayWidth; ++x) {
        Raycaster.setPixel(this.backBuffer, x, y, 113, 113, 113, 255);
      }
    }
  }

  drawSolidCeiling()
  {
    for (let y=0; y<this.displayHeight/2; ++y) {
      for (let x=0; x<this.displayWidth; ++x) {
        Raycaster.setPixel(this.backBuffer, x, y, 56, 56, 56, 255);
      }
    }
  }

  /*
    Floor Casting Algorithm:
    We want to find the location where the ray hits the floor (F)
    1. Find the distance of F from the player's "feet"
    2. Rotate the distance using the current ray angle to find F
       relative to the player
    3. Translate the F using the player's position to get its
       world coordinates
    4. Map the world coordinates to texture coordinates

    Step 1 is the most complicated and the following explains how to
    calculate the floor distance

    ===================[ Floor Casting Side View ]=======================
    Refer to the diagram below. To get the floor distance relative to the
    player, we can use similar triangle principle:
       dy = height between current screen y and center y
          = y - (displayHeight/2)
       floorDistance / eyeHeight = currentViewDistance / dy
       floorDistance = eyeHeight * currentViewDistance / dy

                               current
                          <-view distance->
                       -  +----------------E <-eye
                       ^  |              / ^
                 dy--> |  |          /     |
                       |  |      /         |
        ray            v  |  /             |
           \           -  y                |<--eyeHeight
            \         /   |                |
             \    /       |<--view         |
              /           |   plane        |
          /               |                |
      /                   |                v
     F--------------------------------------  Floor bottom
     <----------  floorDistance  ---------->

    ======================[ Floor Casting Top View ]=====================
    But we need to know the current view distance.
    The view distance is not constant!
    In the center of the screen the distance is shortest.
    But for other angles it changes and is longer.

                               player center ray
                        F         |
                         \        |
                          \ <-dx->|
                 ----------x------+-- view plane -----
       currentViewDistance  \     |               ^
                     |       \    |               |
                     +----->  \   |        center view distance
                               \  |               |
                                \ |               |
                                 \|               v
                                  O--------------------

     We can calculate the current view distance using Pythogaras theorem:
       x  = current strip x
       dx = distance of x from center of screen
       dx = abs(screenWidth/2 - x)
       currentViewDistance = sqrt(dx*dx + viewDist*viewDist)

     We calculate and save all the view distances in this.viewDistances using
     createViewDistances()
  */
  drawTexturedFloor(rayHits)
  {
    for (let i=0; i<rayHits.length; ++i) {
      const rayHit = rayHits[ i ];
      const wallScreenHeight = this.stripScreenHeight(this.viewDist, rayHit.correctDistance, this.tileSize);
      const centerY = this.displayHeight / 2;
      const eyeHeight = this.tileSize/2 + this.player.z;
      const screenX = rayHit.strip * this.stripWidth;
      const currentViewDistance = this.viewDistances[rayHit.strip]
      const worldMaxX = this.mapWidth  * this.tileSize
      const worldMaxY = this.mapHeight * this.tileSize
      const cosRayAngle = Math.cos(rayHit.rayAngle)
      const sinRayAngle = Math.sin(rayHit.rayAngle)
      let screenY = Math.max(centerY, Math.floor((this.displayHeight-wallScreenHeight)/2) + wallScreenHeight)
      for (; screenY<this.displayHeight; screenY++) {
        let dy = screenY-centerY
        let floorDistance = (currentViewDistance * eyeHeight) / dy
        let worldX = this.player.x + floorDistance * cosRayAngle
        let worldY = this.player.y + floorDistance * -sinRayAngle
        if (worldX<0 || worldY<0 || worldX>=worldMaxX || worldY>=worldMaxY) {
          continue;
        }
        let textureX = Math.floor(worldX) % this.tileSize;
        let textureY = Math.floor(worldY) % this.tileSize;
        if (this.tileSize != this.textureSize) {
          textureX = Math.floor(textureX / this.tileSize * this.textureSize)
          textureY = Math.floor(textureY / this.tileSize * this.textureSize)
        }
        let srcPixel =Raycaster.getPixel(this.floorImageData, textureX, textureY)
        Raycaster.setPixel(this.backBuffer, screenX, screenY, srcPixel.r, srcPixel.g, srcPixel.b, 255)
      }
    }
  }

  drawTexturedCeiling(rayHits)
  {
    for (let i=0; i<rayHits.length; ++i) {
      const rayHit = rayHits[ i ];
      const wallScreenHeight = this.stripScreenHeight(this.viewDist, rayHit.correctDistance, this.tileSize);
      const centerY = this.displayHeight / 2;
      const eyeHeight = this.tileSize/2 + this.player.z;
      const screenX = rayHit.strip * this.stripWidth;
      const currentViewDistance = this.viewDistances[rayHit.strip]
      const worldMaxX = this.mapWidth  * this.tileSize
      const worldMaxY = this.mapHeight * this.tileSize
      const cosRayAngle = Math.cos(rayHit.rayAngle)
      const sinRayAngle = Math.sin(rayHit.rayAngle)
      const currentCeilingHeight = this.tileSize * this.ceilingHeight
      let screenY = Math.min(centerY-1, Math.floor((this.displayHeight-wallScreenHeight)/2)-1)
      for (; screenY>=0; screenY--) {
        let dy = centerY-screenY
        let ceilingDistance = (currentViewDistance * (currentCeilingHeight-eyeHeight)) / dy
        let worldX = this.player.x + ceilingDistance * cosRayAngle
        let worldY = this.player.y + ceilingDistance * -sinRayAngle
        if (worldX<0 || worldY<0 || worldX>=worldMaxX || worldY>=worldMaxY) {
          continue;
        }
        let textureX = Math.floor(worldX) % this.tileSize;
        let textureY = Math.floor(worldY) % this.tileSize;
        if (this.tileSize != this.textureSize) {
          textureX = Math.floor(textureX / this.tileSize * this.textureSize)
          textureY = Math.floor(textureY / this.tileSize * this.textureSize)
        }
        let srcPixel =Raycaster.getPixel(this.ceilingImageData, textureX, textureY)
        Raycaster.setPixel(this.backBuffer, screenX, screenY, srcPixel.r, srcPixel.g, srcPixel.b, 255)
      }
    }
  }

  drawWorld(rayHits)
  {
    this.ceilingHeight = document.getElementById("ceilingHeight").value;
    if (!this.backBuffer) {
      this.backBuffer = this.mainCanvasContext.createImageData(this.displayWidth, this.displayHeight);
    }
    let texturedFloorOn = document.getElementById("texturedFloorOn").checked
    if (texturedFloorOn) {
      this.drawTexturedFloor(rayHits);
    } else {
      this.drawSolidFloor()
    }
    let texturedCeilingOn = document.getElementById("texturedCeilingOn").checked;
    if (texturedCeilingOn) {
      this.drawTexturedCeiling(rayHits);
    } else {
      this.drawSolidCeiling()
    }
    for (let i=0; i<rayHits.length; ++i) {
      let rayHit = rayHits[ i ];
      let wallScreenHeight = Math.round(this.viewDist / rayHit.correctDistance*this.tileSize);
      let textureX = (rayHit.horizontal?this.textureSize-1:0) + (rayHit.tileX/this.tileSize*this.textureSize);
      let textureY = this.textureSize * (rayHit.wallType-1);
      this.drawWallStrip(rayHit, textureX, textureY, wallScreenHeight);
    }
    this.mainCanvasContext.putImageData(this.backBuffer, 0, 0);
  }

  /*
    Calculate and save the ray angles from left to right of screen.

          screenX
          <------
          +-----+------+  ^
          \     |     /   |
           \    |    /    |
            \   |   /     | this.viewDist
             \  |  /      |
              \a| /       |
               \|/        |
                v         v

    tan(a) = screenX / this.viewDist
    a = atan( screenX / this.viewDist )
  */
  createRayAngles()
  {
    if (!this.rayAngles) {
      this.rayAngles = [];
      for (let i=0;i<this.rayCount;i++) {
        let screenX = (this.rayCount/2 - i) * this.stripWidth
        let rayAngle = Math.atan(screenX / this.viewDist)
        this.rayAngles.push(rayAngle)
      }
      console.log("No. of ray angles="+this.rayAngles.length);
    }
  }

  /**
    Calculate and save the view distances from left to right of screen.
  */
  createViewDistances()
  {
    if (!this.viewDistances) {
      this.viewDistances = [];
      for (let x=0; x<this.rayCount; x++) {
        let dx = (this.rayCount/2 - x) * this.stripWidth
        let currentViewDistance = Math.sqrt(dx*dx + this.viewDist*this.viewDist)
        this.viewDistances.push(currentViewDistance)
      }
      console.log("No. of view distances="+this.viewDistances.length);
    }
  }

  castRays(rayHits)
  {
    for (let i=0; i<this.rayAngles.length; i++) {
      let rayAngle =  this.rayAngles[i];
      this.castSingleRay(rayHits, this.player.rot + rayAngle, i);
    }
  }

  castSingleRay(rayHits, rayAngle, stripIdx) {
    rayAngle %= Raycaster.TWO_PI;
    if (rayAngle < 0) rayAngle += Raycaster.TWO_PI;

    var right = (rayAngle<Raycaster.TWO_PI*0.25 && rayAngle>=0) || // Quadrant 1
                (rayAngle>Raycaster.TWO_PI*0.75); // Quadrant 4
    var up    = rayAngle<Raycaster.TWO_PI*0.5  && rayAngle>=0; // Quadrant 1 and 2

    var wallType = 0;
    var textureX; // the x-coord on the texture of the block, ie. what part of the texture are we going to render

    var dist = 0; // the distance to the block we hit
    var xHit = 0; // the x and y coord of where the ray hit the block
    var yHit = 0;

    var wallHorizontal = false;

    //--------------------------
    // Vertical Lines Checking
    //--------------------------

    // Find x coordinate of vertical lines on the right and left
    var vx = 0;
    if (right) {
      vx = Math.floor(this.player.x/this.tileSize) * this.tileSize + this.tileSize;
    }
    else {
      vx = Math.floor(this.player.x/this.tileSize) * this.tileSize - 1;
    }

    // Calculate y coordinate of those lines
    // lineY = playerY + (playerX-lineX)*tan(ALPHA);
    var vy = this.player.y + (this.player.x-vx)*Math.tan(rayAngle);

    // Calculate stepping vector for each line
    var stepx = right ? this.tileSize : -this.tileSize;
    var stepy = this.tileSize * Math.tan(rayAngle);

    // tan() returns positive values in Quadrant 1 and Quadrant 4
    // But window coordinates need negative coordinates for Y-axis so we reverse them
    if ( right ) {
      stepy = -stepy;
    }

    while (vx >= 0 && vx < this.mapWidth*this.tileSize && vy >= 0 && vy < this.mapHeight*this.tileSize) {
      var wallY = Math.floor(vy / this.tileSize);
      var wallX = Math.floor(vx / this.tileSize);
      if (this.map[wallY][wallX] > 0) {
        var distX = this.player.x - vx;
        var distY = this.player.y - vy;
        var blockDist = distX*distX + distY*distY;
        if (!dist || blockDist < dist) {
          dist = blockDist;
          xHit = vx;
          yHit = vy;
          wallType = this.map[wallY][wallX];
          textureX = vy % this.tileSize;

          // Facing left, flip image
          if (!right) {
            textureX = this.tileSize - textureX;
          }
        }
        break;
      }
      vx += stepx;
      vy += stepy;
    }

    //--------------------------
    // Horizontal Lines Checking
    //--------------------------

    // Find y coordinate of horizontal lines above and below
    var hy = 0;
    if (up) {
      hy = Math.floor(this.player.y/this.tileSize) * this.tileSize - 1;
    }
    else {
      hy = Math.floor(this.player.y/this.tileSize) * this.tileSize + this.tileSize;
    }

    // Calculation x coordinate of horizontal line
    // lineX = playerX + (playerY-lineY)/tan(ALPHA);
    var hx = this.player.x + (this.player.y-hy) / Math.tan(rayAngle);
    var stepy = up ? -this.tileSize : this.tileSize;
    var stepx = this.tileSize / Math.tan(rayAngle);

    // tan() returns stepx as positive in quadrant 3 and negative in quadrant 4
    // This is the opposite of window coordinates so we need to reverse when angle is facing down
    if ( !up ) {
      stepx = -stepx;
    }

    while (hx >= 0 && hx < this.mapWidth*this.tileSize && hy >= 0 && hy < this.mapHeight*this.tileSize) {
      var wallY = Math.floor(hy / this.tileSize);
      var wallX = Math.floor(hx / this.tileSize);
      if (this.map[wallY][wallX] > 0) {
        var distX = this.player.x - hx;
        var distY = this.player.y - hy;
        var blockDist = distX*distX + distY*distY;
        if (!dist || blockDist < dist) {
          dist = blockDist;
          xHit = hx;
          yHit = hy;
          wallType = this.map[wallY][wallX];
          textureX = hx % this.tileSize;
          wallHorizontal = true;

          // Facing down, flip image
          if (!up) {
            textureX = this.tileSize - textureX;
          }
        }
        break;
      }
      hx += stepx;
      hy += stepy;
    }


    let rayHit = new RayHit();
    rayHit.strip = stripIdx;
    rayHit.tileX = textureX;
    rayHit.horizontal = wallHorizontal;
    rayHit.wallType = wallType;
    rayHit.rayAngle = rayAngle;
    if (dist) {
      rayHit.distance = Math.sqrt(dist);
      rayHit.correctDistance = rayHit.distance * Math.cos( this.player.rot - rayAngle );
      this.drawRay(xHit, yHit);
    }
    rayHits.push(rayHit);
  }

  drawRay(rayX, rayY) {
    var miniMapObjects = document.getElementById("minimapobjects");
    var objectCtx = miniMapObjects.getContext("2d");

    rayX = rayX / (this.mapWidth*this.tileSize) * 100;
    rayX = rayX/100 * Raycaster.MINIMAP_SCALE * this.mapWidth;
    rayY = rayY / (this.mapHeight*this.tileSize) * 100;
    rayY = rayY/100 * Raycaster.MINIMAP_SCALE * this.mapHeight;

    var playerX = this.player.x / (this.mapWidth*this.tileSize) * 100;
    playerX = playerX/100 * Raycaster.MINIMAP_SCALE * this.mapWidth;

    var playerY = this.player.y / (this.mapHeight*this.tileSize) * 100;
    playerY = playerY/100 * Raycaster.MINIMAP_SCALE * this.mapHeight;

    objectCtx.strokeStyle = "rgba(0,100,0,0.3)";
    objectCtx.lineWidth = 0.5;
    objectCtx.beginPath();
    objectCtx.moveTo(playerX, playerY);
    objectCtx.lineTo(
      rayX,
      rayY
    );
    objectCtx.closePath();
    objectCtx.stroke();
  }

  move() {
    // speed = forward / backward = 1 or -1
    var moveStep = this.player.speed * this.player.moveSpeed; // player will move this far along the current direction vector

    // dir = left / right = -1 or 1
    this.player.rot += -this.player.dir * this.player.rotSpeed; // add rotation if player is rotating (this.player.dir != 0)

    // make sure the angle is between 0 and 360 degrees
    // while (this.player.rot < 0) this.player.rot += Raycaster.TWO_PI;
    // while (this.player.rot >= Raycaster.TWO_PI) this.player.rot -= Raycaster.TWO_PI;

     // cos(angle) = A / H = x / H
     // x = H * cos(angle)
     // sin(angle) = O / H = y / H
     // y = H * sin(angle)
    var newX = this.player.x + Math.cos(this.player.rot) * moveStep;  // calculate new player position with simple trigonometry
    var newY = this.player.y + -Math.sin(this.player.rot) * moveStep;

    // Round down to integers
    newX = Math.floor( newX );
    newY = Math.floor( newY );

    var wallX = newX / this.tileSize;
    var wallY = newY / this.tileSize;

    if (this.isBlocking(wallX, wallY)) { // are we allowed to move to the new position?
      return; // no, bail out.
    }

    this.player.x = newX; // set new position
    this.player.y = newY;
  }

  isBlocking(x,y) {

    // first make sure that we cannot move outside the boundaries of the level
    if (y < 0 || y >= this.mapHeight || x < 0 || x >= this.mapWidth)
      return true;

    // return true if the map block is not 0, ie. if there is a blocking wall.
    return (this.map[Math.floor(y)][Math.floor(x)] != 0);
  }

  updateMiniMap() {

    var miniMap = document.getElementById("minimap");
    var miniMapObjects = document.getElementById("minimapobjects");

    var objectCtx = miniMapObjects.getContext("2d");

    miniMapObjects.width = miniMapObjects.width;

    var playerX = this.player.x / (this.mapWidth*this.tileSize) * 100;
    playerX = playerX/100 * Raycaster.MINIMAP_SCALE * this.mapWidth;

    var playerY = this.player.y / (this.mapHeight*this.tileSize) * 100;
    playerY = playerY/100 * Raycaster.MINIMAP_SCALE * this.mapHeight;

    objectCtx.fillStyle = "red";
    objectCtx.fillRect(   // draw a dot at the current player position
      playerX  - 2,
      playerY  - 2,
      4, 4
    );

    objectCtx.strokeStyle = "red";
    objectCtx.beginPath();
    objectCtx.moveTo(playerX , playerY );
    objectCtx.lineTo(
      (playerX +  Math.cos(this.player.rot) * 4 * Raycaster.MINIMAP_SCALE) ,
      (playerY + -Math.sin(this.player.rot) * 4 * Raycaster.MINIMAP_SCALE)
    );
    objectCtx.closePath();
    objectCtx.stroke();
  }

  drawMiniMap() {
    let miniMap = document.getElementById("minimap");     // the actual map
    let miniMapCtr = document.getElementById("minimapcontainer");   // the container div element
    let miniMapObjects = document.getElementById("minimapobjects"); // the canvas used for drawing the objects on the map (player character, etc)

    miniMap.width = this.mapWidth * Raycaster.MINIMAP_SCALE;  // resize the internal canvas dimensions
    miniMap.height = this.mapHeight * Raycaster.MINIMAP_SCALE;  // of both the map canvas and the object canvas
    miniMapObjects.width = miniMap.width;
    miniMapObjects.height = miniMap.height;

    let w = (this.mapWidth * Raycaster.MINIMAP_SCALE) + "px"  // minimap CSS dimensions
    let h = (this.mapHeight * Raycaster.MINIMAP_SCALE) + "px"
    miniMap.style.width = miniMapObjects.style.width = miniMapCtr.style.width = w;
    miniMap.style.height = miniMapObjects.style.height = miniMapCtr.style.height = h;

    let ctx = miniMap.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,miniMap.width,miniMap.height);

    // loop through all blocks on the map
    for (let y=0;y<this.mapHeight;y++) {
      for (let x=0;x<this.mapWidth;x++) {
        let wall = this.map[y][x];
        if (wall > 0) { // if there is a wall block at this (x,y) ...
          ctx.fillStyle = "rgb(200,200,200)";
          ctx.fillRect(       // ... then draw a block on the minimap
            x * Raycaster.MINIMAP_SCALE,
            y * Raycaster.MINIMAP_SCALE,
            Raycaster.MINIMAP_SCALE,Raycaster.MINIMAP_SCALE
          );
        }
      }
    }

    this.updateMiniMap();
  }
}