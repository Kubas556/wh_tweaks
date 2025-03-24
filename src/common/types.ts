interface ICommonMessage<R, S> {
  type: R;
  data: S;
}

type CommonResponse = ICommonMessage<"response", string>;

type CommonRequest = ICommonMessage<"request", IRequestData>;

interface IResponseData {
  response: any;
  isJson: boolean;
  url: string;
}

interface IRequestData {
  action: "working_hours";
}

interface ITimeResponse {
  data: {
    date: { value: string | null; formatted: string | null };
    totalForToday: number;
    difference: number;
  };
}

interface dayEvent {
  date: {
    text: string;
    value: {
      V: string;
      Y: string;
      M: string;
      D: string;
    };
  };
  title: {
    value: string;
  };
  subtitle1: {
    value: string;
  };
}
