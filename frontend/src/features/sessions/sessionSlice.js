import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Ensure this points to your backend (e.g., http://localhost:8080/api)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({ baseURL: API_URL });

// Attach token to requests
api.interceptors.request.use((request) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        request.headers.Authorization = `Bearer ${user.token}`;
    }
    return request;
});

// Handle unauthorized errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// --- Local Storage Helpers ---
// We keep sessions in local storage so the user doesn't lose their chat history on refresh
const getStoredSessions = () => JSON.parse(localStorage.getItem('doctorg_sessions')) || [];
const saveStoredSessions = (sessions) => localStorage.setItem('doctorg_sessions', JSON.stringify(sessions));

const initialState = {
    sessions: [],
    activeSession: null,
    isGenerating: false,
    isError: false,
    isLoading: false,
    message: ''
};

// 1. Get All Sessions
export const getSessions = createAsyncThunk('sessions/getAll', async (_, thunkAPI) => {
    try {
        return getStoredSessions();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message);
    }
});

// 2. Get Single Session
export const getSessionById = createAsyncThunk('sessions/getOne', async (sessionId, thunkAPI) => {
    try {
        const sessions = getStoredSessions();
        const session = sessions.find(s => s._id === sessionId);
        if (!session) throw new Error("Session not found");
        return session;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message);
    }
});

// 3. Create a New Session
export const createSession = createAsyncThunk('sessions/create', async (_, thunkAPI) => {
    try {
        const sessionId = 'session_' + Date.now();
        const newSession = {
            _id: sessionId,
            status: "in-progress",
            startTime: new Date().toISOString(),
            endTime: null,
            // Updated to a clean chat format
            messages: [
                {
                    role: "assistant",
                    content: "Hello! I am DoctorG, your AI health assistant. What symptoms or medical concerns have you been experiencing recently?"
                }
            ],
            medicalAdvice: null // Will hold the final report
        };

        const sessions = getStoredSessions();
        sessions.unshift(newSession);
        saveStoredSessions(sessions);
        
        // Auto-redirect to chat
        setTimeout(() => { window.location.href = `/session/${sessionId}`; }, 100);
        
        return newSession;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message);
    }
});

// 4. Submit a Message to the AI
export const submitMessage = createAsyncThunk('sessions/submitMessage', async ({ sessionId, messageText }, thunkAPI) => {
    try {
        const sessions = getStoredSessions();
        const sessionIndex = sessions.findIndex(s => s._id === sessionId);
        if (sessionIndex === -1) throw new Error("Session not found");
        const session = sessions[sessionIndex];

        // Add user message immediately
        session.messages.push({ role: 'user', content: messageText });

        // IMPORTANT API #1: Get AI's next question
        // Adjust the endpoint to match your actual backend route for chat
        const response = await api.post('/patient/chat/send', {
            sessionId,
            message: messageText
        });
        
        const replyText = response.data?.reply || "I understand. Could you tell me more?";
        
        // Add AI response
        session.messages.push({ role: 'assistant', content: replyText });

        // Check if collection is complete
        if (replyText.toUpperCase().includes('COLLECTION_COMPLETE')) {
            const transcript = session.messages.map(m => 
                `${m.role === 'user' ? 'Patient' : 'Doctor'}: ${m.content}`
            ).join('\n\n');

            try {
                const adviceResponse = await api.post('/medical-advice/query', {
                    query: `&{transcript}`
                });
                const finalAdvice = adviceResponse.data?.data || adviceResponse.data?.advice || "No advice generated.";
                session.status = 'completed';
                session.endTime = new Date().toISOString();
                session.medicalAdvice = finalAdvice;
            } catch (err) {
                console.error("Failed to generate advice automatically:", err);
            }
        }

        sessions[sessionIndex] = session;
        saveStoredSessions(sessions);
        
        return session;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

// 5. End Session & Generate Medical Advice
export const endSession = createAsyncThunk('sessions/endSession', async (sessionId, thunkAPI) => {
    try {
        const sessions = getStoredSessions();
        const sessionIndex = sessions.findIndex(s => s._id === sessionId);
        if (sessionIndex === -1) throw new Error("Session not found");
        const session = sessions[sessionIndex];
        
        // Format the chat history into a transcript string for the AI to read
        const transcript = session.messages.map(m => 
            `${m.role === 'user' ? 'Patient' : 'Doctor'}: ${m.content}`
        ).join('\n\n');
        
        // IMPORTANT API #2: Final Medical Advice
        const response = await api.post('/medical-advice/query', {
            query: `Analyze this patient transcript and provide structured medical advice, possible conditions, and home care recommendations.\n\nTranscript:\n${transcript}`
        });
        
        // Assuming your backend sends the advice in response.data.data
        const finalAdvice = response.data?.data || response.data?.advice || "No advice generated.";
        
        // Update session state
        session.status = 'completed';
        session.endTime = new Date().toISOString();
        
        // Store it cleanly so the frontend can render it beautifully
        session.medicalAdvice = finalAdvice; 
        
        sessions[sessionIndex] = session;
        saveStoredSessions(sessions);
        
        return session;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

// 6. Delete Session
export const deleteSession = createAsyncThunk('sessions/delete', async (sessionId, thunkAPI) => {
    try {
        let sessions = getStoredSessions();
        sessions = sessions.filter(s => s._id !== sessionId);
        saveStoredSessions(sessions);
        return sessionId;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message);
    }
});

export const sessionSlice = createSlice({
    name: 'sessions',
    initialState,
    reducers: {
        reset: (state) => {
            state.isError = false;
            state.message = '';
            state.isLoading = false;
            state.isGenerating = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get Sessions
            .addCase(getSessions.pending, (state) => { state.isLoading = true; })
            .addCase(getSessions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.sessions = action.payload;
            })
            .addCase(getSessions.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Create Session
            .addCase(createSession.pending, (state) => { state.isGenerating = true; })
            .addCase(createSession.fulfilled, (state, action) => {
                state.isGenerating = false;
                state.activeSession = action.payload;
            })
            .addCase(createSession.rejected, (state, action) => {
                state.isGenerating = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Get By ID
            .addCase(getSessionById.fulfilled, (state, action) => {
                state.activeSession = action.payload;
            })
            // Submit Message
            .addCase(submitMessage.pending, (state) => { state.isGenerating = true; })
            .addCase(submitMessage.fulfilled, (state, action) => {
                state.isGenerating = false;
                state.activeSession = action.payload;
            })
            .addCase(submitMessage.rejected, (state, action) => {
                state.isGenerating = false;
                state.isError = true;
                state.message = action.payload;
            })
            // End Session
            .addCase(endSession.pending, (state) => { state.isLoading = true; })
            .addCase(endSession.fulfilled, (state, action) => {
                state.isLoading = false;
                state.activeSession = action.payload;
            })
            .addCase(endSession.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Delete Session
            .addCase(deleteSession.fulfilled, (state, action) => {
                state.sessions = state.sessions.filter(s => s._id !== action.payload);
            });
    }
});

export const { reset } = sessionSlice.actions;
export default sessionSlice.reducer;