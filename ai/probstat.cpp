#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <limits.h>
#include "board.h"
#include "search.h"

SearchResult opening_move(Board* b)
{
    Move movables[1500];
    int nmove = b->movables(movables);
    int i = (int)((rand() / ((double)RAND_MAX+1.0f)) * nmove);
    return SearchResult(movables[i], 0);
}

SearchResult calc_move(Board* b)
{
    const int depth_table[] = {
    //  0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18  19  20
	4, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 8, 9, 9, 10, 10,
    //  21  22  23  24
	10, 10, 10, 10
    };

    if (b->turn() == 0)
	return opening_move(b);
    else
	return search_negascout(b, depth_table[b->turn()], 1800, 1800);
}

void com_vs_com(Board* b)
{
    clock_t match_start = clock();

    for (int npass = 0; npass < 1 && b->turn() < 25;) {
	clock_t turn_start = clock();
	visited_nodes = 0;

	SearchResult result = calc_move(b);
	Move m = result.first;

	double sec = (double)(clock() - turn_start) / CLOCKS_PER_SEC;
	printf("time(%d): %d nodes / %.3f sec (%d nps)\n",
	       b->turn(), visited_nodes, sec, (int)(visited_nodes / sec));
	printf("\n%s (%d)\n", m.fourcc().c_str(), result.second);
	printf("%d %s\n", b->turn(), m.fourcc().c_str());

	npass = m.is_pass() ? npass+1 : 0;
	b->do_move(m);
	b->show();
	fflush(stdout);
    }
    printf("result: %d (%.3f sec)\n\n",
	   b->violet_score() - b->orange_score(),
	   (double)(clock() - match_start) / CLOCKS_PER_SEC);
}

int main()
{
    srand(time(NULL));
    for (;;) {
	Board b;
	com_vs_com(&b);
    }
    return 0;
}
