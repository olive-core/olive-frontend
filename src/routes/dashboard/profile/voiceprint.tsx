import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PlayIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/dashboard/profile/voiceprint")({
  component: RouteComponent,
});

function RouteComponent() {
  const { clinician, userId } = useAuthStore();
  const navigate = useNavigate();

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
  };

  const handleProceed = async () => {
    if (!audioBlob) return;

    try {
      setIsSubmitting(true);

      if (!userId) {
        throw new Error("User Id not found");
      }

      const formData = new FormData();
      formData.append("file", audioBlob, "voiceprint.webm");
      formData.append("user_id", userId);

      await api.post("/voiceprints/", formData);
      navigate({ to: "/dashboard" })
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };


  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);


  return (
    <div className="flex justify-center items-start min-h-screen bg-slate-50 pt-32">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-sm border border-slate-200 p-8 relative">


        <h3 className="text-2xl font-semibold text-slate-800 mb-2">
          👋 Hi, Doctor {clinician?.lastName}
        </h3>

        <p className="text-slate-600 mb-6">
          I need to learn about your voice to be a better assistant.
          Please press the record button and read the text aloud.
        </p>

        {!isRecording && !audioBlob && (
          <div className="flex justify-center items-center mt-6 bg-emerald-100 rounded-lg min-h-40 p-8">
            <button className="text-white bg-emerald-500 rounded-full p-4 cursor-pointer" onClick={handleStartRecording}>
              <PlayIcon className="size-8" />
            </button>
          </div>
        )}

        {isRecording && (
          <div className="mt-8">
            <p className="p-5 bg-slate-100 rounded-xl text-slate-700 text-lg leading-relaxed">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam iste
              odit tenetur dolorum dolor possimus, corporis voluptatum.
            </p>

            <div className="flex justify-center mt-6">
              <Button
                onClick={handleStopRecording}
              >
                Done
              </Button>
            </div>
          </div>
        )}

        {audioBlob && !isRecording && (
          <div className="mt-8 space-y-4">
            <audio
              controls
              src={URL.createObjectURL(audioBlob)}
              className="w-full"
            />

            <Button
              onClick={handleProceed}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Proceed"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
