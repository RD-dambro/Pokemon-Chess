
// grid [posizione / 64 + 2][ posizioni % 64 + 1]
// grid [posizione / 64 + 2][ posizioni % 64 - 1]
// grid [posizione / 64 - 2][ posizioni % 64 + 1]
// grid [posizione / 64 - 2][ posizioni % 64 - 1]
// grid [posizione / 64 + 1][ posizioni % 64 - 2]
// grid [posizione / 64 + 1][ posizioni % 64 + 2]
// grid [posizione / 64 - 1][ posizioni % 64 - 2]
// grid [posizione / 64 - 1][ posizioni % 64 + 2]
const DIRECTIONS = Object.freeze({   
    UP_LEFT: 0,     UP: 1,      UP_RIGHT:2,
    LEFT: 3,                    RIGHT: 4,
    DOWN_LEFT: 5,   DOWN: 6,    DOWN_RIGHT: 7,
})

const MOVES = Object.freeze([7, 8, 9, -1, 1, -9, -8, -7]);
const OWNER = Object.freeze({ WHITE: 1, BLACK: -1});
class Piece{
    owner;
    current_position;

    constructor(owner, pos){
        this.owner = owner;
        this.current_position = pos;
    }

    getValidMoves(){}

    isOpponent(board, pos){
        return board[pos].owner !== this.owner;
    }

    isInBoard(board, pos){
        return pos in board;
    }

    isEmpty(board, pos){
        return board[pos] === null;
    }

    getStraightMoves(board, direction, min, max){
        let pos = this.current_position + MOVES[direction];
        let moves = [];

        while(min <= pos && pos <= max){
            if(!this.isInBoard(board, pos)) break;
            if(this.isEmpty(board, pos)){
                moves.push(pos);
            }
            else{
                if(this.isOpponent(board, pos)){
                    moves.push(pos);
                }
                break;
            }

            pos += MOVES[direction];
        }

        return moves;
    }

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
        let max_up = 64 - 8 + (this.current_position % 8);
        let min_down = this.current_position % 8;
        let max_right = (parseInt(this.current_position / 8) + 1) * 8 - 1;
        let min_left = (parseInt(this.current_position / 8) + 1) * 8 - 8;

        const up_moves = this.getStraightMoves(board, DIRECTIONS.UP, this.current_position, max_up);
        const down_moves = this.getStraightMoves(board, DIRECTIONS.DOWN, min_down, this.current_position);
        const left_moves = this.getStraightMoves(board, DIRECTIONS.LEFT, min_left, this.current_position);
        const right_moves = this.getStraightMoves(board, DIRECTIONS.RIGHT, this.current_position, max_right);

        return [...up_moves, ...down_moves, ...left_moves, ...right_moves];
    }
}

class Knight extends Piece{
    getValidMoves(board){
        // controlla dove può muoversi
        let moves = [];
        let pos = this.current_position;
    
        
        return moves;
    }
}

class Bishop extends Piece{
    getValidMoves(board){
        let row = parseInt(this.current_position / 8)
        let col = this.current_position % 8;

        let min_dl = this.current_position 
            + Math.min(col, row)*MOVES[DIRECTIONS.DOWN_LEFT];
        let max_ur = this.current_position 
            + Math.min(8 - col - 1, 8 - row - 1)*MOVES[DIRECTIONS.UP_RIGHT];
        let min_dr = this.current_position 
            + Math.min(8 - col - 1, row)*MOVES[DIRECTIONS.DOWN_RIGHT];
        let max_ul = this.current_position 
            + Math.min(col, 8 - row - 1)*MOVES[DIRECTIONS.UP_LEFT];

        const dl_moves = this.getStraightMoves(board, DIRECTIONS.DOWN_LEFT, min_dl, this.current_position);
        const ur_moves = this.getStraightMoves(board, DIRECTIONS.UP_RIGHT, this.current_position, max_ur);
        const dr_moves = this.getStraightMoves(board, DIRECTIONS.DOWN_RIGHT, min_dr, this.current_position);
        const ul_moves = this.getStraightMoves(board, DIRECTIONS.UP_LEFT, this.current_position, max_ul);
        
        return [...dl_moves, ...ur_moves, ...dr_moves, ...ul_moves];
    }
}

