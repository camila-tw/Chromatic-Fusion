let bgColor;
let colorScheme;
let drawWidth, drawHeight, drawRatio;
let canvasWidth, canvasHeight, canvasRatio;
let densityRatio;

/**
 * 主要畫布
 */
let mainCanvas;

/**
 * 初始化參數
 * @returns {Object} 包含初始化參數的物件
 */
function initParams() {
  return {
    layers: floor(random(2, 4)),
    minSize: 2,
    maxSize: 8,
    minAlpha: 0.2,
    maxAlpha: 0.8,
  };
}

function fxSetup() {
  let seed = lerp(-1000000, 1000000, $fx.rand()); 
  randomSeed(seed);
  noiseSeed(seed);
  console.log("fxhash = " + $fx.hash);
}

/**
 * 初始化畫面比例
 */
function setupRatio () {

  densityRatio = 1;
  windowRatio = windowWidth / windowHeight;
  drawRatio = drawWidth / drawHeight;

  if(drawRatio < windowRatio)
  {
    canvasHeight = windowHeight;
    canvasWidth = canvasHeight * drawRatio;
  }
  else
  {
    canvasWidth = windowWidth;
    canvasHeight = canvasWidth / drawRatio;
  }

  let url = new URL(window.location.href);
  let inputRatio = url.searchParams.get('scale');
  inputRatio = float(inputRatio);

  if( isNaN(inputRatio) == true )
  {
    densityRatio = canvasWidth / drawWidth;
  }
  else
  {
    densityRatio = inputRatio;
  }
}

/**
 * 主要畫布初始設定
 */
function setupMainCanvas() {
  mainCanvas = createGraphics(drawWidth, drawHeight);
  mainCanvas.pixelDensity(densityRatio);
  bgColor = getRandomBackgroundColor();
  mainCanvas.background(bgColor);
  mainCanvas.colorMode(HSB);
}

function setup() {
  
  drawWidth = 600;
  drawHeight = 800;
  
  createCanvas(drawWidth, drawHeight);

  fxSetup();
  // bgColor = getRandomBackgroundColor();
  
  // background(bgColor);
  colorMode(HSB);
  setupRatio();
  setupMainCanvas();

  let params = initParams();
  let layers = params.layers;
  let minSize = params.minSize;
  let maxSize = params.maxSize;
  let minAlpha = params.minAlpha;
  let maxAlpha = params.maxAlpha;

  colorScheme = random([
    "monochromatic",
    "analogous",
    "complementary",
    "splitComplementary",
    "tetradic",
    "triadic",
  ]);

  drawLayers(layers, minSize, maxSize, minAlpha, maxAlpha);
  drawColorFilterLayer();
}

/**
 * 獲取隨機數量
 * @param {number} minSize - 最小網格數量
 * @param {number} maxSize - 最大網格數量
 * @returns {number} 隨機數量
 */
function getRandomCount(_minSize, _maxSize) {
  return floor(random(_minSize, _maxSize));
}

/**
 * 獲取隨機背景色
 * @returns {p5.Color} 隨機背景色
 */
function getRandomBackgroundColor() {
  let hue = (frameCount % 360);
  let sat, bri;

  switch (colorScheme) {
    case "monochromatic":
      sat = random(30, 50);
      bri = random(90, 100);
      break;
    case "analogous":
    case "complementary":
    case "splitComplementary":
    case "triadic":
    case "tetradic":
      sat = random(40, 80);
      bri = random(50, 90);
      break;
    default:
      sat = random(30, 90);
      bri = random(30, 90);
      break;
  }
  return color(hue, sat, bri);
}

function draw() {
  image(mainCanvas, 0, 0, width, height);
}

/**
 * 獲取隨機顏色
 * @param {number} _mainHue - 主色調
 * @param {number} _layerAlpha - 透明度
 * @returns {p5.Color} 隨機顏色
 */
