# Mitchy Rich — The Casino of Mitchell’s Angels

Browser casino game with blackjack, European roulette and slots. No purchases or cash payouts.

Play on a phone: https://gelatofreeze.github.io/mitchy-rich-casino/
Tap Enter the Casino, then select a table. Tap a chip and a roulette board space to bet; the board becomes a vertical layout on narrow screens. Sound begins after a tap. Saves stay in the current browser on the current device.

## This build
- Blackjack: fresh 52-card shuffle, dealer stands on all 17s, natural 3:2, ordinary 1:1, split identical ranks once, double after split, one card per split ace.
- Autoplay: fixed wagers, configurable blackjack stand threshold, round cap, loss budget, profit target and stop-on-win. Roulette repeats the placed board. No automatic wager escalation.
- Roulette: 37 equally likely single-zero pockets; the rendered pointer lands on the drawn result. Number pays 35:1; dozen/column 2:1; even-money outside bets 1:1. Stakes returned on wins.
- Slots: four equally likely independent symbols; matching gross payouts 30/16/8/4 times the wager; theoretical RTP 90.625%.
- Browser cryptographic RNG with unbiased rejection sampling; not a certified real-money platform.
- Wins appear in a small, nonblocking left-hand celebration, dismissing automatically.
- High cash tracked locally, as requested. Scores do not synchronize between phones.

## Controls
Rules, fullscreen, reset, music, motion and Menu/Pause are labeled. Reset asks before replacing the current game. Reduced-motion settings are respected.

## Development status
Alyssa and Mikayla now use independent transparent bikini sprite layers with blinking, subtle breathing and speech-triggered mouth cels. The title and hoodie host have new anime pixel artwork. Saved roulette layouts, a vertical mobile board, round history, visible session accounting and a softer original lounge soundtrack are included. Rebecca retains her previous artwork. Character-specific dances and precise phoneme-synchronized speech remain unfinished. Phaser currently renders victory animation only, not the entire game. No claim of full graphics overhaul or completed request history.

## Credits
Phaser 3.90.0: MIT, see PHASER-LICENSE.md. Pixel font: see PIXEL-FONT-LICENSE.txt. Generated artwork supplied for this project.
