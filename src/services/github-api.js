const USERNAME = "cyto0plasm";

const headers = () =>
  import.meta.env.VITE_GITHUB_TOKEN
    ? { Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}` }
    : {};

const cleanReadme = (text) => {
  if (!text) return "";
  return text
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/#+\s*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim().slice(0, 300);
};

export async function fetchRepos() {
  if (!navigator.onLine) return [];
  const res = await fetch(
    `https://api.github.com/users/${USERNAME}/repos?per_page=100`,
    { headers: headers() }
  );
  if (!res.ok) throw new Error("Failed to fetch repos");
  const data = await res.json();
  return data
    .filter((r) => !r.fork && !r.archived && r.description)
    .map(({ name, description, html_url }) => ({ name, description, url: html_url }));
}

export async function fetchReadme(repoName) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${USERNAME}/${repoName}/readme`,
      { headers: headers() }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return cleanReadme(atob(data.content));
  } catch { return null; }
}

export async function fetchContributions(from, to) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers() },
    body: JSON.stringify({
      query: `{
        user(login: "${USERNAME}") {
          contributionsCollection(from: "${from}", to: "${to}") {
            contributionCalendar {
              totalContributions
              weeks { contributionDays { contributionCount date } }
            }
          }
        }
      }`,
    }),
  });
  if (!res.ok) throw new Error("Failed to fetch contributions");
  const json = await res.json();
  return json.data.user.contributionsCollection.contributionCalendar;
}