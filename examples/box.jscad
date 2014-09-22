function main2() {
  var base_w = 63;
  var base_h = 30;
  var shell = 2;
  var inner_w = base_w-2*shell;
  var top_r1 = 70;
  var top_r2 = base_w/2;
  var top_h = 4;
  var sides = 5;
  var base = difference(
    cube([base_w,base_w,base_h]).center(true),
    cube([inner_w,inner_w,base_h]).center(true).translate([0,0,shell])
  ).translate([base_w,0,base_h/2]);
  var top = CSG.cylinder({
    start: [0, 0, 0],
    end: [0, 0, top_h],
    radiusStart: top_r1,
    radiusEnd: top_r2,
    resolution: sides
  }).center(true);
  if (sides%2 == 0) { top = top.rotateZ(45); }
  var s = shell/2;
  var cutout = difference(
    cube([base_w+s,base_w+s,s]).center(true),
    cube([inner_w-s,inner_w-s,s]).center(true)
  ).translate([0,0,-top_h/2]);
  top = difference(
    top,
    cutout
  );
  top = top.translate([-top_r2,0,top_h/2]);
  return [base, top]
}

function main() {
  var base_r = 25;
  var base_h = 30;
  var base_d = 50; // separation between circle centers
  var shell = 2;
  var inner_r = base_r-shell;
  var top_lip = 20;
  var top_h = 4;
  var sides = 5;
  var c = circle(base_r).center(true);
  var base_plate = hull(c,c.translate([base_d,0,0])).center(true);
  var c_i = circle(inner_r).center(true);
  var inner_plate = hull(c_i,c_i.translate([base_d,0,0])).center(true);
  var base  = difference(
    linear_extrude({height: base_h},base_plate),
    linear_extrude({height: base_h},inner_plate).translate([0,0,shell])
  );
  var r = 1;
  var h = base_d/base_r;
  var top  = cylinder({r: r, h: h, round: true}).rotateY(90).center(true).translate([0,0,-r*Math.sqrt(0.75)]);
  top = difference(top,cube(200).center(true).translate([0,0,-100]));
  var top_r = base_r + 2*top_lip;
  var top_d = base_r*2
  top = top.scale([top_d,top_r,top_r]);
  top = difference(top,cube(200).center(true).translate([0,0,100+top_h]));
  var c = circle(base_r+shell/2).center(true);
  var base_plate = hull(c,c.translate([base_d,0,0])).center(true);
  var c_i = circle(inner_r-shell/2).center(true);
  var inner_plate = hull(c_i,c_i.translate([base_d,0,0])).center(true);
  var cutout  = difference(
    linear_extrude({height: shell},base_plate),
    linear_extrude({height: shell},inner_plate)
  );
  top = difference(top,cutout);
  return [top,base.translate([0,base_r*2.5,0]),top];
}
