# Wordle

A fun, browser‑playable Wordle clone built in React with TypeScript.

This repository contains the source code for a Wordle‑style word guessing game. Players have six tries to guess a secret five‑letter word. The UI gives feedback on each guess by highlighting correct letters in the correct position, present letters in the wrong position, and absent letters.

You can play the game right here: https://wordlebysaleh.netlify.app

## 🧠 How It Works

This project replicates the core mechanics of the popular Wordle game:

1. A secret five‑letter word is selected each round.
2. The player types a guess and submits it.
3. The game checks:
   - Letters in the correct spot
   - Letters in the word but wrong spot
   - Letters not in the word
4. Feedback is shown with color‑coded tiles.
5. The player wins by guessing correctly within six tries.

The goal is to keep the logic clear, gameplay snappy, and UX smooth.

## 🛠 Built With

This app uses:

- **React**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- (Optional any other libs you used)

## 🚀 Getting Started

To run this locally:

1. Clone the repo  
   ```sh
   git clone https://github.com/XVXMOA/Wordle.git
   cd Wordle
