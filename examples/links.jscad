var defaults = {
  border_radius: 2,
  width_x: 12,
  width_y: 2,
  width_z: 7,
  notch_z: 1,
  gap: 0.4,
  r_peg: 0.75,
  n_links: 4
}

var large_defaults = {
  border_radius: 5,
  width_x: 30,
  width_y: 10,
  width_z: 15,
  notch_z: 2,
  gap: 0.4,
  r_peg: 2,
  n_links: 20
}

function getParameterDefinitions() {
  return [
    { name: 'width_x', type: 'float', initial: 12, caption: "Width X (length)" },
    { name: 'width_y', type: 'float', initial: 2, caption: "Width Y" },
    { name: 'width_z', type: 'float', initial: 7, caption: "Width Z" },
    { name: 'notch_z', type: 'float', initial: 1, caption: "Notch Z (size of tab)" },
    { name: 'gap', type: 'float', initial: 0.4, caption: "Gap" },
    { name: 'r_peg', type: 'float', initial: 0.75, caption: "Peg Radius" },
    { name: 'n_links', type: 'float', initial: 24, caption: "Number of Links" },
    { name: 'border_radius', type: 'float', initial: 2, caption: "border_radius" },
  ];
}

defaults = large_defaults;
function footprint(_p) {
  var c = circle(_p.border_radius).center(true);
  var dx = (_p.width_x - _p.border_radius)/2;
  var dy = (_p.width_y - _p.border_radius)/2;
  circles = [
    c.translate([dx,dy,0]),
    c.translate([-dx,dy,0]),
    c.translate([dx,-dy,0]),
    c.translate([-dx,-dy,0])
  ];
  return hull(circles);
}

function main(_p) {
  var n_gap = _p.notch_z+_p.gap;
  var start = new Date().valueOf();
  var fp = footprint(_p);
  var link = linear_extrude({height: _p.width_z},fp);
  var dx = _p.width_x-3*(_p.r_peg+_p.gap); // how far to move the peg
  var dx2 = _p.width_x*0.75; // how much to cut
  var slice = linear_extrude({height: n_gap},fp);
  r_slice = square([_p.width_x+_p.border_radius*2,_p.width_y+_p.border_radius*2,1]).center(true);
  inside = linear_extrude({height: _p.width_z-2*_p.notch_z},r_slice);
  outside = linear_extrude({height: _p.notch_z+_p.gap},r_slice);
  link = difference(
    link,
    outside.translate([dx2,0,0]),
    outside.translate([dx2,0,_p.width_z-n_gap]),
    inside.translate([-dx2,0,_p.notch_z])
  )
  cylinder = linear_extrude({height:_p.width_z},circle(_p.r_peg+_p.gap).center(true));
  link = difference(link,cylinder.translate([dx/2+_p.gap,0,0]));
  cylinder = linear_extrude({height:_p.width_z},circle(_p.r_peg).center(true));
  link = union(link,cylinder.translate([-dx/2-_p.r_peg,0,0]));
  var slice = cube([_p.r_peg*1.8,_p.width_y,_p.width_z]).center([true,true,false]).translate([dx/2+_p.gap,_p.width_y/2,0]);
  dx = dx + _p.gap+_p.r_peg;
  out = [];
  for (var i=0; i<_p.n_links; i++){
    if (i == _p.n_links-1) { link = difference(link,slice); }
    out.push(link.translate([(1+i-_p.n_links/2)*dx,0,0]).rotateX(90));
  }
  console.log("Built in "+Math.floor((new Date().valueOf() - start)/1000)+"s");
  return out
}
