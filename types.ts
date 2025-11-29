export interface GithubUser {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GithubComment {
  user: GithubUser;
  id: number;
}

export interface Candidate {
  id: string; // usually the login
  login: string;
  avatarUrl: string;
}

export enum AppState {
  IDLE = 'IDLE',
  FETCHING = 'FETCHING',
  READY = 'READY',
  SPINNING = 'SPINNING',
  WINNER = 'WINNER',
  ERROR = 'ERROR'
}

export interface RaffleSettings {
  issueUrl: string;
  excludeAuthors: string[]; // e.g., excluding the repo owner
}