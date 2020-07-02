
// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyAjUps19Am2e55-1TC7wCnrK7cF9JkYiFM",
    authDomain: "mazer-e5ecc.firebaseapp.com",
    databaseURL: "https://mazer-e5ecc.firebaseio.com",
    projectId: "mazer-e5ecc",
    storageBucket: "mazer-e5ecc.appspot.com",
    messagingSenderId: "695470047240",
    appId: "1:695470047240:web:06fc02c23b97b7d566d1bd",
    measurementId: "G-NK6Z81VQWJ"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

//readData();

function writeData() {
    docRef.add({
        x: 0,
        y: 0
    })
    .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
}

function readData() {
    docRef.get().then(function (qSnap) {
        qSnap.forEach(docSnapshot => {
            if(docSnapshot) {
                const myData = docSnapshot.data();
                console.log("x: " + myData.x);
                console.log(myData)
            }
        });
    });
}

function getRealTimeUpdates() {
    var docRef = db.doc("mazeState/seed");
    docRef.onSnapshot(function (doc) {
        if(doc) {
            const myData = doc.data();
            console.log("seed_num: " + myData.seed_num);
        }
    });
}


function initMaze() {
    // read maze state from DB
    db.doc("mazeState/seed").get()
    .then(function (doc) {
        if(doc && doc.exists) {
            var seed;
            const myData = doc.data();

            if(myData.seed_num) { //if seed is in DB
                seed = myData.seed_num;
            }
            else { // if seed is not in DB
                seed = Math.random();
                writeMazeState(seed);
            }

            maze = new Maze(mazeHeight, mazeWidth, seed);
            maze.init();
        }
    })
    .catch(function (error) {
        console.error("Error getting seed number from DB! Error message: " + error);
    });
}

