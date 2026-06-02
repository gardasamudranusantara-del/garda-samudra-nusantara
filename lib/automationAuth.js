export function isAutomationAuthorized(request) {
  const secret = process.env.GSN_AUTOMATION_SECRET || process.env.CRON_SECRET || "";
  if (!secret) {
    return true;
  }

  const authorization = request.headers.get("authorization") || "";
  const headerSecret = request.headers.get("x-automation-secret") || "";
  return authorization === `Bearer ${secret}` || headerSecret === secret;
}
