import { Property } from '../types';
import { ADD_PROPERTY_URL, UPDATE_PROPERTY_URL } from '../constants/apiUrls';

export const propertyService = {
  async addProperty(
    property: Property,
    files: { blueprint?: File; floor_image?: File; images?: File[] }
  ) {
    const formData = new FormData();

    // Add all property fields
    Object.entries(property).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    // Add files
    if (files.blueprint) formData.append('blueprint_file', files.blueprint);
    if (files.floor_image) formData.append('floor_image_file', files.floor_image);
    if (files.images && files.images.length > 0) {
      files.images.forEach((img, idx) => {
        formData.append(`images[${idx}]`, img);
      });
    }

    const response = await fetch(ADD_PROPERTY_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Failed to add property');
    return response.json();
  },

  async updateProperty(
    property: Property,
    files: { blueprint?: File; floor_image?: File; images?: File[] }
  ) {
    const formData = new FormData();

    Object.entries(property).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    if (files.blueprint) formData.append('blueprint_file', files.blueprint);
    if (files.floor_image) formData.append('floor_image_file', files.floor_image);
    if (files.images && files.images.length > 0) {
      files.images.forEach((img, idx) => {
        formData.append(`images[${idx}]`, img);
      });
    }

    const response = await fetch(UPDATE_PROPERTY_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Failed to update property');
    return response.json();
  }
};
