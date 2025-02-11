import { supabase } from "./supabase";

export class WebRTCConnection {
  private peerConnection: RTCPeerConnection;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private emergencyId: string;

  constructor(emergencyId: string) {
    this.emergencyId = emergencyId;
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage({
          type: "ice-candidate",
          data: event.candidate,
        });
      }
    };

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
    };

    // Listen for signaling messages
    this.setupSignalingListener();
  }

  private async setupSignalingListener() {
    supabase
      .channel(`webrtc-${this.emergencyId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "webrtc_signaling",
          filter: `emergency_id=eq.${this.emergencyId}`,
        },
        async (payload) => {
          const { type, data } = payload.new;

          switch (type) {
            case "offer":
              await this.handleOffer(data);
              break;
            case "answer":
              await this.handleAnswer(data);
              break;
            case "ice-candidate":
              await this.handleIceCandidate(data);
              break;
          }
        },
      )
      .subscribe();
  }

  private async sendSignalingMessage(message: { type: string; data: any }) {
    await supabase.from("webrtc_signaling").insert({
      emergency_id: this.emergencyId,
      type: message.type,
      data: message.data,
    });
  }

  private async handleOffer(offer: RTCSessionDescriptionInit) {
    await this.peerConnection.setRemoteDescription(
      new RTCSessionDescription(offer),
    );
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    await this.sendSignalingMessage({
      type: "answer",
      data: answer,
    });
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit) {
    await this.peerConnection.setRemoteDescription(
      new RTCSessionDescription(answer),
    );
  }

  private async handleIceCandidate(candidate: RTCIceCandidateInit) {
    await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  async startCall(isInitiator: boolean) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream!);
      });

      if (isInitiator) {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        await this.sendSignalingMessage({
          type: "offer",
          data: offer,
        });
      }

      return this.localStream;
    } catch (error) {
      console.error("Error starting call:", error);
      throw error;
    }
  }

  async stopCall() {
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection.close();
  }

  getRemoteStream() {
    return this.remoteStream;
  }
}
