"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { GameScreen } from "@/components/kiosk/GameScreen";
import { KioskShell } from "@/components/kiosk/KioskShell";
import { RegisterScreen, type Registration } from "@/components/kiosk/RegisterScreen";
import { RevealScreen } from "@/components/kiosk/RevealScreen";
import { StartScreen } from "@/components/kiosk/StartScreen";
import { CompletedModal } from "@/components/modals/CompletedModal";
import { DuplicateModal } from "@/components/modals/DuplicateModal";
import { PerfectModal } from "@/components/modals/PerfectModal";
import { TimeUpModal } from "@/components/modals/TimeUpModal";
import type { Car } from "@/config/cars";
import { gameConfig, KIOSK_ID, uiConfig } from "@/config/game";
import { messages, type DuplicateMessage } from "@/content/messages";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { loadCarImage } from "@/lib/puzzle/carImage";
import { createPlayerRepository, type PlayerRepository } from "@/lib/players/repository";
import { createCarBag, createScramblePicker } from "@/lib/puzzle/picker";
import type { RoundResult, Scramble } from "@/lib/types";
import { withTimeout } from "@/lib/utils/withTimeout";

// ------------------------------------------------------------ state machine

type Screen = "start" | "register" | "reveal" | "playing";

interface Session {
  roundId: number;
  name: string;
  phone: string;
  car: Car;
  image: string;
  scramble: Scramble;
}

interface KioskState {
  screen: Screen;
  session: Session | null;
  /** Result popup over the game screen. */
  result: RoundResult | null;
  /** Duplicate-number popup over the registration screen. */
  duplicate: DuplicateMessage | null;
  /** "Has this number played?" check running. */
  checking: boolean;
  /** Changing it remounts the registration form (empty fields). */
  formKey: number;
}

type KioskAction =
  | { type: "OPEN_REGISTER" }
  | { type: "GO_START" }
  | { type: "CHECKING" }
  | { type: "DUPLICATE"; message: DuplicateMessage }
  | { type: "CLOSE_DUPLICATE" }
  | { type: "REGISTERED"; session: Session }
  | { type: "REVEAL_DONE" }
  | { type: "FINISHED"; result: RoundResult }
  | { type: "NEXT_PLAYER" };

const initialState: KioskState = {
  screen: "start",
  session: null,
  result: null,
  duplicate: null,
  checking: false,
  formKey: 0,
};

function kioskReducer(state: KioskState, action: KioskAction): KioskState {
  switch (action.type) {
    case "OPEN_REGISTER":
      return state.screen === "start" ? { ...state, screen: "register", formKey: state.formKey + 1 } : state;
    case "GO_START":
      return { ...initialState, formKey: state.formKey + 1 };
    case "CHECKING":
      return state.screen === "register" ? { ...state, checking: true } : state;
    case "DUPLICATE":
      return state.screen === "register" ? { ...state, checking: false, duplicate: action.message } : state;
    case "CLOSE_DUPLICATE":
      return { ...state, duplicate: null, formKey: state.formKey + 1 };
    case "REGISTERED":
      return state.screen === "register" && state.checking
        ? { ...state, checking: false, screen: "reveal", session: action.session }
        : state;
    case "REVEAL_DONE":
      return state.screen === "reveal" ? { ...state, screen: "playing" } : state;
    case "FINISHED":
      return state.screen === "playing" && !state.result ? { ...state, result: action.result } : state;
    case "NEXT_PLAYER":
      return { ...state, screen: "register", session: null, result: null, formKey: state.formKey + 1 };
  }
}

const randomDuplicateMessage = () => messages.duplicate[Math.floor(Math.random() * messages.duplicate.length)];

// ---------------------------------------------------------------- component

