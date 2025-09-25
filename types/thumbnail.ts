export interface ThumbnailTemplate {
  id: string;
  name: string;
  description: string;
  category: "youtube" | "reels" | "general";
  preview: string;
  style: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
    textPosition?: "top" | "center" | "bottom";
    overlay?: boolean;
    border?: boolean;
    shadow?: boolean;
  };
  dimensions: {
    width: number;
    height: number;
  };
  trending: boolean;
}

export interface ThumbnailGenerationRequest {
  image: string;
  template: ThumbnailTemplate;
}

export interface ThumbnailGenerationResponse {
  thumbnail: string;
  success: boolean;
  message?: string;
}
