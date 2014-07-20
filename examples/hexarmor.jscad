_d = {
  hex: {fn:6,h:4,r:6, rotx:45},
  tri: {fno:3,ri:3,ro:12,rotx:60},
  gap: 0.6
}
function getParameterDefinitions() {
  return [
    { name: 'hex_r', type: 'float', initial: 6, caption: "Hex Radius" },
    { name: 'hex_h', type: 'float', initial: 4, caption: "Hex Thickness" },
    { name: 'tri_ro', type: 'float', initial: 12, caption: "Triangle Outer Radius" },
    { name: 'tri_ri', type: 'float', initial: 3, caption: "Triangle Inner Radius" },
    { name: 'gap', type: 'float', initial: 0.6, caption: "Gap" },
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
function get_unit_cell(_d) {
  var tri = torus2(_d.tri);
  var r_total = 9;
  var hex = linear_extrude({height:_d.hex.h},circle(_d.hex)).rotateZ(30).center(true).translate([-r_total,0,0]);
  _d.otri = {fno:3,ri:_d.tri.ri+_d.gap,ro:_d.tri.ro,rotx:_d.tri.rotx};
  var otri = torus2(_d.otri);
  half_hex = difference(
    hex,
    cube(2*r_total).center(true).translate([-r_total*2,0]),
    otri
  )
  var cylinder = linear_extrude({height:_d.hex.h/2},circle(_d.tri.ri/2).center(true))
    .translate([_d.tri.ro,0,-_d.hex.h/2]);
  var unit_cell = union([
    tri,
    half_hex,
    half_hex.rotateZ(120),
    half_hex.rotateZ(-120),
    cylinder,
    cylinder.rotateZ(120),
    cylinder.rotateZ(-120),
  ])
  return unit_cell
}
function main(params) {
  _d.hex.r = params.hex_r;
  _d.hex.h = params.hex_h;
  _d.tri.ri = params.tri_ri;
  _d.tri.ro = params.tri_ro;
  _d.gap = params.gap;
  var unit_cell = get_unit_cell(_d);
  var dist = _d.tri.ro+_d.hex.r;
  var _uc = unit_cell.rotateZ(60).translate([-dist,0,0]);
  return unit_cell;
  unit_cell2 = union([
    unit_cell,
    _uc,
    _uc.rotateZ(120),
    _uc.rotateZ(-120),
  ])
  _uc2 = unit_cell2.rotateZ(60).translate([2*dist,0,0]);
  return [
    unit_cell2,
    _uc2,
    _uc2.rotateZ(120),
    _uc2.rotateZ(-120),
  ]
}
