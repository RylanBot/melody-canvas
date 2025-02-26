import FFT from "fft.js";
import { NORMALIZATION_FACTOR } from "@/libs/common";

class FrequencyAnalyzer {
  private readonly logMultiplier = 20;
  private readonly smoothUp = 0.2;
  private readonly smoothDown = 0.05;

  private fft: FFT;
  private frequency: number[] = [];

  constructor(fftSize: number) {
    this.fft = new FFT(fftSize);
  }

  private extractSamples = (buffer: AudioBuffer, time: number) => {
    const allSamples = buffer.getChannelData(0);
    const percentage = time / buffer.duration;
    const startIndex = Math.floor(allSamples.length * percentage);
    const endIndex = startIndex + this.fft.size;

    let samples = allSamples.slice(startIndex, endIndex);
    const delta = samples.length - this.fft.size;
    if (delta < 0) {
      samples = new Float32Array(this.fft.size).fill(0);
    }

    return samples;
  };


  private normalize = (yArr: number[]) => {
    const shiftedY = yArr.map((v) => v + this.logMultiplier);

    const minVal = Math.min(...shiftedY);
    const maxVal = Math.max(...shiftedY);

    const range = NORMALIZATION_FACTOR / (maxVal - minVal);
    return shiftedY.map((v) => Math.min(NORMALIZATION_FACTOR, Math.max(0, (v - minVal) * range)));
  };

  private computeFrequency(samples: Float32Array): number[] {
    const out = this.fft.createComplexArray();
    this.fft.realTransform(out, samples);

    return Array.from({ length: this.fft.size / 2 + 1 }, (_, i) => {
      const real = out[2 * i];
      const imag = out[2 * i + 1];
      const magnitude = Math.sqrt(real * real + imag * imag);

      const logMag = this.logMultiplier * Math.log10(magnitude);
      return isFinite(logMag) ? logMag : 0;
    });
  }

  public getFrequency(buffer: AudioBuffer, time: number) {
    const samples = this.extractSamples(buffer, time);
    const rawFrequency = this.computeFrequency(samples);

    if (this.frequency.length !== rawFrequency.length) {
      this.frequency = rawFrequency;
    }

    for (let i = 0; i < rawFrequency.length; i++) {
      if (rawFrequency[i] < this.frequency[i]) {
        this.frequency[i] = rawFrequency[i] * this.smoothDown + this.frequency[i] * (1 - this.smoothDown);
      } else {
        this.frequency[i] = rawFrequency[i] * this.smoothUp + this.frequency[i] * (1 - this.smoothUp);
      }
    }

    return this.normalize(this.frequency);
  }

  public updateFFTSize(fftSize: number) {
    this.fft = new FFT(fftSize);
    this.frequency = [];
  }
}

export default FrequencyAnalyzer;
