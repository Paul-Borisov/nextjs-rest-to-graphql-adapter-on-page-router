import { useRef } from "react";

/*
// This throttling hook uses context of the component so it stops working if you dismount the component, which uses it.
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
const useThrottle = (
  func: Function,
  delayInMilliseconds: number,
  debug: boolean = true
) => {
  const refCanRun = useRef(true);
  const refTimeout = useRef<ReturnType<typeof setTimeout>>();
  const refStarted = useRef<number>(0);

  return function (...args: any) {
    if (refCanRun.current) {
      refCanRun.current = false;
      refStarted.current = Date.now();
      if (debug) console.log(`${args} is running`);
      func(...args);
      const timeoutId = setTimeout(function () {
        refCanRun.current = true;
      }, delayInMilliseconds);
      refTimeout.current = timeoutId;
    } else {
      if (debug) {
        console.log(
          `${args} throttled, retry in ${
            refStarted.current + delayInMilliseconds - Date.now()
          } ms`
        );
      }
    }
  };
};

export default useThrottle;
