TARGET_DIR = /home/share/www

all: $(TARGET_DIR)/blokus.js $(TARGET_DIR)/blokus.html

$(TARGET_DIR)/blokus.js: piece.js board.js blokus.js
	cat $^ >$@

$(TARGET_DIR)/blokus.html: blokus.html
	grep -v 'piece.js\|board.js' $^ >$@
