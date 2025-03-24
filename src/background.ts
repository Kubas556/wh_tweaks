

//const workdayTableRequest = "/task/2997$4767.htmld";

let currentDay: string | null = null;
let currentDayFormatted: string | null = null;
let daysEventsList: dayEvent[] | null = null;
let totalForToday: number | null = null;

function processResponse(message: CommonResponse) {
  try {
    const response: IResponseData = JSON.parse(message.data);
    if (response.isJson) {
      // current day
      if (
        response.response?.body?.children?.length > 0 &&
        response.response.body.children[0].userCurrentDate
      ) {
        console.log(response.response.body.children[0].userCurrentDate);
        const newDay = response.response.body.children[0].userCurrentDate.text;
        if (!currentDay) {
          currentDay = newDay; //.value.V;
        } else if (currentDay !== newDay) {
          currentDay = newDay;
          daysEventsList = null;
        }
      }

      // current day formatted
      if (
        response.response?.body?.children?.length > 0 &&
        response.response.body.children[0].dayInfo
      ) {
        const filtered = response.response.body.children[0].dayInfo.filter(
          (d: any) => d.date.text === currentDay
        );
        if (filtered.length > 0) {
          currentDayFormatted = filtered[0].formattedDateFull.value;
          totalForToday = filtered[0].totalForDay.value;
        }
      }

      //chrome.storage.local.set({ workdayTableRequest: json.response });
      if (
        response.response?.body?.children?.length > 0 &&
        response.response.body.children[0].consolidatedList
      ) {
        console.log(response.response.body.children[0].consolidatedList);
        const list =
          response.response.body.children[0].consolidatedList.children;
        if (!daysEventsList || daysEventsList.length < list.length) {
          daysEventsList = list;
        }
      }
    }

    if (response.url.includes("app_info/hash/widget_with_versions")) {
      console.log(response.response);
    }
  } catch (e) {
    console.error(message);
  }
  return true;
}

function processRequest(
  message: CommonRequest,
  sendResponse: (resp: any) => void
) {
  if (message.data.action === "working_hours") {
    if (!currentDay || !daysEventsList) {
      sendResponse(null);
      return true;
    }

    if (daysEventsList.length === 0) {
      sendResponse(null);
      return true;
    }

    let filtered = daysEventsList.filter(
      (day) =>
        day.date.text === currentDay && day.title.value === "Unmatched Check-in"
    );

    if (filtered.length === 0) {
      sendResponse(null);
      return true;
    }

    const day = filtered[0];

    sendResponse({
      data: {
        date: { value: currentDay, formatted: currentDayFormatted },
        totalForToday: totalForToday,
        difference:
          new Date(Date.now()).getTime() -
          new Date(
            `${day.date.value.Y}.${day.date.value.M}.${day.date.value.D}.${day.subtitle1.value}`
          ).getTime(),
      },
    } as ITimeResponse);
    return true;
  }
}

chrome.runtime.onMessage.addListener(
  (message: CommonResponse | CommonRequest, sender, sendResponse) => {
    if (message.type === "response") {
      return processResponse(message);
    } else if (message.type === "request") {
      processRequest(message, sendResponse);
    }
  }
);

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "👌",
  });
});
