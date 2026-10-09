let Display = {
    MENU: document.getElementsByClassName('menu'),
    CONTAINER: document.querySelector('.game-container'),      // Reference to the main game container element
    RELATIVE_HEIGHT: 0.86,                                              // The height of the game display relative to the container
    ASPECT_RATIO: 7 / 11,                                               // The aspect ratio of the game display (width/height)
    TARGET_WIDTH: 350,                                                  // The target width for scaling purposes

    // Variables to store calculated dimensions and scaling factors
    height: 0,
    width: 0,
    offsetLeft: 0,
    offsetTop: 0,
    scale: 1,
};

// Method to calculate and set the size of the game display based on the container dimensions
Display.setSize = function () {
    // read and calculate new height and width
    this.height = this.CONTAINER.clientHeight * this.RELATIVE_HEIGHT;
    this.width = this.height * this.ASPECT_RATIO;
    // scale factor world to screen coordinates
    this.scale = this.width / this.TARGET_WIDTH;
};

// Method to calculate and return the offsets needed for mouse input
Display.getOffset = function () {
    return {
        top: (window.innerHeight - this.height) / 2,
        left: (window.innerWidth - this.width) / 2,
    };
};

// Method to set the visibility of the menu based on the provided boolean flag
Display.setMenuVisible = function (isVisible) {
    if (isVisible) {
        this.MENU.item(0).style.visibility = 'visible';
        this.MENU.item(1).style.visibility = 'visible';
    } else {
        this.MENU.item(0).style.visibility = 'hidden';
        this.MENU.item(1).style.visibility = 'hidden';
    }
};

export default Display;