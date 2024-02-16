let canvas;
let canvasInit = false;
let c;
let cInit = false;

let controls;
document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('graph');
    controls = document.getAnimations('controls');
    if (canvas) {
        c = canvas.getContext('2d');
        cInit = true; //TO DO: add flag checks ahead of accessing c and canvas below!
        canvasInit = true;
        canvas.width = innerWidth 
        canvas.height = innerHeight 
    } else {
        console.error('Canvas element not found');
    }
});

class Vertex{
    static width = 10;
    static height= 10;
    static border = 1;
    
    neighbours = [];

    constructor({position}){
        this.position = position;
        this.state = '0';
        this.statebuffer = '0';
        this.selected = 'false';
    }

    draw(){
        switch(this.state){
            case '1': 
                c.fillStyle = 'white';
                break;
            case '0': 
                c.fillStyle = 'black';
                break;
            default: 
                c.fillStyle = 'yellow';
                break;
        }
           
        switch(this.selected){
            case 'true':
                c.fillStyle = 'red';
                break;
        
        }
        //console.log(this.state);
        c.fillRect(this.position.x ,this.position.y,Vertex.width - Vertex.border,Vertex.height - Vertex.border);
    }

    setState(state){
        this.state = state;
    }

    setStateBuffer(state){
        this.statebuffer = state;
    }

    getState(){
        return this.state;
    }

    getStateBuffer(){
        return this.statebuffer;
    }

    setSelected(selected){
        this.selected = selected
    }

    addNeighbour(neighbour){
        if(!this.neighbours.includes(neighbour)){
            this.neighbours.push(neighbour);
        }
    }

    updateStateBuffer(){
        //Conways Game of Life Rules Go Here. 
        const activeNeighbourCount = this.neighbours.filter(vertex =>
            vertex.getState() == '1'
        ).length
        
        if(activeNeighbourCount <= 1){
            this.setStateBuffer('0');
        }
        else if (activeNeighbourCount >= 4){
            this.setStateBuffer('0');
        }
        else if (activeNeighbourCount == 2){
            this.setStateBuffer(this.getState());
        }
        else if (activeNeighbourCount == 3){
            this.setStateBuffer('1');
        } else{
            this.setStateBuffer('1');
        }

    }

    updateState(){
        this.setState(this.getStateBuffer());
    }

    update(){
        this.updateStateBuffer();
        this.updateState();
    }

}

class Graph{

    height = 0;
    width = 0;
    map = [];
    auto_mode = false;
    step_mode = false;
    reset_flag = false;
    lastUpdatedAt;
    autoUpdateIntervalMS = 500;

    constructor({height, width, map=[]}){
        this.height = height; 
        this.width = width;
        this.map = map;

        let date = new Date();
        this.lastUpdatedAt = date.getSeconds()*1000 + date.getMilliseconds();

        for(let i = 0; i < height; i++){
            this.map.push([]);
            for(let j = 0; j < width; j++){

                const vertex = new Vertex({
                    position:{
                        x:j*Vertex.width,
                        y:i*Vertex.height
                    }
                })

                map[map.length - 1].push(vertex)
            }
        }
    
        for(let i = 0; i < height; i++){
            for(let j = 0; j < width; j++){
                const topmost = Boolean(i == 0);
                const leftmost = Boolean(j == 0);
                const bottommost = Boolean(i == map.length - 1);
                const rightmost = Boolean(j == map[0].length - 1);
                
                if(!topmost && !leftmost) {
                    this.addEdge(map[i][j],map[i-1][j-1]);
                }  // top left 
                if(!topmost) {
                    this.addEdge(map[i][j],map[i-1][j]);
                }    // top  
                if(!topmost && !rightmost) {
                    this.addEdge(map[i][j],map[i-1][j+1]);
                }  // top right 
                if(!leftmost) {
                    this.addEdge(map[i][j],map[i][j-1]);
                }    //  left 
                if(!rightmost) {
                    this.addEdge(map[i][j],map[i][j+1]);
                }    // right
                if(!bottommost && !leftmost) {
                    this.addEdge(map[i][j],map[i+1][j-1]);
                }  // bottom left 
                if(!bottommost) {
                    this.addEdge(map[i][j],map[i+1][j]);
                }    // bottom  
                if(!bottommost && !rightmost) {
                    this.addEdge(map[i][j],map[i+1][j+1]);
                }  // bottom right 
            
            }
        }
    }

    draw(){
        this.map.forEach(row=>
            row.forEach(cell =>
                cell.draw()))
    }

    cursorVertexPixel(x, y, action){
        let rect = canvas.getBoundingClientRect();
        this.cursorVertexPixelRelative(x-rect.left, y-rect.top, action);
    }

