
export function validatePhoneNumber(
  phoneNumber: string | number | null | undefined
): boolean {
  if (phoneNumber === null || phoneNumber === undefined) return false;


  const str = String(phoneNumber).trim();

  const phoneRegex =
    /^(?:(?:(?:\+?|00)98)|0)?(9(?:0|1|2|3|9)\d{8})$/;

  return phoneRegex.test(str);
}


export function validateUsername(
  username: string | number | null | undefined
): boolean {
  if (username === null || username === undefined) return false;

  return String(username).trim().length >= 3;
}
