const alphabet = 'abcdefghijklmnopqrstuvwxyz';
export const suggestionIndexToWeight = (index: number): string => {
    const characterInsideAlphabet = alphabet[index];
    if (characterInsideAlphabet) {
        return characterInsideAlphabet;
    }

    const duplicateTimes = Math.floor(index / alphabet.length);
    const remains = index % alphabet.length;

    const lastCharacter = alphabet.slice(-1);

    return lastCharacter.repeat(duplicateTimes) + alphabet[remains];
};
