
const MAP_COLUMNS = 64;
const MAP_ROWS = 48;
const PLAYER_WIDTH = 3;
const PLAYER_HEIGHT = 5;
const PLAYER_SPEED = 24;
const OBSTACLE_SPEED = 12;


/* This class stores the player information (essentially the X and Y position) */
class Player
{
    constructor() {
        this._x = (MAP_COLUMNS - PLAYER_WIDTH) / 2;
        this._y = MAP_ROWS - PLAYER_HEIGHT;
    }

    // Returns the X position of the player
    get x() {
        return this._x;
    }

    // Sets the X position of the player, checking bounds to make sure the player doesn't exit the screen
    set x(newX) {
        if (newX > (MAP_COLUMNS - PLAYER_WIDTH))
            this._x = MAP_COLUMNS - PLAYER_WIDTH;
        else if (newX < 0)
            this._x = 0;
        else
            this._x = newX;
    }

    // Returns the Y position of the player
    get y() {
        return this._y;
    }
};


function randomInt(min, max) {

    return (Math.random() * (max - min)) + min;
}

class Obstacle
{
   constructor(){
       let spacing = randomInt(PLAYER_WIDTH + 1, PLAYER_WIDTH + 4);
       let spaceStart = randomInt(0, MAP_COLUMNS - spacing);
       this._leftWidth = spaceStart;
       this._rightX = spaceStart + spacing;
       this._y = 1;
   }
   get leftWidth(){
       return this._leftWidth ;
   }
   get rightX(){
       return this._rightX;
   }
    get y(){
        return this._y;
    }
    set y(newY) {
        this._y = newY;
    }
}

class Game
{
    constructor(renderer, inputManager)
    {
        // The game class is the main class of the game

        this._inputs = inputManager;
        this._renderer = renderer; // The renderer is responsible for rendering the player/obstacles/... on screen
        this._player = new Player(); // The player instance holds the informations about the player (its coordinates)
        this._updateTimer = -1; // This variable stores the handle given by setInterval, in order to being able to call clearInterval
        this._updateInterval = 1000 / 30; // This variable stores the number of milliseconds between two frames. In this case its 30 frames/second
        this._obstacles = []; // This variable holds all the obstacles
    }

    get deltaTime() {
        // Return the time elapsed between two frames
        return this._updateInterval / 1000;
    }

    get obstacles() {
        // Return the list of obstacles
        return this._obstacles;
    }

    get player() {
        // Return the player instance
        return this._player;
    }

    start() {
        // This function starts the game loop (except if its already running)
        if (this._updateTimer !== -1) return;
        // The update method is called each frame
        this._updateTimer = setInterval(() => this.update(), this._updateInterval);
        this.obstacles.push(new Obstacle());
    }

    stop() {
        // This function pause the game, it just cancels the timer we started in the Game.start() method
        clearInterval(this._updateTimer);
        this._updateTime = -1;
    }

    update() {
        // This function is called for each frame

        // First we check user inputs (Keyboard)
        if (this._inputs.isPressed("ArrowLeft"))
            this._player.x -= PLAYER_SPEED * this.deltaTime;
        
        if (this._inputs.isPressed("ArrowRight"))
            this._player.x += PLAYER_SPEED * this.deltaTime;
        //we move obstacles down
        this.obstacles.forEach((obstacle) => {
            obstacle.y += OBSTACLE_SPEED * this.deltaTime;
        });
        // Then we clean previous obstacles (if any)
        // TODO

        // We regenerate obstacles if needed
        // TODO

        // We check collisions between the player and obstacles
        // TODO

        // Then we call the render method of the renderer to render the game to the screen
        this._renderer.render(this);
    }
};

class InputManager
{
    // The Input manager listen for keyboard events and store the state of each key (pressed/released)

    constructor() {
        // We listen for keydown and keyup events
        window.addEventListener("keydown", (ev) => this._onKeyDown(ev));
        window.addEventListener("keyup", (ev) => this._onKeyUp(ev));

        this._keys = {};
    }
    
    _onKeyDown(ev)
    {
        // When the key is down, we set its value to true in this._keys
        this._keys[ev.key] = true;
    }
    
    _onKeyUp(ev)
    {
        // When the key is up, we set its value to false in this._keys
        this._keys[ev.key] = false;
    }

    isPressed(keyName)
    {
        return !!this._keys[keyName];
    }
};




class CanvasRenderer
{
    // The CanvasRenderer method is responsible of rendering the game

    constructor(canvas)
    {
        // When creating a the renderer, we need a canvas passed as a parameter, otherwise where do we render ?
        this._canvas = canvas;
        // The canvas is able to render in both 2D or 3D. We choose the 2D API: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
        this._ctx = canvas.getContext("2d");
    }

    get columnWidth() {
        // Our canvas is divided in columns and rows: this getter returns the width of a column in pixels
        return this.width / MAP_COLUMNS;
    }

    get height() {
        // This is the real height of the canvas in pixels
        return this._canvas.height;
    }
    
    get rowHeight() {
        // Our canvas is divided in columns and rows: this getter returns the height of a row in pixels
        return this.height / MAP_ROWS;
    }
    
    get width() {
        // This is the real width of the canvas in pixels
        return this._canvas.width;
    }

    render(game)
    {
        // We need to clear the screen before drawing
        this._ctx.clearRect(0, 0, this.width, this.height);

        // Renders the player
        this._renderPlayer(game.player);

        // Renders each obstacle, one at a time: the CanvasRenderer._renderObstacle method is called for each obstacle
        game.obstacles.forEach((obstacle) => this._renderObstacle(obstacle));

        // Renders the UI/HUD: we'll render the score here
        this._renderUI(game);
    }

    _renderObstacle(obstacle)
    {
        this._ctx.fillStyle = "#FFF";
        this._ctx.fillRect(                 //left obstacle
            0,
            obstacle.y * this.rowHeight,
            obstacle.leftWidth * this.columnWidth,
            this.rowHeight
        );

        this._ctx.fillRect(                 //right obstacle

            obstacle.rightX * this.columnWidth,
            obstacle.y * this.rowHeight,
            (MAP_COLUMNS - obstacle.rightX) * this.columnWidth,
            this.rowHeight

        )



    }

    _renderPlayer(player)
    {
        // TODO: render the player with an image instead
        
        // Here we do some debug rendering: we draw a rectangle of the size of the player
        this._ctx.fillStyle = "#421652";
        this._ctx.fillRect(
            player.x * this.columnWidth,
            player.y * this.rowHeight,
            PLAYER_WIDTH * this.columnWidth,
            PLAYER_HEIGHT * this.rowHeight
        );
    }

    _renderUI(game)
    {
        // TODO: render score and maybe high score ???
    }
};

// Main: everything starts here
const renderer = new CanvasRenderer(document.querySelector("#game-canvas")); // We start with the instancing of our renderer
const inputManager = new InputManager(window); // The Input manager listen for keyboard events and store the state of each key (pressed/released)
const game = new Game(renderer, inputManager); // The game class instance handles all the game informations and logic
game.start(); // We start the game