function writeMazeState(seed) {
    var docRef = db.doc("mazeState/seed");
    docRef.set({
        seed_num: seed
    })
    .then(function() {
        console.log("Document written");
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
}


/* Canvas variables */
let canvas;
let ctx;

/* Customized variables */
let cellSize = 40;
let mazeHeight = 8;
let mazeWidth = 8;

let setpTime = 100;
/* ____________________ */
let oppx = {"N": 0, "E": 1, "S": 0, "W": -1};
let oppy = {"N": -1, "E": 0, "S": 1, "W": 0};
let opp = {"N": "S", "E": "W", "S": "N", "W": "E"};

let maze; //do not like this
let icon; //do not like this


let buttonPressed = false;
let finished = false;
let isFirstLoop = true;
let nextTime;
let vec = new Array();
let count = 0;


function Timer(time){

    if(!finished) {
        requestAnimationFrame(Timer);
    }

    if(isFirstLoop){
        isFirstLoop=false;
        nextTime = time;
    }
    
    let elapsedTime = time - nextTime;
    if(elapsedTime > setpTime) {
        nextTime = time;
        maze.delWall(vec[count][0], vec[count][1], vec[count][2]);
        count++;
        if(count >= vec.length) {
            finished = true;
            count = 0;
        }
    }
}


function stepByStep() {
    buttonPressed = !buttonPressed;
    finished = false;
    count = 0;
    SetupCanvas();
}

function redraw() {
    finished = false;
    count = 0;
    SetupCanvas();
}





document.addEventListener("DOMContentLoaded", main);
document.addEventListener("keydown", keyHandler);

function main() {
    SetupCanvas();

    initMaze();

    //go to DB get all icons
    icon = new Icon(maze);
    icon.init();
}

function SetupCanvas() {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    canvas.height = cellSize * mazeHeight;
    canvas.width = cellSize * mazeWidth;
}

/*_____________________ Classes _______________________*/
class Maze {
    constructor(height, width, seed) {
        this.maze_height = height;
        this.maze_width = width;
        this.maze_seed = seed;
        
        /* init var positions */
        /* using the x,y major order (or Column major order) != from memory and C (Row major order) */
        this.positions = [...Array(this.maze_width)].map(e => Array(this.maze_height));
        this.initPositions();

        /* init var set */
        /* put this variable set inside of kruskal algorithm method because thats the only place that this variable is used */
        this.set = [...Array(mazeWidth)].map(e => Array(mazeHeight));
        this.initSet();

        /* init var edges */
        this.edges = new Array();
        this.initEdges();
    }

    init() {
        vec = [];
        this.drawGrid();
        this.kruskalAlgorithm();
        if(buttonPressed) {
            requestAnimationFrame(Timer);
        }
        else {
            this.drawMaze();
        }
    }

    drawGrid() { //recheckar bem as coordenadas, deu bem logo a primeira, estranho...
        ctx.fillStyle = "black";
        for(let i = 0; i < this.positions.length+1; ++i) {
            ctx.fillRect(cellSize*i  -2, 0, 4, cellSize*this.positions.length);
        }
        for(let i = 0; i < this.positions[0].length+1; ++i) {
            ctx.fillRect(0, cellSize*i -2, cellSize*this.positions[0].length, 4);
        }
    }

    drawMaze(){
        for(let i = 0; i < vec.length ; ++i) {
            maze.delWall(vec[i][0], vec[i][1], vec[i][2]);
        }
    }

    delWall(x, y, side) {
        ctx.fillStyle = "white";
        switch(side) { // +2 and -2 is just adjusts, nothing to do with the grid
            case "N":
                ctx.fillRect(cellSize*x  +2, cellSize*y  -2, cellSize  -4, 4);
                break;
            case "E":
                ctx.fillRect(cellSize*(x+1)  -2, cellSize*y  +2, 4, cellSize  -4);
                break;
            case "S":
                ctx.fillRect(cellSize*x  +2, cellSize*(y+1)  -2, cellSize  -4, 4);
                break;
            case "W":
                ctx.fillRect(cellSize*x  -2, cellSize*y  +2, 4, cellSize  -4);
                break;
            default:
                console.log("HOW!?");
                break;
        }
    }

    kruskalAlgorithm() {
        let x, y, ox, oy, set1, set2;
        for(let i = 0; i < this.edges.length; ++i) {
            x = this.edges[i].x;
            y = this.edges[i].y;
            ox = this.edges[i].x + oppx[this.edges[i].dir];
            oy = this.edges[i].y + oppy[this.edges[i].dir];
    
            set1 = this.set[x][y];
            set2 = this.set[ox][oy];
            if(!(set1.connected(set2))) {
                set1.connect(set2);
                this.positions[x][y][this.edges[i].dir] = 1;
                this.positions[ox][oy][opp[this.edges[i].dir]] = 1;

                vec.push([x, y, this.edges[i].dir]);
            }
        }
    }

    async checkWinner() {
        if(icon.x == this.positions.length-1 && icon.y == this.positions[0].length-1) {
            document.getElementById("win").innerHTML = "🎉 Congratulations Mazer, you Won! 🎉";
            await new Promise(r => setTimeout(r, 3000)); // sleep for 3s => 3000ms
            document.getElementById("win").innerHTML = "";
            icon.move
            //BUG HERE, winner can win a lot of times before it starts a new maze, generating lots of mazes
            //SetupCanvas();
            icon.deleteIcon();
            icon.x = 0;
            icon.y = 0;
            icon.init();
        }
    }

    initPositions() {
        for(let i = 0; i < this.positions.length; ++i) {
            for(let j = 0; j < this.positions[i].length; ++j) {
                this.positions[i][j] = {"N": 0, "E": 0, "S": 0, "W": 0};
            }
        }
    }

    initSet() {
        for(var i = 0; i < this.set.length; ++i) {
            for(var j = 0; j < this.set[i].length; ++j) {
                this.set[i][j] = new Tree;
            }
        }
    }

    initEdges() {
        for(var i = 0; i < this.positions.length; ++i) {
            for(let j = 0; j < this.positions[i].length; ++j) {
                if(j>0) {
                    this.edges.push(new Edge(i, j, "N"));
                }
                if(i>0) {
                    this.edges.push(new Edge(i, j, "W"));
                }
            }
        }

        // shuffle with seed 
        this.edges = shuffle(this.edges, this.maze_seed);
    }
}


class Icon {
    constructor(myMaze) {
        //add user + id to DB
        this.x = 0;
        this.y = 0;
        this.myMaze = myMaze;

        // cellsize = 40
        // height = width = 8
        this.x1 = cellSize/5;
        this.y1 = cellSize/5;
        this.x2 = cellSize - (cellSize/5)*2;
        this.y2 = cellSize - (cellSize/5)*2;
    }

    init() {
        ctx.fillStyle = "blue";
        ctx.fillRect(this.x1, this.y1, this.x2, this.y2);

        //ctx.fillStyle = "red";
        //ctx.fillRect(this.x1, this.y1+cellSize, this.x2, this.y2);
    }

    drawIcon() {
        ctx.fillStyle = "blue";
        ctx.fillRect(this.x1+cellSize*this.x, this.y1+cellSize*this.y, this.x2, this.y2);
    }

    deleteIcon() {
        ctx.fillStyle = "white";
        ctx.fillRect(this.x1+cellSize*this.x, this.y1+cellSize*this.y, this.x2, this.y2);
    }

    move(dir){
        if(this.myMaze.positions[this.x][this.y][dir]) {
            this.deleteIcon();
            this.x += oppx[dir];
            this.y += oppy[dir];
            this.drawIcon();
            this.myMaze.checkWinner();
            finished = false;
        }
    }
}


class Tree {
    constructor() {
        this.parent = null;
        this.rootV = null;
    }

    root() { //this recursion could be improved with "memory" of the root
        if(this.parent == null) {
            return this;
        }
        else
            return this.parent.root();
    }

    connected(tree) {
        return this.root() == tree.root();
    }

    connect(tree) {
        tree.root().parent = this.root();
    }
}


class Edge {
    constructor(x, y, dir) {
        this.x = x;
        this.y = y;
        this.dir = dir;
    }
}



/*_____________________ Functions _______________________*/
function shuffle(array, seed) {
    var m = array.length, t, i;
  
    // While there remain elements to shuffle…
    while (m) {
  
      // Pick a remaining element…
      i = Math.floor(random(seed) * m--);
  
      // And swap it with the current element.
      t = array[m];
      array[m] = array[i];
      array[i] = t;
      ++seed;
    }
  
    return array;
  }
  
  function random(seed) {
    var x = Math.sin(seed++) * 10000; 
    return x - Math.floor(x);
  }


function keyHandler(e) {
    switch (e.keyCode) {
        case 37: //left
            icon.move("W");
            break;
        case 38: //up
            icon.move("N");
            break;
        case 39: //right
            icon.move("E");
            break;
        case 40: //down
            icon.move("S");
            break;
        default:
            //console.log("No function for that key");
            break;
    }
};