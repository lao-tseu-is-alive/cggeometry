var w = window.innerWidth;

class Point {
  constructor(x, y, name='') {
    this.x = x;
    this.y = y;
    this.name = name; // for debug purpose
  }
}
class Segment {
  constructor(p1,p2,name=''){
    this.p1 = p1;
    this.p2 = p2;
    this.name = name; // for debug purpose
  }
}

var points=[];
points.push(new Point(100, 150, 'p1'));
points.push(new Point(50, 480, 'p2'));
points.push(new Point(475, 500, 'p3'));
points.push(new Point(600, 130, 'p4'));
points.push(new Point(320, 50, 'p5'));
var Sprites=[];
var PointSegments=[];
var Segments=[];

/* 6.1 geometric primitives : https://algs4.cs.princeton.edu/91primitives/
 And  Book : Algorithms in C++ by Robert Sedgewick Addison-Wesley ISBN 0-201-51059-6


 */
function isCcw(p1, p2, p3) {
  return (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y);
}
// l1 and l2 are segments
function intersects(l1, l2) {
  if (isCcw(l1.p1, l1.p2, l2.p1) * isCcw(l1.p1, l1.p2, l2.p2) > 0) return false;
  if (isCcw(l2.p1, l2.p2, l1.p1) * isCcw(l2.p1, l2.p2, l1.p2) > 0) return false;
  return true;
}

/**
 * polygonSelfIntersect allows to know if a polygon as self-intersection
 * @param arr2DPolygonCoords array of x,y coordinates values from the vertices of external ring of a closed Polygon (last two x,y values should be equal to first)
 * @return {boolean} true if there is a self-intersection in the polygon.  false elsewhere
 */
function polygonSelfIntersect(arr2DPolygonCoords){
  PointSegments= [];
  Segments = [];
  for (let i=0; i < ((arr2DPolygonCoords.length / 2)); i++ ){
    offset = i * 2;
    PointSegments.push(new Point(arr2DPolygonCoords[offset],arr2DPolygonCoords[offset+1],`P${i+1}`))
  }
  // last point is supposed to be equal to first point of polygon (closed polygon)
  PointSegments[PointSegments.length-1].name = PointSegments[0].name
  for (let i=0; i < (PointSegments.length - 1); i++ ) {
    Segments.push(new Segment (PointSegments[i], PointSegments[i + 1], `S${i+1}`))
  }
  for (let i= 0; i < Segments.length; i++){
    for (let j= i+2; j < Segments.length; j++){ // no need to test adjacent segments
      //console.log(i,j,Segments[i],Segments[j])
      if (!((i==0) && (j==(Segments.length-1)))){ // no need to test connection from first segment with last one
        if (intersects(Segments[i], Segments[j])) {
          console.log(`%c WARNING Segment ${Segments[i].name} intersects with ${Segments[j].name}`, 'background: #222; color: #bada55')
          return true
        } else {
          console.log(`%c OK Segment ${Segments[i].name} does not intersects with ${Segments[j].name}`, 'background: #00ff33; color: #111')
        }
      }
    }
  }
  return false
}


var game = new Phaser.Game(800, 600, Phaser.canvas, 'phaser-example', {
  preload: preload,
  create: create,
  update: update,
  render: render,
  enableDebug: false
});

function preload() {
  game.load.image('grid', 'assets/tests/debug-grid-1920x1920.png');
  for (let i=0; i < points.length; i++) {
    game.load.image(points[i].name, `assets/point_white_${points[i].name}.png`);
  }
}

var result = 'Drag a point ot change polygon shape...';
var p1 = newSprite = p3 = p4 = p5 = line2 = group = polygon = graphics =null;

function create() {
  //game.add.sprite(0, 0, 'grid');
  game.stage.backgroundColor = '#222222';
  group = game.add.group();
  //group.inputEnableChildren = true;

  //p1 = group.create(32, 100, 'point');
  for (let i=0; i < points.length; i++){
    newSprite = game.add.sprite(points[i].x, points[i].y, points[i].name)
    newSprite.anchor.set(0.5)
    newSprite.inputEnabled = true;
    newSprite.input.enableDrag();
    newSprite.events.onDragStart.add(onDragStart, this);
    newSprite.events.onDragStop.add(onDragStop, this);
    group.add(newSprite);
    Sprites.push(newSprite);
  }
  Sprites.push(Sprites[0])

  polygonSelfIntersect(Sprites.reduce((r, s) => r.push(s.x,s.y) && r, []))

  polygon = new Phaser.Polygon(Sprites)
  graphics = game.add.graphics()
  group.add(graphics)
  group.onChildInputDown.add(onDown, this);
}

function onDown(sprite, pointer) {
  result = "Down " + sprite.key;
  console.log('down', sprite.key);
}

function onDragStart(sprite, pointer) {
  result = "Dragging " + sprite.key;
}

function onDragStop(sprite, pointer) {
  result = sprite.key + " dropped at x:" + pointer.x + " y: " + pointer.y;

  polygonSelfIntersect(Sprites.reduce((r, s) => r.push(s.x,s.y) && r, []))

  if (pointer.y > 800) {
    console.log('input disabled on', sprite.key);
    sprite.input.enabled = false;

    sprite.sendToBack();
  }
}

function update() {

  // line1.fromSprite(p1, p2, false);
  graphics.destroy(); // destroy previous one is apparently easy way to erase it
  graphics = game.add.graphics()
  //graphics.lineStyle(2,game.stage.backgroundColor,1).drawShape(polygon);
  polygon.setTo(Sprites);
  graphics.lineStyle(2,0x00ff00,1)
  graphics.drawShape(polygon);

}

function render() {
  game.debug.text(result, 10, 20);
}
