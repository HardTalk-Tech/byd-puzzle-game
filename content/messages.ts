/**
 * All on-screen text lives here so it can be edited in one place.
 * Keep it short, fun and easy to understand for kids and adults.
 */
export const messages = {
  start: {
    title: "Build Your Dreams",
    subtitle: "Swap the tiles. Rebuild the car. Beat the clock!",
    steps: ["Swipe a tile", "Rebuild the car", "Beat 2 minutes"],
    cta: "Tap to play",
  },
  register: {
    heading: "Let's get you on the grid!",
    nameLabel: "Your name",
    phoneLabel: "Phone number",
    start: "Start game",
    errors: {
      nameRequired: "Please type your name to start!",
      phoneLength: "Phone numbers need 10 digits. Please check yours!",
    },
  },
  reveal: { intro: "Your car is…", go: "GO!" },
  game: {
    targetLabel: "Your car",
    targetHint: "Match this picture",
    hint: "Swipe a tile to swap it with its neighbour",
    tips: [
      "Tip: gold edges mean the tile is in the right place!",
      "Tip: hold the small picture to see it bigger.",
      "Tip: start with the corners!",
    ],
    /** Always visible during play. Keep it 3–4 words. */
    prizeHint: "Fewer moves, bigger prize!",
  },
  /** Win popup place badge: "{place}" becomes 1st, 2nd … */
  place: {
    badge: "{place} place",
    /** Short cheer under the badge, by place (1st … 5th). */
    cheers: ["Champion!", "Superstar!", "On the podium!", "Great drive!", "Nice driving!"],
  },
  perfect: { title: "Perfect drive!", body: "16 moves – the best score possible! You're a true BYD master!" },
  completed: { title: "You did it!", body: "Car rebuilt! Great driving!", best: "Best possible: 16 moves" },
  timeUp: { title: "Time's up!", body: "So close – the BYD was almost ready! Thanks for playing!" },
  duplicate: [
    { title: "Whoa, slow down, racer!", body: "This number has already taken the wheel. Let someone else drive!" },
    { title: "Battery already used!", body: "This number has had its turn. Thanks for playing!" },
    { title: "Nice try!", body: "This number already played. One drive per number!" },
    { title: "Déjà vu!", body: "We've seen this number before. Give a friend a turn!" },
  ],
  ok: "OK",

  // ---- Small labels used across the kiosk ----
  labels: {
    time: "Time",
    moves: "Moves",
    best: "Best",
    space: "Space",
    next: "Next",
    clear: "Clear",
    backspace: "Delete",
  },
  errorScreen: { title: "Restarting…", body: "One moment, we're getting the car ready again." },
  notFound: { title: "Wrong turn!", body: "This page doesn't exist.", back: "Back to the game" },

  // ---- Hidden status panel (staff only) ----
  status: {
    title: "Kiosk status",
    online: "Online",
    offlineReady: "Offline-ready",
    firebaseConfigured: "Firebase configured",
    signedIn: "Kiosk signed in",
    pendingWrites: "Unsynced writes",
    kioskId: "Kiosk ID",
    version: "App version",
    yes: "Yes",
    no: "No",
    checking: "Checking…",
    close: "Close",
    reload: "Reload app",
  },

  // ---- Staff dashboard ----
  staff: {
    title: "BYD Puzzle – Staff",
    localBanner: "Firebase is not configured – showing local test data",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in…",
    signOut: "Sign out",
    signInFailed: "Sign-in failed. Check the email and password.",
    notAllowed: "This account is not allowed",
    loading: "Loading…",
    search: "Search name or phone",
    filters: { all: "All", completed: "Completed", perfect: "Perfect", timeout: "Time up" },
    stats: {
      total: "Total players",
      completed: "Completed",
      perfect: "Perfect (16 moves)",
      timeUps: "Time-ups",
      averageMoves: "Average moves",
      fastest: "Fastest completion",
    },
    columns: {
      date: "Date & time",
      name: "Name",
      phone: "Phone",
      model: "Car model",
      status: "Status",
      moves: "Moves",
      time: "Time",
      perfect: "Perfect",
    },
    statusNames: { playing: "Playing", completed: "Completed", timeout: "Time up" },
    perfectBadge: "PERFECT",
    exportCsv: "Export CSV",
    empty: "No players yet.",
    noMatches: "No players match this search.",
    reset: {
      button: "Reset player data",
      title: "Reset player data?",
      body: "This permanently deletes all {count} players and their results. Every phone number will be able to play again. This can't be undone.",
      exportFirst: "Keep a copy first",
      typeToConfirm: "Type RESET to confirm",
      confirmWord: "RESET",
      confirm: "Delete all",
      cancel: "Cancel",
      working: "Deleting…",
      done: "Done – {count} players deleted.",
      failed: "Reset failed.",
      permissionDenied: "Permission denied. Publish the updated firestore.rules (staff may delete players) and try again.",
    },
  },
};

export type DuplicateMessage = (typeof messages.duplicate)[number];
