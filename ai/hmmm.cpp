#include <algorithm>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <ctype.h>
#include <time.h>
#include <assert.h>
#include "board.h"
#include "search.h"
#include "opening.h"
#include "str.h"
using namespace std;

bool old_algorithm = false;

class Player {
public:
    virtual Move get_move(Board* b) = 0; 
};

class Com_15min : public Player {
public:
    Com_15min() : time_(900.0) {}
    virtual Move get_move(Board* b);
protected:
    SearchResult search(Board* b);
private:
    double time_;
};

SearchResult Com_15min::search(Board* b)
{
    int max_depth, stop_sec, timeout_sec;

    int stage = (b->turn() + 1) / 2;

    if (stage < 7) {        // turn 0-12
	int t = 7 - stage;
	timeout_sec = (int)min((time_ - 360) / t * 1.5, time_-360);
	stop_sec = timeout_sec / (stage < 4 ? 15 : 8);
	max_depth = 9;
    }
    else if (stage < 10) {  // turn 13-18
	int t = 9 - stage;
	timeout_sec = (int)(time_ - 70 - 90*t);
	stop_sec = timeout_sec / 3;
	max_depth = 12;
    }
    else if (stage < 13) {  // turn 19-24
	int t = 12 - stage;
	try { return wld(b, 10); } catch (Timeout& e) {}
	time_ -= 10;
	timeout_sec = (int)(time_ - 10 - 20*t);
	stop_sec = timeout_sec / 2;
	max_depth = 15;
    }
    else if (stage < 14)    // turn 25-26
	return wld(b, 900);
    else
	return perfect(b);

    printf("stop: %d  timeout: %d  time: %.3f\n",
	   stop_sec, timeout_sec, time_);

    return search_negascout(b, max_depth, stop_sec, timeout_sec);
}

Move Com_15min::get_move(Board* b)
{
    Move move;
    int score = 100;
    clock_t turn_start = clock();
    visited_nodes = 0;

    move = opening_move(b);
    if (move == INVALID_MOVE) {
	SearchResult result = search(b);
	move = result.first;
	score = result.second;
    }
    assert(b->is_valid_move(move));

    double sec = (double)(clock() - turn_start) / CLOCKS_PER_SEC;
    time_ -= sec;

    printf("%s (%d)\n", move.fourcc().c_str(), score);
    printf(" %d nodes / %.3f sec (%d nps) %.3f sec remaining\n\n",
	   visited_nodes, sec, (int)(visited_nodes / sec), time_);
    printf("%s@%d: %s\n",
	   b->is_violet() ? "violet" : "orange", b->turn() + 1,
	   move.fourcc().c_str());

    return move;
}

class Com_5sec : public Player {
public:
    virtual Move get_move(Board* b);
};

Move Com_5sec::get_move(Board* b)
{
    Move move;
    int score = 100;
    clock_t turn_start = clock();
    visited_nodes = 0;

    move = opening_move(b);
    if (move == INVALID_MOVE) {
	SearchResult r;
	if (b->turn() < 25)
	    r = search_negascout(b, 10, 2, 5);
	else if (b->turn() < 27)
	    r = wld(b, 1000);
	else
	    r = perfect(b);
	move = r.first;
	score = r.second;
    }
    assert(b->is_valid_move(move));

    double sec = (double)(clock() - turn_start) / CLOCKS_PER_SEC;

    printf("%s (%d)\n", move.fourcc().c_str(), score);
    printf(" %d nodes / %.3f sec (%d nps)\n\n",
	   visited_nodes, sec, (int)(visited_nodes / sec));
    printf("%s@%d: %s\n",
	   b->is_violet() ? "violet" : "orange", b->turn() + 1,
	   move.fourcc().c_str());

    return move;
}

class Human : public Player {
public:
    virtual Move get_move(Board* b);
};

Move Human::get_move(Board* b)
{
    char buf[100];
    Move m;
    printf("\n");
    for (;;) {
	printf("%s@%d> ", b->is_violet() ? "violet" : "orange", b->turn() + 1);
	fflush(stdout);
	if (fgets(buf, sizeof buf, stdin) == NULL)
	    exit(1);

	if (strncmp(buf, "----", 4) == 0)
	    return PASS;

	int x, y, d;
	char c;
	if (sscanf(buf, "%1X%1X%c%1d", &x, &y, &c, &d) == 4 &&
	    x >= 1 && x <= 14 && y >= 1 && y <= 14 &&
	    tolower(c) >= 'a' && tolower(c) <= 'u' &&
	    d >= 0 && d <= 7)
	{
	    m = Move(buf);
	    if (b->is_valid_move(m))
		return m;
	}
    }
}