function getRandomColor(_mainHue, _layerAlpha) {

  let randomColor, randomHue, randomSat, randomBri;

  let bgSat = saturation(bgColor);
  let bgBri = brightness(bgColor);

  let hueDiff = abs(_mainHue - hue(bgColor));
  let satRange = map(hueDiff, 0, 180, 10, 30);
  let briRange = map(hueDiff, 0, 180, 10, 30);

  randomSat = constrain(bgSat + random(-satRange, satRange), 30, 100);
  randomBri = constrain(bgBri + random(-briRange, briRange), 30, 100);
  switch (colorScheme) {
    // 單色配色法：以單一顏色為焦點，通常透過混合一個色相的淺色、色調和色度作搭配變化。
    case "monochromatic":
      randomHue = _mainHue;
      break;

    //相似色配色法: 在構圖選擇相似色組合時，只以一種色調為主，即冷色調或暖色調。挑一種主色，再用對應的相似色襯托。
    case "analogous":
      randomHue = (_mainHue + random(-30, 30)) % 360;
      break;

    //互補配色法: 其中一色通常是原色，而另一色則為二次色。
    case "complementary":
      randomHue = (_mainHue + 180) % 360;
      break;

    //補色分割配色法: 補色分割的配色看起來有點類似互補色，但這種組合混合了一種顏色和其互補色相鄰的兩色
    case "splitComplementary":
      {
        let splitHue1 = (_mainHue + 150) % 360;
        let splitHue2 = (_mainHue + 210) % 360;
        randomHue = random([splitHue1, splitHue2]);
      }
      break;
      
    //矩形配色法: 互補色在本質上已經很強烈；雙重互補色，又稱矩形配色使用兩組互補色讓效果加倍。
    case "tetradic":
      {
        let tetradicHue1 = _mainHue;
        let tetradicHue2 = (_mainHue + 90) % 360;
        let tetradicHue3 = (_mainHue + 180) % 360;
        let tetradicHue4 = (_mainHue + 270) % 360;
        randomHue= random([tetradicHue1,tetradicHue2,tetradicHue3,tetradicHue4,]);
      }
      break;
    //三等分配色法: 三等分配色是由三種顏色組成，這三種顏色在色輪上的位置彼此等距，形成如下所示的等邊三角形。
    case "triadic":
      {
        let triadicHue1 = _mainHue;
        let triadicHue2 = (_mainHue + 120) % 360;
        let triadicHue3 = (_mainHue + 240) % 360;
        randomHue = random([triadicHue1, triadicHue2, triadicHue3]);
      }
      break;
    
    //默認值
    default:
        randomHue = (_mainHue + random(-60, 60)) % 360;
      break;
  }

  randomColor = color(randomHue, randomSat, randomBri, _layerAlpha);
  console.log("color scheme:" + colorScheme);
  return randomColor;
}

/**
 * 獲取對比色
 * @param {number} minAlpha - 最小透明度
 * @param {number} maxAlpha - 最大透明度
 * @returns {p5.Color} 對比色
 */
function getContrastingColor(minAlpha, maxAlpha) {
  let bgHue = hue(bgColor);
  let bgSat = saturation(bgColor);
  let bgBri = brightness(bgColor);

  let colorScheme = random([
    "complementary",
    "splitComplementary",
    "tetradic",
    "triadic",
  ]);

  let contrastingColor;

  switch (colorScheme) {
    case "complementary":
      contrastingColor = getComplementaryColor(bgHue, bgSat, bgBri);
      break;
    case "splitComplementary":
      contrastingColor = getSplitComplementaryColor(bgHue, bgSat, bgBri);
      break;
    case "tetradic":
      contrastingColor = getTetradicColor(bgHue, bgSat, bgBri);
      break;
    case "triadic":
      contrastingColor = getTriadicColor(bgHue, bgSat, bgBri);
      break;
    default:
      contrastingColor = color(bgHue, bgSat, bgBri);
  }

  contrastingColor.setAlpha(random(minAlpha, maxAlpha));
  return contrastingColor;
}

