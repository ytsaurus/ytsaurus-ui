const encoderTest = (ENV) => {
  describe(`encoder ${ENV}`, () => {
    const yt = require("../lib")({ exportBrowserModule: false });

    test.each([
      { str: "Hello World", expected: "SGVsbG8gV29ybGQ=" },
      { str: "Привет Мир", expected: "0J/RgNC40LLQtdGCINCc0LjRgA==" },
      { str: "你好世界", expected: "5L2g5aW95LiW55WM" },
    ])("encoder('$str')", ({ str, expected }) => {
      var settings = yt.setup.getOption(yt.setup, "encodedParametersSettings");
      var encoded = settings.encoder(str);
      expect(encoded).toBe(expected);
    });
  });
};

encoderTest("NodeJS");

module.exports = {
  encoderTest,
};
