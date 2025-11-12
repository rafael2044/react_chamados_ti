import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Intercepta todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para renovar token automaticamente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem("refresh_token");

    // Se o token expirou e ainda não tentamos atualizar
    if (error.response?.status === 401 && refreshToken && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/refresh`, { refresh_token: refreshToken });
        if (res.status === 401){
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login";
        }else {
            localStorage.setItem("access_token", res.data.access_token);
            api.defaults.headers.common["Authorization"] = `Bearer ${res.data.access_token}`;
            return api(originalRequest); // reenvia requisição original
        }
      } catch (err) {
        console.error("Falha ao renovar token:", err);
      }
    }
    return Promise.reject(error);
  }
);


const getUsers = async (offset=1, limit=100, search="") => {
  const params = new URLSearchParams({
                offset,
                limit,
                });
  if (search) params.append('search', search)
  const res = await api.get(`/user/?${params.toString()}`)
  return res.data;
}

const insertUser = async (userData) => {
  const res = await api.post('/user/', userData);
  return res.data;
}

const deleteUser = async (userId) => {
  const res = await api.delete(`/user/${userId}`)
  return res.data;
}

const getPrivilegios = async (offset=1, limit=100, search="") => {
  const params = new URLSearchParams({
                offset,
                limit,
                });
  if (search) params.append('search', search)
  const res = await api.get(`/privilegio/?${params.toString()}`)
  return res.data;
}

const getUnidades = async (offset=1, limit=100, search="") => {
  const params = new URLSearchParams({
                offset,
                limit,
  });
  if (search) params.append("search", search)
  const res = await api.get(`/unidade/?${params.toString()}`);
  return res.data;
}

const insertUnidade = async (dataUnidade) => {
  const res = await api.post("/unidade/", dataUnidade);
  return res.data;
}

const deleteUnidade = async (unidadeId) => {
  const res = await api.delete(`/unidade/${unidadeId}`)
  return res.data;
}

const getModulos = async (offset=1, limit=100, search="") => {
  const params = new URLSearchParams({
                offset,
                limit,
  });
  if (search) params.append("search", search)
  const res = await api.get(`/modulo/?${params.toString()}`);
  return res.data;
}

const insertModulo = async (dataModulo) => {
  const res = await api.post("/modulo/", dataModulo);
  return res.data;
}

const deleteModulo = async (moduloId) => {
  const res = await api.delete(`/modulo/${moduloId}`)
  return res.data;
}

const getChamados = async (params) => {
  const res = await api.get(`/chamados/?${params.toString()}`)
  return res.data;
}

const insertChamado = async (dataChamado) => {
  const res = await api.post("/chamados/", dataChamado);
  return res.data;

}

const updateChamado = async (chamadoId, chamadoUpdate) => {
  const res =  await api.patch(
    `/chamados/${chamadoId}`, chamadoUpdate);
  return res.data;
}

const finalizarChamado = async (chamadoId) => {
  const res = await api.patch(`/chamados/${chamadoId}/finalizar`);
  return res.data;

}

const insertAnexoChamado = async (chamadoId, dataAnexo) => {
  const formData = new FormData();
      formData.append("file", dataAnexo);
  const res = await api.post(`/chamados/${chamadoId}/anexo`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

const deleteChamado = async (chamadoId) => {
  const res = await api.delete(`/chamados/${chamadoId}`)
  return res.data;
}

const getStatus = async () => {
  const res = await api.get('/status/');
  return res.data;
}

const insertAtendimento = async (chamadoId, dataAtendimento) => {
  const res = await api.post(
        `/atendimento/${chamadoId}`,
        dataAtendimento,
        {
            headers: { "Content-Type": "multipart/form-data" },
        }
  );
  return res.data;
}

export {api, getUsers, insertUser, deleteUser, getPrivilegios,
  getUnidades, insertUnidade, deleteUnidade,
  getModulos, insertModulo, deleteModulo,
  getChamados, insertChamado, insertAnexoChamado,
  getStatus, insertAtendimento, finalizarChamado,
  updateChamado, deleteChamado}
