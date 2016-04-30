import { RegExpWrapper, RegExpMatcherWrapper, isBlank } from 'angular2/src/facade/lang';
import { MatchedUrl } from './route_path';
export class RegexRoutePath {
    constructor(_reString, _serializer) {
        this._reString = _reString;
        this._serializer = _serializer;
        this.terminal = true;
        this.specificity = '2';
        this.hash = this._reString;
        this._regex = RegExpWrapper.create(this._reString);
    }
    matchUrl(url) {
        var urlPath = url.toString();
        var params = {};
        var matcher = RegExpWrapper.matcher(this._regex, urlPath);
        var match = RegExpMatcherWrapper.next(matcher);
        if (isBlank(match)) {
            return null;
        }
        for (let i = 0; i < match.length; i += 1) {
            params[i.toString()] = match[i];
        }
        return new MatchedUrl(urlPath, [], params, [], null);
    }
    generateUrl(params) { return this._serializer(params); }
    toString() { return this._reString; }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnZXhfcm91dGVfcGF0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZzk0UkJKSjIudG1wL2FuZ3VsYXIyL3NyYy9yb3V0ZXIvcnVsZXMvcm91dGVfcGF0aHMvcmVnZXhfcm91dGVfcGF0aC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FBTyxFQUFDLGFBQWEsRUFBRSxvQkFBb0IsRUFBRSxPQUFPLEVBQUMsTUFBTSwwQkFBMEI7T0FFOUUsRUFBMEIsVUFBVSxFQUFDLE1BQU0sY0FBYztBQUtoRTtJQU9FLFlBQW9CLFNBQWlCLEVBQVUsV0FBNEI7UUFBdkQsY0FBUyxHQUFULFNBQVMsQ0FBUTtRQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFpQjtRQUxwRSxhQUFRLEdBQVksSUFBSSxDQUFDO1FBQ3pCLGdCQUFXLEdBQVcsR0FBRyxDQUFDO1FBSy9CLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFRCxRQUFRLENBQUMsR0FBUTtRQUNmLElBQUksT0FBTyxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM3QixJQUFJLE1BQU0sR0FBNEIsRUFBRSxDQUFDO1FBQ3pDLElBQUksT0FBTyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMxRCxJQUFJLEtBQUssR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFL0MsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDekMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBRUQsTUFBTSxDQUFDLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUQsV0FBVyxDQUFDLE1BQTRCLElBQWtCLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUU1RixRQUFRLEtBQWEsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UmVnRXhwV3JhcHBlciwgUmVnRXhwTWF0Y2hlcldyYXBwZXIsIGlzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1VybCwgUm9vdFVybH0gZnJvbSAnLi4vLi4vdXJsX3BhcnNlcic7XG5pbXBvcnQge1JvdXRlUGF0aCwgR2VuZXJhdGVkVXJsLCBNYXRjaGVkVXJsfSBmcm9tICcuL3JvdXRlX3BhdGgnO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVnZXhTZXJpYWxpemVyIHsgKHBhcmFtczoge1trZXk6IHN0cmluZ106IGFueX0pOiBHZW5lcmF0ZWRVcmw7IH1cblxuZXhwb3J0IGNsYXNzIFJlZ2V4Um91dGVQYXRoIGltcGxlbWVudHMgUm91dGVQYXRoIHtcbiAgcHVibGljIGhhc2g6IHN0cmluZztcbiAgcHVibGljIHRlcm1pbmFsOiBib29sZWFuID0gdHJ1ZTtcbiAgcHVibGljIHNwZWNpZmljaXR5OiBzdHJpbmcgPSAnMic7XG5cbiAgcHJpdmF0ZSBfcmVnZXg6IFJlZ0V4cDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9yZVN0cmluZzogc3RyaW5nLCBwcml2YXRlIF9zZXJpYWxpemVyOiBSZWdleFNlcmlhbGl6ZXIpIHtcbiAgICB0aGlzLmhhc2ggPSB0aGlzLl9yZVN0cmluZztcbiAgICB0aGlzLl9yZWdleCA9IFJlZ0V4cFdyYXBwZXIuY3JlYXRlKHRoaXMuX3JlU3RyaW5nKTtcbiAgfVxuXG4gIG1hdGNoVXJsKHVybDogVXJsKTogTWF0Y2hlZFVybCB7XG4gICAgdmFyIHVybFBhdGggPSB1cmwudG9TdHJpbmcoKTtcbiAgICB2YXIgcGFyYW1zOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIHZhciBtYXRjaGVyID0gUmVnRXhwV3JhcHBlci5tYXRjaGVyKHRoaXMuX3JlZ2V4LCB1cmxQYXRoKTtcbiAgICB2YXIgbWF0Y2ggPSBSZWdFeHBNYXRjaGVyV3JhcHBlci5uZXh0KG1hdGNoZXIpO1xuXG4gICAgaWYgKGlzQmxhbmsobWF0Y2gpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1hdGNoLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBwYXJhbXNbaS50b1N0cmluZygpXSA9IG1hdGNoW2ldO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgTWF0Y2hlZFVybCh1cmxQYXRoLCBbXSwgcGFyYW1zLCBbXSwgbnVsbCk7XG4gIH1cblxuICBnZW5lcmF0ZVVybChwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogR2VuZXJhdGVkVXJsIHsgcmV0dXJuIHRoaXMuX3NlcmlhbGl6ZXIocGFyYW1zKTsgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLl9yZVN0cmluZzsgfVxufVxuIl19