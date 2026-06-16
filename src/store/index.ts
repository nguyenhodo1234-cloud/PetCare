import {
  configureStore,
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
}
interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
const API = "/api";

function saveSession(token: string, refreshToken: string, user: User) {
  localStorage.setItem("token", token);
  localStorage.setItem("refresh_token", refreshToken);
  localStorage.setItem("user", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
}

function getSavedUser(): User | null {
  try {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: getSavedUser(),
    token: localStorage.getItem("token"),
    loading: false,
    error: null,
  } as AuthState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
    logout(state) {
      state.user = null;
      state.token = null;
      clearSession();
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(login.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.token = a.payload.access_token;
        saveSession(
          a.payload.access_token,
          a.payload.refresh_token,
          a.payload.user,
        );
      })
      .addCase(login.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      })
      .addCase(register.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(register.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.token = a.payload.access_token;
        saveSession(
          a.payload.access_token,
          a.payload.refresh_token,
          a.payload.user,
        );
      })
      .addCase(register.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      });
  },
});

export const login = createAsyncThunk(
  "auth/login",
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) return rejectWithValue(json.error);
      return json;
    } catch {
      return rejectWithValue("Không thể kết nối server");
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    data: { name: string; email: string; phone: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) return rejectWithValue(json.error);
      return json;
    } catch {
      return rejectWithValue("Không thể kết nối server");
    }
  },
);

export const { setUser, setToken, logout, clearError } = authSlice.actions;
export const store = configureStore({ reducer: { auth: authSlice.reducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
