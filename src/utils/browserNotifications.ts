// Utility for Admin Browser Web Notifications & Audio Alerts

class AdminBrowserNotificationManager {
  private audioCtx: AudioContext | null = null;
  private lastNotifiedIds = new Set<string | number>();

  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "denied";
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.warn("Failed to request notification permission:", e);
      return "denied";
    }
  }

  getPermissionStatus(): NotificationPermission {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "denied";
    }
    return Notification.permission;
  }

  // Plays an admin alert chime using Web Audio API
  playAlertSound(type: "urgent" | "info" = "info") {
    if (typeof window === "undefined") return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      if (type === "urgent") {
        // Double pulse alert chime
        const notes = [440, 880]; // A4, A5
        notes.forEach((freq, idx) => {
          if (!this.audioCtx) return;
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.14);

          gain.gain.setValueAtTime(0, now + idx * 0.14);
          gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.14 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.35);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start(now + idx * 0.14);
          osc.stop(now + idx * 0.14 + 0.4);
        });
      } else {
        // Pleasant info chime
        const notes = [523.25, 659.25]; // C5, E5
        notes.forEach((freq, idx) => {
          if (!this.audioCtx) return;
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.28);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.3);
        });
      }
    } catch (err) {
      console.warn("Admin audio alert failed to play:", err);
    }
  }

  showNotification(
    title: string,
    options?: {
      body?: string;
      id?: string | number;
      sound?: boolean;
      soundType?: "urgent" | "info";
      url?: string;
      tag?: string;
    }
  ) {
    if (typeof window === "undefined") return;

    if (options?.id) {
      if (this.lastNotifiedIds.has(options.id)) {
        return;
      }
      this.lastNotifiedIds.add(options.id);
      if (this.lastNotifiedIds.size > 200) {
        const first = this.lastNotifiedIds.values().next().value;
        if (first !== undefined) {
          this.lastNotifiedIds.delete(first);
        }
      }
    }

    if (options?.sound !== false) {
      this.playAlertSound(options?.soundType || "info");
    }

    if ("Notification" in window && Notification.permission === "granted") {
      try {
        const notification = new Notification(title, {
          body: options?.body || "MediFind Admin Alert",
          icon: "/favicon.ico",
          tag: options?.tag || (options?.id ? String(options.id) : undefined),
        });

        if (options?.url) {
          notification.onclick = () => {
            window.focus();
            window.location.href = options.url!;
          };
        }
      } catch (e) {
        console.warn("Failed to create admin browser notification:", e);
      }
    }
  }
}

export const adminBrowserNotifications = new AdminBrowserNotificationManager();
