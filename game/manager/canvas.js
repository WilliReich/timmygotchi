let Canvas = {
    canvas: null,
    ctx: null,
    spritesImage: null,     // Image object that holds the sprite sheet

    WORLD_HEIGHT: 550,      // Original height of the game world
    WORLD_WIDTH: 350,       // Original width of the game world

    scale: 1,               // Scaling factor for resizing the canvas
    height: 550,
    width: 350,
    offsetTop: 0,
    offsetLeft: 0,
};

Canvas.setup = function (canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.spritesImage = this.loadSpritesImage();
};

// Loads the sprite sheet image
Canvas.loadSpritesImage = function () {
    let path = 'game/images/sprites.png';
    try {
        const img = new Image();
        img.src = path;
        return img;
    } catch (err) {
        console.log(err.message);
    }
};

// Updates the size and scale of the canvas
Canvas.updateSize = function (height, width, offsetTop, offsetLeft) {
    this.height = height;
    this.width = width;
    this.canvas.height = height;
    this.canvas.width = width;

    this.scale = width / this.WORLD_WIDTH;

    this.offsetTop = offsetTop;
    this.offsetLeft = offsetLeft;
};

Canvas.clear = function(){
    this.ctx.clearRect(0,0, this.width, this.height);
};

// Draws a sprite onto the canvas
Canvas.draw = function (src, dst) {
    this.ctx.drawImage(
        this.spritesImage,
        src.x,
        src.y,
        src.w,
        src.h,
        dst.x * this.scale,
        dst.y * this.scale,
        dst.w * this.scale,
        dst.h * this.scale
    );
};


export default Canvas;