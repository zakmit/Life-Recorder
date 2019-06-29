class Point {
    constructor(p, id, rotate, img, imgSize, radius) {
        this.p = p;
        this.id = id;
        this.rotate = rotate;
        this.img = img;
        this.imgSize = imgSize;
        this.radius = radius;
    }
    display() {
      let i = 0;
      let num = this.id;
      while(num > i*8) {
        num -= i*8;
        i++;
      }
      this.p.push();
        if(i !== 0)
          this.p.translate( (i*this.radius)*Math.cos( (num-1) * Math.PI/ (4 * i) ), (i*this.radius)*Math.sin( (num-1) * Math.PI/ (4 * i) ));
        this.p.rotate(this.rotate);
        this.p.image(this.img, 0, 0, this.imgSize, this.imgSize);
      this.p.pop();
    }
}


export default function sketch (p) {
    let count = 0;
    let points = [];
    p.setup = function () {
        p.createCanvas(window.innerWidth, window.innerHeight);
        p.imageMode(p.CENTER);
    };
  
    p.myCustomRedrawAccordingToNewPropsHandler = function (props) {
        p.resizeCanvas(props.width, props.height);
        if(props.pattern.length === 0) {
          points = [];
          count = 0;
        }
        else if(props.pattern.length > count) {
          let img2;
          while(props.pattern.length > count) {
            img2 = p.loadImage( props.imgs[props.pattern[count][0]%props.imgs.length] );
            points.push(new Point(p, count, props.pattern[count][1], img2, props.imgSize, props.radius))
            count++;
          }
        }
    };
  
    p.draw = function () {
        p.background(255);
        p.translate(p.width / 2, p.height / 2);
        if(points !== [])
          points.forEach((point) => point.display());
    };
};
  