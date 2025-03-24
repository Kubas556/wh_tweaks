import {
  waitForAllQuerySelectors,
  injectScript,
  observeDomChanges,
  getElementTopPos,
  pxToNumber,
} from "./common/utils";

const workdayTableRequest = "/task/2997$4767.htmld";

function removeTags() {
  waitForAllQuerySelectors([
    "[data-automation-id=entriesContainer]",
    '[label="Worked / Scheduled difference"]',
  ]).then(([containers, differenceTags]) => {
    const container = containers[0];
    console.log("removed tags");

    if (differenceTags) {
      let tagsToShift = [];
      let tagHeight, tagTopPos, tagGap;

      let first = true;
      for (const differenceTag of differenceTags) {
        if (first) {
          tagHeight = window.getComputedStyle(differenceTag).height;
          tagTopPos = window.getComputedStyle(differenceTag).top;
        }

        let daySelector = differenceTag
          .getAttribute("aria-label")
          ?.split("|")
          .pop();

        differenceTag.parentElement?.removeChild(differenceTag);
        //container?.removeChild(differenceTag);

        let dayTags = document.querySelectorAll(
          `button[aria-label*="${daySelector}"]`
        );

        if (dayTags.length === 0) {
          return;
        }

        let sorted = Array.from(dayTags).sort(
          (a, b) => getElementTopPos(a) - getElementTopPos(b)
        );

        if (first) {
          tagGap = pxToNumber(tagTopPos ?? "0") + pxToNumber(tagHeight ?? "0");
          tagGap = getElementTopPos(sorted[0]) - tagGap;
          first = false;
        }

        tagsToShift.push(...sorted);
      }

      for (const tagToShift of tagsToShift) {
        (tagToShift as HTMLElement).style.top = `${
          getElementTopPos(tagToShift) -
          pxToNumber(tagHeight ?? "0") -
          (tagGap ?? 0)
        }px`;
      }
    }
  });
}

function addTimeDifference() {
  chrome.runtime
    .sendMessage({
      type: "request",
      data: { action: "working_hours" },
    } as CommonRequest)
    .then((r: ITimeResponse) => {
      if (r !== null) {
        console.log((r.data.difference / (1000 * 60 * 60)).toFixed(2));
        waitForAllQuerySelectors([
          `[data-automation-id=calendarWeek] [data-automation-id*="calendarDateCell"][aria-label*="${r.data.date.formatted}"] [data-automation-id="calendarDateHoursAccumulationLabel"]`,
        ]).then(([labels]) => {
          const label = labels[0];
          const newTime = (
            r.data.totalForToday +
            r.data.difference / (1000 * 60 * 60)
          ).toFixed(2);

          if (label.innerHTML === `Hours: ${newTime}`) return;

          label.innerHTML = `Hours: ${newTime}`;
        });
      }
    });
}

function runAllTableMutations() {
  removeTags();
  addTimeDifference();
}

// setup

function registerResponseDataPass() {
  const dataHolderId = "responseDataPass"; //sync with request-patch.js
  const dataHolderAttribute = "responseData"; //sync with request-patch.js
  const dataHolder = document.createElement("div");
  dataHolder.setAttribute("id", dataHolderId);
  document.body.appendChild(dataHolder);

  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type == "attributes") {
        // This is where we have access to the response BODY!
        const response = (mutation.target as Element).getAttribute(
          dataHolderAttribute
        );
        chrome.runtime.sendMessage({
          type: "response",
          data: response,
        } as ICommonMessage<"response", string>);
      }
    });
  });
  observer.observe(dataHolder, {
    //configure it to listen to attribute changes
    attributes: true,
  });
}

function observePageNavigation() {
  window.addEventListener("popstate", (e) => {
    if (e.target) {
      const target = e.target as Window;
      const tags = document.querySelectorAll(
        '[label="Worked / Scheduled difference"]'
      );
      if (
        target?.location?.href?.includes(workdayTableRequest) ||
        tags.length > 0
      ) {
        runAllTableMutations();
        observeTableChanges();
      }
    }
  });
}

function observeTableChanges() {
  observeDomChanges(
    ["[data-automation-id=entriesContainer]", "[id*=wd-Calendar]"],
    () => {
      runAllTableMutations();
    }
  );
}

// run

injectScript("js/request-patch.js");

observePageNavigation();
observeTableChanges();

window.addEventListener("load", () => {
  registerResponseDataPass();
  runAllTableMutations();
});
