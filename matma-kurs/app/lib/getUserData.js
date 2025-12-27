import user1 from '@/dane/users/user1.json';

export function getUserData(userId) {
  // później: fetch(`/api/users/${userId}`)
    if (userId === '1') {
        return user1;
    }

    return null;
}