function body_segment(_o) {
  var circles = [];
  for (var i=-1; i<2; i++) {
    circles.push(circle(0.5*_o.height*(1-Math.abs(i*0.5))).center([false,true]).translate([0,_o.height*i/2,0]));
  }
  if (!_o.flat) {
    shape = linear_extrude({height:_o.t_rib},hull(circles));
  }
  return shape.rotateY(-90);
}

function snake(_o) {
  start = new Date().valueOf();
  var shapes = [];
  var d = _o.t_rib+_o.separation;
  var min_height = Infinity;
  var max_height = 0;
  var last_height = Infinity;
  for (var i=_o.tail_skew-_o.segments; i<_o.tail_skew; i++) {
    _o.height = _o.max_height*(1-Math.abs(i/40));
    _o.spine_height = Math.min(last_height,_o.height);
    x0 = d*i;
    shapes.push(body_segment(_o).translate([x0,0,0]));
    min_height = Math.min(min_height,_o.height);
    max_height = Math.max(max_height,_o.height);
    last_height = _o.height;
    x = _o.separation+_o.t_rib;
    shapes.push(
      cube([x,_o.t_spine,0.9*_o.spine_height])
        .center(true,true,false)
        .translate([x0-x/2,0,_o.spine_height/2])
    );
  }
  var j_max = _o.tail_segments;
  var j2 = j_max*j_max;
  var tail = [];
  var tail_radius = min_height/2;
  x0 += tail_radius;
  for (var j=1; j<j_max+1; j++) {
    radius = j*tail_radius/j_max;
    x = 20*(j2-j*j)/j2-2;
    tail.push(sphere(radius).translate([x0+x,3*j/j_max,radius]));
    tail.push(sphere(radius).translate([x0+x,-3*j/j_max,radius]));
  }
  shapes.push(tail);
  var head = sphere(max_height).scale([3,0.6,0.6]).translate([0,0,0.3*max_height]);
  var head_slice = cube([3*max_height,max_height*2,2*max_height]).center(true);
  head = difference(head,head_slice.translate([1.5*max_height,0,0]));
  head = difference(head,head_slice.translate([-1.5*max_height,0,-max_height]));
  x0 = -d*(1+_o.segments-_o.tail_skew)
  shapes.push(head.translate([x0,0,0]));
  eye = sphere(1).translate([x0-max_height*0.7,max_height*0.4,max_height*0.7]);
  shapes.push(eye);
  shapes.push(eye.translate([0,-max_height*0.8,0]));
  return union(shapes);
}

function main() {
  _o = {
    separation: 2,
    t_rib: 2.5,
    t_spine: 0.8,
    segments: 40,
    max_height: 11,
    tail_segments: 0,
    tail_skew: 34
  };
  var start = new Date().valueOf();
  x = union([
    snake(_o)
  ]);
  console.log("Built in "+Math.floor((new Date().valueOf() - start)/1000)+"s");
  return x;
}
