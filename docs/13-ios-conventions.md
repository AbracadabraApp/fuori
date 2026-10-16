# iOS conventions: following Apple's Human Interface Guidelines

Status: **draft for Josh**, 2026-10-15. Written before any more app screens are built, at Josh's request: follow the HIG as strictly as we reasonably can and don't break iOS conventions. Companion to [Native iPhone app: plan](12-native-app.md).

## 1. Purpose and how to use this

- **These rules are checked before an iOS screen counts as done**, alongside "done means used" (CLAUDE.md). The checklist in [section 6](#6-done-checklist-for-any-ios-screen) is the short form.
- **Source:** Apple's HIG, fetched 2026-10-15 with `npm run hig` into `docs/reference/hig/` (git-ignored: it's Apple's text and this repo is public). Everything below is our paraphrase, linked to the live page.
- **When Apple updates the HIG** (usually June, with smaller December updates), re-run `npm run hig`, check the change logs at the bottom of the pages linked here, and update this file.
- **Severity words:** *must* = conflicts with the HIG or breaks for some users; *should* = the HIG prefers another way; *consider* = a judgement call.
- **Both countries:** every rule applies to Fuori (Italy, Italian) and Afuera (Mexico, Mexican Spanish), and to any country added later. Examples use Italy's words ("Sali", "Mostra altro", Roma); Mexico's are "Subir", "Ver más" and its own cities, all from each country's pack via `/v1/content`. Nothing in a rule or in Swift may assume Italian.
- Scope: iPhone only, portrait only, iOS 26 minimum, voice-first. iPad, Mac, Watch and visionOS guidance is ignored.

## 2. Default stance

Use the system's components and behaviours unless this file records a reason not to. Fuori's look (paper, Polaroids, watercolour, Alegreya) is **styling layered on top of standard controls; it never replaces their behaviour.** Concretely:

- `NavigationStack` with the standard back button and edge-swipe back; no custom back links.
- Sheets with grabbers and swipe-to-dismiss; standard alerts and confirmation dialogs; no hand-built overlays.
- SF Symbols for interface icons; system haptics through `sensoryFeedback`; system progress indicators.
- Dynamic Type on every piece of text; Dark Mode and Increase Contrast supported; safe areas respected.
- Every control has a VoiceOver label; every image is either described or hidden.
- iOS 26's Liquid Glass comes free with standard bars, toolbars, sheets and buttons. We don't paint over it.

([Design principles: Familiarity][design-principles], [Branding: express your brand with familiar components][branding])

## 3. Rules by area

Each rule: what to do, the HIG page, and where it applies in Fuori.

### Navigation and hierarchy
- **One `NavigationStack`; drill-down screens push, scoped tasks use sheets.** City list → place list → conversation are pushes. [Toolbars: Navigation][toolbars] · Applies to: all.
- **Use the standard Back button, showing the previous screen's title; never a text "Back" or a custom arrow.** The edge swipe must work everywhere. [Toolbars][toolbars], [Gestures][gestures] · Applies to: place list, conversation, Magda.
- **Every way out of a screen runs the same code.** Swipe-back, the back button and boarding ("Sali" / "Subir") all reach `leaveConversation()`; no exit may skip saving, and we don't disable the swipe to force a path. · Applies to: conversation.
- **Don't title the root screen with the app name.** Use a title that says what's there. Keep titles short (under about 15 characters). [Toolbars: Titles][toolbars] · Applies to: city list.
- **Use a large title on top-level lists**, which shrinks as you scroll. [Toolbars: iOS][toolbars] · Applies to: city list, place list.
- **A tab bar has not been decided.** It would be a navigation redesign, so it gets its own decision, from a sketch. If one comes, the HIG's rules apply: tabs are for navigation only, always visible except under a modal, never disabled, an SF Symbol and a one-word label each. [Tab bars][tab-bars] · Applies to: nothing yet.

### Layout and safe areas
- **Content and controls stay inside the safe area.** Only backgrounds (the portrait, paper) extend under the status bar and home indicator. [Layout: Guides and safe areas][layout] · Applies to: all, especially conversation.
- **Most important things go at the top, and the order stays the same at every text size.** [Layout][layout], [Typography][typography] · Applies to: all.
- **Separate controls from content with the system's scroll edge effect** on scrolling screens (feeds). **Exception, decided:** the person screen keeps Josh's approved name band (2026-10-13, progress.md "name on a band"): the standard navigation bar (back button, gear), then the solid paper band with the name in Alegreya and "role, neighbourhood" in Alegreya Sans, then the portrait. The band is content (the person's name card), not a replacement for the bar. [Scroll views: Scroll edge effects][scroll-views], [Status bars][status-bars] · Applies to: feeds, conversation.
- **Portrait only is fine on iPhone, but the layout still adapts** to every iPhone size and to Display Zoom. [Layout: Adaptability][layout] · Applies to: all.

### Typography
- **All text supports Dynamic Type, up to the largest accessibility size (AX5).** With custom fonts in SwiftUI, use `Font.custom(_:size:relativeTo:)` with the matching text style (`.largeTitle`/`.title` for Alegreya names, `.body`/`.subheadline` for Alegreya Sans). Plain `Font.custom(_:size:)` scales on the body curve; `fixedSize:` doesn't scale at all and is banned. [Typography: Supporting Dynamic Type][typography], [Accessibility: Vision][accessibility] · Applies to: all.
- **Sizes that aren't text scale too:** badges, icons, ring diameters use `@ScaledMetric`. [Typography][typography] · Applies to: visit badge, mic ring.
- **Layouts reflow at accessibility sizes**: rows stack, text wraps (no truncation in scroll views). [Typography][typography], [Layout][layout] · Applies to: cards, ticket, settings.
- **Default 17 pt, minimum 11 pt** at the default text size. [Typography: Ensuring legibility][typography] · Applies to: all.
- **Custom fonts must honour Bold Text**: read `legibilityWeight` and step up a weight. [Typography: Using custom fonts][typography] · Applies to: all.
- **Two typefaces at most** (Alegreya, Alegreya Sans). Consider the system font for small dense text such as captions and the debug panel; the HIG suggests custom fonts for headings and system fonts for small text. [Branding][branding], [Typography][typography] · Applies to: all.
- **Prioritise what people came for when text grows.** In a conversation that's the subtitles. [Typography: Conveying hierarchy][typography] · Applies to: conversation.

### Colour and Dark Mode
- **Support Dark Mode.** iOS users expect every app to follow the system setting; an in-app light/dark switch is discouraged. A permanently dark UI is allowed for immersive media; a permanently light one isn't given as an option. [Dark Mode][dark-mode] · Applies to: all.
- **Every custom colour has light, dark and increased-contrast variants**, defined once (asset catalog colour sets, generated from `design/tokens.json`). No hard-coded hex in views. [Color][color], [Dark Mode][dark-mode] · Applies to: tokens.
- **Contrast at least 4.5:1 for text; aim for 7:1 for small text.** Checked today: olive on paper 5.8:1 (ok), grey `#666` on white 5.7:1 (ok), **terracotta on paper 3.8:1 (fails for text; use it only for shapes or large type)**. [Accessibility][accessibility], [Dark Mode][dark-mode] · Applies to: tokens.
- **Never use colour alone to mean something** (listening vs thinking dots, current city, visited). Add a symbol or a word. [Color: Inclusive color][color] · Applies to: conversation, board, cards.
- **Watercolours on white paper glow in Dark Mode**: dim them slightly there. [Dark Mode: Soften white backgrounds][dark-mode] · Applies to: portraits, place images.

### Touch targets and buttons
- **Every tappable thing is at least 44×44 pt**, with room between targets. [Buttons][buttons], [Accessibility: Mobility][accessibility] · Applies to: all.
- **Every custom button shows a pressed state.** [Buttons][buttons] · Applies to: cards, ticket, "Mostra altro".
- **One prominent button per screen at most**, and the most likely action gets it. [Buttons: Style][buttons] · Applies to: ticket "Sali", onboarding.
- **Long actions show an activity indicator inside the button.** [Buttons: iOS][buttons] · Applies to: retry, boarding.
- **Toolbar items are SF Symbols without borders or text labels**, except where a word is clearer. [Toolbars: Actions][toolbars] · Applies to: settings, captions.

### Sheets and modality
- **Sheets for short, scoped tasks only; one at a time.** Close one before opening the next. [Sheets][sheets], [Modality][modality] · Applies to: settings, departures board.
- **Resizable sheets show a grabber and dismiss by swiping down.** Consider the medium detent. [Sheets: iOS][sheets] · Applies to: settings.
- **Cancel on the leading edge, Done on the trailing edge; never Done alone.** Settings that take effect immediately need neither: just a close button. [Sheets][sheets] · Applies to: settings, board.
- **Full-screen covers only for immersive or multi-step flows**, with an obvious way out. [Modality][modality] · Applies to: onboarding.

### Alerts and errors
- **No alert at launch, and no alert that only informs.** Put the problem in the screen, near where it happened, with a next step. [Alerts][alerts], [Feedback][feedback] · Applies to: root error, conversation errors.
- **Alert titles say what happened; buttons are verbs; "Cancel" is always "Cancel".** [Alerts: Content][alerts] · Applies to: any alert.
- **Error copy: plain, specific, no blame, no "oops", no "we".** "Couldn't reach Fuori's server" beats "We're having trouble". The E-code goes in small type underneath. [Writing: Write clear error messages][writing] · Applies to: all errors.
- **Choices about an action the learner started use a confirmation dialog (action sheet), not an alert.** [Action sheets][action-sheets] · Applies to: e.g. leaving mid-lesson, if ever needed.

### Loading and launch
- **The launch screen is the first screen's background colour and nothing else**: no logo, no text. It matches the current appearance (light/dark). [Launching: Launch screens][launching] · Applies to: app.
- **Show something immediately.** Bundle the content pack (already planned) so the city list draws on first frame; refresh in the background. [Loading][loading] · Applies to: city list.
- **Restore where the learner was** after the app is killed (city and place, not mid-conversation). [Launching][launching] · Applies to: app.
- **Waits say what's happening**, specifically ("Giulia is thinking"), not "Loading…". [Progress indicators][progress-indicators], [Generative AI: Outputs][generative-ai] · Applies to: conversation.

### Onboarding
- **Fast, interactive, about two minutes.** The HIG suggests making onboarding skippable; Josh decided against a Skip (D7). Teach by doing (the planned city → face → talk flow fits). [Onboarding][onboarding] · Applies to: onboarding.
- **Defer anything not needed to start**: sign-in, notifications, ratings. [Onboarding: Additional requests][onboarding], [Sign in with Apple][sign-in-with-apple] · Applies to: onboarding.
- **Prefer contextual tips to front-loaded instructions** (TipKit). [Offering help][offering-help] · Applies to: first conversation.

### Audio
- **Category `.playAndRecord`**: correct for a voice-call-like app. It ignores the silent switch, which is fine because the learner started the conversation. [Playing audio][playing-audio] · Applies to: conversation.
- **Activate the session only inside a conversation; deactivate with `notifyOthersOnDeactivation`** so the learner's podcast resumes. Never take audio over while browsing feeds. [Playing audio][playing-audio] · Applies to: conversation.
- **No sound effects** (chimes, clicks): with this category they would play through the silent switch. Use haptics instead. [Playing audio: Silence][playing-audio] · Applies to: all.
- **Interruptions (call, Siri, alarm): stop, show "Paused", and wait for a tap.** Never reopen the microphone by itself after an interruption; the HIG treats that as a privacy problem. [Playing audio: Handling interruptions][playing-audio] · Applies to: conversation.
- **Headphones removed: pause at once; never move to the speaker.** Headphones connected: re-route without stopping. [Playing audio][playing-audio] · Applies to: conversation.
- **The system volume governs; we never set it.** [Playing audio][playing-audio] · Applies to: playback.

### Haptics
- **System haptics only, used for what they mean** (success, warning, error, impact, selection), short, and never continuous. [Playing haptics][playing-haptics] · Applies to: see [section 8](#haptics).
- **Haptics must not disturb the microphone.** Never play one while the mic is measuring noise or recording. [Playing haptics][playing-haptics] · Applies to: conversation.
- **Haptics add to visual feedback; they never replace it.** [Feedback][feedback] · Applies to: all.

### Privacy and the microphone
- **Ask for the microphone when it's first needed, with context**, not at launch. In Fuori that is the first moment someone is asked to speak (onboarding). [Privacy: Requesting permission][privacy] · Applies to: onboarding.
- **A screen before the system prompt may have exactly one button, titled "Continue"**: no "Allow", no "Not now", no close button. [Privacy: Pre-alert screens][privacy] · Applies to: onboarding.
- **Purpose string: one active, specific sentence ending in a full stop.** Proposed: *"Fuori listens when it's your turn to speak and sends the recording to be transcribed, so the person you're talking to can answer you."* [Privacy][privacy] · Applies to: `Info.plist`.
- **If the learner refuses, the app still works where it can** and shows a button that opens Settings, with a one-line explanation. [Settings][settings], [Writing][writing] · Applies to: conversation.
- **Say plainly that audio and text go to servers**, and to whom, in onboarding and the privacy label. [Generative AI: Privacy][generative-ai] · Applies to: onboarding, App Store.
- **Token in Keychain (done); nothing sensitive in `UserDefaults`.** [Privacy: Protecting data][privacy]

### Accessibility
- **VoiceOver: every control labelled, every meaningful image described, decorative ones hidden** (barcode, sprigs, Polaroid shadow). Cards read as one element: "Roma, Lazio, visited 3 times, button". [VoiceOver][voiceover] · Applies to: all.
- **Target-language text is spoken with the target-language voice.** Tag target-language strings (Italian, Spanish) with the pack's speech code (`accessibilitySpeechLanguage` / an `AttributedString` language attribute) so VoiceOver doesn't read "Binario" in an English accent. This also keeps other languages possible. [VoiceOver][voiceover], [Inclusion: Languages][inclusion] · Applies to: all target-language words.
- **Announce changes** ("Your turn", "Giulia is speaking", "Paused") with accessibility notifications. [VoiceOver: Navigation][voiceover] · Applies to: conversation.
- **Subtitles are captions.** Always available; forced on when the system's Closed Captions setting is on; sized by Dynamic Type. [Accessibility: Hearing][accessibility] · Applies to: conversation.
- **Reduce Motion: no typewriter reveal, card tilt animation or pulsing**; crossfades are fine. [Accessibility: Cognitive][accessibility], [Motion][motion] · Applies to: conversation, feeds.
- **Avoid time limits; where one exists, it can be extended.** [Accessibility: Cognitive][accessibility] · Applies to: silence ring, first-word wait.
- **Audio autoplay comes with visible controls to stop it.** [Accessibility: Cognitive][accessibility] · Applies to: conversation.
- **Voice Control, Switch Control and Full Keyboard Access reach every control**: no gesture-only actions. [Accessibility: Mobility][accessibility] · Applies to: all.

### Feedback
- **State is always visible**: listening, thinking, speaking, paused, failed, each with a symbol and a word, not only colour or animation. [Feedback][feedback], [Motion: Make motion optional][motion] · Applies to: conversation.
- **Confirm only significant successes** (boarding, a stamp), not every turn. [Feedback][feedback]

### Generative AI disclosure
- **No disclosure inside the game** (Josh, 2026-10-15: the characters are illustrated, nobody will think a cartoon person is real). The App Store description says Fuori is AI conversation practice, which covers the HIG's "don't trick people" rule. Characters never break role to say they're AI. **Any explanation (what Fuori is, that it uses AI, where speech goes) lives only in onboarding and Settings** (an "About Fuori" row), never on the game's screens (Josh, 2026-10-15). [Generative AI: Transparency][generative-ai] · Applies to: App Store listing.
- **Before anyone but Josh uses it (N4): privacy, not a label.** A privacy policy and the App Store privacy label (required for every app), and one line on the microphone screen (part of onboarding) saying what is sent to outside AI services, which App Review's privacy rules require; the full version in Settings → About Fuori. [Generative AI: Privacy][generative-ai], [Privacy][privacy] · Applies to: mic permission, App Store.
- **Let people report a bad line** (already in the plan's App Review risks): a quiet affordance, never an interruption. [Generative AI: Continuous improvement][generative-ai] · Applies to: conversation, M4.

### App icon
- **Layered icon made in Icon Composer**, with default, dark, clear and tinted appearances; no text, no photo, no baked-in shadows or gloss; illustration rather than a watercolour photo. [App icons][app-icons] · Applies to: N4.

### Writing
- **English chrome, target-language world.** Navigation, settings, errors, permissions and accessibility labels are English (String Catalog). Words that belong to the place (signs, tickets, "Binario", "Sali", character lines) come from the pack, never Swift literals. [Writing][writing], CLAUDE.md · Applies to: all.
- **Buttons are verbs; one capitalisation style per element type** (title case for buttons and titles, sentence case for messages). [Writing][writing], [Buttons: Content][buttons] · Applies to: all.
- **"Tap", never "click". Plurals through the String Catalog** ("1 visit", "3 visits"). [Writing][writing] · Applies to: all.
- **Empty screens say what to do next.** [Writing: blank screens][writing] · Applies to: "nobody to talk to here yet".

## 4. Fuori-specific risks

| # | Fuori today | Severity | What the HIG says | iOS-native way to keep the intent |
|---|---|---|---|---|
| R1 | **"Settings" text button, top right, on every screen** (decided: gear on every screen, D2), opening a sheet with checkboxes and a Save button (`SettingsButton.tsx`, `page.tsx`) | Should fix | Toolbar items are symbols without text; general, rarely changed settings live in one settings area; task-specific options belong in the screen they affect; toggles in a list row; changes apply without Save. [Settings][settings], [Toolbars][toolbars], [Toggles][toggles] | A `gearshape` toolbar item (label "Settings" for VoiceOver); D2 puts it on every screen. The sheet is a `Form` of `Toggle`s that apply at once, with a grabber and a close button. **Conversation options (subtitles, English) move into the conversation's own toolbar** as a `captions.bubble` toggle or menu, where their effect is visible. |
| R2 | **Custom "← City" back link** on the person and place screens | Must fix | Use the standard Back button; keep the edge swipe. [Toolbars: Navigation][toolbars], [Gestures][gestures] | Standard back button in the navigation bar (iOS 26's round arrow; Josh preferred it to the web's "← Roma" after seeing both, 2026-10-15), above the approved name band, which stays. Saving hangs off the route leaving the path, so swipe-back saves too. |
| R3 | **"Start conversation" button** (English literal, web) | Should fix | Autoplaying audio needs visible controls; a deliberate action is better than a surprise. [Accessibility: Cognitive][accessibility] | With hands-free (decision 4) the button goes, and the tap on the place card is the deliberate action. Keep a visible **Pause** control from the first second; if a button stays (e.g. in a quiet room), its label comes from `language.ui`. |
| R4 | **Hands-free, always-listening turns** (decision 4) | Must fix (the design, before N1 is built) | People control recording; no mic reopening on its own after an interruption; state visible without colour alone; offer more than one input method. [Privacy][privacy], [Playing audio][playing-audio], [Accessibility][accessibility], [Gestures][gestures] | (a) A persistent, labelled state: `mic.fill` + "Your turn" / `waveform` + "Giulia" / `pause.fill` + "Paused". (b) A **Pause** button always on screen, plus Back to leave. (c) Interruptions, route changes and backgrounding go to Paused; resuming needs a tap. (d) The mic is open only during the learner's turn (already planned). (e) **When VoiceOver or Switch Control is running, switch to tap-to-talk**: otherwise VoiceOver's own speech is recorded and the learner can't hear what they're focused on. (f) Mic permission handled per [section 3](#privacy-and-the-microphone). |
| R5 | **4 s silence ring ends the turn** (same for every level; adapts to the learner's pauses and cut-offs, docs/12 → Audio pipeline 4–7) | Should fix | Avoid timed UI; where unavoidable, let people take more time. [Accessibility: Cognitive][accessibility] | Keep it (it's what makes hands-free work), but: any sound resets it (planned), a tap ends the turn at once (planned), the wait adapts to the learner's pauses and lengthens after a cut-off (planned), and tap to talk, the default, has no timer at all. ~~Settings gets "Give me more time to answer"~~: dropped (Josh, 2026-10-16: the setting would be confusing); VoiceOver users get tap to talk, so no timer either. The ring is a determinate progress indicator (good); no pulsing under Reduce Motion. |
| R6 | **Fixed point sizes, custom fonts** (`Tokens.Size`, `Typography.swift`) | Must fix | Dynamic Type to AX5; custom fonts must honour Bold Text. [Typography][typography] | `relativeTo:` text styles, `@ScaledMetric` for non-text sizes, `legibilityWeight` for Bold Text; snapshot tests at AX5. |
| R7 | **Light-only paper palette** | Must decide (see [D1](#7-decisions-josh-2026-10-15)) | Support Dark Mode; supply dark and high-contrast variants of custom colours even if shipping one appearance. [Dark Mode][dark-mode], [Color][color] | A **"night paper"** variant: warm charcoal (around `#1f1c19`) background, card around `#2a2622`, text a warm off-white, olive lifted for contrast, watercolours dimmed about 10%. Until it exists, declare light-only in `Info.plist` so the system bars match the paper (see audit A1). |
| R8 | **Polaroid cards as buttons** | Should fix | Custom buttons need a pressed state, a button trait, a label. [Buttons][buttons], [VoiceOver][voiceover] | A shared `PolaroidButtonStyle` (slight dim/scale, no motion under Reduce Motion); the card is one accessibility element with name, region and visits; the image is hidden. Place cards that can't be opened yet must not look tappable. |
| R9 | **"Mostra altro" pagination** for 20 cities (decided: show all, D4) | Consider | Progressive disclosure is fine; scrolling is the norm; a lone target-language word as the only control on an English-chrome screen may puzzle a beginner. [Layout][layout], [Scroll views][scroll-views] | Either list all cities (a lazy list of 20 is cheap) with the first-screen ones on top, or keep the button as a standard bordered button at least 44 pt tall. See [D4](#7-decisions-josh-2026-10-15). |
| R10 | **Departures board** (custom overlay with an × and a grid) | Should fix | A scoped task is a sheet, with a title and Cancel; one sheet at a time. [Sheets][sheets], [Modality][modality] | `.sheet` titled with `language.ui.whereTo`, Cancel leading, a `List` of cities (board styling is fine as content); the current city is disabled with "You are here" as text, not only colour. Picking a city dismisses the sheet, then pushes the conversation. |
| R11 | **Ticket with "Sali"** | Should fix | One prominent action; 44 pt; activity indicator while it works; meaningful VoiceOver grouping. [Buttons][buttons], [VoiceOver][voiceover] | The ticket is content; "Sali" is a real `Button` with a prominent style, a pressed state and a spinner while saving. VoiceOver reads "Roma to Napoli, platform 4, seat 23" as one element; the barcode is hidden. A `.success` haptic on boarding. |
| R12 | **Visit-count badge** (green circle with a number, top right) | Should fix | Don't imitate the system's notification badge; don't rely on colour; scale with text. [Notifications: Badging][notifications], [Color][color] | The M3 stamp redesign, which isn't a number in a circle; label "Visited 3 times"; scales with `@ScaledMetric`. |
| R13 | **Error screen** (full-screen pink, raw code, text "Try again") | Should fix | Show the problem in context; don't block what still works; clear copy and a next step. [Alerts][alerts], [Loading][loading], [Writing][writing] | `ContentUnavailableView` on the normal background: symbol, plain title ("Can't reach Fuori"), the E-code in footnote, a prominent "Try Again". If only `/me` fails, show the feed without stamps and a quiet note. |
| R14 | **Full-screen conversation vs status bar** (portrait edge to edge) | Should fix | Don't hide the status bar permanently; keep it legible; keep essential navigation visible. [Status bars][status-bars], [Going full screen][going-full-screen] | Top to bottom: status bar, standard navigation bar (back, gear), the approved paper name band (name, role and neighbourhood), then the portrait filling the rest at the approved framing (at least 124% of the screen width). The status bar stays (it's where people check the time and see the system's recording indicator). No deferring of the home gesture. **Show Josh a simulator screenshot of this before N1 builds on it.** |
| R15 | **Subtitles over the portrait** | Should fix | Don't put Liquid Glass in the content layer; legibility over bright content. [Materials][materials] | Subtitles sit on a solid paper card or a standard material, never glass; the card grows with Dynamic Type and scrolls if needed. |
| R16 | **Onboarding by a character, who speaks before any permission** | Consider | Voice playback needs no permission; the mic prompt should come with context, through one "Continue" screen; onboarding should be skippable. [Onboarding][onboarding], [Privacy][privacy] | The character greets (audio only). When they first ask you to speak, the screen shows one English line ("To hear your answer, Fuori needs the microphone") and **Continue** → system prompt. Denied → step 1 of the ladder (tap answers) still works, plus a Settings button. (No Skip: D7.) |
| R17 | **Characters are AI, presented as people** | Resolved (Josh, 2026-10-15) | Don't trick people into thinking they're talking to a person. [Generative AI][generative-ai] | Nothing in the game: the characters are illustrated, so nobody takes them for real people. The App Store description says it's AI conversation practice; the mic screen says where speech goes (privacy, N4). |
| R18 | **Target-language words on controls** ("Sali" / "Subir", ticket and sign words) | Consider | Labels must be clear; VoiceOver must pronounce them. [Writing][writing], [VoiceOver][voiceover] | Allowed as world vocabulary when the meaning is obvious from context; tagged with the speech language; English accessibility hint for beginners ("Board the train"). See [D5](#7-decisions-josh-2026-10-15). |

## 5. Audit of the N0 SwiftUI code

| # | Where | Finding | Fix | Severity |
|---|---|---|---|---|
| A1 | `ios/FuoriKit/Sources/FuoriFeatures/CityListView.swift:29-30`, `PlaceListView.swift:23-24` | Fixed `paper` background with system-coloured navigation titles. **In Dark Mode the large title turns white on light paper** and the status bar text goes white too: nearly invisible. | Now: add `UIUserInterfaceStyle: Light` to `ios/project.yml` `info.properties`. Then: dark tokens (R7) and remove the key. | Must, now |
| A2 | `FuoriDesign/Tokens.swift:6-16` (from `design/tokens.json`) | Static colours: no dark or increased-contrast variants; terracotta fails text contrast. | Give `tokens.json` `light`/`dark`/`lightHC`/`darkHC` values; generate colour sets into an asset catalog (or a dynamic `UIColor` provider). | Must (with D1) |
| A3 | `FuoriDesign/Typography.swift:7-14` | `Font.custom(_:size:)` scales everything on the body curve; Bold Text is ignored. | Take a `relativeTo:` text style (`display` → `.title`/`.largeTitle`; `label` → `.body`/`.subheadline`); apply a heavier weight when `legibilityWeight == .bold`. Check that Alegreya Sans Medium/Bold faces are actually picked up by `.weight()` (they're separate static files; Alegreya is a variable font). | Must |
| A4 | `FuoriFeatures/PlaceListView.swift:35-41` | Badge: fixed 15 pt text in a fixed 32×32 circle, clips at large sizes; looks like a notification badge; label "\(count) visits" is a Swift literal with no plural ("1 visits"); it's a separate VoiceOver element from its card. | `@ScaledMetric` size, String Catalog plural ("Visited %lld times"), fold it into the card's label; replace with the stamp design (R12). | Should |
| A5 | `FuoriFeatures/CityListView.swift:30` | `navigationTitle(content.language.appName)`: the HIG says not to title a screen with the app name. | A content title, e.g. "Cities" (English chrome) or a pack word (D5). | Should |
| A6 | `FuoriFeatures/CityListView.swift:18` | `.buttonStyle(.plain)` on the card link: weak pressed feedback. | A shared `PolaroidButtonStyle` with a pressed state that respects Reduce Motion (R8). | Should |
| A7 | `FuoriFeatures/CityListView.swift:21-24` | "Mostra altro" is a bare text button. Height is fine thanks to padding, but there's no shape and it's the only target-language word on an English-chrome screen. | `.buttonStyle(.bordered)`, `.controlSize(.large)`, speech-language tag; or remove (D4). | Consider |
| A8 | `FuoriFeatures/PlaceListView.swift:16-18` | Place cards look exactly like the tappable city cards but do nothing (N0 placeholder). | Fine for N0; in N1 they become links. Don't ship non-tappable cards that look tappable. | Should (N1) |
| A9 | `FuoriFeatures/RootView.swift:17-29` | Error state: full-screen `errorBg`, raw server code (`server_error`) in the message, an unstyled "Try again". | `ContentUnavailableView` + `.borderedProminent` "Try Again" + E-code in footnote (R13). | Should |
| A10 | `FuoriFeatures/AppModel.swift:31-34` | If `/me` fails after content loaded, the whole app shows the error. | Separate the two: content ready → show feeds; visits failure → no stamps + a quiet inline note, with a retry. | Should |
| A11 | `FuoriFeatures/RootView.swift:13-16` | Spinner on a blank page at every launch. | Bundle the pack (planned) so the first screen draws instantly; refresh behind it. | Should |
| A12 | `FuoriFeatures/RootView.swift:36` | `.tint(Tokens.Colors.green)` in code. | An `AccentColor` colour set with a dark variant; drop the modifier. | Consider |
| A13 | `ios/project.yml:47-48` | `UILaunchScreen` with an empty `UIColorName`: the launch screen is system white/black, then paper appears: a flash. | Add a `LaunchBackground` colour set (paper; night paper in dark) and name it here. | Should |
| A14 | `ios/project.yml` (no asset catalog) | No `AppIcon`, no `AccentColor`, no colour sets. | Add `Fuori/Resources/Assets.xcassets` (icon from Icon Composer at N4). | Should (N4) |
| A15 | `ios/project.yml:40-61` | No `NSMicrophoneUsageDescription` yet. | Add the string from [section 3](#privacy-and-the-microphone) in N1. | Must (N1) |
| A16 | `FuoriDesign/PolaroidCard.swift:21-27` | Image failure and loading look the same (sand) forever, with no retry; images aren't dimmed in Dark Mode. | Keep the sand placeholder; retry on reappear; slight dim in dark. Decorative image is correctly covered by the combined element (line 51). | Consider |
| A17 | `FuoriFeatures/PlaceListView.swift:29` | Subtitle mixes the target-language role ("barista", "taquero") and English punctuation in one string, read by VoiceOver in English. | Build it from parts and tag the target-language parts with the speech language. | Consider |

Good already: one `NavigationStack` (`RootView.swift:11`), standard back swipe, card combined into one VoiceOver element (`PolaroidCard.swift:51`), portrait-only declared, token in Keychain, target-language words from the pack.

## 6. Done checklist for any iOS screen

Add to "Definition of done" for every Swift screen, and say in the commit which items were checked:

1. Largest accessibility text size (AX5): nothing clipped or overlapping; order unchanged.
2. Dark Mode and Increase Contrast (or the documented light-only exception while D1 is open).
3. VoiceOver pass: every control labelled, decorative images hidden, target-language words pronounced in the target language, state changes announced.
4. Every target ≥ 44×44 pt; every custom button has a pressed state.
5. Back swipe works and runs the same exit code as the back button.
6. Reduce Motion: no slides, pulses or typewriter effects.
7. Audio screens: incoming call, Siri, AirPods out, AirPods in, background mid-speech, locked phone. The mic never reopens by itself.
8. No hard-coded colours, sizes or English literals outside the token file and String Catalog; target-language words from the pack.
9. Errors appear in context with a next step and an E-code; no informational alerts.
10. Light and dark snapshots at 390×844 at the default and AX5 text sizes.

## 7. Decisions (Josh, 2026-10-15)

Where a strict reading of the HIG changed something already decided. Josh went through each one.

- **D1. Dark Mode: a "night paper" palette at N2.** Warm charcoal background (around `#1f1c19`), cards a shade lighter, warm off-white text, olive lifted for contrast, watercolours dimmed about 10%. Light-only (`UIUserInterfaceStyle: Light`) until then.
- **D2. Settings: a button on every screen, with Fuori's own icon.** A toolbar item, top right on every screen, showing the web's settings icon (a circle with eight rays; `FuoriDesign/SettingsIcon.swift`), not the system gear (Josh, 2026-10-15, after seeing both) (labelled "Settings" for VoiceOver), opening the settings sheet: a `Form` of toggles that apply at once, no Save button. This keeps Josh's earlier decision (settings top right everywhere) in iOS form: a symbol, not the word. Subtitles and English can also get a toggle in the conversation toolbar where their effect is visible (R1); the gear stays either way.
- **D3. Hands-free safeguards: all four.** A Pause button always on the conversation screen; calls, Siri, AirPods out and going to the background pause, and the mic never reopens without a tap; tap-to-talk when VoiceOver or Switch Control is on. ~~A "more time to answer" setting~~: dropped (Josh, 2026-10-16: confusing; tap to talk, now the default, has no timer). The default experience is unchanged.
- **D4. Show all cities.** One scrolling list, first-screen cities on top in the curated order; no "Mostra altro" on the city list.
- **D5. World words in the learned language, app controls in English.** Tickets, signs, "Sali" / "Subir", place and role names come from each country's pack; Settings, errors, permissions and accessibility hints are English. Every target-language label is tagged with the speech language for VoiceOver, with an English hint.
- **D6. Typed reply only as accessibility.** Hidden unless the mic is off or an accessibility setting is on; voice stays the way to play. Around N3.
- **D7. No Skip in onboarding.** Everyone goes through the onboarding conversation once. A **"Start as a beginner"** button is fine (Josh, 2026-10-15): an explicit choice of level, not a Skip that quietly makes you a beginner. Any default a flow needs (a starting city, a tier) comes from the country's data, e.g. its first home city, never a city named in code, so Afuera learners don't land in Italy.

## 8. Modern iOS features: what to adopt, when, and how

Rule of thumb: adopt what makes Fuori feel like a native iPhone app without pulling the learner out of the country they're living in. Nothing here that adds a streak, a nag, or a second voice talking over the character.

### Liquid Glass and the iOS 26 look
- **Adopt (N1, then everywhere).** [Materials: Liquid Glass][materials], [Color: Liquid Glass color][color], [Toolbars][toolbars], [Layout][layout]
- **Get it by using standard parts**: `NavigationStack` bars, `.toolbar` items, `.sheet`, `TabView`, and `Button` with `.buttonStyle(.glass)` / `.glassProminent` for floating controls. Use `.glassEffect` on custom views only for the conversation's floating controls (Pause, captions), and sparingly.
- **With paper and watercolour:** glass is the *control layer*; paper and watercolour are the *content layer*. Let the paper scroll under the glass bars; don't give the toolbar a paper background (the HIG asks for fewer custom bar backgrounds). Tint only the one primary action olive; leave other bar items monochrome.
- **Don't** put glass in the content layer: not on Polaroid captions, the ticket, or **subtitles over the portrait** (use a solid paper card or a standard material). Over the bright watercolour portrait, use regular glass, not clear glass (clear would need a dimming layer).
- Applies to: all screens. Check with Reduce Transparency and Increase Contrast on.

### Sign-in, passkeys and Face ID
- **Sign in with Apple: not adopted** (Josh, 2026-10-15; was planned for M4). Identity is the silent device token, stored as a synchronizable iCloud Keychain item so it follows the learner's Apple ID to a new phone. No accounts means no sign-in screen, no account deletion flow and no Face ID code.
- **Passkeys: Later, probably never.** Only needed if non-Apple accounts arrive (Android, web). Today's identity is an iCloud Keychain token, with no sign-in.
- **Face ID unlock (LocalAuthentication): Don't.** Fuori holds nothing sensitive enough (cities visited, conversation notes); locking it behind Face ID adds friction for no protection, and the HIG discourages app-specific biometric toggles.

### Haptics
- **Adopt (N1 onwards), with `sensoryFeedback`.** [Playing haptics][playing-haptics], [Feedback][feedback]

| Moment | Haptic | Note |
|---|---|---|
| Your turn starts (mic opens) | `.impact(weight: .light)` | The most useful one: tells you to speak without looking. **Play it just before the mic opens**, then wait about 150 ms before the voice gate measures the noise floor, so the vibration isn't recorded. |
| Turn ends (silence ring completes or tap) | `.selection` or none | Try both on the device; the character's reply may be feedback enough. |
| Character starts speaking | None | The voice is the feedback. |
| Conversation paused (interruption, timeout) | `.warning` | Paired with the "Paused" label. |
| A failure with an E-code | `.error` | With the visible message, never alone. |
| Boarding the train or bus ("Sali" / "Subir") | `.success` | |
| Stamp earned | `.success` | Once, when the stamp appears. |
| Tapping cards, toggles, sheets | System default only | Standard controls already play their own. |

- They respect the system's haptics setting automatically. The HIG asks that haptics be optional; the system switch covers it, so no in-app toggle unless testers ask.
- **Don't:** continuous haptics following the voice meter; haptics on every subtitle word; haptics while the mic is recording.

### Notifications
- **Later (after N4), opt-in only.** [Notifications][notifications], [Managing notifications][managing-notifications]
- **Appropriate:**
  - A **reminder the learner asks for**: Magda says "ci vediamo giovedì" and offers "Remind me", or Settings has "Remind me to practise at 19:00". The learner sets it; it's not us nagging.
  - **News from the world, if the parked "messages" idea returns** (`docs/ideas.md`): "Rita: *Giulia mi ha chiesto di te*". Today `ideas.md` records it as passed (2026-10-14, "in-app only, no push"), so **Don't** for now.
- **Permission timing:** never at launch or in onboarding. Ask right after the learner taps "Remind me" (the request then explains itself).
- **Content:** a short title in English for context, the line in the target language with a few words of English if the learner is a beginner; no app name (the system shows the icon); a generic text for hidden previews ("A message from Rita"). No personal details from the study file.
- **Frequency and level:** at most one a day, none on a day they've already played; interruption level Passive or Active, **never Time Sensitive**; no badge counts.
- **Don't:** streak warnings or guilt ("Giulia misses you!"), messages that only say "come back", marketing, errors as notifications, more than one notification about the same thing. Note the HIG discourages notifications that tell people to do a task in the app, which is why reminders should be ones the learner asked for.
- An in-app settings row to turn them off is required once they exist.

### Everything else

| Feature | Verdict | When | Why |
|---|---|---|---|
| SF Symbols | Adopt | N1 | Standard icons scale with Dynamic Type and adapt to Dark Mode; use animated symbols (`.symbolEffect`) for the listening/thinking state instead of custom dots, off under Reduce Motion. [SF Symbols][sf-symbols] |
| Dynamic Type | Adopt | Now | Required (R6, A3). [Typography][typography] |
| Dark Mode | Adopt | N2 | D1. [Dark Mode][dark-mode] |
| TipKit | Adopt, sparingly | N1/N2 | Two or three one-time tips ("Tap to answer now", "Tap to ask in English"), not an instruction screen. [Offering help][offering-help] |
| App Intents / Siri / App Shortcuts ("Talk to Giulia in Fuori") | Later | After N4 | Natural for a voice app and cheap with App Intents, but it needs a stable "last person" model first; the phrase must include the app name. Could also go on the Action button. [App Shortcuts][app-shortcuts], [Siri][siri] |
| Widgets | Later | When daily suggestions exist | A small "Oggi" widget with today's suggestion (target-language line plus picture) deep-linking to the place. No streak or progress widget. [Widgets][widgets] |
| Share sheet | Later | If the study export or a postcard comes into the app | `ShareLink` with the system share sheet; no custom share menu. Today the export stays on the server. [Activity views][activity-views] |
| Ratings prompt | Later | After TestFlight | System prompt only, after a good conversation ends, never mid-conversation or in onboarding. [Ratings and reviews][ratings-and-reviews] |
| StoreKit / In-App Purchase | Later | If Fuori charges | Let people play first; system confirmation sheet; easy cancellation. [In-App Purchase][apple-in-app-purchase] |
| Spotlight | Later, low priority | — | Indexing the people you've met ("Giulia, Bar del Fico, Roma") is pleasant but rarely used. [Searching][searching] |
| Live Activities | Don't | — | A conversation only runs in the foreground (no background audio), and game days aren't real time; nothing to track on the Lock Screen. [Live Activities][live-activities] |
| Control Center controls | Don't | — | No action that makes sense without opening the app. [Controls][controls] |
| Focus filters | Don't | — | Nothing to filter. Notifications just use honest interruption levels. [Managing notifications][managing-notifications] |
| Apple Intelligence, Writing Tools, Foundation Models | Don't | — | No text editing, and Claude is the model; an on-device model would be a second, weaker voice. [Generative AI][generative-ai] |
| Game Center, leaderboards, streaks | Don't | — | Against "no likes, no streaks" (game design). |
| Sound effects | Don't | — | They would ignore the silent switch under `.playAndRecord`; use haptics. [Playing audio][playing-audio] |

[accessibility]: https://developer.apple.com/design/human-interface-guidelines/accessibility
[action-sheets]: https://developer.apple.com/design/human-interface-guidelines/action-sheets
[activity-views]: https://developer.apple.com/design/human-interface-guidelines/activity-views
[alerts]: https://developer.apple.com/design/human-interface-guidelines/alerts
[app-icons]: https://developer.apple.com/design/human-interface-guidelines/app-icons
[app-shortcuts]: https://developer.apple.com/design/human-interface-guidelines/app-shortcuts
[apple-in-app-purchase]: https://developer.apple.com/design/human-interface-guidelines/apple-in-app-purchase
[branding]: https://developer.apple.com/design/human-interface-guidelines/branding
[buttons]: https://developer.apple.com/design/human-interface-guidelines/buttons
[color]: https://developer.apple.com/design/human-interface-guidelines/color
[controls]: https://developer.apple.com/design/human-interface-guidelines/controls
[dark-mode]: https://developer.apple.com/design/human-interface-guidelines/dark-mode
[design-principles]: https://developer.apple.com/design/human-interface-guidelines/design-principles
[feedback]: https://developer.apple.com/design/human-interface-guidelines/feedback
[generative-ai]: https://developer.apple.com/design/human-interface-guidelines/generative-ai
[gestures]: https://developer.apple.com/design/human-interface-guidelines/gestures
[going-full-screen]: https://developer.apple.com/design/human-interface-guidelines/going-full-screen
[inclusion]: https://developer.apple.com/design/human-interface-guidelines/inclusion
[launching]: https://developer.apple.com/design/human-interface-guidelines/launching
[layout]: https://developer.apple.com/design/human-interface-guidelines/layout
[live-activities]: https://developer.apple.com/design/human-interface-guidelines/live-activities
[loading]: https://developer.apple.com/design/human-interface-guidelines/loading
[managing-accounts]: https://developer.apple.com/design/human-interface-guidelines/managing-accounts
[managing-notifications]: https://developer.apple.com/design/human-interface-guidelines/managing-notifications
[materials]: https://developer.apple.com/design/human-interface-guidelines/materials
[modality]: https://developer.apple.com/design/human-interface-guidelines/modality
[motion]: https://developer.apple.com/design/human-interface-guidelines/motion
[notifications]: https://developer.apple.com/design/human-interface-guidelines/notifications
[offering-help]: https://developer.apple.com/design/human-interface-guidelines/offering-help
[onboarding]: https://developer.apple.com/design/human-interface-guidelines/onboarding
[playing-audio]: https://developer.apple.com/design/human-interface-guidelines/playing-audio
[playing-haptics]: https://developer.apple.com/design/human-interface-guidelines/playing-haptics
[privacy]: https://developer.apple.com/design/human-interface-guidelines/privacy
[progress-indicators]: https://developer.apple.com/design/human-interface-guidelines/progress-indicators
[ratings-and-reviews]: https://developer.apple.com/design/human-interface-guidelines/ratings-and-reviews
[scroll-views]: https://developer.apple.com/design/human-interface-guidelines/scroll-views
[searching]: https://developer.apple.com/design/human-interface-guidelines/searching
[settings]: https://developer.apple.com/design/human-interface-guidelines/settings
[sf-symbols]: https://developer.apple.com/design/human-interface-guidelines/sf-symbols
[sheets]: https://developer.apple.com/design/human-interface-guidelines/sheets
[sign-in-with-apple]: https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple
[siri]: https://developer.apple.com/design/human-interface-guidelines/siri
[status-bars]: https://developer.apple.com/design/human-interface-guidelines/status-bars
[tab-bars]: https://developer.apple.com/design/human-interface-guidelines/tab-bars
[toggles]: https://developer.apple.com/design/human-interface-guidelines/toggles
[toolbars]: https://developer.apple.com/design/human-interface-guidelines/toolbars
[typography]: https://developer.apple.com/design/human-interface-guidelines/typography
[voiceover]: https://developer.apple.com/design/human-interface-guidelines/voiceover
[widgets]: https://developer.apple.com/design/human-interface-guidelines/widgets
[writing]: https://developer.apple.com/design/human-interface-guidelines/writing