export function KioskApp() {
  const [state, dispatch] = useReducer(kioskReducer, initialState);
  const [carBag] = useState(() => createCarBag());
  const [scramblePicker] = useState(() => createScramblePicker());
  const roundCounter = useRef(0);
  // Created in the browser only (Firestore's offline cache needs IndexedDB).
  const repoRef = useRef<PlayerRepository | null>(null);
  const repo = useCallback(() => (repoRef.current ??= createPlayerRepository()), []);

  const { screen, session, result, duplicate } = state;
  // Current screen for async handlers (the number check can take up to ~3 s).
  const screenRef = useRef(screen);
  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  // Start the data layer (and the kiosk's anonymous sign-in) right away.
  useEffect(() => {
    repo();
  }, [repo]);

  // Preload the car the next player will get while they type.
  useEffect(() => {
    if (screen === "register") void loadCarImage(carBag.peek());
  }, [screen, carBag]);

  // Idle: registration → start screen; result popup → start screen.
  useIdleTimeout(screen === "register", gameConfig.registerIdleSeconds, () => dispatch({ type: "GO_START" }));
  useIdleTimeout(result !== null, gameConfig.resultIdleSeconds, () => dispatch({ type: "GO_START" }));

  const handleRegister = async ({ name, phone }: Registration) => {
    dispatch({ type: "CHECKING" });
    // At most ~3 s (falls back to the offline cache, see section 10.4).
    const played = await repo().hasPlayed(phone);
    if (screenRef.current !== "register") return; // went idle meanwhile
    if (played) {
      dispatch({ type: "DUPLICATE", message: randomDuplicateMessage() });
      return;
    }
    // Car and scramble are picked at registration and saved with the player.
    const car = carBag.deal();
    const scramble = scramblePicker.pick();
    repo().registerPlayer({
      name,
      phone,
      kioskId: KIOSK_ID,
      modelSlug: car.slug,
      modelName: car.name,
      scrambleId: scramble.id,
      clientCreatedAt: new Date().toISOString(),
    });
    const image = await withTimeout(loadCarImage(car), uiConfig.imageWaitMs).catch(() => car.image);
    roundCounter.current += 1;
    dispatch({ type: "REGISTERED", session: { roundId: roundCounter.current, name, phone, car, image, scramble } });
  };

  const handleRevealDone = useCallback(() => dispatch({ type: "REVEAL_DONE" }), []);

  const handleFinish = useCallback(
    (roundResult: RoundResult) => {
      if (session) {
        repo().saveResult(session.phone, {
          status: roundResult.outcome === "timeout" ? "timeout" : "completed",
          moves: roundResult.moves,
          timeMs: roundResult.timeMs,
          perfect: roundResult.outcome === "perfect",
          clientFinishedAt: new Date().toISOString(),
        });
      }
      dispatch({ type: "FINISHED", result: roundResult });
    },
    [repo, session],
  );

  const nextPlayer = () => dispatch({ type: "NEXT_PLAYER" });
  const getPendingWrites = useCallback(() => repo().pendingWrites(), [repo]);
  const inRound = screen === "reveal" || screen === "playing";
  const groupKey = inRound && session ? `round-${session.roundId}` : screen;

  return (
    <KioskShell fxIntensity={inRound ? "light" : "full"} getPendingWrites={getPendingWrites}>
      <AnimatePresence mode="wait">
        <motion.div
          key={groupKey}
          className="absolute inset-0"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: uiConfig.screenTransitionMs / 1000, ease: [0.22, 1, 0.36, 1] }}
        >
          {screen === "start" && <StartScreen onStart={() => dispatch({ type: "OPEN_REGISTER" })} />}
          {screen === "register" && (
            <RegisterScreen key={state.formKey} checking={state.checking} onSubmit={(r) => void handleRegister(r)} />
          )}
          {screen === "reveal" && session && (
            <RevealScreen car={session.car} image={session.image} scramble={session.scramble} onDone={handleRevealDone} />
          )}
          {screen === "playing" && session && (
            <GameScreen car={session.car} image={session.image} scramble={session.scramble} onFinish={handleFinish} />
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {duplicate && screen === "register" && (
          <DuplicateModal key="duplicate" message={duplicate} onOk={() => dispatch({ type: "CLOSE_DUPLICATE" })} />
        )}
        {result?.outcome === "perfect" && (
          <PerfectModal key="perfect" moves={result.moves} timeMs={result.timeMs} onOk={nextPlayer} />
        )}
        {result?.outcome === "completed" && (
          <CompletedModal key="completed" moves={result.moves} timeMs={result.timeMs} onOk={nextPlayer} />
        )}
        {result?.outcome === "timeout" && <TimeUpModal key="timeup" moves={result.moves} onOk={nextPlayer} />}
      </AnimatePresence>
    </KioskShell>
  );
}
