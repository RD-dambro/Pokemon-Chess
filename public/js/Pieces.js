
// grid [posizione / 64 + 2][ posizioni % 64 + 1]
// grid [posizione / 64 + 2][ posizioni % 64 - 1]
// grid [posizione / 64 - 2][ posizioni % 64 + 1]
// grid [posizione / 64 - 2][ posizioni % 64 - 1]
// grid [posizione / 64 + 1][ posizioni % 64 - 2]
// grid [posizione / 64 + 1][ posizioni % 64 + 2]
// grid [posizione / 64 - 1][ posizioni % 64 - 2]
// grid [posizione / 64 - 1][ posizioni % 64 + 2]
const DIRECTIONS = Object.freeze([-9, -8, -7, 1, 9, 8, 7, -1]);
const OWNER = Object.freeze({ WHITE: 1, BLACK: -1});
class Piece{
    owner;
    current_position;

    constructor(owner, pos){
        this.owner = owner;
        this.current_position = pos;
    }

    getValidMoves(){}
    move(board, target_position){
        board[this.current_position] = null;

        this.current_position = target_position;

        board[target_position] = this; 
    }

    toString(){
        return `${this.constructor.name}`;
    }
}


class Rook extends Piece{
    getValidMoves(board){
        // controlla dove può muoversi
        
        return [];
    }
}

class Knight extends Piece{
    getValidMoves(board){
        // controlla dove può muoversi
        
        return [];
    }
}

class Bishop extends Piece{
    getValidMoves(board){
        // controlla dove può muoversi
        
        return [];
    }
}

class Queen extends Piece{
    getValidMoves(board){
        // controlla dove può muoversi
        
        return [];
    }
}

class King extends Piece{
    getValidMoves(board){
        return DIRECTIONS.map(d => this.current_position + d)
            .filter(d => d in board);
    }
}

class Pawn extends Piece{
    first_move = true;
    second_move = false;

    getValidMoves(board){
        // controlla dove può muoversi
        let moves = [8];
        if(this.first_move) moves.push(16);

        return moves.map(m => m*this.owner+this.current_position)
    }

    move(...args){
        super.move(...args);

        if(this.second_move){
            this.second_move = false;
        }

        if(this.first_move){
            this.first_move = false;
            this.second_move = true;
        }
    }
}