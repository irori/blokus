#include <iostream>
#include <sstream>
#include <map>
#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include "board.h"
#include "search.h"
#include "opening.h"
using namespace std;

map<string, string> parse_query()
{
    const char *qstr = getenv("QUERY_STRING");
    string s;
    if (qstr)
	s = qstr;

    map<string, string> query;
    while (!s.empty()) {
	string::size_type amp = s.find('&');
	string param = s.substr(0, amp);
	s = (amp == string::npos) ? string() : s.substr(amp + 1);

	string::size_type eq = param.find('=');
	if (eq != string::npos)
	    query[param.substr(0, eq)] = param.substr(eq + 1);
	else
	    query[param] = "";
    }
    return query;
}

Move parse_move(string fourcc)
{
    if (fourcc == "----")
	return PASS;
    int x, y, d;
    char c;
    if (fourcc.length() == 4 &&
	sscanf(fourcc.c_str(), "%1X%1X%c%1d", &x, &y, &c, &d) == 4 &&
	x >= 1 && x <= 14 && y >= 1 && y <= 14 &&
	tolower(c) >= 'a' && tolower(c) <= 'u' &&
	d >= 0 && d <= 7)
	return Move(fourcc.c_str());
    else
	return INVALID_MOVE;
}

Move com_move(Board* b, int time)
{
    Move move;
    int score = 100;
    quiet = true;

    move = opening_move(b);
    if (move == INVALID_MOVE) {
	SearchResult r;
	if (b->turn() < 25)
	    r = search_negascout(b, 10, time / 2, time);
	else if (b->turn() < 27)
	    r = wld(b, 1000);
	else
	    r = perfect(b);
	move = r.first;
	score = r.second;
    }

    return move;
}

int main(int argc, char *argv[])
{
    nice(5);
    srand(time(NULL));

    map<string, string> params = parse_query();
    cout << "Content-Type: text/plain\r\n\r\n";

    int time_limit;
    switch (atoi(params["l"].c_str())) {
    case 2:
        time_limit = 6;
        break;
    case 3:
        time_limit = 18;
        break;
    default:
        time_limit = 2;
        break;
    }

    Board b;
    istringstream path(params["b"]);
    string fourcc;
    while (getline(path, fourcc, '/')) {
	if (fourcc.empty())
	    continue;
	Move m = parse_move(fourcc);
	if (m == INVALID_MOVE || !b.is_valid_move(m)) {
	    cout << "XXXX invalid move " << fourcc;
	    return 0;
	}
	b.do_move(m);
    }
    Move m = com_move(&b, time_limit);
    cout << m.fourcc();

    return 0;
}
