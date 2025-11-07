// Hardcoded users for authentication
const USERS = [
  { username: 'abc1', password: 'xyz1' },
  { username: 'abc2', password: 'xyz2' },
  { username: 'abc3', password: 'xyz3' },
  { username: 'abc4', password: 'xyz4' },
  { username: 'abc5', password: 'xyz5' },
];

export interface User {
  username: string;
}

export function validateUser(username: string, password: string): User | null {
  const user = USERS.find(u => u.username === username && u.password === password);
  return user ? { username: user.username } : null;
}

export function setSession(user: User): void {
  if (typeof window !== 'undefined') {
    const sessionData = {
      username: user.username,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('session', JSON.stringify(sessionData));
  }
}

export function getSession(): User | null {
  if (typeof window !== 'undefined') {
    const sessionStr = localStorage.getItem('session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      return session.user;
    }
  }
  return null;
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}
