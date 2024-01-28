const canvas = document.querySelector('canvas')
//console.log(canvas)
const c = canvas.getContext('2d') // what is this?? 
canvas.width = innerWidth 
canvas.height = innerHeight 

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

    constructor({height, width, map=[]}){
        this.height = height; 
        this.width = width;
        this.map = map

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

    activateVertexPixels(x,y){
        const xi = Math.floor(x/Vertex.width);
        const yi = Math.floor(y/Vertex.height);

        if(x < this.map[0].length*Vertex.width){
            if(y < this.map.length*Vertex.height){
                this.activateVertex(xi,yi);
            }
        }
    }

    activateVertex(x, y){
        this.map[y][x].setState('1');
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
        const xi = Math.floor(x/Vertex.width);
        const yi = Math.floor(y/Vertex.height);

        if(x < this.map[0].length*Vertex.width){
            if(y < this.map.length*Vertex.height){
                this.selectVertex(xi,yi);
            }
        }
    }

    selectVertex(x,y){
        this.map[y][x].setSelected('true');
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
    }
}


const graph = new Graph({
    height:100,
    width:200
})

addEventListener("mousemove",(event) => {
    graph.deselectVertexAll();
    graph.selectVertexPixels(event.clientX, event.clientY);
    switch(event.button){
        case 1 : 
            graph.activateVertexPixels(event.clientX, event.clientY);
            break;
    }
    console.log(event.button)
})

addEventListener("click", (event) => {
    graph.activateVertexPixels(event.clientX, event.clientY);

})

addEventListener("keypress", (event) => {
    console.log(event.key);
    switch(event.key){
        case("n"):
            graph.update();
            break;
        case("r"):
            graph.deactivateVertexAll();
            break;
    }
})

function animate(){
    requestAnimationFrame(animate);
    c.clearRect(0,0,canvas.width, canvas.height);
    graph.draw();
}

animate();