/**
* 獲取互補色：互補色是色輪上位置相對的兩色；其中一色通常是原色，而另一色則為二次色。主要的互補色是藍橙、紅綠和黃紫。
 * @param {number} _hue - 色相
 * @param {number} _sat 
 * @param {number} _bri 
 * @returns {p5.Color} 互補色
 */
function getComplementaryColor(_hue, _sat, _bri) {
  let hue = (_hue + 180) % 360;
  let sat = constrain(_sat + random(-20, 20), 30, 100);
  let bri = constrain(_bri + random(-20, 20), 30, 100);

  return color(hue, sat, bri);
}

/**
* 獲取補色分割：補色分割的配色看起來有點類似互補色，但這種組合混合了一種顏色和其互補色相鄰的兩色，例如黃色與藍紫色和紅紫色的搭配。

 * @param {number} _hue - 色相
 * @param {number} _sat 
 * @param {number} _bri 
 * @returns {p5.Color} 補色分割
 */
function getSplitComplementaryColor(_hue, _sat, _bri) {
  let splitHues = [(_hue + 150) % 360, (_hue + 210) % 360];
  let hue = random(splitHues);
  let sat = constrain(_sat + random(-20, 20), 30, 100);
  let bri =  constrain(_bri + random(-20, 20), 30, 100);

  return color(hue, sat, bri);
}

/**
* 矩形配色法：互補色在本質上已經很強烈；雙重互補色，又稱矩形配色使用兩組互補色讓效果加倍。

 * @param {number} _hue - 色相
 * @param {number} _sat 
 * @param {number} _bri 
 * @returns {p5.Color}
 */
function getTetradicColor(_hue, _sat, _bri) {
  let tetradicHues = [ _hue,
    (_hue + 90) % 360,
    (_hue + 180) % 360,
    (_hue + 270) % 360,
  ];

  let hue = random(tetradicHues);
  let sat = constrain(_sat + random(-20, 20), 30, 100);
  let bri = constrain(_bri + random(-20, 20), 30, 100);
  return color(hue, sat, bri);
}

/**
* 三等分配色法：三等分配色是由三種顏色組成，這三種顏色在色輪上的位置彼此等距，形成如下所示的等邊三角形。

 * @param {number} _hue - 色相
 * @param {number} _sat 
 * @param {number} _bri 
 * @returns {p5.Color}
 */
function getTriadicColor(_hue, _sat, _bri) {
  let triadicHues = [_hue, 
    (_hue + 120) % 360, 
    (_hue + 240) % 360];

  let hue = random(triadicHues);
  let sat = constrain(_sat + random(-20, 20), 30, 100);
  let bri = constrain(_bri + random(-20, 20), 30, 100);
  return color(hue, sat, bri);
}

function getColorVariation(_color, _range) {
  let h = hue(_color);
  let s = saturation(_color);
  let b = brightness(_color);
  let a = alpha(_color);

  h = (h + random(-_range, _range)) % 360;
  s = constrain(s + random(-_range, _range), 0, 100);
  b = constrain(b + random(-_range, _range), 0, 100);

  return color(h, s, b, a);
}

function getRelatedColor(_hue, _sat, _bri, _alpha, _colorScheme) {
  let relatedColor;

  switch (_colorScheme) {
    case "monochromatic":
      relatedColor = color(_hue, _sat, _bri, _alpha);
      break;

    case "complementary":
      relatedColor = getComplementaryColor(_hue, _sat, _bri, _alpha);
      break;

    case "splitComplementary":
      relatedColor = getSplitComplementaryColor(_hue, _sat, _bri, _alpha);
      break;

    case "tetradic":
      relatedColor = getTetradicColor(_hue, _sat, _bri, _alpha);
      break;

    case "triadic":
      relatedColor = getTriadicColor(_hue, _sat, _bri, _alpha);
      break;

    case "analogous":
      let analogousHue = (_hue + random(-30, 30)) % 360;
      relatedColor = color(analogousHue, _sat, _bri, _alpha);
      break;

    default:
      let randomHue = (_hue + random(-60, 60)) % 360;
      relatedColor = color(randomHue, _sat, _bri, _alpha);
      break;
  }

  return relatedColor;
}

