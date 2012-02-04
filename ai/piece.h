#ifndef PIECE_H_
#define PIECE_H_

struct Position {
    int x, y;
};

struct Piece {
    int id;
    int size;
    Position coords[5];
    int nedge[4];
    Position edges[4][3];
    int minx, miny, maxx, maxy;
};

struct Rotation {
    int offset_x, offset_y;
    Piece *piece;
};

struct Block {
    int id;
    int size;
    Piece *variations[9];
    Rotation rotations[8];
    char name() { return 'u' - (id >> 3); }
};

extern Block *block_set[];

#endif // PIECE_H_
