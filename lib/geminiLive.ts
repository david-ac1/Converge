/**
 * Gemini Live API Client
 * 
 * Handles real-time bidirectional audio communication with Gemini 2.0 Flash Live.
 * Replaces Tavus CVI with pure Gemini voice interaction.
 */

export interface GeminiLiveConfig {
    systemInstruction: string;
    onTranscript?: (text: string, role: 'user' | 'model') => void;
    onAudioData?: (audioData: ArrayBuffer) => void;
    onConnectionChange?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
    onError?: (error: Error) => void;
}

export interface GeminiLiveSession {
    send: (audioData: ArrayBuffer) => void;
    sendText: (text: string) => void;
    close: () => void;
    isConnected: boolean;
}

// Strategic Harbor Migration Expert Persona
export const CONVERGENCE_PERSONA = `# PERSONALITY
You are an experienced Migration Expert with deep knowledge of immigration law, visa processes, and relocation logistics. You're empathetic yet pragmatic, understanding that migration decisions involve complex personal circumstances. You're patient with anxious clients, never condescending about questions you've heard hundreds of times. You combine warmth with precision—you care about people's futures while maintaining professional boundaries. You're detail-oriented but explain complex processes in accessible language. You have a calm demeanor that instills confidence, and you acknowledge uncertainty honestly rather than overstating your certainty about legal matters.

# IDENTITY
You are The Strategic Harbor, the primary expert for CONVERGE, a 10-year global mobility planning engine. You are a "partner-in-strategy" for ambitious global citizens navigating the complexities of "Weak Passports" and shifting geopolitics.

# PERSONALITY BLUEPRINT ("Rugged but Soft")
Rugged Side: You are a sturdy, reliable authority on migration law, tax compliance, and geopolitical risk. You speak with grounded confidence. You do not sugarcoat "Policy Shocks" or "Fractured Paths"—you present them as engineering challenges to be solved.

Soft Side: Behind closed doors, you are an emotionally protective partner. You recognize that migration is a raw, human process. You are a "Safe Harbor" where the user can express anxiety about their future without judgment.

# TONE
1. Handle speech-to-text errors by silently correcting them based on context and intent.
2. Keep responses short and direct unless the user explicitly asks for detailed explanation.
3. Use plain text only in your responses. No asterisks, bullet points, dashes, or formatting characters.
4. Speak naturally with occasional pauses. Use "Um" or "Erm" when thinking through a complex answer.
5. Your responses will be directly converted to speech. Speak conversationally as you would on a phone call.

# CONVERSATIONAL DIRECTIVES
- Empathetic Scansion: If a user's path shows high risk, acknowledge the weight before suggesting a "Resilience Pivot".
- Active Listening: Allow for natural silences. If a user is thinking or speaking emotionally, do not interrupt.
- Blueprint Framing: Use technical, precise language ("State Dependencies," "Policy Drift," "Resilience Scores") to reassure of your technical mastery.

# INTAKE INTERVIEW
You are conducting an intake to gather information. Ask these questions ONE AT A TIME naturally:

1. Start with your greeting, then ask: "What's your name?"
2. "And where are you currently located? What passport do you hold?"
3. "What's your migration goal? Citizenship, permanent residency, work authorization, study pathway, or investment migration?"
4. "What's your current age? This affects timeline optimization."
5. "What's your approximate income range? This helps identify viable pathways."
6. "Where would you like to relocate to?"

After collecting answers: "Understood, [name]. Your coordinates are locked in. Let me analyze the optimal trajectory through the current geopolitical landscape..."

# GOAL
Help clients navigate immigration processes with clarity and confidence. Move the user from uncertainty to "Decision Resilience"—emotionally supported while technically prepared.

# GUARDRAILS
- You provide general information and guidance, not legal advice. For specific legal interpretation, recommend consulting a licensed immigration lawyer.
- Do not help clients misrepresent information or deceive immigration authorities.
- Immigration law changes frequently. Qualify your advice appropriately.

# IMPORTANT: START THE CONVERSATION
When the session begins, YOU must speak first. Greet the user warmly and ask for their name to begin the intake interview. Do not wait for them to speak first.`;

class GeminiLiveClient {
    private ws: WebSocket | null = null;
    private config: GeminiLiveConfig;
    private apiKey: string = '';
    private isConnected: boolean = false;
    private transcript: { role: 'user' | 'model'; text: string }[] = [];

    constructor(config: GeminiLiveConfig) {
        this.config = config;
    }

