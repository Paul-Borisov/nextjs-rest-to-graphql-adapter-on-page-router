export const capitalizeFirstLetters = (
  input: string,
  maxWords: number = 0,
  wordSeparator: string = " "
) => {
  if (!input) return input;

  return (
    input
      .split(wordSeparator)
      .map((word, index) => {
        if (word.length === 0) return word; // Handle empty words
        if (maxWords > 0 && index + 1 > maxWords) {
          return word;
        } else {
          return word[0].toUpperCase() + word.substring(1);
        }
      })
      .join(wordSeparator) ?? input
  );
};

export const splitByUppercaseLetters = (
  input: string,
  wordSeparator: string = " "
) => {
  // This function must split strings like UsersDummyjsonCom to Users-Dummyjson-Com
  let words: string[] = [];
  let currentWord = input[0];

  for (let i = 1; i < input.length; i++) {
    const char = input[i];

    if (
      char.toLocaleLowerCase() !== char.toLocaleUpperCase() &&
      char === char.toUpperCase()
    ) {
      words.push(currentWord);
      currentWord = char;
    } else {
      currentWord += char;
    }
  }

  words.push(currentWord);

  return words.join(wordSeparator);
};
