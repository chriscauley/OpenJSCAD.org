var defaults = {
  border_radius: 5,
  width_y: 10,
  width_x: 30,
  width_z: 15,
  notch_z: 2,
  gap: 0.5,
  r_peg: 2,
}

function footprint(_d) {
  var c = circle(_d.border_radius).center(true);
  var dx = (_d.width_x - _d.border_radius)/2;
  var dy = (_d.width_y - _d.border_radius)/2;
  circles = [
    c.translate([dx,dy,0]),
    c.translate([-dx,dy,0]),
    c.translate([dx,-dy,0]),
    c.translate([-dx,-dy,0])
  ];
  return hull(circles);
}

function main(params) {
  var _d = defaults;
  var n_gap = _d.notch_z+_d.gap;
  var start = new Date().valueOf();
  var fp = footprint(_d);
  var link = linear_extrude({height: _d.width_z},fp);
  var dx = _d.width_x*0.8;
  var slice = linear_extrude({height: n_gap},fp);
  r_slice = square([_d.width_x+_d.border_radius*2,_d.width_y+_d.border_radius*2,1]).center(true);
  inside = linear_extrude({height: _d.width_z-2*_d.notch_z},r_slice);
  outside = linear_extrude({height: _d.notch_z+_d.gap},r_slice);
  dx2 = _d.width_x*0.78; //no idea here
  /*link = difference(
    link,
    outside.translate([dx2,0,0]),
    outside.translate([dx2,0,_d.width_z-n_gap]),
    //linear_extrude({height: _d.width_z-2*_d.notch_z},fp).translate([-dx,0,_d.notch_z])
    inside.translate([-dx2,0,_d.notch_z])
  )*/
  cylinder = linear_extrude({height:_d.width_z},circle(_d.r_peg+_d.gap).center(true));
  link = difference(link,cylinder.translate([dx/2+_d.gap,0,0]));
  cylinder = linear_extrude({height:_d.width_z},circle(_d.r_peg).center(true));
  link = union(link,cylinder.translate([-dx/2,0,0]));
  console.log("Built in "+Math.floor((new Date().valueOf() - start)/1000)+"s");
  dx = dx + _d.gap;
  out = [];
  for (var i=-3; i<=3; i++){
    out.push(link.translate([i*dx,0,0]));
  }
  return out;
}
