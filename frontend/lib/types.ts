export interface Genre {
  id: number;
  name: string;
  slug: string;
  color?: string | null;
  icon?: string | null;
}

export interface StreamSource {
  id?: number;
  serverName: string;
  url: string;
  type?: string;
  quality?: string | null;
  language?: string | null;
  priority?: number;
  sortOrder?: number;
  isEmbed?: boolean;
}

export interface DownloadLink {
  id?: number;
  quality: string;
  size?: string | null;
  sizeLabel?: string | null;
  url: string;
  provider?: string | null;
  isDirect?: boolean;
}

export interface SeriesEpisode {
  id: number;
  episodeNumber?: number;
  episodeNum?: number;
  title: string;
  overview?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  stillPath?: string | null;
  duration?: number | null;
  viewCount?: number;
  streamSources?: StreamSource[];
  downloadLinks?: DownloadLink[];
  streamUrl?: string | null;
  downloadUrl?: string | null;
}

export interface SeriesSeason {
  id: number;
  seasonNumber?: number;
  seasonNum?: number;
  title: string;
  year?: number | null;
  poster?: string | null;
  episodes: SeriesEpisode[];
}

export interface MovieItem {
  id: number;
  tmdbId?: number | string | null;
  imdbId?: string | null;
  title: string;
  slug: string;
  type: "MOVIE" | "SERIES";
  overview?: string | null;
  description?: string | null;
  releaseYear?: number | null;
  runtime?: number | null;
  poster?: string | null;
  posterPath?: string | null;
  backdrop?: string | null;
  backdropPath?: string | null;
  trailerUrl?: string | null;
  rating?: number | null;
  imdbRating?: number | null;
  language?: string | null;
  quality?: string | null;
  views?: number;
  viewCount?: number;
  downloadCount?: number;
  director?: string | null;
  cast?: any;
  production?: string | null;
  country?: string | null;
  tags?: string | null;
  isFeatured?: boolean;
  featured?: boolean;
  isTrending?: boolean;
  genres?: any[];
  streamSources?: StreamSource[];
  downloadLinks?: DownloadLink[];
  seasons?: SeriesSeason[];
  related?: MovieItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface HomepageData {
  userRegion?: {
    code: string;
    name: string;
  };
  hero: MovieItem[];
  rows: {
    title: string;
    type?: string;
    showRank?: boolean;
    region?: string;
    regionName?: string;
    viewAllHref?: string;
    items: MovieItem[];
  }[];
}

export interface SiteSettings {
  siteName: string;
  siteUrl: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  faviconUrl?: string;
  defaultPlayer: string;
  enableDownloadApi: boolean;
  adBannerCode?: string;
  telegramLink?: string;
}
