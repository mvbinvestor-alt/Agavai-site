export const INSTAGRAM_USERNAME = process.env.NEXT_PUBLIC_INSTAGRAM_USERNAME || 'agavai.in';

export function instagramProfileLink() {
  return `https://www.instagram.com/${INSTAGRAM_USERNAME}`;
}

// Opens Instagram's DM composer directly, in-app if the Instagram app is
// installed, or the web DM inbox otherwise.
export function instagramDmLink() {
  return `https://ig.me/m/${INSTAGRAM_USERNAME}`;
}
