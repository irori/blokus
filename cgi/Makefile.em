# Makefile for emscripten

CXX = em++
CXXFLAGS = -Wall
#CXXFLAGS = -g
#CXXFLAGS = -pg -O -g

EMFLAGS = -O2 \
	  -s EXPORTED_FUNCTIONS="['_hm5move', '_getVisitedNodes']"

../hm5move.js: hm5move.bc hm5move_post.js
	emcc $(EMFLAGS) --post-js hm5move_post.js hm5move.bc -o $@

hm5move.bc: hm5move.o search.o board.o opening.o piece.o
	$(CXX) $(CXXFLAGS) -o $@ hm5move.o search.o board.o opening.o piece.o

piece.cpp: piece.rb
	ruby piece.rb >piece.cpp

hm5move.o: hm5move.cpp board.h search.h opening.h str.h
search.o: search.cpp board.h search.h probcut.h probcut.tab.c
board.o: board.cpp piece.h opening.h board.h str.h
opening.o: opening.cpp opening.h
piece.o: piece.cpp piece.h

clean:
	rm -f *.o hm5move.bc ../hm5move.js
