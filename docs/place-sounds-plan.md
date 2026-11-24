# Place sounds: the Lupita test

One session does all of this: **the laptop**. It has the ElevenLabs key, builds Swift and installs on Josh's phone. The cloud session has none of the three, which is why splitting the work failed (Josh, 2026-11-23: "i thnk this is impossible to coordate and there is no plan").

## What Josh asked for

"church bells at Lupitas opening and kids in the squarre while she talksks". A test on one person, Lupita Barajas (Tlaquepaque, Guadalajara), judged by his ear on the phone.

## Steps

1. **Make the sounds.** `npm run place-sounds` writes two takes each of `bells-parish` (8 s) and `kids-square` (20 s, loop) to `design/place-sounds/`. Josh picks one of each, or the prompts in `scripts/place-sounds.mjs` change and it runs again.
2. **Put the picks in the app.** Copy them to `ios/FuoriKit/Sources/FuoriAudio/Sounds/` as `bells-parish.mp3` and `kids-square.mp3`.
3. **Play them** (new `PlaceSound` in `FuoriAudio`, an `AVAudioPlayer` each, on the conversation's audio session; not a system sound like `TravelSound`, which can't loop, fade or sit under the voice):
   - **Bells:** start when her person screen appears, once, fading out under her first words.
   - **Kids:** loop at low volume while she speaks and while the app waits for her reply.
   - **Mic open:** both silent. The voice gate measures the room in its first 300 ms, and a loop there would be heard as speech or raise the floor.
   - **Leaving:** every exit stops both, through the one leave function.
4. **Which person gets them:** for the test, a constant naming Lupita's id in the app is enough. If Josh keeps the idea, the sound names move to the place in `content/<country>/` and reach the app through `/v1/content`, like the trip's sound.
5. **Check:** `make build`, CI, then Josh's yes to install and a visit to Lupita out loud. Audio handling changed, so recheck one interruption (a call or Siri).

## For Josh's ear

- Is the loop too loud under her voice, or too quiet to notice?
- Do the bells step on her first line?
- Does the mic still open and send as before?

## Not decided

Which places get sounds, how many sounds, and whether a place's sound changes by time of day. All after the Lupita test.
