"use client";

interface SecureVideoViewerProps {
  fileId: string;
  fileName: string;
  token: string;
}

export default function SecureVideoViewer({
  fileId,
  fileName,
  token,
}: SecureVideoViewerProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <video
        controls
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        className="w-full rounded-lg"
        style={{
          pointerEvents: "auto",
        }}
      >
        <source
          src={`/api/public/view?fileId=${fileId}&token=${token}`}
          type="video/mp4"
        />
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>

      {/* Watermark overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent, transparent 200px, rgba(255,255,255,0.02) 200px, rgba(255,255,255,0.02) 400px)",
          zIndex: 10,
        }}
      />
    </div>
  );
}
