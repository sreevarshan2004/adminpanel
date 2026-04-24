const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://v5cproperties.com/v5c_api';

export const LOGIN_URL = `${BASE_URL}/login.php`;
export const GET_LOGIN_URL = `${BASE_URL}/login.php`;
export const PROPERTIES_URL = `${BASE_URL}/get.php`;
export const GET_PROPERTY_DETAIL_URL = `${BASE_URL}/get_single.php`;
export const ADD_PROPERTY_URL = `${BASE_URL}/index.php`;
export const UPDATE_PROPERTY_URL = `${BASE_URL}/update.php`;
export const DELETE_PROPERTY_URL = `${BASE_URL}/delete.php`;
export const IMAGE_BASE_URL = `${BASE_URL}/`;
export const VIDEO_UPLOAD_URL = `${BASE_URL}/upload_video.php`;
export const STATUS_URL = `${BASE_URL}/change_status.php`;