/**
 * 繪製顏色過濾器，讓畫面保值一致性
 */
function drawColorFilterLayer() {
  let overlayColor = color(hue(bgColor), 40, 100, 0.2);
  mainCanvas.noStroke();
  mainCanvas.fill(overlayColor);
  mainCanvas.rect(0, 0, width, height);
}


/**
 * 繪製圖層
 * @param {number} _layers - 圖層數量
 * @param {number} _minSize - 最小網格數量
 * @param {number} _maxSize - 最大網格數量
 * @param {number} _minAlpha - 最小透明度
 * @param {number} _maxAlpha - 最大透明度
 */
function drawLayers(_layers, _minSize, _maxSize, _minAlpha, _maxAlpha) {

  let padding = 20;

  // 存儲圖層的疊加順序
  let layerOrder = [];

  let baseHue = random(0, 360);
  let baseSat = random(40, 80);
  let baseBri = random(50, 90);
  
  for (let i = 0; i < _layers; i++) {
    let xCount = getRandomCount(_minSize, _maxSize);
    let yCount = getRandomCount(_minSize, _maxSize);

    let rectWidth = (mainCanvas.width - 2 * padding) / xCount;
    let rectHeight = (mainCanvas.height - 2 * padding) / yCount;

    let layerAlpha = random(_minAlpha, _maxAlpha); 
    let mode = random([BLEND, MULTIPLY, SCREEN, OVERLAY]);

    let layerType = random() < 0.35 ? "rect" : "noise";

    let layerColorScheme = random([
      "monochromatic",
      "complementary",
      "splitComplementary",
      "tetradic",
      "triadic",
      "analogous",
    ]);

    let rectColor = getRelatedColor(baseHue, baseSat, baseBri, layerAlpha, layerColorScheme);
    
    // let rectColor = getRandomColor(baseHue, layerAlpha);
    let variationColor = getColorVariation(rectColor, 30);

    layerOrder.push({ type: layerType, xCount, yCount, mode, rectWidth, rectHeight, padding, layerAlpha, colors: [rectColor, variationColor]});
  }

  // 根據圖層類型和透明度排序
  layerOrder.sort((a, b) => {
    if (a.type === "noise" && b.type === "rect") return -1;
    if (a.type === "rect" && b.type === "noise") return 1;
    return b.layerAlpha - a.layerAlpha;
  });

  // 繪製圖層
  layerOrder.forEach((layer, index) => {
    let layerAlpha = map(index, 0, _layers - 1, _maxAlpha, _minAlpha);

    if (layer.type === "rect") {
      drawRectLayer(layer.xCount, layer.yCount, layer.mode, layer.colors[0], layer.colors[1], layer.rectWidth, layer.rectHeight, layer.padding, layerAlpha, index, _layers);
    } else {
      drawNoiseLayer(layer.xCount, layer.yCount, layer.mode, layer.colors[0], layer.colors[1], layer.rectWidth, layer.rectHeight, layer.padding, layerAlpha, index, _layers);
    }
  });
}

/**
 * 繪製線條
 * @param {number} x - 線條的 x 座標
 * @param {number} y - 線條的 y 座標
 * @param {number} rotation - 線條的旋轉角度
 * @param {number} thickness - 線條的粗細
 * @param {p5.Color} color - 線條的顏色
 * @param {number} length - 線條的長度
 */
function drawLine(x, y, rotation, thickness, color, length) {
  mainCanvas.push();
  mainCanvas.translate(x, y);
  mainCanvas.rotate(rotation);
  mainCanvas.strokeWeight(thickness);
  mainCanvas.stroke(color);
  mainCanvas.noFill();
  mainCanvas.line(0, -length / 2, 0, length / 2);
  mainCanvas.pop();
}

