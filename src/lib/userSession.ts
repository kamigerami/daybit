// Simple session management for multi-user support
export class UserSession {
  private static USER_ID_KEY = 'daybit_user_id';
  
  static getUserId(): string {
    if (typeof window === 'undefined') return 'anonymous';
    
    let userId = localStorage.getItem(this.USER_ID_KEY);
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem(this.USER_ID_KEY, userId);
    }
    return userId;
  }
  
  static getStorageKey(): string {
    return `daybit_entries_${this.getUserId()}`;
  }
  
  static clearSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.getStorageKey());
  }
}