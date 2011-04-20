#ifndef OPENING_H_
#define OPENING_H_

extern const unsigned short violet_first_moves[];
extern const unsigned short orange_first_moves[];
extern const unsigned short violet_unique_first_moves[];
extern const unsigned short orange_unique_first_moves[];

void load_opening_book(const char *fname);
Move opening_move(Board* b);
Move random_move(Board* b);

#endif // OPENING_H_
