function getParameterDefinitions() {
  var _v = ['bottom','lid'];
  return [
    { name: 'hex_r', type: 'float', initial: 29, caption: "Hex Radius" },
    { name: 'border', type: 'float', initial: 2, caption: "Hex Border" },
    { name: 'hex_h', type: 'float', initial: 9.25, caption: "Hex Height" },
    { name: 'gap', type: 'float', initial: 0.5, caption: "Gap" },
    { name: 'style', type: 'choice', values: _v, initial: 'bottom', caption: "Style" },
    { name: 'count', type: 'choice', values: ['single','full'], caption: 'Count' }
    ]
}

function make_hex(r,h) {
  return linear_extrude({height:h},circle({fn:6,r:r})).center([true,true,false]).rotateZ(30);;
}

function get_unit(p) {
  var inner = make_hex(p.hex_r,p.hex_h+p.border).translate([0,0,p.border]);
  var peg = make_hex(p.hex_r-p.gap*2,p.border*0.9).translate([0,0,-p.border]);
  if (p.style == 'lid') {
    var outer = make_hex(p.hex_r+p.border,p.border);
    unit = union(outer,peg,peg.translate([0,0,2*p.border]));
  } else {
    var outer = make_hex(p.hex_r+p.border,p.hex_h+p.border*2);
    unit = union(difference(outer,inner),peg);
  }
  return unit.translate([0,0,p.border]);
}

function main(p) {
  var unit = get_unit(p);
  var hex_w = p.hex_r*Math.sqrt(3)/2;
  var dx = 2*hex_w+p.border-p.gap/2;
  var dy = -1.5*p.hex_r-p.border+p.gap/2;
  var shifts = [
    [-dx,0,0],
    [-dx,0,0],
    [dx,0,0],
    [-dx/2,dy,0],
    [dx/2,dy,0],
    [-dx/2,-dy,0],
    [dx/2,-dy,0],
    [0,0,0]
  ];
  if (p.count == 'single') { shifts = [[0,0,0]]; }
  var hexes = [];
  var base = [];
  var skirt = [];
  for (var i=0; i<shifts.length; i++) {
    hexes.push(unit.translate(shifts[i]));
    base.push(make_hex(p.hex_r+p.border-0.3,p.border).translate(shifts[i]));
    skirt.push(make_hex(p.hex_r+p.border*1.5,p.border).translate(shifts[i]));
  }
  base = difference(union(skirt),union(base))
  units = union(union(hexes),base).center([true,true,false]);
  //return difference(units,cube(100).center(true).translate([0,50,0]));
  return units;
}
