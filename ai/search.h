#ifndef SEARCH_H_
#define SEARCH_H_

#include <utility>
typedef std::pair<Move, short> SearchResult;

extern int visited_nodes;
extern bool quiet;

class Timeout {};

SearchResult search_negascout(Board* node, int max_depth,
			      int stop_sec, int timeout_sec);
SearchResult wld(Board* node, int timeout_sec);
SearchResult perfect(Board* node);

#endif // SEARCH_H_