class Queen extends Piece{
    getValidMoves(board){
        let max_up = 64 - 8 + (this.current_position % 8);
        let min_down = this.current_position % 8;
        let max_right = (parseInt(this.current_position / 8) + 1) * 8 - 1;
        let min_left = (parseInt(this.current_position / 8) + 1) * 8 - 8;

        let row = parseInt(this.current_position / 8)
        let col = this.current_position % 8;

        let min_dl = this.current_position 
            + Math.min(col, row)*MOVES[DIRECTIONS.DOWN_LEFT];

        let max_ur = this.current_position 
            + Math.min(8 - col - 1, 8 - row - 1)*MOVES[DIRECTIONS.UP_RIGHT];

        let min_dr = this.current_position 
            + Math.min(8 - col - 1, row)*MOVES[DIRECTIONS.DOWN_RIGHT];
            
        let max_ul = this.current_position 
            + Math.min(col, 8 - row - 1)*MOVES[DIRECTIONS.UP_LEFT];

        const dl_moves = this.getStraightMoves(board, DIRECTIONS.DOWN_LEFT, min_dl, this.current_position);
        const ur_moves = this.getStraightMoves(board, DIRECTIONS.UP_RIGHT, this.current_position, max_ur);
        const dr_moves = this.getStraightMoves(board, DIRECTIONS.DOWN_RIGHT, min_dr, this.current_position);
        const ul_moves = this.getStraightMoves(board, DIRECTIONS.UP_LEFT, this.current_position, max_ul);

        const up_moves = this.getStraightMoves(board, DIRECTIONS.UP, this.current_position, max_up);
        const down_moves = this.getStraightMoves(board, DIRECTIONS.DOWN, min_down, this.current_position);
        const left_moves = this.getStraightMoves(board, DIRECTIONS.LEFT, min_left, this.current_position);
        const right_moves = this.getStraightMoves(board, DIRECTIONS.RIGHT, this.current_position, max_right);

        return [...up_moves, ...down_moves, ...left_moves, ...right_moves, ...dl_moves, ...ur_moves, ...dr_moves, ...ul_moves];
    }
}

class King extends Piece{
    getValidMoves(board){

        let max_up = this.current_position + MOVES[DIRECTIONS.UP];
        let min_down = this.current_position + MOVES[DIRECTIONS.DOWN];
        let max_right = this.current_position + MOVES[DIRECTIONS.RIGHT];
        let min_left = this.current_position + MOVES[DIRECTIONS.LEFT];

        let min_dl = this.current_position + MOVES[DIRECTIONS.DOWN_LEFT];
        let max_ur = this.current_position + MOVES[DIRECTIONS.UP_RIGHT];
        let min_dr = this.current_position + MOVES[DIRECTIONS.DOWN_RIGHT];
        let max_ul = this.current_position + MOVES[DIRECTIONS.UP_LEFT];

        const dl_moves = this.getStraightMoves(board, DIRECTIONS.DOWN_LEFT, min_dl, this.current_position);
        const ur_moves = this.getStraightMoves(board, DIRECTIONS.UP_RIGHT, this.current_position, max_ur);
        const dr_moves = this.getStraightMoves(board, DIRECTIONS.DOWN_RIGHT, min_dr, this.current_position);
        const ul_moves = this.getStraightMoves(board, DIRECTIONS.UP_LEFT, this.current_position, max_ul);

        const up_moves = this.getStraightMoves(board, DIRECTIONS.UP, this.current_position, max_up);
        const down_moves = this.getStraightMoves(board, DIRECTIONS.DOWN, min_down, this.current_position);
        const left_moves = this.getStraightMoves(board, DIRECTIONS.LEFT, min_left, this.current_position);
        const right_moves = this.getStraightMoves(board, DIRECTIONS.RIGHT, this.current_position, max_right);
        
        return [...up_moves, ...down_moves, ...left_moves, ...right_moves, ...dl_moves, ...ur_moves, ...dr_moves, ...ul_moves];
    }
}

class Pawn extends Piece{
    first_move = true;
    second_move = false;

    getValidMoves(board){
        // controlla dove può muoversi
        let moves_on_take = [MOVES[DIRECTIONS.UP_LEFT], MOVES[DIRECTIONS.UP_RIGHT]];
        let moves_on_empty = [MOVES[DIRECTIONS.UP]];
        if(this.first_move) {
            if(board[8*this.owner+this.current_position] === null)
                moves_on_empty.push(MOVES[DIRECTIONS.UP]*2);
        }

        moves_on_empty = moves_on_empty.map(m => m*this.owner+this.current_position)
            .filter(pos => pos in board)
            .filter(pos => board[pos] === null);
        
        moves_on_take = moves_on_take.map(m => m*this.owner+this.current_position)
            .filter(pos => pos in board)
            .filter(pos => board[pos] !== null)
            .filter(pos => board[pos].owner != this.owner);
        
        // todo en passant
        return [...moves_on_empty, ...moves_on_take];
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