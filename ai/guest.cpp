#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <time.h>
#include "board.h"
#include "search.h"

SearchResult random_move(Board* b)
{
    Move movables[1500];
    int nmove = b->movables(movables);
    int i = (int)((rand() / ((double)RAND_MAX+1.0f)) * nmove);
    return SearchResult(movables[i], 0);
}

Move calc_move(Board* b)
{
    int depth_table[] = { 0, 0, 4, 17, 22, 42, -1 };
    int depth;
    for (depth = 0; depth_table[depth] >= 0; depth++) {
	if (b->turn() < depth_table[depth])
	    break;
    }

    SearchResult result =
	  b->turn() < 25 ? search_negascout(b, depth, 10000, 10000000)
	: b->turn() < 27 ? wld(b, 10) : perfect(b);

    return result.first;
}

void guest(int given_moves)
{
    Board b;
    char buf[100];
    gets(buf);
    int me = (buf[0] & 1) ^ 1;
    for (int npass = 0; npass < 2;) {
	Move m;
	if (b.turn() >= given_moves && (b.turn() & 1) == me) {
#if 1
	    SearchResult result = b.turn() < 1 ? random_move(&b)
		: b.turn() < 25 ? search_negascout(&b, 10, 1, 3)
		: b.turn() < 27 ? wld(&b, 10) : perfect(&b);
#else
	    SearchResult result = calc_move(b);
#endif
	    m = result.first;
	    printf("%s (%d)\n", m.fourcc().c_str(), result.second);
	    puts(buf);
	    fflush(stdout);
	}
	else {
	    gets(buf);
	    m = Move(buf);
	}
	b.do_move(m);
	if (!quiet)
	    b.show();
	npass = m.is_pass() ? npass+1 : 0;
    }
}

int main(int argc, char *argv[])
{
    srand(time(NULL));
    if (argc > 2 && strcmp(argv[2], "-q") == 0)
	quiet = true;
    guest(argc > 1 ? atoi(argv[1]) : 0);
    return 0;
}