/**
 * 繪製矩形圖層
 * @param {number} _xCount - 水平方向的網格數量
 * @param {number} _yCount - 垂直方向的網格數量
 * @param {string} _blendMode - 混合模式
 * @param {p5.Color} _fromColor - 矩形的顏色
 * @param {p5.Color} _toColor - 矩形的顏色
 * @param {number} _padding - 邊距
 * @param {number} _layerAlpha - 透明度
 */
function drawRectLayer(_xCount, _yCount, _blendMode, _fromColor, _toColor, _rectWidth, _rectHeight, _padding, _layerAlpha, _layerIndex, _totalLayers) {
  mainCanvas.push();
  mainCanvas.blendMode(_blendMode);
  mainCanvas.noStroke();

  // 噪聲比例因子，可調整噪聲細節
  let noiseScale = random(0.01, 0.1); 
  let colorStep = 1.0 / _xCount;
  for (let x = 0; x < _xCount; x++) {
    let lerpAmount = x * colorStep;
    let rectColor = lerpColor(_fromColor, _toColor, lerpAmount, _layerAlpha);

    for (let y = 0; y < _yCount; y++) {
      let skipProbability = map(_layerIndex, 0, _totalLayers - 1, 0.4, 0.8);
      if (random() > skipProbability) continue;
      let noiseVal = noise(x * noiseScale, y * noiseScale);
      let rectWidthRange = map(_layerIndex, 0, _totalLayers - 1, 10, 30);
      let rectHeightRange = map(_layerIndex, 0, _totalLayers - 1, 10, 30);
      let rectWidth =
        _rectWidth + map(noiseVal, 0, 1, -rectWidthRange, rectWidthRange);
      let rectHeight =
        _rectHeight + map(noiseVal, 0, 1, -rectHeightRange, rectHeightRange);

      let xPos = _padding + x * _rectWidth;
      let yPos = _padding + y * _rectHeight;

      mainCanvas.fill(rectColor);
      mainCanvas.rect(xPos, yPos, rectWidth, rectHeight);
      drawFuzzyBorder(xPos, yPos, rectWidth, rectHeight, rectColor);
    }
  }

  mainCanvas.pop();
}

/**
 * 繪製毛毛效果的邊框線
 * @param {number} _x - 矩形的 x 座標
 * @param {number} _y - 矩形的 y 座標
 * @param {number} _width - 矩形的寬度
 * @param {number} _height - 矩形的高度
 * @param {p5.Color} _color - 邊框線的顏色
 */
function drawFuzzyBorder(_x, _y, _width, _height, _color) {

  let dotSpacing = random(3, 8);
  mainCanvas.noFill();
  mainCanvas.strokeCap(ROUND);

  let textureType = random();

  if (textureType < 0.33) {
    drawDottedTexture(_x, _y, _width, _height, dotSpacing, _color);
  } else if (textureType < 0.66) {
    drawLineTexture(_x, _y, _width, _height, dotSpacing, _color);
  } else {
    drawFoggyTexture(_x, _y, _width, _height, dotSpacing, _color);
  }
}

/**
 * 繪製紋理效果 - 點點
 * @param {number} _x - 矩形的 x 座標
 * @param {number} _y - 矩形的 y 座標
 * @param {number} _width - 矩形的寬度
 * @param {number} _height - 矩形的高度
 * @param {number} _space - 間距
 * @param {number} _color - 顏色
 */
function drawDottedTexture(_x, _y, _width, _height, _space, _color) {
  let noiseScale = random(0.01, 0.1);

  for (let x = _x; x <= _x + _width; x += _space) {
    for (let y = _y; y <= _y + _height; y += _space) {
      let noiseVal = noise(x * noiseScale, y * noiseScale);
      let offsetX = random(-5, 5);
      let offsetY = random(-5, 5);
      let pointSize = map(noiseVal, 0, 1, 1, 8); 

      let lerpAmount = map(dist(x, y, _x, _y), 0, dist(_x, _y, _x + _width, _y + _height), 0, 1);
      let hueOffset = map(lerpAmount, 0, 1, -30, 30);
      let satOffset = map(lerpAmount, 0, 1, -20, 20);
      let briOffset = map(lerpAmount, 0, 1, -20, 20);
      
      let pointColor = color(
        (hue(_color) + hueOffset + 360) % 360,
        constrain(saturation(_color) + satOffset, 0, 100),
        constrain(brightness(_color) + briOffset, 0, 100)
      );
      
      mainCanvas.stroke(pointColor);
      mainCanvas.strokeWeight(pointSize);
      mainCanvas.point(x + offsetX, y + offsetY);
    }
  }
}

