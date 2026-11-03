# The welcome conversation

version: 2026-11-02b

The newcomer's first conversation (docs/onboarding-giulia.md and
docs/onboarding-chela.md, agreed with Josh 2026-11-02; N6 item 3b): a
character from the city files plays it in the Beginner format
(beginner.md), with the steps from content/<country>/onboarding.ts
(`welcome.script`) as her brief. Its last turn sets `done`, and the app
shows a button in place of the mic. When the learner taps it, **Read**
picks out what they answered from the whole conversation
(lib/welcome.ts).

Placeholders: `{language}`, `{country}`, `{appName}`, `{script}`, `{name}`
(the character's), `{conversation}`.

## Brief

```
This conversation is the newcomer's welcome to {appName}: the very first conversation they have. You lead it through these steps, in order, a step a turn or two, and then it ends:

{script}

Start straight with step 1: no line about the place before it. Keep to the steps and their words (each phrase and question in {language} its own part; where a step gives its English in brackets, that whole English is its gloss, word for word: a question's gloss is the whole question, never a clipped one like "your name?"). React to what they say in a word or two, the way you would; if they correct you ("No, I said…", a misheard name), take the correction and carry on. If they say something else, answer briefly and come back to the step. If they say either is fine, don't mind, or it isn't clear whether to welcome them in the masculine or the feminine, use the feminine and carry on without asking again. Don't add steps or other questions, and don't skip ahead. Set done to true only on the last turn, the one ending with the last question; false on every turn before it.
```

## Mic off

```
They can't use the microphone right now: they tap the answers instead. In this turn only, add one short English sentence saying the microphone can be turned on in Settings, then carry on with the step.
```

## Read

```
This is a newcomer's welcome conversation in a game where they learn {language}: {name} asked their name, whether to welcome them in the masculine or the feminine, whether it's their first time in {country}, and whether they already speak {language}. Their lines came through speech-to-text. Read what they answered from the whole conversation (a later correction wins, as in "No, my name is…"):
- name: their first name as they gave it, or null if they didn't
- address: "m" if they chose the masculine, "f" the feminine, "unclear" if they said either, didn't mind, or it isn't clear
- firstTime: true or false, null if they didn't answer
- speaks: true if they said they already speak {language} fairly well, false if not yet, null if they didn't answer
- levelLine: the number of their line that answered whether they speak {language} (their lines are "Learner 1", "Learner 2"…), or null

{conversation}

Reply with JSON.
```

## Changelog

### 2026-11-02b: whole questions in English

Josh, on the simulator: "phrase should be 'what is your name' not 'your name'". beginner.md's gloss rule clips the English to the key words; in the welcome every question's English is now given in the steps and said whole.

### 2026-11-02: first version

The new onboarding (Josh, 2026-11-02: "Everything it needs is there", pointing at the two scripts and N6 item 3b). Replaces the greeter's fixed lines and buttons with a conversation a real character plays from the agreed steps, so the answers are read from the whole conversation at the end, not one by one.
