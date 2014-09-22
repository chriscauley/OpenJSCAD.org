_d = {
  clamp: {fn:6},
  tri: {fno:3}
};
function getParameterDefinitions() {
  return [
    { name: 'clamp_l', type: 'float', initial: 15, caption: "Clamp Length" },
    { name: 'clamp_w', type: 'float', initial: 5, caption: "Clamp Width" },
    { name: 'tri_ro', type: 'float', initial: 12, caption: "Triangle Outer Radius" },
    { name: 'tri_ri', type: 'float', initial: 3.5, caption: "Triangle Inner Radius" },
    { name: 'gap', type: 'float', initial: 0.6, caption: "Gap" },
    { name: 'pattern', type: 'custom', constructor: 'newCanvas', caption: "pattern"}
  ];
}

function torus3(p) {
  var ri = 1, ro = 4, fni = 16, fno = 32;
  var p = p || {}
  if(p.ri) ri = p.ri;
  if(p.fni) fni = p.fni;
  if(p.ro) ro = p.ro;
  if(p.fno) fno = p.fno;
  if(fni<3) fni = 3;
  if(fno<3) fno = 3;
  var c = circle({r:ri,fn:fni,center:true});
  var ro2 = ro*sin(180/fno);
  var rod = linear_extrude({height: ro*4},c).rotateY(90).center(true).translate([0,ro2,0]);
  var cut = cube([3*ro,2*ro,2*ri]).center(true).translate([0,-ro,0]);
  var cut1 = cut.translate([ro,0,0]).rotateZ(90-180/fno);
  var cut2 = cut.translate([-ro,0,0]).rotateZ(-90+180/fno);
  rod = difference(rod,cut1,cut2);
  out = [rod];
  for (var i=1;i<fno;i++) { out.push(rod.rotateZ(i*360/fno)); }
  return union(out).rotateZ(90); //this is a hack to get the triangle oriented the same as everything else
}

function generate_link(_d) {
  var c = circle(_d.tri.ri).center(true);
  var offset = _d.clamp.l/2;
  var link = hull(c.translate([offset,0,0]),c.translate([-offset,0,0]));
  link = linear_extrude({height:_d.clamp.w},link).rotateX(90).center(true);
  return difference(link,cube(offset*2).center(true).translate([-offset,0,0]));
}

function get_unit_cell(_d) {
  var tri = torus3(_d.tri);
  var tri_r2 = _d.tri.ro*sin(60); //distance to center of clamp
  var tri_cut = linear_extrude({height:_d.clamp.w+_d.gap},circle(_d.tri.ri));
  tri_cut = tri_cut.rotateX(90).center(true).translate([-tri_r2,0,0]);
  tri = difference(tri,tri_cut,tri_cut.rotateZ(120),tri_cut.rotateZ(-120));
  _d.tri_inner = {ri:_d.tri.ri,ro:_d.tri.ro,fno:_d.tri.fno};
  var clamp_thickness = 1;
  _d.tri_inner.ri = _d.tri.ri - clamp_thickness - _d.gap;
  tri = union(tri,torus3(_d.tri_inner));
  
  var c = linear_extrude({height:_d.clamp.w+_d.gap},circle(_d.tri.ri-clamp_thickness+_d.gap/2)).center(true);
  var clamp_hole = c.rotateX(90).center(true).translate([-tri_r2,0,0]);
  var join = generate_link(_d).translate([-tri_r2-_d.clamp.l/2,0,0]);
  var half_join = difference(
    join,
    clamp_hole //round hole
  );
  var unit_cell = union([
    tri,
    half_join,
    half_join.rotateZ(120),
    half_join.rotateZ(-120),
  ])
  return unit_cell;
}

function main(p) {
  var start = new Date().valueOf();
  _d.clamp.l = p.clamp_l;
  _d.clamp.w = p.clamp_w;
  _d.tri.ri = p.tri_ri;
  _d.tri.ro = p.tri_ro;
  _d.gap = p.gap;
  var unit_cell = get_unit_cell(_d);
  var bounds = unit_cell.getBounds();
  _d.dx = 2*sin(60)*_d.tri.ro;
  _d.dy = 2*cos(60)*_d.tri.ro*2;
  //unit_cell = difference(unit_cell,cube(100).center(true).translate([0,50,0]))
  var y_shift = 0;
  var from_pattern = [];
  for (var xi=0; xi<p.pattern.length; xi++) {
    for (var yi=0; yi<p.pattern[xi].length; yi++) {
      if (p.pattern[xi][yi] == 0) { continue; }
      t = unit_cell;
      if (p.pattern[xi][yi] == -1) { t = t.rotateZ(60).translate([2*y_shift,0,0]); } // this translate is bs'd
      t = t.translate([(xi-3)*_d.dy,(yi-2)*_d.dx,0]);
      from_pattern.push(t);
    }
  }
  console.log("Completed in "+(new Date().valueOf()-start)/1000+" seconds");
  return from_pattern;
}
