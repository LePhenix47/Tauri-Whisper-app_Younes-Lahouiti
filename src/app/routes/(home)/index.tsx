import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, CardBody, Chip } from "@heroui/react";
import {
  IoDownloadOutline,
  IoMicOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import env from "@env";
import { useModelsDir } from "@app/hooks/useModels";

function HomePage() {
  const navigate = useNavigate();
  const { data: modelsDir } = useModelsDir();

  return (
    <div className="home-page">
      {/* Welcome Section */}
      <section className="home-page__welcome">
        <h1 className="home-page__title">Welcome to Tauri Whisper</h1>
        <p className="home-page__subtitle">
          Transform your audio and video files into accurate transcriptions
          using OpenAI's Whisper AI — all processed locally on your machine.
        </p>
      </section>

      {/* Quick Action Cards */}
      <section className="home-page__actions">
        <h2 className="home-page__section-title">Quick Actions</h2>
        <div className="home-page__cards-grid">
          {/* Download Models Card */}
          <Card
            className="home-page__card"
            isPressable
            isHoverable
            onPress={() => navigate({ to: "/models" })}
          >
            <CardBody>
              <div className="home-page__card-icon home-page__card-icon--primary">
                <IoDownloadOutline size={32} />
              </div>
              <h3 className="home-page__card-title">Download Models</h3>
              <p className="home-page__card-description">
                Download and manage Whisper AI models for offline transcription
              </p>
            </CardBody>
          </Card>

          {/* Transcribe Audio Card */}
          <Card
            className="home-page__card"
            isPressable
            isHoverable
            onPress={() => navigate({ to: "/transcribe" })}
          >
            <CardBody>
              <div className="home-page__card-icon home-page__card-icon--success">
                <IoMicOutline size={32} />
              </div>
              <h3 className="home-page__card-title">Transcribe Audio</h3>
              <p className="home-page__card-description">
                Upload audio or video files and generate accurate subtitles
              </p>
            </CardBody>
          </Card>

          {/* Settings Card */}
          <Card
            className="home-page__card"
            isPressable
            isHoverable
            onPress={() => navigate({ to: "/settings" })}
          >
            <CardBody>
              <div className="home-page__card-icon home-page__card-icon--secondary">
                <IoSettingsOutline size={32} />
              </div>
              <h3 className="home-page__card-title">Settings</h3>
              <p className="home-page__card-description">
                Configure app preferences and manage your workspace
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* System Info */}
      <section className="home-page__system-info">
        <h2 className="home-page__section-title">System Information</h2>
        <div className="home-page__info-grid">
          <div className="home-page__info-item">
            <span className="home-page__info-label">Environment:</span>
            <Chip size="sm" variant="flat" color="primary">
              {env.REACT_APP_NODE_ENV}
            </Chip>
          </div>
          {modelsDir && (
            <div className="home-page__info-item">
              <span className="home-page__info-label">Models Directory:</span>
              <span className="home-page__info-value" title={modelsDir}>
                {modelsDir}
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export const Route = createFileRoute("/(home)/")({
  component: HomePage,
});
