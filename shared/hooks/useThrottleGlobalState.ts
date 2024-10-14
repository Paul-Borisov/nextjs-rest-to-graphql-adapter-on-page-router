import { md5 } from "../utils/md5";

/*
// This throttling hook uses session state of the browser so it works even if you dismount the component, which uses it.
// An example of using:
const getData = async (tag: string) => {
  console.log(`${tag} started`);
  return fetch(`https://dummyjson.com/products?tag=${tag}`)
    .then((r) => r.json())
    .catch((e) => console.log(e));
};
const throttle = useThrottleWithGlobalState(getData, 12000);
throttle("a");
setTimeout(() => throttle("b"), 750);
setTimeout(() => throttle("c"), 1500);
setTimeout(() => throttle("d"), 2200);
*/
const useThrottleWithGlobalState = (
  func: Function,
  delayInMilliseconds: number,
  debug: boolean = true
) => {
  const getGlobalState = (key: string) => {
    return sessionStorage.getItem(key);
  };
  const setGlobalState = (key: string, value: any) => {
    sessionStorage.setItem(key, value);
  };

  if (typeof sessionStorage === "undefined") {
    throw Error("Global state is unavailable: sessionStorage object not found");
  }

  const initGlobalState = (state: { [key: string]: any }) => {
    Object.keys(state).forEach((key) => {
      if (getGlobalState(key) === null) {
        setGlobalState(key, state[key]);
      }
    });
  };
  const cleanupGlobalState = (...args: string[]) => {
    args.forEach((key) => {
      if (getGlobalState(key) !== null) {
        sessionStorage.removeItem(key);
      }
    });
  };

  return function (...args: any) {
    const key = `${func.name}:${JSON.stringify(args)}`;
    const keyCanRun = `canRun_${md5(func.toString())}`;
    const keyStarted = `started${key}`;
    const keyTimeout = `timeout${key}`;
    initGlobalState({
      [keyCanRun]: true,
      [keyStarted]: false,
      [keyTimeout]: 0,
    });

    const canRun = getGlobalState(keyCanRun) === "true";
    if (canRun) {
      setGlobalState(keyCanRun, false);
      setGlobalState(keyStarted, Date.now());
      if (debug) console.log(`${args} is running`);
      if (canRun) {
        func(...args);
        const timeoutId = setTimeout(function () {
          setGlobalState(keyCanRun, true);
          cleanupGlobalState(keyCanRun, keyStarted, keyTimeout);
        }, delayInMilliseconds);
        setGlobalState(keyTimeout, timeoutId);
      }
    } else {
      if (debug) {
        console.log(
          `${args} throttled, retry in ${
            Number(getGlobalState(keyStarted) ?? 0) +
            delayInMilliseconds -
            Date.now()
          } ms`
        );
      }
      cleanupGlobalState(keyStarted, keyTimeout);
    }
  };
};

export default useThrottleWithGlobalState;
