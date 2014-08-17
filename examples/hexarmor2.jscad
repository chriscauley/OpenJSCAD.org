_d = {
  hex: {fn:6,rotx:45},
  tri: {fno:3,rotx:60,roty:15}
};
function getParameterDefinitions() {
  return [
    { name: 'hex_r', type: 'float', initial: 7, caption: "Hex Radius" },
    { name: 'hex_h', type: 'float', initial: 5, caption: "Hex Thickness" },
    { name: 'tri_ro', type: 'float', initial: 12, caption: "Triangle Outer Radius" },
    { name: 'tri_ri', type: 'float', initial: 3.5, caption: "Triangle Inner Radius" },
    { name: 'gap', type: 'float', initial: 0.6, caption: "Gap" },
    { name: 'pattern', type: 'custom', constructor: 'newCanvas', caption: "pattern"}
  ];
}

function torus2(p) {
  var ri = 1, ro = 4, fni = 16, fno = 32, rotx = 0, roty = 0, rotz = 0;
  if(p) {
    if(p.ri) ri = p.ri;
    if(p.fni) fni = p.fni;
    if(p.rotx) rotx = p.rotx;
    if(p.roty) roty = p.roty;
    if(p.rotz) rotz = p.rotz;
    if(p.ro) ro = p.ro;
    if(p.fno) fno = p.fno;
  }
  if(fni<3) fni = 3;
  if(fno<3) fno = 3;
  var c = circle({r:ri,fn:fni,center:true});
  if(rotx) c = c.rotateX(rotx);
  if(roty) c = c.rotateY(roty);
  if(rotz) c = c.rotateZ(rotz);
  return rotate_extrude({fn:fno},c.translate([ro,0,0]));
}
function generate_link(_d) {
  var c = circle(_d.hex.h/2).center(true);
  var offset = _d.tri.ro/2;
  var link = hull(c.translate([offset,0,0]),c.translate([-offset,0,0]));
  return linear_extrude({height:_d.hex.h},link).rotateX(90).center(true);
}
function get_unit_cell(_d) {
  var tri = torus2(_d.tri);
  var clamp_r = _d.tri.ri/2-_d.gap; // size of clamp hole
  var clamp_d = _d.tri.ro*cos(60); //clamp translate distance
  clamp_outer = linear_extrude({height:_d.hex.h+_d.gap},circle(_d.tri.ri/2)).center(true);
  clamp_inner = linear_extrude({height:_d.hex.h+_d.gap},circle(clamp_r)).center(true);
  c = linear_extrude({height:_d.hex.h+_d.gap},circle(_d.tri.ri/2)).center(true);
  var clamp = difference(clamp_outer,clamp_inner).rotateX(90).center(true).translate([-clamp_d,0,0]);
  var clamp_hole = c.rotateX(90).center(true).translate([-clamp_d,0,0]);
  tri = difference(
    tri,
    clamp.rotateZ(120),
    clamp.rotateZ(-120),
    clamp
  );
  _d.otri = {fno:3,ri:_d.tri.ri,ro:_d.tri.ro-_d.gap,rotx:_d.tri.rotx};
  var osq = cube([clamp_r*2,clamp_r*4,clamp_r]).center(true).translate([-clamp_d,0,-_d.tri.ri/4]);
  var join = generate_link(_d).translate([-_d.tri.ro,0,0]);
  var half_join = difference(
    join,
    osq, // square hole
    cube(2*clamp_d).scale([1,2,1]).center(true).translate([-(_d.tri.ro+_d.hex.r/2),0,0]), // bisect join
    clamp_hole //round hole
  );
  var foot = linear_extrude({height:_d.hex.h/2},circle(_d.tri.ri/3).center(true)).translate([0,0,-_d.hex.h/2]);
  tri_big = torus2({fno:3,ro:_d.hex.r*cos(30)+_d.tri.ro,ri:0.1}); // outer calibration triangle
  var c1 = foot.translate([_d.tri.ro,0,0]);
  var c2 = foot.translate([-clamp_d,_d.hex.r/2+2*_d.gap,0]);
  var c3 = foot.translate([-clamp_d,-_d.hex.r/2-2*_d.gap,0]);
  var unit_cell = union([
    //tri_big, //useful for trying to get the triangles lined up
    tri,
    half_join,
    half_join.rotateZ(120),
    half_join.rotateZ(-120),
    c1,
    c2,
    c3,
    c1.rotateZ(120),
    c2.rotateZ(120),
    c3.rotateZ(120),
    c1.rotateZ(-120),
    c2.rotateZ(-120),
    c3.rotateZ(-120)
  ])
  return unit_cell;
}
function main(p) {
  var start = new Date().valueOf();
  _d.hex.r = p.hex_r;
  _d.hex.h = p.hex_h;
  _d.tri.ri = p.tri_ri;
  _d.tri.ro = p.tri_ro;
  _d.gap = p.gap;
  _d.dx = sin(30)*(2*_d.tri.ro + _d.hex.r); //height of unit_cell
  _d.dy = cos(30)*(2*_d.tri.ro + _d.hex.r); //width of unit_cell
  var unit_cell = get_unit_cell(_d).translate([0,0,_d.hex.h/2]);
  //unit_cell = difference(unit_cell,cube(100).center(true).translate([0,50,0]))
  var y_shift = _d.dy-(1+cos(30))*_d.tri.ro;
  var from_pattern = [];
  for (var ri=0; ri<p.pattern.length; ri++) {
    for (var ci=0; ci<p.pattern[ri].length; ci++) {
      if (p.pattern[ri][ci] == 0) { continue; }
      t = unit_cell;
      if (p.pattern[ri][ci] == -1) { t = t.rotateZ(60).translate([2*y_shift,0,0]); } // this translate is bs'd
      t = t.translate([(ri-3)*_d.dy,(ci-2)*_d.dx,0]);
      from_pattern.push(t);
    }
  }
  console.log("Completed in "+(new Date().valueOf()-start)/1000+" seconds");
  return from_pattern;
}
