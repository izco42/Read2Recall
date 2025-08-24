import { api } from "../../api";

const STORAGE_KEY = 'anki_auth_session';

export function loadSession() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
    catch { return null; }
}
export function saveSession(session) {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
}

export async function authSignup({ email, password, name }) {
    const payload = {
        email: String(email || '').trim().toLowerCase(),
        password: String (password || ''),
        name: String(name || '').trim(),
    };

    if (!/^\S+@\S+\.\S+$/.test(payload.email)) throw new Error('Email inválido');
    if (payload.password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres');
    if (payload.name.length < 2) throw new Error('El nombre es muy corto');

    try {
        const { data } = await api.post('/auth/sign-up', payload, {
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        });
        return data;
    } catch (e) {
        const status = e?.response?.status;
        const detail = e?.response?.data?.detail;
        let msg = '';

        if (status === 400) {
            if (typeof detail === 'string' && detail.trim()) {
                msg = detail.trim();
            } else if (Array.isArray(detail) && detail.length) {
                msg = detail.map(x => x?.msg || JSON.stringify(x)).join(' • ');
            }

            if (!msg || /400 Bad Request/i.test(msg)) {
                msg = 'El correo ya está registrado o los datos no son válidos.';
            }
            e.userMessage = msg;
        }
        throw e;
    }
}
export async function authLogin({ email, password }) {
    const payload = {
        email: String(email || "").trim().toLowerCase(),
        password: String(password || ""),
    };

    if (!payload.email || !payload.password) {
        const e = new Error("Ingresa tu email y contraseña.");
        e.userMessage = e.message;
        throw e;
    }

    const emailRe = /^\S+@\S+\.\S+$/;
    if (!emailRe.test(payload.email)) {
        const e = new Error("Email inválido. Debe tener un formato correcto.");
        e.userMessage = e.message;
        throw e;
    }

    try {
        const { data } = await api.post("/auth/log-in", payload, {
            headers: { "Content-Type": "application/json", Accept: "application/json" },
        });
        if (data?.session) saveSession(data.session);
        return data?.session || null;

    }  catch (e) {
  const status = e?.response?.status;
  const detail = e?.response?.data?.detail;
  let msg = "";

  // helper convierte detail (string/array/obj) en texto
  const detailText = (() => {
    if (typeof detail === "string") return detail.trim();
    if (Array.isArray(detail) && detail.length)
      return detail.map(x => x?.msg || JSON.stringify(x)).join(" • ");
    if (detail && typeof detail === "object" && detail.msg) return String(detail.msg);
    return "";
  })();

  if (status === 401) {
    msg = "Credenciales incorrectas. Verifica tu email y contraseña.";
  }

  if (!msg && status === 400) {
    if (/401\s*Unauthorized/i.test(detailText) || /developer\.mozilla\.org\/.*\/401/i.test(detailText)) {
      msg = "Credenciales incorrectas. Verifica tu email y contraseña.";
    }
  }

  if (!msg && (status === 400 || status === 422)) {
    msg = detailText || "No se pudo iniciar sesión. Revisa los datos e intenta de nuevo.";
  }

  if (!msg && !status) {
    msg = "No se pudo contactar al servidor. ¿Está levantado " +
          (api?.defaults?.baseURL || "la API") + "?";
  }

  if (!msg) {
    msg = "Error inesperado. Intenta de nuevo más tarde.";
  }
//el Modal prioriza esto
  e.userMessage = msg;   
  throw e;
}

}

export function authLogout() {
    saveSession(null);
}

export async function syncUpload(secret) {
    const { data } = await api.post('/sync/upload', {}, {
        headers: { secret }
    });
    return data;
}

export async function syncDownload(secret) {
    const { data } = await api.get('/sync/download', {
        headers: { secret }
    });
    return data;
}
