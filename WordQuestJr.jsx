import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Volume2, RotateCcw, Stars, Trophy, Settings2, Baby, PartyPopper, ThumbsUp } from "lucide-react";

// ------------------------------------
// Word bank (age 4–7 friendly)
// ------------------------------------
const WORDS = [
  { word: "cat", emoji: "🐱", hint: "A small pet that says meow.", sentence: "The cat sleeps on the mat.", category: "Animals" },
  { word: "dog", emoji: "🐶", hint: "A friendly pet that wags its tail.", sentence: "The dog runs fast.", category: "Animals" },
  { word: "cow", emoji: "🐮", hint: "It says moo and gives milk.", sentence: "The cow eats grass.", category: "Animals" },
  { word: "bee", emoji: "🐝", hint: "It buzzes and loves flowers.", sentence: "The bee makes honey.", category: "Animals" },
  { word: "ant", emoji: "🐜", hint: "A tiny bug that walks in a line.", sentence: "The ant carries food.", category: "Animals" },
  { word: "lion", emoji: "🦁", hint: "King of the jungle.", sentence: "The lion has a loud roar.", category: "Animals" },
  { word: "fish", emoji: "🐟", hint: "It swims in water.", sentence: "The fish splashes.", category: "Animals" },
  { word: "frog", emoji: "🐸", hint: "It hops and says ribbit.", sentence: "The frog jumps high.", category: "Animals" },
  { word: "duck", emoji: "🦆", hint: "A bird that says quack.", sentence: "The duck swims in the pond.", category: "Animals" },
  { word: "bird", emoji: "🐦", hint: "It sings in trees.", sentence: "The bird can fly.", category: "Animals" },

  { word: "red", emoji: "🔴", hint: "The color of strawberries.", sentence: "The ball is red.", category: "Colors" },
  { word: "blue", emoji: "🔵", hint: "The color of the sky.", sentence: "The kite is blue.", category: "Colors" },
  { word: "green", emoji: "🟢", hint: "The color of grass.", sentence: "The leaf is green.", category: "Colors" },
  { word: "pink", emoji: "🩷", hint: "A soft, bright color.", sentence: "The flower is pink.", category: "Colors" },
  { word: "gold", emoji: "🟡", hint: "Shiny and yellow.", sentence: "The star looks gold.", category: "Colors" },

  { word: "cake", emoji: "🎂", hint: "We eat it at birthdays.", sentence: "The cake is sweet.", category: "Food" },
  { word: "milk", emoji: "🥛", hint: "A white drink from cows.", sentence: "I drink milk.", category: "Food" },
  { word: "apple", emoji: "🍎", hint: "Red and crunchy.", sentence: "An apple a day!", category: "Food" },
  { word: "bread", emoji: "🍞", hint: "We use it for toast.", sentence: "I eat bread for breakfast.", category: "Food" },
  { word: "corn", emoji: "🌽", hint: "Yellow and tasty.", sentence: "The corn is hot.", category: "Food" },
  { word: "rice", emoji: "🍚", hint: "Small white grains.", sentence: "We eat rice with curry.", category: "Food" },
  { word: "pear", emoji: "🍐", hint: "Green fruit, soft and sweet.", sentence: "The pear is juicy.", category: "Food" },

  { word: "run", emoji: "🏃‍♀️", hint: "Move fast with your legs.", sentence: "I run in the park.", category: "Actions" },
  { word: "hop", emoji: "🐰", hint: "A small jump.", sentence: "Bunnies hop.", category: "Actions" },
  { word: "sing", emoji: "🎵", hint: "Use your voice with music.", sentence: "We sing a song.", category: "Actions" },
  { word: "read", emoji: "📖", hint: "Look at words in a book.", sentence: "We read a story.", category: "Actions" },
  { word: "draw", emoji: "✏️", hint: "Make a picture with a pencil.", sentence: "I draw a cat.", category: "Actions" },
  { word: "sleep", emoji: "😴", hint: "Rest with eyes closed.", sentence: "Babies sleep a lot.", category: "Actions" },
  { word: "swim", emoji: "🏊", hint: "Move in water.", sentence: "We swim at the pool.", category: "Actions" },
];

const CATEGORIES = ["All", ...Array.from(new Set(WORDS.map(w => w.category)))];

// Utility to shuffle array
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-GB";
  utter.rate = 0.95; // a bit slower for kids
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

