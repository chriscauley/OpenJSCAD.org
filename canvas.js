function newCanvas() {
  var wrapper = document.createElement("div");
  document.querySelector("body").appendChild(wrapper);
  wrapper.id = "canvas-modal";
  var canvas = document.createElement("canvas");
  canvas.style.display = "block";
  wrapper.appendChild(canvas);
  canvas.width = 480;
  canvas.height = 410;
  function done() {
    wrapper.style.display = "none";
    console.log(data);
  }
  var button = document.createElement("button");
  button.innerHTML = "Save and Render";
  button.onclick = done;
  var margin = 20;
  var r = 40;
  var sx = 60;
  var sy = sx/3*4;
  var ctx = canvas.getContext("2d");
  var n_rows = 5,n_cols = 8, data = [];

  for (j=0;j<n_rows;j++) {
    row = [];
    for (i=0;i<n_cols;i++) {
      row.push(0);
    }
    data.push(row);
  }

  function tick(e) {
    // draw grid
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (j=0;j<n_rows;j++) {
      for (i=0;i<n_cols;i++) {
        spin = ((i+j)%2==0)?1:-1;
        var x = sx*i+margin,y=sy*j+margin;
        if (e) {
          var dx = x-e.offsetX, dy = y-e.offsetY;
          if (Math.sqrt(dx*dx+dy*dy) < r*0.75) { data[j][i] = data[j][i]?0:spin; }
        }
        ctx.beginPath();
        _t = spin*Math.PI/2;
        if (spin == 1) { y -= sy/4; }
        ctx.moveTo(x+r*Math.cos(_t),y+r*Math.sin(_t));
        ctx.lineTo(x+r*Math.cos(Math.PI*2/3+_t),y+r*Math.sin(Math.PI*2/3+_t));
        ctx.lineTo(x+r*Math.cos(Math.PI*4/3+_t),y+r*Math.sin(Math.PI*4/3+_t));
        ctx.lineTo(x+r*Math.cos(_t),y+r*Math.sin(_t));
        ctx.fillStyle="#333";
        ctx.stroke();
        if (!!data[j][i]) { ctx.fill() };
      }
    }
  }

  canvas.onclick = tick;
  function open() {
    wrapper.style.display = "block";
    tick();
  }
  return {
    open: open,
    data: data,
  }
}

//setTimeout(newCanvas,2000);