/**
 * 繪製紋理效果 - 方格線條
 * @param {number} _x - 矩形的 x 座標
 * @param {number} _y - 矩形的 y 座標
 * @param {number} _width - 矩形的寬度
 * @param {number} _height - 矩形的高度
 * @param {number} _space - 間距
 * @param {number} _color - 顏色
 */
function drawLineTexture(_x, _y, _width, _height, _space, _color) {
  let noiseScale = random(0.01, 0.1);

  drawTextureLines(_x, _y, _width, _height, _space, true, noiseScale, _color);
  drawTextureLines(_x, _y, _width, _height, _space, false, noiseScale, _color);
}

function drawTextureLines(_x, _y, _width, _height, _space, _isHorizontal, _noiseScale, _color) {
  let start = mainCanvas.createVector(_x, _y);
  let end = mainCanvas.createVector(_x + _width, _y + _height);

  for (let i = 0; i <= (_isHorizontal ? _width : _height); i += _space) {
    let position = _isHorizontal ? start.x + i : start.y + i;
    let noiseVal = noise(position * _noiseScale);
    let offset = noiseVal * 8; 
    let thickness = map(noiseVal, 0, 1, 1, 8); 

    let lerpAmount = map(i, 0, _isHorizontal ? _width : _height, 0, 1);
    let hueOffset = map(lerpAmount, 0, 1, -30, 30);
    let satOffset = map(lerpAmount, 0, 1, -20, 20);
    let briOffset = map(lerpAmount, 0, 1, -20, 20);

    let lineColor = color(
      (hue(_color) + hueOffset + 360) % 360,
      constrain(saturation(_color) + satOffset, 0, 100),
      constrain(brightness(_color) + briOffset, 0, 100)
    );

    mainCanvas.stroke(lineColor);
    mainCanvas.strokeWeight(thickness);

    if (_isHorizontal) {
      mainCanvas.line(start.x + i, start.y + offset, start.x + i, end.y + offset);
    } else {
      mainCanvas.line(start.x + offset, start.y + i, end.x + offset, start.y + i);
    }
  }
}

/**
 * 繪製紋理效果 - 霧化
 * @param {number} _x - 矩形的 x 座標
 * @param {number} _y - 矩形的 y 座標
 * @param {number} _width - 矩形的寬度
 * @param {number} _height - 矩形的高度
 * @param {number} _space - 間距
 * @param {number} _color - 顏色
 */
function drawFoggyTexture(_x, _y, _width, _height, _space, _color) {
  let noiseScale = random(0.01, 0.1);
  for (let x = _x; x <= _x + _width; x += _space) {
    for (let y = _y; y <= _y + _height; y += _space) {
      let noiseVal = noise(x * noiseScale, y * noiseScale); 
      
      let offsetX = map(noiseVal, 0, 1, -5, 5);
      let offsetY = map(noiseVal, 0, 1, -5, 5);
      let alpha = map(noiseVal, 0, 1, 50, 150);
      let strokeSize = map(noiseVal, 0, 1, 1, 8); 

      let lerpAmount = map(dist(x, y, _x, _y), 0, dist(_x, _y, _x + _width, _y + _height), 0, 1);
      let hueOffset = map(lerpAmount, 0, 1, -60, 60);
      let satOffset = map(lerpAmount, 0, 1, -20, 20);
      let briOffset = map(lerpAmount, 0, 1, -20, 20);

      let fogColor = color(
        (mainCanvas.hue(_color) + hueOffset + 360) % 360,
        constrain(mainCanvas.saturation(_color) + satOffset, 0, 100),
        constrain(mainCanvas.brightness(_color) + briOffset, 0, 100),
        alpha
      );

      mainCanvas.stroke(fogColor);
      mainCanvas.stroke(_color, alpha);
      mainCanvas.strokeWeight(strokeSize);
      mainCanvas.point(x + offsetX, y + offsetY);
    }
  }
}

