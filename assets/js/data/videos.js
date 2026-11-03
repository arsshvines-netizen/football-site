// =========================================================
// data/videos.js: THE ONE PLACE to add training videos.
//
// How to add a video:
//   1. Save the video in assets/video/ (for example
//      assets/video/drills/gk-01.mp4). Use MP4, keep it short
//      (under 1 minute) and small (under about 10 MB).
//   2. Type the file name between the quotes below, e.g.
//        "gk-01": "drills/gk-01.mp4",
//   3. That's it. The video appears in the drill popup, the
//      warm-up and the programme sessions automatically.
//
// Empty quotes ("") = no video yet, so nothing is shown.
// The Creator Studio page lists which videos are still missing.
//
// Safety: only film yourself or players whose parents have
// agreed. No music you don't have the rights to.
// =========================================================

export const VIDEO_FOLDER = "assets/video/";

// One video per drill (the key is the drill id from data/drills.js)
export const DRILL_VIDEOS = {
  "gk-01": "",     // Ready Position and Catch
  "gk-04": "",     // Side-Step and Set
  "gk-06": "",     // Back-Pass and Play Out
  "gk-07": "",     // Crosses: Claim or Punch
  "gk-08": "",     // 1v1: Narrow the Angle
  "def-01": "",    // Jockey Mirror
  "def-02": "",    // Pass and Move Out from the Back
  "def-03": "",    // Shadow Defending Channel
  "def-06": "",    // Long Pass Switch
  "def-07": "",    // 2v1 Recovery Defending
  "mid-01": "",    // Triangle Passing
  "mid-02": "",    // Open Body Receiving
  "mid-04": "",    // Scan and Turn
  "mid-05": "",    // 4v1 Rondo
  "mid-08": "",    // 5v2 Rondo Under Pressure
  "wing-01": "",   // Cone Dribble to Cross
  "wing-02": "",   // Inside and Outside Foot Slalom
  "wing-04": "",   // 1v1: Beat the Full-Back
  "wing-06": "",   // Overlap Combination
  "wing-08": "",   // Wide 2v1 Final Ball
  "str-01": "",    // Placement Finishing
  "str-03": "",    // First Touch Away from the Cone
  "str-06": "",    // One-Touch Finishing
  "str-07": "",    // Beat the Defender and Finish
  "str-08": "",    // Run in Behind

  // PLUS drills
  "gk-02": "",   // Scoop and Smother Ground Balls
  "gk-05": "",   // Low Dive from Kneeling
  "def-04": "",  // 1v1 Channel to End Line
  "def-08": "",  // Defend the Box vs Low Crosses
  "mid-06": "",  // Pass, Spin and Support
  "mid-07": "",  // Third-Man Run
  "wing-03": "",  // Cross to a Target Zone
  "wing-07": "",  // Speed Dribble Race
  "str-02": "",  // Lay-Off and Shoot
  "str-05": "",  // Near-Post Runs
};

// The whole warm-up in one video (shown above the warm-up list)
export const WARM_UP_FULL_VIDEO = "";

// Optional: one short clip per warm-up move (names must match data/fitness.js)
export const WARM_UP_VIDEOS = {
  "Easy jog": "",
  "Leg swings (forward and back)": "",
  "Leg swings (side to side)": "",
  "High knees": "",
  "Heel flicks": "",
  "Walking lunges": "",
  "Side shuffles": "",
  "Open and close the gate": "",
  "Arm circles": "",
  "Quick feet": "",
  "Toe taps on the ball": "",
  "Build-up runs": "",
};

// Returns the full path of a video, or "" if there isn't one yet
export function videoPath(file) {
  return file ? VIDEO_FOLDER + file : "";
}
