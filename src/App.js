import React from "react";
import "./styles.css";

const FOREGROUND_COLOR = [42.0, 46.0, 8.0];
const BACKGROUND_COLOR = [221.0, 29.0, 62.0];

export default function App() {
  const canvasRef = React.useRef(null);
  React.useEffect(() => {
    const { current } = canvasRef;
    if (current === null) return;
    const width = current.width;
    const height = current.height;
    const ctx = current.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const imageData = ctx.createImageData(width, height);
    let gameLifeArr = [];
    for (let i = 0; i < width * height * 4; i += 4) {
      const randomBinary = Math.random() > 0.1 ? 1 : 0;
      const randomColor = randomBinary ? FOREGROUND_COLOR : BACKGROUND_COLOR;
      imageData.data[i + 0] = randomColor[0];
      imageData.data[i + 1] = randomColor[1];
      imageData.data[i + 2] = randomColor[2];
      imageData.data[i + 3] = 255.0;
      gameLifeArr.push(randomBinary);
    }
    ctx.putImageData(imageData, 0, 0);
    let loop;
    const getPxGreyscaleValue = (data, row, col) => {
      return gameLifeArr[row * width + col];
    };
    const numNeighbors = (arr) => {
      return arr
        .map((item) => {
          return item;
        })
        .reduce((prev, bool) => prev + parseInt(bool, 10));
    };
    const drawLoop = () => {
      const currentImgData = ctx.getImageData(0, 0, width, height);
      const { data } = currentImgData;
      const newImgData = ctx.getImageData(0, 0, width, height);
      for (let i = 0; i < width * height * 4; i += 4) {
        let totalPxNeighborValue = 0;
        const column = (i / 4) % width;
        const row = (i / 4 - column) / height;
        const hasTopBoundary = row === 0;
        const hasLeftBoundary = column === 0;
        const hasRightBoundary = column === width - 1;
        const hasBottomBoundary = row === height - 1;
        const topPxValue = hasTopBoundary
          ? getPxGreyscaleValue(data, height - 1, column)
          : getPxGreyscaleValue(data, row - 1, column);
        const topLeftPxValue =
          hasTopBoundary && hasLeftBoundary
            ? getPxGreyscaleValue(data, height - 1, width - 1)
            : hasLeftBoundary
            ? getPxGreyscaleValue(data, row - 1, width - 1)
            : hasTopBoundary
            ? getPxGreyscaleValue(data, height - 1, column - 1)
            : getPxGreyscaleValue(data, row - 1, column - 1);
        const topRightPxValue =
          hasTopBoundary && hasRightBoundary
            ? getPxGreyscaleValue(data, height - 1, 0)
            : hasRightBoundary
            ? getPxGreyscaleValue(data, row - 1, 0)
            : hasTopBoundary
            ? getPxGreyscaleValue(data, height - 1, column + 1)
            : getPxGreyscaleValue(data, row - 1, column + 1);
        const bottomPxValue = hasBottomBoundary
          ? getPxGreyscaleValue(data, 0, column)
          : getPxGreyscaleValue(data, row + 1, column);
        const bottomLeftPxValue =
          hasBottomBoundary && hasLeftBoundary
            ? getPxGreyscaleValue(data, 0, width - 1)
            : hasLeftBoundary
            ? getPxGreyscaleValue(data, row + 1, width - 1)
            : hasBottomBoundary
            ? getPxGreyscaleValue(data, 0, column - 1)
            : getPxGreyscaleValue(data, row + 1, column - 1);
        const bottomRightPxValue =
          hasBottomBoundary && hasRightBoundary
            ? getPxGreyscaleValue(data, 0, 0)
            : hasRightBoundary
            ? getPxGreyscaleValue(data, row + 1, 0)
            : hasBottomBoundary
            ? getPxGreyscaleValue(data, 0, column + 1)
            : getPxGreyscaleValue(data, row + 1, column + 1);
        const leftPxValue = hasLeftBoundary
          ? getPxGreyscaleValue(data, row, width - 1)
          : getPxGreyscaleValue(data, row, column - 1);
        const rightPxValue = hasRightBoundary
          ? getPxGreyscaleValue(data, row, 0)
          : getPxGreyscaleValue(data, row, column + 1);
        totalPxNeighborValue =
          topPxValue +
          bottomPxValue +
          leftPxValue +
          rightPxValue +
          topLeftPxValue +
          topRightPxValue +
          bottomLeftPxValue +
          bottomRightPxValue;
        if (isNaN(totalPxNeighborValue)) {
          console.log(i);
        }
        let nextColor, nextState;
        const isCellAlive = getPxGreyscaleValue(data, row, column);
        const neighbors = numNeighbors([
          topPxValue,
          bottomPxValue,
          leftPxValue,
          rightPxValue,
          topLeftPxValue,
          topRightPxValue,
          bottomLeftPxValue,
          bottomRightPxValue
        ]);
        if (isCellAlive) {
          nextState = neighbors === 2 || neighbors === 3 ? 1 : 0;
        } else if (neighbors === 3) {
          nextState = 1;
        } else {
          nextState = 0;
        }
        nextColor = nextState ? FOREGROUND_COLOR : BACKGROUND_COLOR;
        newImgData.data[i + 0] = nextColor[0];
        newImgData.data[i + 1] = nextColor[1];
        newImgData.data[i + 2] = nextColor[2];
        newImgData.data[i + 3] = 255.0;
        gameLifeArr[row * width + column] = nextState;
      }
      ctx.putImageData(newImgData, 0, 0);
      loop = window.requestAnimationFrame(drawLoop);
    };
    loop = window.requestAnimationFrame(drawLoop);
    return () => {
      window.cancelAnimationFrame(loop);
    };
  }, [canvasRef]);
  return (
    <div className="App">
      <canvas
        style={{
          transform: "scale(10)",
          transformOrigin: "top",
          imageRendering: "pixelated"
        }}
        width="100"
        height="100"
        ref={canvasRef}
      ></canvas>
    </div>
  );
}