/**
 * 繪製毛毛圖層
 * @param {number} _xCount - 水平方向的網格數量
 * @param {number} _yCount - 垂直方向的網格數量
 * @param {string} _mode - 混合模式
 * @param {p5.Color} _fromColor - 起始顏色
 * @param {p5.Color} _toColor - 結束顏色
 * 
 * @param {number} _padding - 邊距
 * @param {number} _layerAlpha - 透明度
 */
function drawNoiseLayer(_xCount, _yCount, _mode, _fromColor, _toColor, _rectWidth, _rectHeight, _padding, _layerAlpha, _layerIndex, _totalLayers) {
  mainCanvas.push();
  mainCanvas.blendMode(_mode);

  // 更小的比例因子以增加噪聲細節
  let noiseScale = random(0.01, 0.1); 
  let colorStep = 1.0 / _yCount;

  for (let y = 0; y < _yCount; y++) {
    if (random() > 0.6) continue;
    let lerpAmount = y * colorStep;
    let rectColor = lerpColor(_fromColor, _toColor, lerpAmount);

    for (let x = 0; x < _xCount; x++) {
      let skipProbability = map(_layerIndex, 0, _totalLayers - 1, 0.4, 0.8);
      if (random() > skipProbability) continue;
      let noiseVal = noise(x * noiseScale, y * noiseScale);
      let rectWidth = _rectWidth + map(noiseVal, 0, 1, -10, 10);
      let rectHeight = _rectHeight + map(noiseVal, 0, 1, -10, 10);

      let xPos = _padding + x * _rectWidth;
      let yPos = _padding + y * _rectHeight;

      mainCanvas.fill(rectColor, _layerAlpha);

      drawNoiseRect(xPos, yPos, rectWidth, rectHeight, _fromColor, _toColor, _mode);
    }
  }

  mainCanvas.pop();
}

/**
 * 繪製噪聲矩形
 * @param {number} _x - 矩形的 x 座標
 * @param {number} _y - 矩形的 y 座標
 * @param {number} _rectWidth - 矩形的寬度
 * @param {number} _rectHeight - 矩形的高度
 * @param {p5.Color} _fromColor - 起始顏色
 * @param {p5.Color} _toColor - 結束顏色
 * @param {string} _mode - 混合模式
 */
function drawNoiseRect(_x, _y, _rectWidth, _rectHeight, _fromColor, _toColor, _mode) {
  let xSpace = random(2, 5);
  let ySpace = random(2, 5);

  let xCount = _rectWidth / xSpace;
  let yCount = _rectHeight / ySpace;

  for (let x = 0; x < xCount; x++) {
    for (let y = 0; y < yCount; y++) {
      let t = x / xCount;

      let xPos = _x + x * xSpace;
      let yPos = _y + y * ySpace;

      let nowColor = lerpColor(_fromColor, _toColor, t);

      let lineRot = noise(xPos * 0.01, yPos * 0.01) * 360;
      let lineThickness = random(3, 6);

      drawLine(xPos, yPos, radians(lineRot), lineThickness, nowColor, 12);
    }
  }
}

/**
 * 鍵盤事件, p5內建的函式
 * 讓用戶點擊s可儲存檔案 
 */
function keyPressed (e) {
  console.log(e);
  if(e.key == 's' || e.key == 'S')
  {
    let fileName = "Gradient-and-Textures-" + $fx.hash + ".png";
    save(mainCanvas, fileName);
  }
}