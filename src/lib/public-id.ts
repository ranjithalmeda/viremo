import { randomUUID } from "node:crypto";

export const PUBLIC_ID_CHARSET = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const PUBLIC_ID_LENGTH = 6;

export function createPublicId() {
  let value = "";

  while (value.length < PUBLIC_ID_LENGTH) {
    const chunk = randomUUID().replace(/-/g, "").toUpperCase();

    for (const character of chunk) {
      if (PUBLIC_ID_CHARSET.includes(character)) {
        value += character;
      }

      if (value.length === PUBLIC_ID_LENGTH) {
        return value;
      }
    }
  }

  return value;
}
