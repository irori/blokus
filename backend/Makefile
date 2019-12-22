# -*- Makefile -*- for emscripten

CXX = em++
CXXFLAGS = -Wall -Oz
#CXXFLAGS = -g
#CXXFLAGS = -pg -O -g

EMFLAGS = -s ENVIRONMENT=worker \
          -s EXPORTED_FUNCTIONS="['_hm5move', '_getVisitedNodes']" \
	  -s EXTRA_EXPORTED_RUNTIME_METHODS="['cwrap']"

OBJS = hm5move.o search.o board.o opening.o piece.o

../docs/hm5move.js: $(OBJS) hm5move_post.js
	$(CXX) $(CXXFLAGS) $(EMFLAGS) --post-js hm5move_post.js -o $@ $(OBJS)

piece.cpp: piece.rb
	ruby piece.rb >piece.cpp

hm5move.o: hm5move.cpp board.h search.h opening.h str.h
search.o: search.cpp board.h search.h probcut.h probcut.tab.c
board.o: board.cpp piece.h opening.h board.h str.h
opening.o: opening.cpp opening.h
piece.o: piece.cpp piece.h

clean:
	rm -f *.o hm5move.bc ../docs/hm5move.js*