    cursorVertexPixelRelative(x, y, action){
        const xi = Math.floor(x/Vertex.width);
        const yi = Math.floor(y/Vertex.height);

        if(x < this.map[0].length*Vertex.width){
            if(y < this.map.length*Vertex.height){
                action(this, xi, yi);
            }
        }
    }

    activateVertexPixels(x,y){
        this.cursorVertexPixel(x,y,this.activateVertex);
    }

    toggleVertexPixels(x,y){
        this.cursorVertexPixel(x,y,this.toggleVertex);
    }

    activateVertex(graph, x, y){
        //console.log(x,y);
        if(y < graph.map.length && y > -1 && x < graph.map[0].length && x > -1){
            graph.map[y][x].setState('1');
        }
    }

    toggleVertex(graph, x, y){
        //console.log(x,y);
        if(y < graph.map.length && y > -1 && x < graph.map[0].length && x > -1){
            switch(graph.map[y][x].getState()){
                case('1'): 
                    graph.map[y][x].setState('0');
                    break;
                case('0'):
                    graph.map[y][x].setState('1');
                    break;
            }
        }
    }

    deactivateVertex(x, y){
        this.map[y][x].setState('0');
    }

    deactivateVertexAll(){
        this.map.forEach(row =>
            row.forEach(vertex => 
                vertex.setState('0')))
    }

    selectVertexPixels(x,y){
        this.cursorVertexPixel(x,y,this.selectVertex);
    }

    selectVertex(graph, x,y){
        if(y < graph.map.length && y > -1 && x < graph.map[0].length && x > -1){
            graph.map[y][x].setSelected('true');
        }
    }

    deselectVertex(x,y){
        this.map[y][x].setSelected('false');
    }

    deselectVertexAll(){
        this.map.forEach(row =>
            row.forEach(vertex => 
                vertex.setSelected('false')))
    }

    addEdge(vertex1, vertex2){
        vertex1.addNeighbour(vertex2);
        vertex2.addNeighbour(vertex1);
    }

    update(){
        this.map.forEach(row => 
            row.forEach(vertex => 
                vertex.updateStateBuffer()));

        this.map.forEach(row => 
            row.forEach(vertex => 
                vertex.updateState()));
        
        let date = new Date();
        this.lastUpdatedAt = date.getSeconds()*1000 + date.getMilliseconds();
    }

    //doesnt work with SetInterval as 'this' keyword binds to global Window object. 
    //see section 'Callbacks' here 
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/thisß
    updateIfEnabled(){
        console.log(this.auto_mode);
        if (this.auto_mode){
            this.update();
            console.log("lols")
        }
    }

    //Had to do this funny business instead (pass graph object into its own method)
    updateIfEnabled(graph){
        var mode = graph.auto_mode;
        if(mode){
            graph.update();
        }
    }

    toggleAutoUpdate(){
        this.auto_mode = !this.auto_mode;
        console.log(this.auto_mode);
    }

    activateResetFlag(){
        this.reset_flag = true;
    }

    activateStepMode(){
        this.step_mode = true;
    }

    deactivateStepMode(){
        this.step_mode = false;
    }

    evaluate(graph){

        if(graph.reset_flag){
            graph.deactivateVertexAll();
            graph.reset_flag = false;
            return;
        }

        if(graph.auto_mode){
            let date = new Date();
            let time = date.getSeconds()*1000 + date.getMilliseconds();
            if(time - graph.lastUpdatedAt > graph.autoUpdateIntervalMS){
                graph.update();
                return;
            }
        }

        if(graph.step_mode){
            graph.update();
            graph.deactivateStepMode();
            return;
        }
    }

}


const graph = new Graph({
    height:500,
    width:500
})

function toggleGraphAutoUpdate(){
    graph.toggleAutoUpdate();
}

function activateGraphReset(){
    graph.activateResetFlag();
}

addEventListener("mousemove",(event) => {
    graph.deselectVertexAll();
    graph.selectVertexPixels(event.clientX, event.clientY);
    switch(event.button){
        case 1 : 
            graph.activateVertexPixels(event.clientX, event.clientY);
            break;
    }
    //console.log(event.button)
})

addEventListener("click", (event) => {
    graph.toggleVertexPixels(event.clientX, event.clientY);

})

addEventListener("keypress", (event) => {
    //console.log(event.key);
    switch(event.key){
        case("n"):
            //graph.update();
            graph.activateStepMode();
            break;
        case("r"):
            //graph.deactivateVertexAll();
            graph.activateResetFlag();
            break;
        case("s"):
            graph.toggleAutoUpdate();
            break;
    }
})

function animate(){
    requestAnimationFrame(animate);
    if(cInit){
        c.clearRect(0,0,canvas.width, canvas.height);
    }
    graph.draw();
} 

setInterval(graph.evaluate, 1, graph);

animate();