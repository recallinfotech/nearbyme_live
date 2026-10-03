import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';

export interface CameraPhotoResult {
  webPath?: string;
  format?: string;
  base64String?: string;
  blob?: Blob;
}

/**
 * Direct Camera Photo Capture Only (Strictly Hardware Camera)
 */
export const captureDirectCameraPhoto = async (): Promise<CameraPhotoResult> => {
  return captureFlexiblePhoto(false);
};

/**
 * Flexible Photo Capture:
 * - allowGallery = false -> Strictly Live Camera
 * - allowGallery = true  -> Camera OR Gallery Choice Prompt
 */
export const captureFlexiblePhoto = async (allowGallery: boolean = false): Promise<CameraPhotoResult> => {
  try {
    const photo: Photo = await Camera.getPhoto({
      quality: 85,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: allowGallery ? CameraSource.Prompt : CameraSource.Camera,
      saveToGallery: false,
    });

    let blob: Blob | undefined;
    if (photo.webPath) {
      const response = await fetch(photo.webPath);
      blob = await response.blob();
    }

    return {
      webPath: photo.webPath,
      format: photo.format,
      blob,
    };
  } catch (error: any) {
    console.error('Camera capture error or cancelled:', error);
    throw error;
  }
};
