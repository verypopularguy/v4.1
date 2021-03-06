import { canvasWidth } from '../store.js'
import { get } from 'svelte/store'

export function calculateCanvasDimensions () {
  const appElement = document.getElementById('main-content')
  let availableHeight
  let availableWidth
  const aspectRatio = 4/3
  if (appElement) {
    availableHeight = appElement.clientHeight
    availableWidth = appElement.clientWidth
  }
  else {
    availableHeight = window.innerHeight
    availableWidth = window.innerWidth
  }

  let dimensions = {}
  // lose 5% of space to maintain slight separation and space for audio slider
  if (availableWidth * (1/aspectRatio) < availableHeight) {
    dimensions.width = 0.95 * availableWidth;
    dimensions.height = dimensions.width * (1/aspectRatio);
  } else {
    dimensions.height = 0.95 * availableHeight;
    dimensions.width = dimensions.height * aspectRatio;
  }
  return dimensions
}

// I know...
export function calculateCanvasDimensions2 () {
  const normalD = calculateCanvasDimensions()
  return { width: 0.9 * normalD.width, height: 0.9 * normalD.height}
}

// the last destructured property `canvasWidth` is renamed, AND also has a default value
export function drawStroke ({ points, color, lineWidth, isErasing, canvasWidth: originalWidth = null }, pointPeriod = null, ctx, canvas) {
  return new Promise(async resolve => {
    for (let i = 1; i < points.length; i++) {
      // always normalize the unitX, unitY and unitWidth
      // points are already in unit form  
      // so just handle unit width 
      let normalizedLineWidth
      if (originalWidth) {
        normalizedLineWidth = lineWidth * (get(canvasWidth) / originalWidth)
      } else {
        normalizedLineWidth = originalWidth
      }
      connectTwoPoints(points, i, isErasing, ctx, color, lineWidth, canvas);
      if (pointPeriod !== null) { // delay for a duration of pointPeriod
        await new Promise(resolve => setTimeout(resolve, pointPeriod));
      }
    }
    resolve();
  });
}

/**
 * Joins together 2 points using a straight line. 
 * 
 * The operation is *used* atomically, and so calling `$_setStrokesProperties()`
 * makes the method safe for single-thread concurrency. 
 * For example: when rendering two strokes "in parallel", the colors won't interfere.
 * 
 * @param {*} points NORMALIZED coordinates of the points to be joined i.e. { unitX: Number, unitY: Number } 
 * @param {*} i 
 * @param {*} isErasing 
 * @param {*} ctx 
 * @param {*} color 
 * @param {*} lineWidth 
 */
export function connectTwoPoints (points, i, isErasing, ctx, color = "white", lineWidth = 3, canvas) {
  setStrokeProperties(color, lineWidth, isErasing, ctx);

  // TODO: this line silently fails for edge case if a stroke only has 1 point
  const prevPoint = points[i - 1]; // this fails silently for the first point of the stroke i = 0
  const prevX = prevPoint.unitX * canvas.width;
  const prevY = prevPoint.unitY * canvas.height;

  const curPoint = points[i];
  // console.log('curPoint =', curPoint)
  // console.log('canvas =', canvas)
  const curX = curPoint.unitX * canvas.width;
  const curY = curPoint.unitY * canvas.height;

  ctx.beginPath();
  ctx.moveTo(prevX, prevY);

  
  /**
   * Draw a quadratic curve according to: https://github.com/shuding/apple-pencil-safari-api-test/blob/gh-pages/index.js
   * 
   * But if I set the control points like this, it's just equivalent to `lineTo()`
   */
  // const controlX = (prevX + curX) / 2; 
  // const controlY = (prevY + curY) / 2;  
  // ctx.quadraticCurveTo(controlX, controlY, curX, curY);
  ctx.lineTo(curX, curY);
  ctx.stroke();
}

export function setStrokeProperties (color, lineWidth, isEraserStroke, ctx) {
  ctx.globalCompositeOperation = isEraserStroke ? 'destination-out' : 'source-over';
  ctx.strokeStyle = color; 
  ctx.lineWidth = lineWidth; 
  /**
   * when two independent lines meet (think two straight lines meeting each other), instead of zigzagging abruptly, they'll be "rounded" together"
   * NOTE: "This property has no effect wherever two connected segments have the same direction"
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin
   */
  ctx.lineJoin = "round"; 

  // end of line is not a square, but a rounded edge  
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineCap
  ctx.lineCap = "round"; 
}

export function renderBackground (src, canvas, bgCtx) {
  return new Promise(resolve => {
    if (!src) resolve(); 

    const image = new Image();
    image.src = src;
    
    /* avoid the "tainted canvas may not be exported" error
        https://stackoverflow.com/questions/22710627/tainted-canvases-may-not-be-exported */
    image.crossOrigin="anonymous";

    image.onload = () => { 
      const boardWidth = canvas.scrollWidth 
      const boardHeight = canvas.scrollHeight
      const imageAspectRatio = image.width / image.height
      // correctness argument: because each device's blackboard has the same aspect ratio,
      // height-based scaling will not distort annotations
      if (image.height > image.width) { // weak criteria, but assume it's a vertical PDF page
        // image.width = boardWidth / 2
        // image.height = image.width * 1/imageAspectRatio
        image.height = boardHeight 
        image.width = image.height * imageAspectRatio
      } else { 
        // slide ratio seems to be 3 * 4 
        // increase size to 100%
        image.width = boardWidth
        image.height = image.width * 1/imageAspectRatio
      }
      bgCtx.drawImage(image, 0, 0, image.width, image.height); // (0, 0) specifies the top-left corner of the image
      resolve();
    };
  });
}