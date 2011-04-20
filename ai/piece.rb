#!/usr/local/bin/ruby

class Piece
  attr_reader :id, :name, :coords, :edges, :directed_edges

  def initialize(id, name, coords)
    @id = id
    @name = name
    @coords = coords
    @edges = coords.reject{|x,y|
      coords.include?([x-1,y]) && coords.include?([x+1,y]) ||
      coords.include?([x,y-1]) && coords.include?([x,y+1])
    }
    @directed_edges = [
      @edges.reject{|x,y| coords.include?([x,y-1]) || coords.include?([x-1,y])},
      @edges.reject{|x,y| coords.include?([x,y-1]) || coords.include?([x+1,y])},
      @edges.reject{|x,y| coords.include?([x,y+1]) || coords.include?([x-1,y])},
      @edges.reject{|x,y| coords.include?([x,y+1]) || coords.include?([x+1,y])}
      ]
  end

  def blk_name
    @name[0..-2]
  end

  def size
    @coords.size
  end

  def min_x
    @coords.map{|x,y| x}.min
  end

  def min_y
    @coords.map{|x,y| y}.min
  end

  def max_x
    @coords.map{|x,y| x}.max
  end

  def max_y
    @coords.map{|x,y| y}.max
  end

  def contour
    start = pt = coords.min
    contour = [pt]

    dir = [1,0] # east
    pt = vec_add(pt, dir)
    until pt == start
      contour << pt
      if coords.include?(vec_add(pt, leftside(dir)))
        dir = [dir[1], -dir[0]] # turn left
      elsif !coords.include?(vec_add(pt, rightside(dir)))
        dir = [-dir[1], dir[0]] # turn right
      end
      pt = vec_add(pt, dir)
    end
    contour
  end

  def to_s
    s = (0..4).map{"     "}
    minx, miny = min_x, min_y
    @coords.each{|x,y| s[y-miny][x-minx] = (x==0 && y==0) ? ?@ : ?#}
    s.map{|l| l.rstrip.empty? ? "" : l.rstrip + "\n"}*''
  end

  private
  def vec_add(v1, v2)
    v1.zip(v2).map{|x,y| x+y}
  end

  def leftside(dir)
    case dir
    when [ 0,-1]; [-1,-1]
    when [ 1, 0]; [ 0,-1]
    when [ 0, 1]; [ 0, 0]
    when [-1, 0]; [-1, 0]
    end
  end

  def rightside(dir)
    leftside([-dir[1], dir[0]])
  end
end

class Bloku
  attr_reader :id, :name, :size
  include Enumerable

  def initialize(id, name, *coords)
    @id = id
    @name = name
    @size = coords.size
    make_variations(coords)
  end

  def rotate(x, y, dir)
    dx, dy, piece = @rotations[dir]
    [x+dx, y+dy, piece]
  end

  def each(&block)
    @variations.each(&block)
  end

  private
  def find_overlap(p2)
    @variations.each do |p1|
      mx1, my1, mx2, my2 = p1.min_x, p1.min_y, p2.min_x, p2.min_y
      if p1.coords.sort.zip(p2.coords.sort).all? {|c1, c2|
          x1, y1 = *c1
          x2, y2 = *c2
          x1-mx1 == x2-mx2 && y1-my1 == y2-my2
        }
        return [mx2-mx1, my2-my1, p1]
      end
    end
    nil
  end

  def make_variations(coords)
    @variations = []
    @rotations = []
    h = {}
    8.times do |i|
      piece = Piece.new(@id << 3|i, "#{@name}#{i}", coords.dup)
      synonym = find_overlap(piece)
      if synonym
        @rotations << synonym
      else
        @rotations << [0, 0, piece]
        @variations << piece
      end
      coords.map!{|x,y| [-x, y]}  # mirror
      coords.map!{|x,y| [-y, x]} if i%2 == 1  # rotate right
    end
  end
end

class BlokuSet
  BLOKU_SET =
      [
       Bloku.new(0, 'u', [0,0], [1,0], [0,1], [-1,0], [0,-1]), # X5
       Bloku.new(1, 't', [-1,-1], [-1,0], [0,0], [1,0], [0,1]), # F5
       Bloku.new(2, 's', [0,0], [1,0], [1,1], [-1,0], [-1,-1]), # Z5
       Bloku.new(3, 'r', [0,0], [1,0], [1,1], [0,-1], [-1,-1]), # W5
       Bloku.new(4, 'q', [0,0], [1,0], [2,0], [0,-1], [0,-2]), # V5
       Bloku.new(5, 'p', [0,0], [0,-1], [0,1], [-1,1], [1,1]), # T5
       Bloku.new(6, 'o', [0,-1], [0,0], [1,0], [0,1], [0,2]), # Y5
       Bloku.new(7, 'n', [0,0], [0,1], [-1,1], [0,-1], [-1,-1]), # C5
       Bloku.new(8, 'm', [0,-1], [-1,0], [0,0], [-1,1], [0,1]), # P5
       Bloku.new(9, 'l', [0,-2], [0,-1], [0,0], [-1,0], [-1,1]), # N5
       Bloku.new(10, 'k', [0,0], [0,1], [0,-2], [0,-1], [-1,1]), # L5
       Bloku.new(11, 'j', [0,0], [0,1], [0,2], [0,-1], [0,-2]), # I5

       Bloku.new(12, 'i', [-1,0], [0,0], [0,1], [1,1]), # Z4
       Bloku.new(13, 'h', [0,0], [1,0], [0,1], [1,1]), # O4
       Bloku.new(14, 'g', [0,0], [1,0], [0,1], [0,-1]), # T4
       Bloku.new(15, 'f', [0,0], [0,-1], [0,1], [-1,1]), # L4
       Bloku.new(16, 'e', [0,0], [0,1], [0,2], [0,-1]), # I4

       Bloku.new(17, 'd', [0,0], [1,0], [0,-1]), # L3
       Bloku.new(18, 'c', [0,0], [0,1], [0,-1]), # I3

       Bloku.new(19, 'b', [0,0], [0,1]), # I2
       Bloku.new(20, 'a', [0,0]), # I1
      ]

  NBLOKU = BLOKU_SET.size

  BLOKU_BIT = {}
  NBLOKU.times {|i| BLOKU_BIT[BLOKU_SET[i].name] = 1 << i}

  NAME_TO_BLK = {}
  BLOKU_SET.each {|blk| NAME_TO_BLK[blk.name] = blk}
  NBLOKU.times {|i| NAME_TO_BLK[i] = BLOKU_SET[i]}

  def BlokuSet.[](blk)
    NAME_TO_BLK[blk]
  end

  include Enumerable

  def initialize(vec = (1 << NBLOKU) - 1)
    @vec = vec
  end

  def each
    NBLOKU.times do |i|
      yield BLOKU_SET[i] if @vec & 1 << i != 0
    end
  end

  def delete(blk_name)
    BlokuSet.new(@vec & ~BLOKU_BIT[blk_name])
  end

  def each_piece(&block)
    each {|blk| blk.each(&block) }
  end
end

def to_c(obj)
  if obj.kind_of?(Array)
    '{' + obj.map{|x| to_c(x) }.join(',') + '}'
  else
    obj.to_s
  end
end

def compile
  puts '#include <stdio.h>'
  puts '#include "piece.h"'
  puts
  bloku_set = BlokuSet.new
  bloku_set.each_with_index do |blk, i|
    blk.each do |piece|
      name = piece.name.tr('.','_')
      id = (i << 3) + name[-1,1].to_i
      fs = ["0x%02x"%id, piece.size, to_c(piece.coords),
            to_c(piece.directed_edges.map(&:size)),
            to_c(piece.directed_edges),
            piece.min_x, piece.min_y, piece.max_x, piece.max_y]
      puts "static Piece #{name} = {#{fs * ', '}};"
    end
  end
  bloku_set.each_with_index do |blk, i|
    name = blk.name.delete('.')
    puts "static Block #{name} = {"
    puts "    0x#{"%02x"%[i<<3]}, #{blk.size},"
    puts "    { #{blk.map{|p|'&'+p.name.tr('.','_')}*', '}, NULL },"
    rot = (0...8).map{|dir| dx,dy,piece = blk.rotate(0,0,dir)
      "{#{dx},#{dy},&#{piece.name.tr('.','_')}}"
    } * ', '
    puts "    { #{rot} }"
    puts "};"
  end
  puts "Block *block_set[] = {"
  names = bloku_set.map{|blk| '&'+blk.name.delete('.')} * ', '
  puts "    #{names}"
  puts "};"
end

if $0 == __FILE__
  compile
end
