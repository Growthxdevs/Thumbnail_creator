export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  projectData: {
    text: string;
    textSize: number;
    textColor: string;
    horizontalPosition: number;
    verticalPosition: number;
    rotation: number;
    textOpacity: number;
    fontFamily: string;
  };
  originalImage?: string;
  processedImage?: string;
  finalImage?: string;
}

export interface ProjectData {
  text: string;
  textSize: number;
  textColor: string;
  horizontalPosition: number;
  verticalPosition: number;
  rotation: number;
  textOpacity: number;
  fontFamily: string;
}
