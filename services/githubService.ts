import { Candidate, GithubComment } from '../types';

const extractIssueDetails = (url: string) => {
  const regex = /github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/;
  const match = url.match(regex);
  if (!match) return null;
  return { owner: match[1], repo: match[2], issueNumber: match[3] };
};

export const fetchParticipants = async (issueUrl: string): Promise<Candidate[]> => {
  const details = extractIssueDetails(issueUrl);
  if (!details) {
    throw new Error("URL de Issue inválida. Formato: https://github.com/owner/repo/issues/123");
  }

  const { owner, repo, issueNumber } = details;
  let page = 1;
  let allComments: GithubComment[] = [];
  let hasNextPage = true;

  // Fetch all comments (pagination)
  while (hasNextPage) {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments?per_page=100&page=${page}`
    );

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("Límite de la API de GitHub excedido. Intenta de nuevo más tarde.");
      }
      if (response.status === 404) {
        throw new Error("Issue no encontrado o el repositorio es privado.");
      }
      throw new Error(`Error de la API de GitHub: ${response.statusText}`);
    }

    const data: GithubComment[] = await response.json();
    if (data.length === 0) {
      hasNextPage = false;
    } else {
      allComments = [...allComments, ...data];
      page++;
      // Safety break for very large threads in this demo
      if (page > 20) hasNextPage = false; 
    }
  }

  // Deduplicate users
  const uniqueUsers = new Map<string, Candidate>();
  
  allComments.forEach(comment => {
    // Basic bot filtering
    if (comment.user.login.endsWith('[bot]')) return;

    if (!uniqueUsers.has(comment.user.login)) {
      uniqueUsers.set(comment.user.login, {
        id: comment.user.login,
        login: comment.user.login,
        avatarUrl: comment.user.avatar_url
      });
    }
  });

  if (uniqueUsers.size === 0) {
    throw new Error("No se encontraron comentarios elegibles en este issue.");
  }

  return Array.from(uniqueUsers.values());
};