void game(Player* violet, Player* orange, const char* record_file)
{
    Board b;

    FILE* record_fp = NULL;
    if (record_file) {
	record_fp = fopen(record_file, "w");
	if (record_fp == NULL)
	    fprintf(stderr, "cannot open %s\n", record_file);
    }

    for (int npass = 0; npass < 2;) {
	b.show();
	fflush(stdout);

	Move m = (b.is_violet() ? violet : orange)->get_move(&b);
	b.do_move(m);

	if (record_fp) {
	    fprintf(record_fp, "%s\n", m.fourcc().c_str());
	    fflush(record_fp);
	}

	npass = m.is_pass() ? npass+1 : 0;
    }
    printf("\nresult: violet (%d) - orange (%d)\n",
	   b.violet_score(), b.orange_score());

    if (record_fp)
	fclose(record_fp);
}

int select_color()
{
    char buf[80];
    int color;

    do {
	printf(STR_COLOR_SELECT);
	fflush(stdout);
	if (fgets(buf, sizeof buf, stdin) == NULL)
	    exit(1);
	color = atoi(buf);
    } while (color < 1 || color > 4);

    return color;
}

int match()
{
    Move history[44];
    int win = 0, lose = 0, draw = 0;

    for (int i = 0; i < 100; i++) {
	Board b;
	Com_5sec violet, orange;

	while (b.turn() < 2) {
	    b.show();
	    if (i % 2 == 0)
		history[b.turn()] = random_move(&b);
	    printf("%s@%d: %s\n",
		   b.is_violet() ? "violet" : "orange", b.turn() + 1,
		   history[b.turn()].fourcc().c_str());
	    b.do_move(history[b.turn()]);
	}

	for (int npass = 0; npass < 2;) {
	    b.show();
	    fflush(stdout);

	    old_algorithm = (b.turn() % 2 != i % 2);
	    if (old_algorithm)
		printf("#");

	    Move m = (b.is_violet() ? violet : orange).get_move(&b);
	    history[b.turn()] = m;

	    b.do_move(m);

	    npass = m.is_pass() ? npass+1 : 0;
	}
	printf("result: %d\n\n",
	       (i % 2 == 0) ? b.violet_score() - b.orange_score()
			    : b.orange_score() - b.violet_score());
	if (b.violet_score() > b.orange_score()) {
	    if (i % 2 == 0)
		win++;
	    else
		lose++;
	}
	else if (b.violet_score() < b.orange_score()) {
	    if (i % 2 == 0)
		lose++;
	    else
		win++;
	}
	else
	    draw++;
    }
    printf("win: %d, draw: %d, lose: %d\n", win, draw, lose);
    return 0;
}

int match2()
{
    int violet_win = 0, orange_win = 0, draw = 0;
    char line[200];

    while (fgets(line, sizeof line, stdin)) {
	Board b;
	Com_15min violet, orange;

	for (char* move = strtok(line, " \n"); move; move = strtok(NULL, " \n"))
	{
	    b.show();
	    printf("%s@%d: %s\n",
		   b.is_violet() ? "violet" : "orange", b.turn() + 1, move);
	    b.do_move(Move(move));
	}

	for (int npass = 0; npass < 2;) {
	    b.show();
	    fflush(stdout);

	    Move m = (b.is_violet() ? violet : orange).get_move(&b);
	    b.do_move(m);

	    npass = m.is_pass() ? npass+1 : 0;
	}
	printf("result: %d\n\n", b.violet_score() - b.orange_score());
	if (b.violet_score() > b.orange_score())
	    violet_win++;
	else if (b.violet_score() < b.orange_score())
	    orange_win++;
	else
	    draw++;
	printf("violet: %d, draw: %d, orange: %d\n",
	       violet_win, draw, orange_win);
    }
    return 0;
}

int main(int argc, char *argv[])
{
    srand(time(NULL));
    load_opening_book("opening_book");

    int color = 0;
    bool contest = false;
    bool match_flag = false;
    for (int i = 1; i < argc; i++) {
	if (argv[i][0] == '-' && argv[i][1] >= '1' && argv[i][1] <= '4')
	    color = argv[i][1] - '0';
	else if (strcmp(argv[i], "-c") == 0)
	    contest = true;
	else if (strcmp(argv[i], "-m") == 0)
	    match_flag = true;
    }
    if (match_flag)
	return match2();

    if (color == 0)
	color = select_color();

    Player* violet = (color & 1) ? (Player*)new Human() :
	contest ? (Player*)new Com_15min() : (Player*)new Com_5sec();
    Player* orange = (color & 2) ? (Player*)new Human() : 
	contest ? (Player*)new Com_15min() : (Player*)new Com_5sec();
    game(violet, orange, "record.txt");
    delete violet;
    delete orange;

    return 0;
}
