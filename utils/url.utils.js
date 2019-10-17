// eslint-disable-next-line max-len
const usage = 'One of those optional parameters was formatted incorrectly. Please refer to the help page and try again.';
const baseUrl = 'https://www.mountainproject.com/data';
const OPTIONAL_PARAMS = {
    startPos: true,
    maxDistance: true,
    maxResults: true,
    minDiff: true,
    maxDiff: true,
};
module.exports = {
    generateUrl: (method, apiKey) => `${baseUrl}/get-${method}?key=${apiKey}`,
    addIdentifier: (url, identifier) => `${url}&${Number(identifier) ? 'userId' : 'email'}=${identifier}`,
    addRouteIds: (url, routeIds) => `${url}&routeIds=${routeIds.join(',')}`,
    addLatLon: (url, lat, lon) => `${url}&lat=${lat}&lon=${lon}`,
    addOptionalParams: (url, opts) => {
        const invalidOpts = !!opts.filter((opt) => {
            const split = opt.split('=');
            return split.length !== 2 || !OPTIONAL_PARAMS[split[0]];
        }).length;

        if (invalidOpts) throw new Error(usage);

        return `${url}${opts.reduce((acc, opt) => (opt ? `${acc}&${opt}` : acc), '')}`;
    },
};
