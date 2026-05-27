// Initializing canvas and context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 400;
let drawing = false;
let isErasing = false;

// Brush settings
let brushColor = document.getElementById('brushColor').value;
let brushSize = document.getElementById('brushSize').value;

// Undo/Redo stacks
let undoStack = [];
let redoStack = [];

// Layer management
let layers = [];
let currentLayer = createNewLayer();

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);

function getMousePos(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function startDrawing(event) {
  saveState();
  drawing = true;
  draw(event);  // To draw a point where the mouse is clicked
}

function stopDrawing() {
  drawing = false;
  ctx.beginPath();
}

function draw(event) {
  if (!drawing) return;
  
  const pos = getMousePos(canvas, event);
  
  ctx.lineWidth = brushSize;
  ctx.lineCap = 'round';
  ctx.strokeStyle = isErasing ? '#ffffff' : brushColor;

  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}

document.getElementById('brushColor').addEventListener('input', (e) => {
  brushColor = e.target.value;
});

document.getElementById('brushSize').addEventListener('input', (e) => {
  brushSize = e.target.value;
});

document.getElementById('save').addEventListener('click', () => {
  const dataURL = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = 'canvas_image.png';
  a.click();
});

// Undo/Redo functionality
function saveState() {
  const imageData = canvas.toDataURL();
  undoStack.push(imageData);
  redoStack = [];
}

document.getElementById('undo').addEventListener('click', () => {
  if (undoStack.length > 0) {
    redoStack.push(canvas.toDataURL());
    const imageData = undoStack.pop();
    const image = new Image();
    image.src = imageData;
    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);
    };
  }
});

document.getElementById('redo').addEventListener('click', () => {
  if (redoStack.length > 0) {
    undoStack.push(canvas.toDataURL());
    const imageData = redoStack.pop();
    const image = new Image();
    image.src = imageData;
    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);
    };
  }
});

// Eraser tool
document.getElementById('eraser').addEventListener('click', () => {
  isErasing = !isErasing;
  document.getElementById('eraser').textContent = isErasing ? 'Brush' : 'Eraser';
});

document.getElementById('imageLoader').addEventListener('change', (e) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
});

document.getElementById('addRectangle').addEventListener('click', () => {
  const width = prompt('Enter rectangle width:', '100');
  const height = prompt('Enter rectangle height:', '100');
  if (width && height) {
    ctx.fillStyle = brushColor;
    ctx.fillRect(50, 50, parseInt(width), parseInt(height));
    saveState();
  }
});

document.getElementById('addCircle').addEventListener('click', () => {
  const radius = prompt('Enter circle radius:', '50');
  if (radius) {
    ctx.fillStyle = brushColor;
    ctx.beginPath();
    ctx.arc(200, 200, parseInt(radius), 0, Math.PI * 2, true);
    ctx.fill();
    saveState();
  }
});

// Add Text tool
document.getElementById('addText').addEventListener('click', () => {
  canvas.addEventListener('click', addTextToCanvas);
});

function addTextToCanvas(event) {
  const pos = getMousePos(canvas, event);
  const text = prompt('Enter the text:');
  if (text) {
    ctx.font = '20px Arial';
    ctx.fillStyle = brushColor;
    ctx.fillText(text, pos.x, pos.y);
    saveState();
  }
  canvas.removeEventListener('click', addTextToCanvas);
}

// Layer management
function createNewLayer() {
  const layerCanvas = document.createElement('canvas');
  layerCanvas.width = canvas.width;
  layerCanvas.height = canvas.height;
  return layerCanvas.getContext('2d');
}

function mergeLayers() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  layers.forEach(layer => ctx.drawImage(layer.canvas, 0, 0));
}

document.getElementById('newLayer').addEventListener('click', () => {
  layers.push(currentLayer);
  currentLayer = createNewLayer();
});

// Brush Shape and Pattern
document.getElementById('brushShape').addEventListener('input', (e) => {
  const shape = e.target.value;
  switch (shape) {
    case 'round':
      ctx.lineCap = 'round';
      break;
    case 'square':
      ctx.lineCap = 'square';
      break;
    default:
      ctx.lineCap = 'round';
  }
});

document.getElementById('brushPattern').addEventListener('input', (e) => {
  const pattern = e.target.value;
  const img = new Image();
  img.src = pattern;
  img.onload = () => {
    ctx.strokeStyle = ctx.createPattern(img, 'repeat');
  };
});

// Save As different formats
document.getElementById('saveAs').addEventListener('change', (e) => {
  const format = e.target.value;
  const dataURL = canvas.toDataURL(`image/${format}`);
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = `canvas_image.${format}`;
  a.click();
});
