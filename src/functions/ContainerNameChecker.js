export default function CheckContainerName(name) {
  // check if name is not a string
  if (typeof name !== "string") {
    return false;
  }

  // check if name is empty or more than 255 chars
  if (name.length < 1 || name.length > 255) {
    return false;
  }

  if (name === "NAN" || name === "UNUSED") {
    return false;
  }

  let currChar;

  // check if name's first character is not printable / is a space
  currChar = name.charCodeAt(0);
  if (currChar < 33 || currChar > 126) {
    return false;
  }

  // check if all characters in name are valid
  for (let i = 0; i < name.length; i++) {
    currChar = name.charCodeAt(i);
    if (currChar < 32 || currChar > 126) {
      return false;
    }
  }

  // name is valid
  return true;
}