function useSound() {
  const clickRef = useRef(null);
  const winRef = useRef(null);
  const loseRef = useRef(null);
  useEffect(() => {
    clickRef.current = new Audio(
      "data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQAA..." // tiny silent stub (keeps mobile unmuted). Optional.
    );
    winRef.current = new Audio(
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAA..."
    );
    loseRef.current = new Audio(
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAA..."
    );
  }, []);
  return {
    click: () => clickRef.current?.play().catch(() => {}),
    win: () => winRef.current?.play().catch(() => {}),
    lose: () => loseRef.current?.play().catch(() => {}),
  };
}

function makeRoundPool(category, difficulty) {
  let pool = category === "All" ? WORDS : WORDS.filter(w => w.category === category);
  if (difficulty === "Short (3–4 letters)") pool = pool.filter(w => w.word.length <= 4);
  if (difficulty === "Medium (5–6 letters)") pool = pool.filter(w => w.word.length >= 5 && w.word.length <= 6);
  // "Mix" leaves pool as-is
  return shuffle(pool);
}

export default function WordQuestJr() {
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("Mix");
  const [optionsCount, setOptionsCount] = useState(3); // 3 choices by default
  const [rounds, setRounds] = useState(10);
  const [pool, setPool] = useState(makeRoundPool("All", "Mix"));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hardMode, setHardMode] = useState(false); // hides emojis
  const [finished, setFinished] = useState(false);
  const [stickers, setStickers] = useState([]);

  const { click, win, lose } = useSound();

  const current = pool[index % pool.length];

  // Generate options (1 correct + distractors)
  const choices = useMemo(() => {
    const others = shuffle((category === "All" ? WORDS : WORDS.filter(w => w.category === category))
      .filter(w => w.word !== current?.word))
      .slice(0, Math.max(2, optionsCount - 1));
    const all = shuffle([current, ...others]);
    return all.map(x => x.word);
  }, [current, category, optionsCount]);

  // speak word on round start (if not hard mode)
  useEffect(() => {
    if (!current) return;
    if (!hardMode) speak(current.word);
  }, [index, current, hardMode]);

  function nextRound(correct) {
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      win();
    } else {
      setStreak(0);
      lose();
    }

    // Rewards
    const reward = correct && (score + 1) % 3 === 0;
    if (reward) {
      const pool = ["🌟", "🏅", "🎉", "🦄", "🐣", "🍭", "🧸", "🪄", "🚀", "🍪"]; 
      const pick = pool[Math.floor(Math.random() * pool.length)];
      setStickers(prev => [...prev, pick]);
    }

    const next = index + 1;
    if (next >= rounds) {
      setFinished(true);
    } else {
      setIndex(next);
      setShowHint(false);
    }
  }

  function resetGame() {
    setPool(makeRoundPool(category, difficulty));
    setIndex(0);
    setScore(0);
    setStreak(0);
    setShowHint(false);
    setFinished(false);
    setStickers([]);
  }

  function onPick(word) {
    click();
    const correct = word === current.word;
    nextRound(correct);
  }

  function sayWord() {
    speak(current.word);
  }

  function saySentence() {
    speak(current.sentence);
  }

  // Update pool on settings change
  useEffect(() => {
    setPool(makeRoundPool(category, difficulty));
    setIndex(0);
    setScore(0);
    setStreak(0);
    setShowHint(false);
    setFinished(false);
    setStickers([]);
  }, [category, difficulty]);

  const progress = Math.min(100, Math.round(((index) / rounds) * 100));

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-rose-50 to-sky-50 flex items-center justify-center py-8 px-4">
      <Card className="w-full max-w-3xl shadow-2xl rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Baby className="w-6 h-6" />
            <CardTitle className="text-2xl md:text-3xl font-bold">WordQuest Jr</CardTitle>
            <Badge variant="secondary" className="text-sm">Ages 4–7</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="gap-2" onClick={() => setShowSettings(s => !s)}>
              <Settings2 className="w-5 h-5" /> Settings
            </Button>
            <Button variant="ghost" className="gap-2" onClick={resetGame}>
              <RotateCcw className="w-5 h-5" /> Reset
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="px-2">
            <Progress value={progress} className="h-3" />
          </div>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="rounded-xl border p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white"
              >
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map((c) => (
                      <Button key={c} variant={c === category ? "default" : "secondary"} onClick={() => setCategory(c)} className="rounded-xl">
                        {c}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Difficulty</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Mix", "Short (3–4 letters)", "Medium (5–6 letters)"].map((d) => (
                      <Button key={d} variant={d === difficulty ? "default" : "secondary"} onClick={() => setDifficulty(d)} className="rounded-xl text-center">
                        {d}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Choices per round</label>
                  <div className="flex gap-2">
                    {[2,3,4].map(n => (
                      <Button key={n} variant={n===optionsCount?"default":"secondary"} onClick={() => setOptionsCount(n)} className="rounded-xl w-16">{n}</Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Rounds</label>
                  <div className="flex gap-2">
                    {[5,10,15].map(n => (
                      <Button key={n} variant={n===rounds?"default":"secondary"} onClick={() => setRounds(n)} className="rounded-xl w-16">{n}</Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch id="hard" checked={hardMode} onCheckedChange={setHardMode} />
                  <label htmlFor="hard" className="text-sm font-semibold">Hard Mode (hide picture)</label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game Area */}
          {!finished ? (
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-base">
                    Score: <span className="ml-1 font-bold">{score}</span>
                  </Badge>
                  <Badge variant="outline" className="text-base">
                    Streak: <span className="ml-1 font-bold">{streak}</span>
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" className="gap-2 rounded-xl" onClick={sayWord}>
                    <Volume2 className="w-4 h-4" /> Say the word
                  </Button>
                  <Button variant="secondary" className="gap-2 rounded-xl" onClick={saySentence}>
                    <Sparkles className="w-4 h-4" /> Use it in a sentence
                  </Button>
                </div>
              </div>

              <motion.div layout className="rounded-2xl p-6 bg-white border flex flex-col items-center justify-center gap-3">
                <div className="text-sm text-slate-500">What is this word?</div>
                {!hardMode && (
                  <motion.div key={current?.emoji} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }} className="text-7xl md:text-8xl">
                    {current?.emoji}
                  </motion.div>
                )}
                <AnimatePresence initial={false}>
                  {showHint && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-slate-700 text-center">
                      Hint: {current?.hint}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" className="rounded-xl" onClick={() => setShowHint(h => !h)}>
                    {showHint ? "Hide Hint" : "Show Hint"}
                  </Button>
                </div>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {choices.map((c) => (
                  <motion.button
                    key={c}
                    onClick={() => onPick(c)}
                    whileTap={{ scale: 0.96 }}
                    className="rounded-2xl border bg-white p-4 text-xl md:text-2xl font-semibold shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-300"
                  >
                    {c}
                  </motion.button>
                ))}
              </div>

              {stickers.length > 0 && (
                <div className="rounded-2xl border bg-white p-4">
                  <div className="text-sm text-slate-600 mb-2 flex items-center gap-2"><Stars className="w-4 h-4"/> Sticker book</div>
                  <div className="text-2xl md:text-3xl">{stickers.join(" ")}</div>
                </div>
              )}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6 bg-white border text-center space-y-4">
              <div className="flex justify-center gap-3 items-center text-3xl md:text-4xl font-bold">
                <Trophy className="w-8 h-8" /> Great job!
              </div>
              <div className="text-lg">You scored <span className="font-bold">{score}</span> out of <span className="font-bold">{rounds}</span>.</div>
              <div className="text-xl md:text-2xl">{score === rounds ? "Perfect! " : ""} <PartyPopper className="inline w-6 h-6"/> {score >= Math.floor(rounds*0.7) ? "Gold star!" : score >= Math.floor(rounds*0.5) ? "Nice work!" : "Keep practicing!"}</div>
              {stickers.length > 0 && (
                <div className="text-lg">You earned stickers: <span className="text-2xl">{stickers.join(" ")}</span></div>
              )}
              <div className="flex justify-center gap-2">
                <Button className="rounded-xl gap-2" onClick={resetGame}><RotateCcw className="w-4 h-4"/> Play again</Button>
                <Button variant="secondary" className="rounded-xl gap-2" onClick={() => setShowSettings(true)}><Settings2 className="w-4 h-4"/> Adjust settings</Button>
              </div>
            </motion.div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <ThumbsUp className="w-4 h-4"/> Tip: Try saying the word together and clapping the sounds.
          </div>
          <div className="text-sm text-slate-500">Made for little learners ✨</div>
        </CardFooter>
      </Card>
    </div>
  );
}
