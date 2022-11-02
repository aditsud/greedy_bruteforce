// Fungsi ini untuk mendapatkan koordinat dari suatu elemen html
const getOffset = ( el ) => {
  let _x = 0;
  let _y = 0;
  while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
      _x += el.offsetLeft - el.scrollLeft;
      _y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
  }
  return { top: _y, left: _x };
}

// fungsi ini untuk membuat garis dari dua titik koordinat suatu elemen html
export default function connect(idCanvas, div1_id, div2_id, variasi_x=0, variasi_y=0, color="red", correctionY=0, thickness=2) { // draw a line connecting elements

  let div1 = document.getElementById(div1_id);
  let div2 = document.getElementById(div2_id);
  
  var off1 = getOffset(div1);
  var off2 = getOffset(div2);
  // bottom right
  var x1 = off1.left + variasi_x;
  var y1 = off1.top + variasi_y - correctionY;
  // top right
  var x2 = off2.left + variasi_x;
  var y2 = off2.top + variasi_y - correctionY;
  // distance
  var length = Math.sqrt(((x2-x1) * (x2-x1)) + ((y2-y1) * (y2-y1)));
  // center
  var cx = ((x1 + x2) / 2) - (length / 2);
  var cy = ((y1 + y2) / 2) - (thickness / 2);
  // angle
  var angle = Math.atan2((y1-y2),(x1-x2))*(180/Math.PI);
  // make hr
  var htmlLine = "<div style='opacity: 0.7; padding:0px; margin:0px; height:" + thickness + "px; background-color:" + color + "; line-height:1px; position:absolute; left:" + cx + "px; top:" + cy + "px; width:" + length + "px; -moz-transform:rotate(" + angle + "deg); -webkit-transform:rotate(" + angle + "deg); -o-transform:rotate(" + angle + "deg); -ms-transform:rotate(" + angle + "deg); transform:rotate(" + angle + "deg);' />";
  //
  // alert(htmlLine);
  document.getElementById(idCanvas).innerHTML += htmlLine;
}