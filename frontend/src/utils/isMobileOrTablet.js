export function isMobileOrTablet() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent);
    
    const isSmallScreen = window.innerWidth <= 1024 || window.innerHeight <= 768;
    
    const isTablet = /ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))/i.test(userAgent);
    
    return isMobileAgent || isTablet || isSmallScreen;
}