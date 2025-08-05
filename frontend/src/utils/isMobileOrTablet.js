export function isMobileOrTablet() {
    const userAgent = navigator.userAgent.toLowerCase();
    const maxMobileWidth = 1024;

    const mobileAgents = [
        /android/,
        /webos/,
        /iphone/,
        /ipod/,
        /blackberry/,
        /windows phone/,
        /iemobile/,
        /opera mini/,
        /mobile/
    ];

    const tabletAgents = [
        /ipad/,
        /tablet/,
        /(android(?!.*mobile))/, 
        /(windows(?!.*phone)(.*touch))/,
        /kindle/,
        /playbook/,
        /silk/
    ];

    const isMobileAgent = mobileAgents.some(pattern => pattern.test(userAgent));
    const isTabletAgent = tabletAgents.some(pattern => pattern.test(userAgent));

    const screenWidth = window.innerWidth || document.documentElement.clientWidth;
    const screenHeight = window.innerHeight || document.documentElement.clientHeight;
    const isSmallScreen = Math.min(screenWidth, screenHeight) <= maxMobileWidth;

    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return isMobileAgent || isTabletAgent || (isSmallScreen && hasTouch);
}