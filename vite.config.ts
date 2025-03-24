import { build, defineConfig } from "vite";

type modes = "content" | "background";

function getInput(mode: modes) {
  switch (mode) {
    case "content":
      return { input: "./src/content.ts", output: "dist/js/content.js" };
    case "background":
      return { input: "./src/background.ts", output: "dist/js/background.js" };
    default:
      throw new Error("unknow mode");
  }
}

export default defineConfig(({ mode }: any) => {
  const selectedMode = getInput(mode);
  return {
    build: {
      rollupOptions: {
        input: [selectedMode.input],
        output: {
          dir: "./",
          entryFileNames: selectedMode.output,
        },
      },
      emptyOutDir: false,
    },
  };
});
