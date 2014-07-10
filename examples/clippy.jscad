function tube(h,r,t){
  return difference(cylinder({h:h,r:r}),cylinder({h:h,r:r-t}));
}

function outie() {
  return difference(tube(10,1,0.1),cube({size:[1,2,10]}).translate([0.5,-1,0]));
}

function innie() {
  return cylinder({h:10,r:0.8});
}

function test_tube() {
  return [tube(10,1,0.1),tube(10,1,0.2),tube(10,1,0.3),tube(10,1,0.05)];
}

function main() {
  //return union(innie().translate([-1,0,0]),outie().translate([0.7,0,0]));
  ts = test_tubes();
  return union(ts[0],ts[1],ts[2],ts[3]);
}