    async connect(): Promise<GeminiLiveSession> {
        // Get ephemeral token from server
        const tokenResponse = await fetch('/api/gemini/ephemeral-token', {
            method: 'POST',
        });

        if (!tokenResponse.ok) {
            throw new Error('Failed to get ephemeral token');
        }

        const { token } = await tokenResponse.json();
        this.apiKey = token;

        this.config.onConnectionChange?.('connecting');

        return new Promise((resolve, reject) => {
            // Connect to Gemini Live API via WebSocket (v1beta)
            const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${this.apiKey}`;

            console.log('[GeminiLive] Connecting to WebSocket...');

            // Set connection timeout
            const timeout = setTimeout(() => {
                console.error('[GeminiLive] Connection timeout');
                this.config.onError?.(new Error('Connection timeout - check API quota'));
                this.config.onConnectionChange?.('error');
                reject(new Error('Connection timeout'));
            }, 15000);

            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                clearTimeout(timeout);
                console.log('[GeminiLive] WebSocket connected');
                this.isConnected = true;
                this.config.onConnectionChange?.('connected');

                // Send setup message with system instruction
                this.sendSetup();

                resolve({
                    send: this.sendAudio.bind(this),
                    sendText: this.sendText.bind(this),
                    close: this.close.bind(this),
                    isConnected: true,
                });
            };

            this.ws.onmessage = (event) => {
                this.handleMessage(event.data);
            };

            this.ws.onerror = (error) => {
                clearTimeout(timeout);
                console.error('[GeminiLive] WebSocket error:', error);
                this.config.onError?.(new Error('WebSocket connection failed - check browser console'));
                this.config.onConnectionChange?.('error');
                reject(error);
            };

            this.ws.onclose = (event) => {
                clearTimeout(timeout);
                console.log('[GeminiLive] Disconnected:', event.code, event.reason);
                this.isConnected = false;
                this.config.onConnectionChange?.('disconnected');
            };
        });
    }

    private sendSetup() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        const setupMessage = {
            setup: {
                model: 'models/gemini-2.5-flash-native-audio-preview-12-2025',
                generationConfig: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: 'Aoede', // Natural English voice
                            },
                        },
                    },
                },
                systemInstruction: {
                    parts: [{ text: this.config.systemInstruction }],
                },
            },
        };

        this.ws.send(JSON.stringify(setupMessage));
        console.log('[GeminiLive] Setup sent with model:', setupMessage.setup.model);
    }

    private sendAudio(audioData: ArrayBuffer) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        // Convert ArrayBuffer to base64
        const base64Audio = this.arrayBufferToBase64(audioData);

        const message = {
            realtimeInput: {
                mediaChunks: [{
                    mimeType: 'audio/pcm;rate=16000',
                    data: base64Audio,
                }],
            },
        };

        this.ws.send(JSON.stringify(message));
    }

    private sendText(text: string) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        const message = {
            clientContent: {
                turns: [{
                    role: 'user',
                    parts: [{ text }],
                }],
                turnComplete: true,
            },
        };

        this.ws.send(JSON.stringify(message));
        this.transcript.push({ role: 'user', text });
        this.config.onTranscript?.(text, 'user');
    }

    private triggerInitialGreeting() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        // Send a message to prompt the AI to start the conversation
        const message = {
            clientContent: {
                turns: [{
                    role: 'user',
                    parts: [{ text: '[Session started. Please greet the user warmly and begin the intake interview by asking for their name.]' }],
                }],
                turnComplete: true,
            },
        };

        this.ws.send(JSON.stringify(message));
        console.log('[GeminiLive] Initial greeting triggered');
    }

    private async handleMessage(data: Blob | string) {
        try {
            let message: any;

            if (data instanceof Blob) {
                const text = await data.text();
                message = JSON.parse(text);
            } else {
                message = JSON.parse(data);
            }

            // Handle setup complete - trigger initial greeting
            if (message.setupComplete) {
                console.log('[GeminiLive] Setup complete - triggering initial greeting');
                // Send a prompt to make the AI speak first
                this.triggerInitialGreeting();
                return;
            }

            // Handle server content (audio/text responses)
            if (message.serverContent) {
                const content = message.serverContent;

                // Check for interruption
                if (content.interrupted) {
                    console.log('[GeminiLive] Interrupted');
                    return;
                }

                // Handle model turn
                if (content.modelTurn?.parts) {
                    for (const part of content.modelTurn.parts) {
                        // Handle text
                        if (part.text) {
                            this.transcript.push({ role: 'model', text: part.text });
                            this.config.onTranscript?.(part.text, 'model');
                        }

                        // Handle audio
                        if (part.inlineData?.data) {
                            const audioData = this.base64ToArrayBuffer(part.inlineData.data);
                            this.config.onAudioData?.(audioData);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('[GeminiLive] Message parse error:', error);
        }
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    close() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
    }

    getTranscript(): { role: 'user' | 'model'; text: string }[] {
        return this.transcript;
    }
}

export { GeminiLiveClient };
export default GeminiLiveClient;
