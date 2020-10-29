export default (() => {
  [...document.getElementsByClassName("ibg")].forEach((index) => {
    if (!!index.querySelector("img")) {
      index.style.backgroundImage = `url(${index
        .querySelector("img")
        .getAttribute("src")})`;
    }
  });
})();
