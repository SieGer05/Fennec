export function isMobileOrTablet() {
  const userAgent = navigator.userAgent.toLowerCase();
  const maxMobileWidth = 1024;

  // 1. Check for mobile/tablet user-agents (high confidence)
  const mobileAgents = [/android/, /webos/, /iphone/, /ipod/, /blackberry/, /windows phone/, /iemobile/, /opera mini/, /mobile/];
  const tabletAgents = [/ipad/, /tablet/, /(android(?!.*mobile))/, /(windows(?!.*phone)(.*touch))/, /kindle/, /playbook/, /silk/];

  if (mobileAgents.some(p => p.test(userAgent)) || tabletAgents.some(p => p.test(userAgent))) {
    return true;
  }

  // 2. Feature detection: Primary input is touch AND screen is small
  const isSmallScreen = Math.min(window.innerWidth, window.innerHeight) <= maxMobileWidth;
  const isPrimaryInputTouch = window.matchMedia?.('(pointer: coarse)').matches;

  // 3. Confirm device isn't a desktop (optional but improves accuracy)
  const isDesktopOS = /(windows|macintosh|linux)/i.test(userAgent) && 
                      !/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(userAgent);

  return (isSmallScreen && isPrimaryInputTouch) && !isDesktopOS;
}