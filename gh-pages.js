var ghpages = require("gh-pages");

ghpages.publish(
  "public", // path to public directory
  {
    branch: "gh-pages",
    repo: "https://github.com/nguyenbinhanltv/svelte-tetris.git", // Update to point to your repository
    user: {
      name: "Nguyen Binh An", // update to use your name
      email: "nguyenbinhanltv@gmail.com", // Update to use your email
    },
  },
  () => {
    console.log("Deploy Complete!");
  }
);
