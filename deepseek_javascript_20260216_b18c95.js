import API from './api';

export const videoService = {
  // Get all videos with filters
  getVideos: async (params = {}) => {
    const response = await API.get('/videos', { params });
    return response.data;
  },

  // Get single video
  getVideoById: async (id) => {
    const response = await API.get(`/videos/${id}`);
    return response.data;
  },

  // Upload video (admin)
  uploadVideo: async (formData) => {
    const response = await API.post('/videos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Download video
  downloadVideo: async (id) => {
    const response = await API.post(`/videos/${id}/download`);
    return response.data;
  },

  // Like/Unlike video
  toggleLike: async (id) => {
    const response = await API.post(`/videos/${id}/like`);
    return response.data;
  },

  // Get related videos
  getRelatedVideos: async (id) => {
    const response = await API.get(`/videos/${id}/related`);
    return response.data;
  },

  // Get trending videos
  getTrendingVideos: async () => {
    const response = await API.get('/videos/trending');
    return response.data;
  }
};