import { LogLayer } from "loglayer";
import { getSimplePrettyTerminal } from "@loglayer/transport-simple-pretty-terminal";

export const log = new LogLayer({
  transport: getSimplePrettyTerminal({
    runtime: "node",
    viewMode: "expanded",
    flattenNestedObjects: false,
  }),
});
