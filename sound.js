import { hslToRgb } from "./utils";
const WIDTH = 1500;
const HEIGHT = 1500;

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.height = HEIGHT;
canvas.width = WIDTH;

let analyser;
let bufferLength;

function handleError(err) {
  console.log("You must give access to your micro !");
}

async function getAudio() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(handleError);
  const audioCtx = new AudioContext();
  analyser = audioCtx.createAnalyser();
  const source = audioCtx.createMediaStreamSource(stream);
  source.connect(analyser);

  //number of data collect
  analyser.fftSize = 2 ** 10;

  //pull data off the audio
  bufferLength = analyser.frequencyBinCount;

  const timeData = new Uint8Array(bufferLength);

  const frequencyData = new Uint8Array(bufferLength);

  drawTimeData(timeData);
  drawFrequency(frequencyData);
}

function drawTimeData(timeData) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  //inject time data into timedata array

  analyser.getByteTimeDomainData(timeData);

  //visual
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#ffc600";
  ctx.beginPath();
  const sliceWidth = WIDTH / bufferLength;

  let x = 0;
  timeData.forEach((data, i) => {
    const v = data / 128;
    const y = (v * HEIGHT) / 2;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  });
  ctx.stroke();
  //call itself asap
  webkitRequestAnimationFrame(() => drawTimeData(timeData));
}

function drawFrequency(frequencyData) {
  analyser.getByteFrequencyData(frequencyData);
  const barWidth = (WIDTH / bufferLength) * 2.5;
  let x = 0;
  frequencyData.forEach((amount) => {
    const percent = amount / 255;
    const [h, s, l] = [360 / (percent * 360) - 0, 0.8, 0.5];
    const barHeight = HEIGHT * percent * 0.5;
    // TODO: Convert the colour to HSL TODO
    const [r, g, b] = hslToRgb(h, s, l);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
    x += barWidth + 2;
  });

  requestAnimationFrame(() => drawFrequency(frequencyData));
}

getAudio();
