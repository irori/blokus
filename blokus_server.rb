#!/usr/bin/env ruby
require 'webrick'

srv = WEBrick::HTTPServer.new({:DocumentRoot => './',
                               :DirectoryIndex => ['blokus.html'],
                               :Port => 8880})
srv.mount('/b/hm5move', WEBrick::HTTPServlet::CGIHandler,
          File.expand_path('cgi/hm5move'))
trap("INT"){ srv.shutdown }
srv.start
