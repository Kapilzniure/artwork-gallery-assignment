import axios from 'axios';
import type { ArtworkResponse } from '../types/artwork';

const API_BASE_URL = 'https://api.artic.edu/api/v1/artworks';

export const fetchArtworks = async (page: number = 1): Promise<ArtworkResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}?page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching artworks:', error);
    throw error;
  }
};
