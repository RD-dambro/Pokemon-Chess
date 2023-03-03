// fetch kings
let kings = []
fetch("data/king.json")
    .then(res => res.json())
    .then(k => kings = k)
    .then( () => console.log(kings))
// fetch queens
let queens = []
fetch("data/queen.json")
    .then(res => res.json())
    .then(k => queens = k)
    .then( () => console.log(queens))
// fetch rooks
let rooks = []
fetch("data/rook.json")
    .then(res => res.json())
    .then(k => rooks = k)
    .then( () => console.log(rooks))
// fetch bishops
let bishops = []
fetch("data/bishop.json")
    .then(res => res.json())
    .then(k => bishops = k)
    .then( () => console.log(bishops))

// fetch knights
let knights = []
fetch("data/knight.json")
    .then(res => res.json())
    .then(k => knights = k)
    .then( () => console.log(knights))
// fetch pawns
let pawns = []
fetch("data/pawn.json")
    .then(res => res.json())
    .then(k => pawns = k)
    .then( () => console.log(pawns))
// get all containers
const image_containers = document.getElementsByClassName("img-container")

for(let container of image_containers){
    // console.log(container);

    container.addEventListener("click", onContainerClick);
}

// choose a pokemon according to piece
function onContainerClick(e){
    console.log(e)
}