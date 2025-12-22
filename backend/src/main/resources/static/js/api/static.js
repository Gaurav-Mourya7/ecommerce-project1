import { http } from "./http.js";

export function getAvailableImages() {
  return http(`/api/static/images`);
}

export function uploadImages(files) {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }
  
  return fetch('/api/static/upload', {
    method: 'POST',
    body: formData
  }).then(response => response.json());
}
