function waitForAllQuerySelectors(selectors: string[]) {
  type returnType = Element[][];
  type queryType = (Element[] | null)[];
  return new Promise<returnType>((res, rej) => {
    new Promise<{ id: number; data: returnType }>(
      (resolveInterval, rejectInterval) => {
        const id = setInterval(() => {
          const resolved: queryType = [];
          for (const selector of selectors) {
            const queryRes = document.querySelectorAll(selector);
            resolved.push(
              queryRes && queryRes.length > 0 ? Array.from(queryRes) : null
            );
          }
          if (resolved.indexOf(null) === -1) {
            resolveInterval({ id: id, data: resolved as returnType });
          }
        }, 20);
        setTimeout(() => {
          rejectInterval({ id });
        }, 8000);
      }
    ).then(
      ({ id, data }) => {
        clearInterval(id);
        res(data);
      },
      ({ id }) => {
        clearInterval(id);
        rej();
      }
    );
  });
}

function injectScript(src: string) {
  const s = document.createElement("script");
  s.src = chrome.runtime.getURL(src);
  s.type = "module";
  s.onload = () => s.remove();
  (document.head || document.documentElement).append(s);
}

function getElementTopPos(e: Element) {
  return pxToNumber(window.getComputedStyle(e).top);
}

function pxToNumber(s: string) {
  return Number.parseFloat(s.replace("px", ""));
}

function observeDomChanges(queries: string[], callback: () => void) {
  for (const query of queries) {
    waitForAllQuerySelectors([query]).then(([containers]) => {
      const container = containers[0];
      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.type === "childList" || mutation.type === "attributes") {
            callback();
          }
        });
      });
      observer.observe(container, {
        childList: true,
        attributes: true,
      });
    });
  }
}

export {
  waitForAllQuerySelectors,
  observeDomChanges,
  injectScript,
  getElementTopPos,
  pxToNumber,
};
