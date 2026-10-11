
import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Mic, MicOff } from "lucide-react";
import { FaceLandmarker, FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import { useNavigate } from "react-router-dom";

const SHOULDER_WIDTH_CM_ESTIMATE = 40;
const MOVEMENT_LIMIT_CM = 3;
const ROTATION_LIMIT_DEGREES = 25;
const CALIBRATION_DURATION_MS = 2000;
const DETECTION_INTERVAL_MS = 200;

function getFaceRotation(matrixData) {
  if (!matrixData || matrixData.length < 11) return null;

  return {
    yaw: Math.atan2(matrixData[4], matrixData[0]),
    pitch: Math.atan2(
      -matrixData[8],
      Math.sqrt(matrixData[0] ** 2 + matrixData[4] ** 2)
    ),
    roll: Math.atan2(matrixData[9], matrixData[10]),
  };
}

function getAngleDifference(angle, baseline) {
  const difference = angle - baseline;
  return Math.atan2(Math.sin(difference), Math.cos(difference));
}

function getBodyPosition(landmarks) {
  const leftShoulder = landmarks?.[11];
  const rightShoulder = landmarks?.[12];
  if (!leftShoulder || !rightShoulder) return null;

  const visibility = Math.min(
    leftShoulder.visibility ?? 1,
    rightShoulder.visibility ?? 1
  );
  const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
  if (visibility < 0.5 || shoulderWidth < 0.01) return null;

  return {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
    shoulderWidth,
  };
}

export default function InterviewInterface() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const warningCountRef = useRef(0);
  const [isStarted, setIsStarted] = useState(false);
  const [hasCameraAccess, setHasCameraAccess] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isRequestingCamera, setIsRequestingCamera] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [motionStatus, setMotionStatus] = useState("");
  const [motionError, setMotionError] = useState("");

  async function requestCameraPermission() {
    setCameraError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Camera access is unavailable. Use HTTPS or localhost in a supported browser."
      );
      return;
    }

    setIsRequestingCamera(true);
    let stream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setHasCameraAccess(true);
      setIsCameraOn(true);
    } catch (error) {
      stream?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraError(
        error.name === "NotAllowedError"
          ? "Camera permission was denied. Allow camera access in your browser settings."
          : "Unable to access the camera. Check that it is connected and not being used by another app."
      );
    } finally {
      setIsRequestingCamera(false);
    }
  }

  function startInterview() {
    if (hasCameraAccess && isCameraOn && streamRef.current) {
      warningCountRef.current = 0;
      setWarningCount(0);
      setMotionError("");
      setMotionStatus("Loading on-device movement detection...");
      setIsStarted(true);
    }
  }

  function toggleCamera() {
    const videoTrack = streamRef.current?.getVideoTracks()[0];
    if (!videoTrack) return;

    videoTrack.enabled = !isCameraOn;
    setIsCameraOn(videoTrack.enabled);
    if (isStarted) {
      setMotionStatus(
        videoTrack.enabled
          ? "Camera is back on. Recalibrating movement detection..."
          : "Movement detection is paused while your camera is off."
      );
    }
  }

  function stopInterview() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsStarted(false);
    setHasCameraAccess(false);
    setIsCameraOn(false);
    setMotionStatus("");
  }

  useEffect(() => {
    if (!isStarted) return undefined;
    if (!isCameraOn) {
      setMotionStatus("Movement detection is paused while your camera is off.");
      return undefined;
    }

    let isCancelled = false;
    let animationFrameId;
    let lastDetectionTime = 0;
    let detectionStartedAt = 0;
    let calibrationStartedAt = 0;
    let calibrationSamples = [];
    let baseline = null;
    let faceLandmarker;
    let poseLandmarker;

    function stopForDetectionFailure(message, error) {
      if (isCancelled) return;
      isCancelled = true;
      console.error("Interview movement detection failed:", error);
      setMotionError(message);
      setMotionStatus("");
      stopInterview();
    }

    function recordWarning(reason) {
      warningCountRef.current += 1;
      const nextCount = warningCountRef.current;
      setWarningCount(nextCount);

      if (nextCount >= 3) {
        setMotionError(
          `Interview ended automatically after 3 movement warnings. Latest: ${reason}`
        );
        setMotionStatus("");
        stopInterview();
        return;
      }

      setMotionStatus(
        `Warning ${nextCount} of 3: ${reason}. Return to your starting position to continue.`
      );
    }

    async function initializeDetection() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0/wasm"
        );
        faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFacialTransformationMatrixes: true,
        });
        if (isCancelled) return;
        poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });
        if (isCancelled) {
          poseLandmarker.close();
          return;
        }
        setMotionStatus(
          "Calibrating. Sit still and face the camera for a moment..."
        );

        function detectFrame(now) {
          if (isCancelled || warningCountRef.current >= 3) return;

          const video = videoRef.current;
          const track = streamRef.current?.getVideoTracks()[0];
          if (
            video?.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
            track?.enabled &&
            now - lastDetectionTime >= DETECTION_INTERVAL_MS
          ) {
            lastDetectionTime = now;
            if (!detectionStartedAt) detectionStartedAt = now;
            try {
              const faceResult = faceLandmarker.detectForVideo(video, now);
              const poseResult = poseLandmarker.detectForVideo(video, now);
              const rotation = getFaceRotation(
                faceResult.facialTransformationMatrixes?.[0]?.data
              );
              const bodyPosition = getBodyPosition(poseResult.landmarks?.[0]);

              if (rotation && bodyPosition) {
                if (!calibrationStartedAt) calibrationStartedAt = now;
                calibrationSamples.push({ rotation, bodyPosition });

                if (!baseline) {
                  if (now - calibrationStartedAt >= CALIBRATION_DURATION_MS) {
                    const count = calibrationSamples.length;
                    baseline = calibrationSamples.reduce(
                      (total, sample) => ({
                        yaw: total.yaw + sample.rotation.yaw / count,
                        pitch: total.pitch + sample.rotation.pitch / count,
                        roll: total.roll + sample.rotation.roll / count,
                        x: total.x + sample.bodyPosition.x / count,
                        y: total.y + sample.bodyPosition.y / count,
                        shoulderWidth:
                          total.shoulderWidth +
                          sample.bodyPosition.shoulderWidth / count,
                      }),
                      {
                        yaw: 0,
                        pitch: 0,
                        roll: 0,
                        x: 0,
                        y: 0,
                        shoulderWidth: 0,
                      }
                    );
                    setMotionStatus(
                      "Movement detection is active. Keep your head and body within the allowed range."
                    );
                  }
                } else {
                  const rotationChanges = {
                    yaw: getAngleDifference(rotation.yaw, baseline.yaw),
                    pitch: getAngleDifference(rotation.pitch, baseline.pitch),
                    roll: getAngleDifference(rotation.roll, baseline.roll),
                  };
                  const exceededRotations = Object.entries(
                    rotationChanges
                  ).filter(
                    ([, angle]) =>
                      Math.abs((angle * 180) / Math.PI) >
                      ROTATION_LIMIT_DEGREES
                  );
                  const horizontalCm =
                    ((bodyPosition.x - baseline.x) *
                      SHOULDER_WIDTH_CM_ESTIMATE) /
                    baseline.shoulderWidth;
                  const verticalCm =
                    ((bodyPosition.y - baseline.y) *
                      SHOULDER_WIDTH_CM_ESTIMATE) /
                    baseline.shoulderWidth;
                  const depthCm =
                    SHOULDER_WIDTH_CM_ESTIMATE *
                    (baseline.shoulderWidth / bodyPosition.shoulderWidth - 1);
                  const movementExceeded = [
                    horizontalCm,
                    verticalCm,
                    depthCm,
                  ].some((distance) => Math.abs(distance) > MOVEMENT_LIMIT_CM);

                  if (exceededRotations.length || movementExceeded) {
                    const reasons = [];

                    if (exceededRotations.length) {
                      exceededRotations.forEach(([axis]) => {
                        baseline[axis] = rotation[axis];
                      });
                      reasons.push(
                        `head rotation exceeded ${ROTATION_LIMIT_DEGREES}°`
                      );
                    }

                    if (movementExceeded) {
                      baseline.x = bodyPosition.x;
                      baseline.y = bodyPosition.y;
                      baseline.shoulderWidth = bodyPosition.shoulderWidth;
                      reasons.push(
                        `estimated body movement exceeded ${MOVEMENT_LIMIT_CM} cm`
                      );
                    }

                    recordWarning(
                      `${reasons.join(" and ")};`
                    );
                  } else {
                    setMotionStatus(
                      `Movement detection is active. ${warningCountRef.current} of 3 warnings used.`
                    );
                  }
                }
              } else if (baseline) {
                setMotionStatus(
                  "Keep your face and shoulders visible to continue movement detection."
                );
              } else if (
                detectionStartedAt &&
                now - detectionStartedAt > 15000
              ) {
                stopForDetectionFailure(
                  "Could not detect your face and shoulders to calibrate movement. The interview was ended.",
                  new Error("Face and shoulder landmarks were not detected.")
                );
                return;
              }
            } catch (error) {
              stopForDetectionFailure(
                "Movement detection stopped working, so the interview was ended.",
                error
              );
              return;
            }
          }

          if (isCancelled || warningCountRef.current >= 3) return;
          animationFrameId = window.requestAnimationFrame(detectFrame);
        }

        animationFrameId = window.requestAnimationFrame(detectFrame);
      } catch (error) {
        stopForDetectionFailure(
          "Movement detection could not start, so the interview was ended.",
          error
        );
      }
    }

    initializeDetection();

    return () => {
      isCancelled = true;
      window.cancelAnimationFrame(animationFrameId);
      faceLandmarker?.close();
      poseLandmarker?.close();
    };
  }, [isCameraOn, isStarted]);

  function sendMessage(event) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || isSending) return;

    setMessages((previous) => [
      ...previous,
      {
        id: `${Date.now()}-${previous.length}`,
        text: trimmedMessage,
        sender: "You",
      },
    ]);

    setMessage("");
    setIsSending(false);
  }

  function toggleVoiceInput() {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError("Voice input is not supported in this browser.");
      return;
    }

    setVoiceError("");
    const recognition = new SpeechRecognition();
    recognition.lang = navigator.language || "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .slice(event.resultIndex)
        .filter((result) => result.isFinal)
        .map((result) => result[0].transcript.trim())
        .filter(Boolean)
        .join(" ");

      if (transcript) {
        setMessage((previous) =>
          [previous.trim(), transcript].filter(Boolean).join(" ")
        );
      }
    };
    recognition.onerror = (event) => {
      const errors = {
        "not-allowed": "Microphone permission was denied.",
        "service-not-allowed": "Speech recognition is blocked by the browser.",
        "no-speech": "No speech was detected. Try again.",
        "audio-capture": "No microphone is available.",
        network: "Voice input failed because of a network error.",
      };
      setVoiceError(
        errors[event.error] || "Voice input could not be completed."
      );
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
      setVoiceError("Unable to start voice input. Please try again.");
    }
  }

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    function endInterviewOnTabChange() {
      if (!document.hidden) return;

      recognitionRef.current?.abort();
      recognitionRef.current = null;
      setIsListening(false);

      if (isStarted) {
        stopInterview();
        setMotionError(
          "The interview ended automatically because you switched browser tabs."
        );
      }
    }

    document.addEventListener("visibilitychange", endInterviewOnTabChange);
    return () =>
      document.removeEventListener("visibilitychange", endInterviewOnTabChange);
  }, [isStarted]);

  return (
    <main className="interview-interface">
      <header className="ii-header">
        <div className="ii-header-main">
          <button
            type="button"
            className="ii-back-button"
            onClick={() => navigate("/dashboard")}
            aria-label="Return to user dashboard"
            title="Return to dashboard"
          >
            <ArrowLeft size={19} />
          </button>
          <div>
            <p className="ii-eyebrow">PREPX INTERVIEW PRACTICE</p>
            <p className="ii-subtitle">
              Your interview workspace. Get comfortable and start when you are ready.
            </p>
          </div>
        </div>

        <div className={`ii-status ${isStarted ? "ii-status-live" : ""}`}>
          <span className="ii-status-dot" />
          {isStarted ? "Interview Started" : "Not Started"}
        </div>
      </header>

      <section className="ii-workspace">
        <div className="ii-main-panels">
          {/* Camera panel: the only panel that accesses the camera */}
          <section className="ii-panel">
            <div className="ii-panel-heading">
              <h2>Camera</h2>
              <span className="ii-panel-label">
                {hasCameraAccess && isCameraOn ? "Camera On" : "Camera Off"}
              </span>
            </div>

            <div className="ii-camera-screen">
              <video
                ref={videoRef}
                className={`ii-video ${
                  hasCameraAccess && isCameraOn ? "ii-video-visible" : ""
                }`}
                autoPlay
                muted
                playsInline
              />

              {(!hasCameraAccess || !isCameraOn) && (
                <div className="ii-camera-placeholder">
                  <div className="ii-camera-icon">◉</div>
                  <h3>
                    {hasCameraAccess ? "Camera is off" : "Your camera preview"}
                  </h3>
                  <p>
                    {hasCameraAccess
                      ? "Turn the camera on to show your preview."
                      : "Allow camera access to preview your camera before starting."}
                  </p>
                </div>
              )}
            </div>

            <div className="ii-camera-controls">
              <button
                type="button"
                className="ii-camera-toggle"
                onClick={toggleCamera}
                disabled={!hasCameraAccess}
                aria-pressed={isCameraOn}
              >
                Camera {isCameraOn ? "On" : "Off"}
              </button>
            </div>

            {cameraError && (
              <p className="ii-error" role="alert">
                {cameraError}
              </p>
            )}

            <p className="ii-panel-description">
              {isStarted
                ? isCameraOn
                  ? "Your camera is active for this session."
                  : "Your camera is off for this session."
                : hasCameraAccess
                  ? "Camera access is ready. Start when you are comfortable."
                  : "Allow camera access before starting your interview."}
            </p>
            {(motionStatus || motionError) && (
              <div
                className={`ii-motion-status ${motionError ? "is-error" : ""}`}
                role={motionError || motionStatus.startsWith("Warning")
                  ? "alert"
                  : "status"}
              >
                <strong>Movement warnings: {warningCount}/3</strong>
                <span>{motionError || motionStatus}</span>
              </div>
            )}
            
          </section>

          {/* Blank panel: deliberately has no camera or media access */}
          <section className="ii-panel">
            <div className="ii-panel-heading">
              <h2>Workspace</h2>
            </div>

            <div className="ii-blank-screen">
              <div className="ii-blank-placeholder">
                <div className="ii-blank-icon">▢</div>
                <h3>Workspace Panel</h3>
              </div>
            </div>

            <p className="ii-panel-description">
              Your AI Interview Assistant will appear here after you start the interview. 
            </p>
          </section>
        </div>

        <aside className="ii-chat-panel">
          <div className="ii-chat-heading">
            <div>
              <h2>Interview Chat</h2>
            </div>
            <span className="ii-chat-icon">✉</span>
          </div>

          <div className="ii-chat-messages" aria-live="polite">
            {messages.length === 0 ? (
              <div className="ii-chat-empty">
                <div className="ii-chat-empty-icon">▤</div>
                <h3>Your conversation starts here</h3>
                <p>
                  Your messages will appear here.
                </p>
              </div>
            ) : (
              messages.map((item) => (
                <div className="ii-message" key={item.id}>
                  <span className="ii-message-sender">{item.sender}</span>
                  <p>{item.text}</p>
                </div>
              ))
            )}
          </div>

          {(isListening || voiceError) && (
            <p
              className={`ii-voice-status ${voiceError ? "ii-error" : ""}`}
              role={voiceError ? "alert" : "status"}
            >
              {voiceError || "Listening... Speak to add text to your message."}
            </p>
          )}

          <form className="ii-chat-form" onSubmit={sendMessage}>
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onPaste={(event) => event.preventDefault()}
              placeholder="Type your message..."
              aria-label="Type your message"
            />
            <button
              type="button"
              className={`ii-voice-button ${isListening ? "is-listening" : ""}`}
              onClick={toggleVoiceInput}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
              aria-pressed={isListening}
              title={isListening ? "Stop voice input" : "Start voice input"}
            >
              {isListening ? <Mic size={17} /> : <MicOff size={17} />}
            </button>
            <button type="submit" disabled={!message.trim() || isSending}>
              Send
            </button>
          </form>
        </aside>
      </section>

      <footer className="ii-footer">
        <div className="ii-actions">
          {!hasCameraAccess && !isStarted && (
            <button
              type="button"
              className="ii-start-button"
              onClick={requestCameraPermission}
              disabled={isRequestingCamera}
            >
              {isRequestingCamera ? "Requesting Camera..." : "Allow Camera"}
            </button>
          )}

          {isStarted && (
            <button
              type="button"
              className="ii-stop-button"
              onClick={stopInterview}
            >
              Stop Interview
            </button>
          )}

          <button
            type="button"
            className="ii-start-button"
            onClick={isStarted ? stopInterview : startInterview}
            disabled={!isStarted && (!hasCameraAccess || !isCameraOn)}
          >
            {isStarted ? "End Interview" : "Start Interview"}
            <span aria-hidden="true"> →</span>
          </button>
        </div>
      </footer>
    </main>
  );
}