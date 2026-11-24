#!/usr/bin/env python3
"""
The trip's two sounds on the station's ticket-and-map page, made by code:
a train on rails (Italy) and a bus on the road (Mexico).

  python3 scripts/travel-sounds.py        writes rails.wav and road.wav into
                                          ios/FuoriKit/Sources/FuoriAudio/Sounds/

Made to be heard on a phone's small speaker at alert volume (B51: Josh,
2026-11-23, "the sound effects are way too subtle, quiet, and short on map
pages"): the energy sits between 300 Hz and 4 kHz, where that speaker works,
each opens on a horn, the level is pressed up to about -12 dBFS RMS with the
peak at -1, and each runs 5 seconds: full for the page's 3.5 s, then a tail
that fades as the city's list comes up. `npm run test:travel-sounds` checks
the files. Needs numpy and scipy. Nobody has heard these but Josh: if one is
wrong, change it here or drop a recording in under the same name.
"""
import os
import wave
import numpy as np
from scipy.signal import butter, sosfilt

RATE = 44100
LENGTH = 5.0          # seconds
FULL_UNTIL = 3.6      # the page turns at 3.5 s; the tail fades after this
OUT = os.path.join(os.path.dirname(__file__), '..', 'ios', 'FuoriKit', 'Sources', 'FuoriAudio', 'Sounds')
rng = np.random.default_rng(2026)
t = np.arange(int(RATE * LENGTH)) / RATE


def band(x, lo, hi):
    return sosfilt(butter(4, [lo, hi], btype='band', fs=RATE, output='sos'), x)


def noise(lo, hi):
    return band(rng.standard_normal(len(t)), lo, hi)


def burst(at, length, shape):
    """A window that is `shape(local time)` from `at` for `length` seconds, 0 elsewhere"""
    w = np.zeros(len(t))
    i0, i1 = int(at * RATE), min(len(t), int((at + length) * RATE))
    if i0 < len(t):
        w[i0:i1] = shape(np.arange(i1 - i0) / RATE)
    return w


def horn(at, length, notes):
    """A chord of buzzy tones (each with harmonics, so a small speaker carries it)"""
    env = burst(at, length, lambda s: np.minimum(1, s / 0.03) * np.minimum(1, (length - s) / 0.08))
    tone = sum(sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, 7)) for f in notes)
    return env * tone / len(notes)


def finish(x):
    """Fade in fast, hold, fade the tail; press the level up; peak at -1 dBFS"""
    env = np.minimum(1, t / 0.06) * np.clip((LENGTH - t) / (LENGTH - FULL_UNTIL), 0, 1) ** 1.5
    x = band(x, 180, 6000)
    x = x / np.sqrt(np.mean(x ** 2))           # the average at 1, whatever the peaks
    x = np.tanh(0.42 * x)                      # soft limiter: holds the peaks so the average can be loud
    return x / np.max(np.abs(x)) * env * 10 ** (-1 / 20)


def rails():
    roar = noise(300, 2400) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.9 * t))
    hiss = noise(2500, 5500) * 0.25
    clack = np.zeros(len(t))
    at = 0.35
    while at < LENGTH:
        for offset, loud in ((0.0, 1.0), (0.15, 0.8)):          # da-dum, da-dum
            knock = burst(at + offset, 0.11, lambda s: np.exp(-s / 0.022))
            ring = burst(at + offset, 0.16, lambda s: np.exp(-s / 0.045))
            clack += loud * (knock * noise(700, 3200) * 3.0 + ring * (np.sin(2 * np.pi * 1150 * t) + 0.6 * np.sin(2 * np.pi * 1730 * t)) * 0.5)
        at += 0.56
    whistle = horn(0.12, 0.85, (370, 466))                       # the two-note horn as it pulls out
    return finish(0.55 * roar / np.max(np.abs(roar)) + hiss / np.max(np.abs(noise(2500, 5500))) * 0.12
                  + 0.9 * clack / np.max(np.abs(clack)) + 0.75 * whistle / np.max(np.abs(whistle)))


def road():
    rev = 92 + 20 * np.clip(t / 1.4, 0, 1)                       # pulls away, then holds
    phase = 2 * np.pi * np.cumsum(rev) / RATE
    engine = sum(np.sin(k * phase) * (1.0 if 3 <= k <= 9 else 0.4) / np.sqrt(k) for k in range(1, 14))
    engine *= 0.8 + 0.2 * np.sin(2 * np.pi * 13 * t)             # the diesel's shake
    tyres = noise(500, 2800) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.6 * t))
    brake = burst(0.0, 0.4, lambda s: np.exp(-s / 0.12)) * noise(2500, 5500)   # air brakes let go
    toots = horn(0.55, 0.2, (440, 554)) + horn(0.85, 0.32, (440, 554))
    rattle = np.zeros(len(t))
    for at in (1.75, 2.5, 2.62, 3.35, 4.1):                      # the road under the wheels
        rattle += burst(at, 0.09, lambda s: np.exp(-s / 0.02)) * noise(900, 2600)
    n = lambda x: x / np.max(np.abs(x))
    return finish(0.75 * n(engine) + 0.5 * n(tyres) + 0.7 * n(brake) + 0.8 * n(toots) + 0.6 * n(rattle))


def write(name, x):
    path = os.path.join(OUT, name + '.wav')
    with wave.open(path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())
    full = x[: int(3.5 * RATE)]
    print(f"{name}.wav  {len(x) / RATE:.1f} s  peak {20 * np.log10(np.max(np.abs(x))):.1f} dBFS  "
          f"RMS over the page's 3.5 s {20 * np.log10(np.sqrt(np.mean(full ** 2))):.1f} dBFS")


if __name__ == '__main__':
    write('rails', rails())
    write('road', road())
