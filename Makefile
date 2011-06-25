TARGET_DIR = /home/share/www

dev: $(TARGET_DIR)/blokus_dev.js $(TARGET_DIR)/blokus_dev.html

$(TARGET_DIR)/blokus_dev.js: piece.js board.js blokus.js
	cat $^ >$@

$(TARGET_DIR)/blokus_dev.html: blokus.html
	grep -v 'piece.js\|board.js' $^ |sed 's/blokus\.js/blokus_dev.js/' >$@


deploy: $(TARGET_DIR)/blokus.js $(TARGET_DIR)/blokus.html

$(TARGET_DIR)/blokus.js: piece.js board.js blokus.js
	cat $^ >$@

$(TARGET_DIR)/blokus.html: blokus.html
	grep -v 'piece.js\|board.js' $^ >$@


result: $(TARGET_DIR)/result.js $(TARGET_DIR)/result.html

$(TARGET_DIR)/result.js: piece.js board.js result.js
	cat $^ >$@

$(TARGET_DIR)/result.html: result.html
	grep -v 'piece.js\|board.js' $^ >$@
