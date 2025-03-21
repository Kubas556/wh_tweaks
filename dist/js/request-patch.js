(function () {
  const dataHolderId = "responseDataPass"; //sync with content.js
  const dataHolderAttribute = "responseData"; //sync with content.js
  console.log("XMLHttpRequest patched");
  // define monkey patch function
  const monkeyPatch = () => {
    let oldXHROpen = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function () {
      this.addEventListener("load", function () {
        let responseBodyParsed;
        try {
          responseBodyParsed = JSON.parse(this.responseText);
        } catch (e) {}
        let responseBody = this.responseText;
        let isJson = responseBodyParsed !== undefined;

        new Promise((res, rej) => {
          let id = setInterval(() => {
            let container = document.getElementById(dataHolderId);

            if (!(container === undefined || container === null)) {
              res({ id, container });
            }
          }, 500);
        }).then(({ id, container }) => {
          clearInterval(id);
          container.setAttribute(
            dataHolderAttribute,
            JSON.stringify({
              response: isJson ? responseBodyParsed : responseBody,
              isJson: isJson,
              url: this.responseURL,
            })
          );
        });
      });
      return oldXHROpen.apply(this, arguments);
    };
  };
  monkeyPatch();
})();
