"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, ArrowRight, Calendar, MapPin, Sparkles } from "lucide-react";
import { motion, AnimatePresence, TargetAndTransition, VariantLabels } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

  // -- Main App State --
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("Tap the orb to start");

  // Refs
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize Speech
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Setup STT
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);

          // Auto-submit on silence (debounce)
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (currentTranscript.trim()) {
              stopListening();
              handleSubmit(currentTranscript);
            }
          }, 1500);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech Error:", event.error);
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }

      // Setup TTS
      synthesisRef.current = window.speechSynthesis;
    }
  }, []);

  const startListening = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    setIsSpeaking(false);
    setAnswer("");
    setTranscript("");
    setIsListening(true);
    recognitionRef.current?.start();
  };

  const stopAll = () => {
    setIsListening(false);
    setIsSpeaking(false);
    setIsProcessing(false);
    recognitionRef.current?.stop();
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    clearTimeout(silenceTimerRef.current);
  };

  const stopListening = () => {
    setIsListening(false);
    recognitionRef.current?.stop();
  };

  const speakText = (text: string) => {
    if (!synthesisRef.current) return;
    const voices = synthesisRef.current.getVoices();
    const preferredVoice = voices.find((v: any) => v.name.includes("Google US English")) || voices[0];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = preferredVoice;
    utterance.rate = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthesisRef.current.speak(utterance);

    // Fallback cleanup in case onend doesn't fire correctly
    setTimeout(() => {
      if (!synthesisRef.current.speaking) {
        setIsSpeaking(false);
      }
    }, 100);
  };

  const handleSubmit = async (text: string) => {
    if (!text) return;
    setIsProcessing(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (!controller.signal.aborted) {
        setAnswer(data.response);
        speakText(data.response);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error(err);
        setAnswer("I lost connection to the network.");
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsProcessing(false);
      }
    }
  };

  // UI Helper: Get Orb Status Color/State
  const getOrbState = () => {
    if (isProcessing) return "processing";
    if (isListening) return "listening";
    if (isSpeaking) return "speaking";
    return "idle";
  };

  // Helper: Adaptive Font Size
  const getTextSize = (length: number) => {
    if (length < 80) return "prose-2xl font-bold text-center";
    if (length < 200) return "prose-xl font-semibold";
    return "prose-lg font-medium";
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-white text-black overflow-hidden relative font-sans selection:bg-blue-100">

      {/* Soft Ambient Background - Always Present */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-80">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-blue-100 rounded-full blur-[100px] opacity-60 mix-blend-multiply" />
        <div className="absolute top-[20%] right-[-20%] w-[60%] h-[60%] bg-purple-100 rounded-full blur-[100px] opacity-60 mix-blend-multiply" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] bg-pink-50 rounded-full blur-[100px] opacity-60 mix-blend-multiply" />
      </div>

      <AnimatePresence mode="wait">
        {showIntro ? (
          <IntroView key="intro" onEnter={() => setShowIntro(false)} />
        ) : (
          <motion.div
            key="main-app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-10 w-full h-full flex flex-col items-center justify-between min-h-screen"
          >
            {/* Top Section: Header & Transcript */}
            <div className="z-10 w-full max-w-lg pt-16 px-6 flex flex-col items-center text-center">
              <AnimatePresence mode="wait">
                {(!isListening && !isProcessing && !isSpeaking && !answer) ? (
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-extrabold tracking-tight text-slate-900"
                  >
                    How can I help?
                  </motion.h1>
                ) : (
                  <motion.div
                    key="status-text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full relative z-20 flex justify-center"
                  >
                    {/* User Transcript */}
                    {isListening && transcript ? (
                      <p className="text-3xl font-semibold text-slate-800 leading-tight">
                        "{transcript}"
                      </p>
                    ) : isProcessing ? (
                      <p className="text-2xl font-medium text-slate-500 animate-pulse">
                        Thinking...
                      </p>
                    ) : (
                      <div className={`prose prose-slate prose-p:text-slate-800 prose-strong:text-slate-900 prose-ul:text-left prose-li:marker:text-blue-500 max-w-none ${getTextSize(answer.length)} max-h-[50vh] overflow-y-auto scrollbar-hide text-left w-full`}>
                        <ReactMarkdown>{answer}</ReactMarkdown>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Middle Section: The Iridescent Orb */}
            <div className="flex-1 flex items-center justify-center z-10 w-full relative min-h-[300px]">
              <div
                onClick={isListening || isSpeaking || isProcessing ? stopAll : startListening}
                className="relative w-64 h-64 cursor-pointer group"
              >
                {/* CORE ORB */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={getMainOrbAnim(getOrbState())}
                  style={{
                    background: "conic-gradient(from 180deg at 50% 50%, #93c5fd 0deg, #c084fc 120deg, #f472b6 240deg, #93c5fd 360deg)",
                    filter: "blur(20px)",
                  }}
                />

                {/* Glass Overlay (Shine) */}
                <div className="absolute inset-4 rounded-full bg-white/30 backdrop-blur-sm border border-white/40 shadow-inner z-20 mix-blend-overlay" />

                {/* Inner Core */}
                <motion.div
                  className="absolute inset-8 rounded-full bg-gradient-to-tr from-white/80 to-transparent z-10"
                  animate={{ rotate: isProcessing ? -360 : 0 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>

            {/* Bottom Section: Controls & Branding */}
            <div className="z-10 w-full pb-16 px-8 flex flex-col items-center">

              {/* Helper Text */}
              <p className="text-slate-400 text-sm font-medium mb-8 uppercase tracking-widest">
                {isListening ? "Listening..." : isSpeaking ? "Speaking..." : isProcessing ? "Thinking..." : "Tap to Speak"}
              </p>

              {/* Floating Button (Optional/redundant with Orb tap but good for affordance) */}
              <button
                onClick={isListening || isSpeaking || isProcessing ? stopAll : startListening}
                className={`
                  w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg
                  ${(isListening || isSpeaking || isProcessing) ? 'bg-slate-900 text-white hover:scale-105' : 'bg-white text-slate-900 border border-slate-200 hover:border-slate-300'}
                `}
              >
                {(isListening || isSpeaking || isProcessing) ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-6 h-6" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// --- INTRO COMPONENT ---
function IntroView({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="z-50 flex flex-col items-center justify-center h-full w-full max-w-md px-6 text-center space-y-12"
    >

      {/* Stacked Cards Animation */}
      <div className="relative w-64 h-80 flex items-center justify-center">
        {/* Card 1: Back (Calendar) */}
        <motion.div
          initial={{ rotate: -10, y: 0, opacity: 0 }}
          animate={{ rotate: -12, y: 10, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute w-56 h-72 bg-blue-100 rounded-3xl border border-blue-200 shadow-xl flex flex-col items-center justify-center p-4 transform origin-bottom-left"
        >
          <Calendar className="w-16 h-16 text-blue-400 mb-4 opacity-50" />
          <div className="h-2 w-24 bg-blue-300/30 rounded-full mb-2" />
          <div className="h-2 w-16 bg-blue-300/30 rounded-full" />
        </motion.div>

        {/* Card 2: Middle (Map) */}
        <motion.div
          initial={{ rotate: 10, y: 0, opacity: 0 }}
          animate={{ rotate: 12, y: 10, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="absolute w-56 h-72 bg-purple-100 rounded-3xl border border-purple-200 shadow-xl flex flex-col items-center justify-center p-4 transform origin-bottom-right"
        >
          <MapPin className="w-16 h-16 text-purple-400 mb-4 opacity-50" />
          <div className="h-2 w-24 bg-purple-300/30 rounded-full mb-2" />
          <div className="h-2 w-16 bg-purple-300/30 rounded-full" />
        </motion.div>

        {/* Card 3: Front (Main) */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 15, delay: 0.6 }}
          className="absolute w-60 h-80 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl flex flex-col items-start justify-end p-6 border border-slate-700 text-white"
        >
          <div className="mb-auto mt-4 w-full flex justify-end">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 blur-md opacity-80" />
          </div>
          <Sparkles className="w-8 h-8 text-yellow-300 mb-4" />
          <h2 className="text-3xl font-bold leading-tight mb-2 tracking-tight">NS Steward</h2>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">SocietyOS</p>
        </motion.div>
      </div>

      {/* Headings */}
      <div className="space-y-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-4xl font-extrabold tracking-tight text-slate-900"
        >
          Frontier Living,<br />Simplified.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="text-slate-500 text-lg leading-relaxed max-w-xs mx-auto"
        >
          Your daily loop companion. Ask about the gym, cafe hours, or tonight's fireside chat.
        </motion.p>
      </div>

      {/* Button */}
      <div className="flex flex-col items-center space-y-6">
        <motion.button
          onClick={onEnter}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="group relative inline-flex h-14 w-full items-center justify-center overflow-hidden rounded-full bg-slate-900 px-8 font-medium text-white shadow-lg transition-all hover:bg-slate-800"
        >
          <span className="mr-2 text-lg">Enter the Network</span>
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <a href="/roadmap" className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors border-b border-transparent hover:border-slate-300 pb-0.5">
            View Future Features & Roadmap
          </a>
        </motion.div>
      </div>

    </motion.div>
  );
}

// Animation Helpers
function getMainOrbAnim(state: string): TargetAndTransition {
  switch (state) {
    case "listening":
      return {
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0],
        filter: "blur(15px)",
        transition: { repeat: Infinity, duration: 2 }
      };
    case "processing":
      return {
        scale: 1.1,
        rotate: 360,
        filter: "blur(25px)",
        transition: { repeat: Infinity, duration: 1, ease: ("linear" as const) }
      };
    case "speaking":
      return {
        scale: [1, 1.05, 1],
        filter: "blur(20px)",
        transition: { repeat: Infinity, duration: 0.5 }
      };
    default: // idle
      return {
        scale: 1,
        rotate: 0,
        filter: "blur(30px)",
        transition: { duration: 0.5 }
      };
  }
}
