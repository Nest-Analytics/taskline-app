import appInsights from "applicationinsights";
import { readRuntimeValue } from "./runtime-values.js";

const connectionString = readRuntimeValue("APPINSIGHTS_CONNECTION_STRING");

if (connectionString) {
  appInsights
    .setup(connectionString)
    .setAutoCollectRequests(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectPerformance(true, true)
    .setAutoDependencyCorrelation(true)
    .setUseDiskRetryCaching(true)
    .start();

  appInsights.defaultClient.context.tags[
    appInsights.defaultClient.context.keys.cloudRole
  ] = "taskline-backend";
}
